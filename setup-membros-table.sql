-- Script SQL para configurar a tabela 'membros' no Supabase
-- Baseado na estrutura TypeScript definida em src/types/member.ts

-- 1. Criar a tabela 'membros'
CREATE TABLE IF NOT EXISTS public.membros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo VARCHAR(255) NOT NULL,
  data_nascimento DATE NOT NULL,
  idade INTEGER,
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  numero_casa VARCHAR(20),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  rg VARCHAR(20),
  cpf VARCHAR(14),
  cidade_nascimento VARCHAR(100),
  estado_cidade_nascimento VARCHAR(2),
  estado_civil VARCHAR(20) CHECK (estado_civil IN ('Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)')),
  nome_conjuge VARCHAR(255),
  data_casamento DATE,
  funcao_ministerial VARCHAR(50) CHECK (funcao_ministerial IN ('Pastor', 'Presbítero', 'Diácono', 'Obreiro', 'Membro', 'Missionário', 'Evangelista')),
  data_batismo DATE,
  data_ordenacao DATE,
  igreja_batismo VARCHAR(255),
  observacoes TEXT,
  foto TEXT, -- URL da foto
  ativo BOOLEAN DEFAULT true,
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  profissao VARCHAR(100),
  link_ficha TEXT, -- Link da ficha do membro
  dados_carteirinha TEXT, -- Dados da carteirinha
  church_id UUID -- Referência para a igreja
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_membros_nome ON public.membros(nome_completo);
CREATE INDEX IF NOT EXISTS idx_membros_cpf ON public.membros(cpf);
CREATE INDEX IF NOT EXISTS idx_membros_rg ON public.membros(rg);
CREATE INDEX IF NOT EXISTS idx_membros_funcao ON public.membros(funcao_ministerial);
CREATE INDEX IF NOT EXISTS idx_membros_cidade ON public.membros(cidade);
CREATE INDEX IF NOT EXISTS idx_membros_estado ON public.membros(estado);
CREATE INDEX IF NOT EXISTS idx_membros_ativo ON public.membros(ativo);
CREATE INDEX IF NOT EXISTS idx_membros_data_cadastro ON public.membros(data_cadastro);
CREATE INDEX IF NOT EXISTS idx_membros_church_id ON public.membros(church_id);

-- 3. Criar trigger para atualizar automaticamente dataAtualizacao
CREATE OR REPLACE FUNCTION update_membros_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_membros_timestamp
    BEFORE UPDATE ON public.membros
    FOR EACH ROW
    EXECUTE FUNCTION update_membros_timestamp();

-- 4. Criar trigger para calcular idade automaticamente
CREATE OR REPLACE FUNCTION calculate_age()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_nascimento IS NOT NULL THEN
        NEW.idade = EXTRACT(YEAR FROM AGE(NEW.data_nascimento));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_age
    BEFORE INSERT OR UPDATE ON public.membros
    FOR EACH ROW
    EXECUTE FUNCTION calculate_age();

-- 5. Adicionar foreign key para churches (se a tabela churches existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'churches') THEN
        ALTER TABLE public.membros ADD CONSTRAINT fk_membros_churches
            FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas de segurança básicas
-- Política para leitura (todos os usuários autenticados podem ler)
CREATE POLICY "Usuários autenticados podem ler membros" ON public.membros
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserção (todos os usuários autenticados podem inserir)
CREATE POLICY "Usuários autenticados podem inserir membros" ON public.membros
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização (todos os usuários autenticados podem atualizar)
CREATE POLICY "Usuários autenticados podem atualizar membros" ON public.membros
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para exclusão (todos os usuários autenticados podem excluir)
CREATE POLICY "Usuários autenticados podem excluir membros" ON public.membros
    FOR DELETE USING (auth.role() = 'authenticated');

-- 8. Criar view para relatórios
CREATE OR REPLACE VIEW public.view_membros_relatorio AS
SELECT 
    m.id,
    m.nome_completo,
    m.data_nascimento,
    m.idade,
    m.telefone,
    m.email,
    m.endereco,
    m.numero_casa,
    m.bairro,
    m.cidade,
    m.estado,
    m.cep,
    m.cpf,
    m.rg,
    m.estado_civil,
    m.funcao_ministerial,
    m.data_batismo,
    m.igreja_batismo,
    m.profissao,
    m.ativo,
    c.nome_ipda as igreja_atual,
    m.data_cadastro,
    m.data_atualizacao
FROM public.membros m
LEFT JOIN public.churches c ON m.church_id = c.id
WHERE m.ativo = true
ORDER BY m.nome_completo;

