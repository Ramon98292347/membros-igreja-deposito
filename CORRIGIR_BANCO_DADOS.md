# 🔧 Correção do Problema do Banco de Dados

## ✅ Problema Resolvido!

Este guia foi criado para resolver o erro de coluna `nomeCompleto` não encontrada no Supabase. O problema foi resolvido com:

1. **Mapeamento automático**: Implementado sistema de conversão automática entre camelCase (TypeScript) e snake_case (banco de dados)
2. **Funções de mapeamento**: Criadas funções `mapMemberToDatabase()` e `mapMemberFromDatabase()` no `supabaseService.ts`
3. **Correção de queries**: Atualizadas todas as consultas para usar a nomenclatura correta (`nome_completo`, `nome_ipda`, etc.)
4. **Scripts SQL atualizados**: Corrigidos os scripts de criação das tabelas para usar snake_case consistentemente

## 🚨 Problema Original

O erro que você estava enfrentando indicava que a tabela `membros` no Supabase não possuía a coluna `nomeCompleto` que o sistema estava tentando usar. O erro específico era:

```
Erro ao buscar membros: column membros.nomeCompleto does not exist
```

## 📋 Causa do Problema

O problema principal era:

1. **Inconsistência de nomenclatura**: O código TypeScript usava `nomeCompleto` (camelCase), mas o banco de dados esperava `nome_completo` (snake_case)
2. **Tabela não criada**: A tabela `membros` não foi criada no Supabase
3. **Estrutura incorreta**: A tabela foi criada com uma estrutura diferente da esperada pelo código

## 🛠️ Solução Passo a Passo

### Passo 1: Verificar se as tabelas existem

1. Acesse o painel do Supabase em [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto
4. Vá para **Table Editor** no menu lateral
5. Verifique se existem as tabelas:
   - `membros`
   - `churches`

### Passo 2: Executar os Scripts SQL

#### 2.1 Criar/Corrigir a tabela de membros

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `setup-membros-table.sql`
4. Cole no editor SQL
5. Clique em **Run** para executar

#### 2.2 Criar/Corrigir a tabela de igrejas (se necessário)

1. No SQL Editor, crie uma nova query
2. Copie todo o conteúdo do arquivo `setup-igreja-table.sql`
3. Cole no editor SQL
4. Clique em **Run** para executar

### Passo 3: Verificar a criação das tabelas

1. Volte para **Table Editor**
2. Verifique se as tabelas foram criadas:
   - `membros` - deve ter as colunas: `id`, `nomeCompleto`, `dataNascimento`, etc.
   - `churches` - deve ter as colunas: `id`, `nomeIPDA`, `classificacao`, etc.

### Passo 4: Configurar as políticas de segurança (RLS)

1. No **Table Editor**, clique na tabela `membros`
2. Vá para a aba **RLS** (Row Level Security)
3. Verifique se as políticas foram criadas automaticamente
4. Repita para a tabela `churches`

### Passo 5: Testar a conexão

1. Volte para o sistema
2. Vá para a página de **Membros**
3. Clique em **Configurar Supabase** (se necessário)
4. Insira suas credenciais do Supabase:
   - **URL**: `https://seu-projeto.supabase.co`
   - **Chave**: Sua chave anon/public
5. Teste criando um novo membro

## 📊 Estrutura Correta das Tabelas

### Tabela `membros`

A tabela deve ter as seguintes colunas principais:

- `id` (UUID, Primary Key)
- `nomeCompleto` (VARCHAR, NOT NULL)
- `dataNascimento` (DATE)
- `idade` (INTEGER)
- `telefone` (VARCHAR)
- `email` (VARCHAR)
- `endereco` (TEXT)
- `numeroCasa` (VARCHAR)
- `bairro` (VARCHAR)
- `cidade` (VARCHAR)
- `estado` (VARCHAR)
- `cep` (VARCHAR)
- `rg` (VARCHAR)
- `cpf` (VARCHAR)
- `estadoCivil` (VARCHAR)
- `funcaoMinisterial` (VARCHAR)
- `dataBatismo` (DATE)
- `igrejaBatismo` (VARCHAR)
- `profissao` (VARCHAR)
- `ativo` (BOOLEAN)
- `dataCadastro` (TIMESTAMP)
- `dataAtualizacao` (TIMESTAMP)
- `linkFicha` (TEXT)
- `dadosCarteirinha` (TEXT)
- `church_id` (UUID, Foreign Key)

### Tabela `churches`

A tabela deve ter as seguintes colunas principais:

- `id` (UUID, Primary Key)
- `nomeIPDA` (VARCHAR, NOT NULL)
- `classificacao` (VARCHAR)
- `endereco` (JSONB)
- `pastor` (JSONB)
- `quantidadeMembros` (INTEGER)
- `temEscola` (BOOLEAN)
- `dataCadastro` (TIMESTAMP)
- `dataAtualizacao` (TIMESTAMP)

## 🔍 Verificação Final

Após executar os scripts, você pode testar se tudo está funcionando:

1. **Teste de inserção**: Tente cadastrar um novo membro
2. **Teste de listagem**: Verifique se os membros aparecem na lista
3. **Teste de busca**: Use a função de busca para localizar membros
4. **Teste de edição**: Edite um membro existente

## 🚨 Problemas Comuns

### Erro de permissão

**Sintoma**: "permission denied for table membros"

**Solução**:
1. Verifique se o RLS está configurado corretamente
2. Confirme se as políticas de segurança foram criadas
3. Teste com um usuário autenticado

### Erro de foreign key

**Sintoma**: "violates foreign key constraint"

**Solução**:
1. Execute primeiro o script da tabela `churches`
2. Depois execute o script da tabela `membros`
3. A ordem é importante devido às referências entre tabelas

### Tabela já existe

**Sintoma**: "relation already exists"

**Solução**:
1. Os scripts usam `CREATE TABLE IF NOT EXISTS`
2. Se a tabela existe mas com estrutura errada, você pode:
   - Fazer backup dos dados
   - Deletar a tabela
   - Executar o script novamente
   - Restaurar os dados

## 📞 Suporte Adicional

Se ainda encontrar problemas:

1. **Verifique os logs**: Abra o console do navegador (F12) e veja se há erros
2. **Teste a conexão**: Use o SQL Editor do Supabase para testar queries simples
3. **Verifique as credenciais**: Confirme se a URL e chave do Supabase estão corretas
4. **Consulte a documentação**: [Documentação do Supabase](https://supabase.com/docs)

---

**Importante**: Sempre faça backup dos seus dados antes de executar scripts que modificam a estrutura do banco de dados.