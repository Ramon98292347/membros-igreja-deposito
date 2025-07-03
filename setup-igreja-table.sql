-- Script SQL para configurar a tabela 'churches' no Supabase
-- Mantendo compatibilidade com importação CSV do Google Sheets

-- 1. Criar a tabela 'churches'
CREATE TABLE IF NOT EXISTS public.churches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  classificacao VARCHAR(50),
  nomeIPDA VARCHAR(255) NOT NULL,
  endereco JSONB, -- {logradouro, numero, complemento, bairro, cidade, estado, cep}
  pastor JSONB, -- {nome, telefone, email}
  quantidadeMembros INTEGER DEFAULT 0,
  temEscola BOOLEAN DEFAULT false,
  dataCadastro TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  dataAtualizacao TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_churches_nome ON public.churches(nomeIPDA);
CREATE INDEX IF NOT EXISTS idx_churches_classificacao ON public.churches(classificacao);
CREATE INDEX IF NOT EXISTS idx_churches_data_cadastro ON public.churches(dataCadastro);
CREATE INDEX IF NOT EXISTS idx_churches_endereco_cidade ON public.churches USING GIN ((endereco->>'cidade'));
CREATE INDEX IF NOT EXISTS idx_churches_endereco_estado ON public.churches USING GIN ((endereco->>'estado'));

-- 3. Criar trigger para atualizar automaticamente dataAtualizacao
CREATE OR REPLACE FUNCTION update_churches_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.dataAtualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_churches_timestamp
    BEFORE UPDATE ON public.churches
    FOR EACH ROW
    EXECUTE FUNCTION update_churches_timestamp();

-- 4. Atualizar a tabela 'membros' para referenciar 'churches'
-- Verificar se a coluna church_id já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'membros' AND column_name = 'church_id') THEN
        ALTER TABLE public.membros ADD COLUMN church_id UUID;
        ALTER TABLE public.membros ADD CONSTRAINT fk_membros_churches
            FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_membros_church_id ON public.membros(church_id);
    END IF;
END $$;

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas de segurança básicas
-- Política para leitura (todos os usuários autenticados podem ler)
CREATE POLICY "Usuários autenticados podem ler igrejas" ON public.churches
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserção (todos os usuários autenticados podem inserir)
CREATE POLICY "Usuários autenticados podem inserir igrejas" ON public.churches
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização (todos os usuários autenticados podem atualizar)
CREATE POLICY "Usuários autenticados podem atualizar igrejas" ON public.churches
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para exclusão (todos os usuários autenticados podem excluir)
CREATE POLICY "Usuários autenticados podem excluir igrejas" ON public.churches
    FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Criar view para relatórios
CREATE OR REPLACE VIEW public.view_churches_relatorio AS
SELECT 
    c.id,
    c.nomeIPDA,
    c.classificacao,
    c.endereco->>'cidade' as cidade,
    c.endereco->>'estado' as estado,
    c.endereco->>'cep' as cep,
    c.pastor->>'nome' as nome_pastor,
    c.pastor->>'telefone' as telefone_pastor,
    c.pastor->>'email' as email_pastor,
    c.quantidadeMembros,
    c.temEscola,
    COUNT(m.id) as total_membros_cadastrados,
    c.dataCadastro,
    c.dataAtualizacao
FROM public.churches c
LEFT JOIN public.membros m ON m.church_id = c.id
GROUP BY c.id, c.nomeIPDA, c.classificacao, c.endereco, c.pastor, 
         c.quantidadeMembros, c.temEscola, c.dataCadastro, c.dataAtualizacao
ORDER BY c.nomeIPDA;

-- 8. Função para buscar igrejas por cidade
CREATE OR REPLACE FUNCTION buscar_igrejas_por_cidade(cidade_nome TEXT)
RETURNS TABLE(
    id UUID,
    nomeIPDA VARCHAR(255),
    classificacao VARCHAR(50),
    endereco JSONB,
    pastor JSONB,
    quantidadeMembros INTEGER,
    temEscola BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.nomeIPDA,
        c.classificacao,
        c.endereco,
        c.pastor,
        c.quantidadeMembros,
        c.temEscola
    FROM public.churches c
    WHERE LOWER(c.endereco->>'cidade') = LOWER(cidade_nome)
    ORDER BY c.nomeIPDA;
END;
$$ LANGUAGE plpgsql;

-- 9. Função para buscar igrejas por estado
CREATE OR REPLACE FUNCTION buscar_igrejas_por_estado(estado_sigla TEXT)
RETURNS TABLE(
    id UUID,
    nomeIPDA VARCHAR(255),
    classificacao VARCHAR(50),
    endereco JSONB,
    pastor JSONB,
    quantidadeMembros INTEGER,
    temEscola BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.nomeIPDA,
        c.classificacao,
        c.endereco,
        c.pastor,
        c.quantidadeMembros,
        c.temEscola
    FROM public.churches c
    WHERE UPPER(c.endereco->>'estado') = UPPER(estado_sigla)
    ORDER BY c.nomeIPDA;
END;
$$ LANGUAGE plpgsql;

-- 10. Comentários nas colunas para documentação
COMMENT ON TABLE public.churches IS 'Tabela de igrejas IPDA - compatível com importação CSV';
COMMENT ON COLUMN public.churches.id IS 'Identificador único da igreja';
COMMENT ON COLUMN public.churches.classificacao IS 'Classificação da igreja (ex: Sede, Congregação, etc.)';
COMMENT ON COLUMN public.churches.nomeIPDA IS 'Nome oficial da igreja IPDA';
COMMENT ON COLUMN public.churches.endereco IS 'Endereço completo em formato JSON: {logradouro, numero, complemento, bairro, cidade, estado, cep}';
COMMENT ON COLUMN public.churches.pastor IS 'Dados do pastor em formato JSON: {nome, telefone, email}';
COMMENT ON COLUMN public.churches.quantidadeMembros IS 'Quantidade total de membros da igreja';
COMMENT ON COLUMN public.churches.temEscola IS 'Indica se a igreja possui escola dominical';
COMMENT ON COLUMN public.churches.dataCadastro IS 'Data de cadastro da igreja no sistema';
COMMENT ON COLUMN public.churches.dataAtualizacao IS 'Data da última atualização dos dados da igreja';

-- Script concluído!
-- Para executar este script:
-- 1. Acesse o painel do Supabase
-- 2. Vá para SQL Editor
-- 3. Cole este script e execute
-- 4. Verifique se todas as tabelas, índices e funções foram criadas corretamente