-- 9. Função para buscar membros por função ministerial
CREATE OR REPLACE FUNCTION buscar_membros_por_funcao(funcao TEXT)
RETURNS TABLE(
    id UUID,
    nome_completo VARCHAR(255),
    telefone VARCHAR(20),
    email VARCHAR(255),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    funcao_ministerial VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.nome_completo,
        m.telefone,
        m.email,
        m.cidade,
        m.estado,
        m.funcao_ministerial
    FROM public.membros m
    WHERE m.funcao_ministerial = funcao AND m.ativo = true
    ORDER BY m.nome_completo;
END;
$$ LANGUAGE plpgsql;

-- 10. Função para buscar aniversariantes do mês
CREATE OR REPLACE FUNCTION buscar_aniversariantes_mes(mes INTEGER)
RETURNS TABLE(
    id UUID,
    nome_completo VARCHAR(255),
    data_nascimento DATE,
    idade INTEGER,
    telefone VARCHAR(20),
    funcao_ministerial VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.nome_completo,
        m.data_nascimento,
        m.idade,
        m.telefone,
        m.funcao_ministerial
    FROM public.membros m
    WHERE EXTRACT(MONTH FROM m.data_nascimento) = mes AND m.ativo = true
    ORDER BY EXTRACT(DAY FROM m.data_nascimento), m.nome_completo;
END;
$$ LANGUAGE plpgsql;

-- 11. Comentários nas colunas para documentação
COMMENT ON TABLE public.membros IS 'Tabela de membros da igreja - compatível com sistema TypeScript';
COMMENT ON COLUMN public.membros.id IS 'Identificador único do membro';
COMMENT ON COLUMN public.membros.nome_completo IS 'Nome completo do membro';
COMMENT ON COLUMN public.membros.data_nascimento IS 'Data de nascimento';
COMMENT ON COLUMN public.membros.idade IS 'Idade calculada automaticamente';
COMMENT ON COLUMN public.membros.telefone IS 'Número de telefone';
COMMENT ON COLUMN public.membros.email IS 'Endereço de email';
COMMENT ON COLUMN public.membros.endereco IS 'Endereço completo';
COMMENT ON COLUMN public.membros.numero_casa IS 'Número da residência';
COMMENT ON COLUMN public.membros.bairro IS 'Bairro';
COMMENT ON COLUMN public.membros.cidade IS 'Cidade';
COMMENT ON COLUMN public.membros.estado IS 'Estado/UF';
COMMENT ON COLUMN public.membros.cep IS 'Código postal';
COMMENT ON COLUMN public.membros.rg IS 'Registro Geral';
COMMENT ON COLUMN public.membros.cpf IS 'Cadastro de Pessoa Física';
COMMENT ON COLUMN public.membros.cidade_nascimento IS 'Cidade de nascimento';
COMMENT ON COLUMN public.membros.estado_cidade_nascimento IS 'Estado de nascimento';
COMMENT ON COLUMN public.membros.estado_civil IS 'Estado civil';
COMMENT ON COLUMN public.membros.nome_conjuge IS 'Nome do cônjuge (se casado)';
COMMENT ON COLUMN public.membros.data_casamento IS 'Data do casamento';
COMMENT ON COLUMN public.membros.funcao_ministerial IS 'Função ministerial na igreja';
COMMENT ON COLUMN public.membros.data_batismo IS 'Data do batismo';
COMMENT ON COLUMN public.membros.data_ordenacao IS 'Data da ordenação (se aplicável)';
COMMENT ON COLUMN public.membros.igreja_batismo IS 'Igreja onde foi batizado';
COMMENT ON COLUMN public.membros.observacoes IS 'Observações adicionais';
COMMENT ON COLUMN public.membros.foto IS 'URL da foto do membro';
COMMENT ON COLUMN public.membros.ativo IS 'Indica se o membro está ativo';
COMMENT ON COLUMN public.membros.data_cadastro IS 'Data de cadastro no sistema';
COMMENT ON COLUMN public.membros.data_atualizacao IS 'Data da última atualização';
COMMENT ON COLUMN public.membros.profissao IS 'Profissão do membro';
COMMENT ON COLUMN public.membros.link_ficha IS 'Link para a ficha do membro';
COMMENT ON COLUMN public.membros.dados_carteirinha IS 'Dados da carteirinha do membro';
COMMENT ON COLUMN public.membros.church_id IS 'Referência para a igreja do membro';

-- Script concluído!
-- Para executar este script:
-- 1. Acesse o painel do Supabase
-- 2. Vá para SQL Editor
-- 3. Cole este script e execute
-- 4. Verifique se a tabela, índices e funções foram criadas corretamente
-- 5. Teste a inserção de alguns membros para validar a estrutura