# Configuração da Integração com Supabase

Este guia explica como usar a integração do sistema de membros com o Supabase para armazenamento e sincronização de dados.

## 📋 Informações do Supabase

### Banco de Dados Supabase
- **URL do Supabase**: `https://seu-projeto.supabase.co`
- **Chave de API**: Sua chave anon/public (segura para uso no cliente)

## 🔧 Credenciais Configuradas

### Supabase API
- **URL**: `https://seu-projeto.supabase.co`
- **Chave Anon/Public**: `sua_chave_anon_public_aqui`

## 📊 Estrutura das Tabelas

### Tabela de Membros (`members`)

| Coluna | Tipo | Descrição |
|--------|------|----------|
| id | uuid | Identificador único (primary key) |
| created_at | timestamp | Data de criação do registro |
| full_name | text | Nome completo do membro |
| image_url | text | URL da foto do membro |
| email | text | Email do membro |
| address | text | Endereço completo |
| neighborhood | text | Bairro |
| house_number | text | Número da residência |
| city | text | Cidade |
| state | text | Estado/UF |
| zip_code | text | Código postal (CEP) |
| cpf | text | Cadastro de Pessoa Física |
| rg | text | Registro Geral |
| birth_city | text | Cidade de nascimento |
| birth_state | text | UF do local de nascimento |
| birth_date | date | Data de nascimento |
| age | integer | Idade calculada |
| marital_status | text | Estado civil |
| phone | text | Número de telefone |
| profession | text | Profissão do membro |
| has_children | boolean | Informação sobre filhos |
| baptism_date | date | Data do batismo |
| ministerial_role | text | Função ministerial (Pastor, Presbítero, etc.) |

### Tabela de Igrejas (`igreja`)

| Coluna | Tipo | Descrição |
|--------|------|----------|
| id | uuid | Identificador único (primary key) |
| classificacao | text | Classificação da igreja |
| nomeIPDA | text | Nome da igreja IPDA |
| endereco | jsonb | Endereço completo (logradouro, numero, complemento, bairro, cidade, estado, cep) |
| pastor | jsonb | Dados do pastor (nome, telefone, email) |
| quantidadeMembros | integer | Número de membros |
| temEscola | boolean | Informação se tem escola |
| dataCadastro | timestamp | Data de criação do registro |
| dataAtualizacao | timestamp | Data da última atualização |

#### Estrutura SQL para criação:
```sql
-- Create igreja table (mantendo compatibilidade com CSV do Google Sheets)
CREATE TABLE IF NOT EXISTS public.igreja (
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
```

## 🚀 Próximos Passos para Ativação

### Passo 1: Criar uma Conta no Supabase

1. Acesse o [Supabase](https://supabase.com/)
2. Clique em "Start your project" e crie uma conta
3. Crie um novo projeto com um nome de sua escolha

### Passo 2: Configurar o Banco de Dados

1. No painel do Supabase, vá para a seção "Table Editor"
2. Crie as tabelas `members` e `igreja` com as estruturas descritas acima
3. Configure as permissões de acesso nas políticas de segurança (RLS)

### Passo 3: Obter as Credenciais

1. No painel do Supabase, vá para "Settings" → "API"
2. Copie a URL do projeto e a chave anon/public
3. Essas credenciais serão usadas na configuração do sistema

## ⚙️ Configuração no Sistema

### Arquivo .env.local (exemplo):
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_public_aqui
```

### Configuração no Sistema

1. Acesse a página "Membros" ou "Igrejas" no sistema
2. Clique no botão "Configurar Supabase"
3. Insira a URL e a chave do Supabase
4. Clique em "Salvar"

## 🔄 Como Usar a Sincronização

### Importar Dados (Supabase → Sistema)

1. Clique no botão "Sincronizar" (ícone de nuvem)
2. Selecione "Importar do Supabase"
3. Os dados serão baixados e exibidos no sistema

### Exportar Dados (Sistema → Supabase)

1. Certifique-se de ter membros ou igrejas cadastrados no sistema
2. Clique no botão "Sincronizar"
3. Selecione "Exportar para Supabase"
4. Os dados serão enviados para o Supabase

## 🛠️ Solução de Problemas

### Erro: "Falha ao conectar com Supabase"

**Possíveis causas:**
- URL ou chave do Supabase incorretas
- Problemas de conectividade com a internet
- Serviço do Supabase indisponível

**Soluções:**
1. Verifique se a URL e a chave estão corretas
2. Teste sua conexão com a internet
3. Verifique o status do serviço Supabase em [status.supabase.com](https://status.supabase.com)

### Erro de Autenticação

**Causa:** Problemas com a chave de API

**Solução:**
1. Verifique se a chave anon/public está correta
2. Gere uma nova chave no painel do Supabase se necessário

### Dados não aparecem após sincronização

**Possíveis causas:**
- Estrutura da tabela alterada
- Permissões insuficientes (RLS)
- Problemas com a consulta

**Soluções:**
1. Verifique se a estrutura da tabela está correta
2. Confirme que as políticas de RLS permitem acesso
3. Verifique os logs do console para erros específicos

## 📝 Dicas Importantes

1. **Backup**: Sempre mantenha um backup dos seus dados
2. **Teste**: Teste a sincronização com poucos dados primeiro
3. **Permissões**: Configure corretamente as políticas de RLS
4. **Limites**: O plano gratuito do Supabase tem limites - monitore o uso
5. **Formato de Dados**: Mantenha consistência nos formatos

## 🔐 Segurança

- **Nunca** compartilhe sua chave de serviço (service_role) publicamente
- Use apenas a chave anon/public no cliente
- Configure políticas de RLS para proteger seus dados
- Ative a autenticação de usuários se necessário
- Monitore o uso da API regularmente

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do navegador (F12 → Console)
2. Confirme se as credenciais do Supabase estão corretas
3. Teste a conexão diretamente com o Supabase
4. Verifique se as tabelas estão configuradas corretamente

---

**Sistema configurado para:**
- Banco de Dados: Supabase
- Tabelas: members, igreja
- **Última atualização:** Janeiro 2025