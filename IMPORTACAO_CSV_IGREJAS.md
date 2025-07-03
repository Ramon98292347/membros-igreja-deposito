# Guia de Importação CSV - Tabela Igreja

Este guia explica como importar dados de igrejas do Google Sheets para o sistema via CSV, mantendo compatibilidade com a estrutura da tabela `igreja` no Supabase.

## 📋 Estrutura do CSV

### Colunas Obrigatórias
- `nomeIPDA` - Nome da igreja IPDA (obrigatório)
- `dataCadastro` - Data de cadastro (formato: YYYY-MM-DD HH:MM:SS)
- `dataAtualizacao` - Data de atualização (formato: YYYY-MM-DD HH:MM:SS)

### Colunas Opcionais
- `classificacao` - Classificação da igreja (Estadual, Setorial, Central, Regional, Local)
- `quantidadeMembros` - Número de membros (inteiro)
- `temEscola` - Possui escola dominical (true/false)

### Colunas para Endereço (formato JSON)
- `endereco_logradouro` - Logradouro/Rua
- `endereco_numero` - Número
- `endereco_complemento` - Complemento
- `endereco_bairro` - Bairro
- `endereco_cidade` - Cidade
- `endereco_estado` - Estado (sigla)
- `endereco_cep` - CEP

### Colunas para Pastor (formato JSON)
- `pastor_nome` - Nome do pastor
- `pastor_telefone` - Telefone do pastor
- `pastor_email` - Email do pastor

## 📝 Exemplo de CSV

```csv
nomeIPDA,classificacao,quantidadeMembros,temEscola,endereco_logradouro,endereco_numero,endereco_bairro,endereco_cidade,endereco_estado,endereco_cep,pastor_nome,pastor_telefone,pastor_email,dataCadastro,dataAtualizacao
"IPDA Central São Paulo","Central",150,true,"Rua das Flores","123","Centro","São Paulo","SP","01234-567","Pastor João Silva","(11) 99999-9999","joao@ipda.com.br","2024-01-15 10:00:00","2024-01-15 10:00:00"
"IPDA Regional Norte","Regional",80,true,"Av. Principal","456","Vila Nova","Manaus","AM","69000-000","Pastor Maria Santos","(92) 88888-8888","maria@ipda.com.br","2024-01-15 11:00:00","2024-01-15 11:00:00"
```

## 🔄 Processo de Importação

### 1. Preparar o CSV no Google Sheets

1. **Estruturar as colunas** conforme o exemplo acima
2. **Validar os dados**:
   - Datas no formato correto (YYYY-MM-DD HH:MM:SS)
   - Valores booleanos como `true` ou `false`
   - Números inteiros para `quantidadeMembros`
3. **Exportar como CSV**:
   - Arquivo → Fazer download → Valores separados por vírgula (.csv)

### 2. Transformar CSV para formato Supabase

Antes de importar, os dados precisam ser transformados para o formato JSON esperado pela tabela `igreja`:

```javascript
// Exemplo de transformação dos dados
function transformarCSVParaIgreja(csvData) {
  return csvData.map(row => ({
    nomeIPDA: row.nomeIPDA,
    classificacao: row.classificacao || 'Local',
    quantidadeMembros: parseInt(row.quantidadeMembros) || 0,
    temEscola: row.temEscola === 'true',
    endereco: {
      logradouro: row.endereco_logradouro,
      numero: row.endereco_numero,
      complemento: row.endereco_complemento,
      bairro: row.endereco_bairro,
      cidade: row.endereco_cidade,
      estado: row.endereco_estado,
      cep: row.endereco_cep
    },
    pastor: {
      nome: row.pastor_nome,
      telefone: row.pastor_telefone,
      email: row.pastor_email
    },
    dataCadastro: row.dataCadastro,
    dataAtualizacao: row.dataAtualizacao
  }));
}
```

### 3. Importar via Supabase Dashboard

1. **Acesse o Supabase Dashboard**
2. **Vá para Table Editor**
3. **Selecione a tabela `igreja`**
4. **Clique em "Insert" → "Import data"**
5. **Faça upload do CSV transformado**

### 4. Importar via SQL (Alternativa)

```sql
-- Exemplo de inserção manual via SQL
INSERT INTO public.igreja (
  nomeIPDA, 
  classificacao, 
  quantidadeMembros, 
  temEscola, 
  endereco, 
  pastor,
  dataCadastro,
  dataAtualizacao
) VALUES (
  'IPDA Central São Paulo',
  'Central',
  150,
  true,
  '{"logradouro": "Rua das Flores", "numero": "123", "bairro": "Centro", "cidade": "São Paulo", "estado": "SP", "cep": "01234-567"}',
  '{"nome": "Pastor João Silva", "telefone": "(11) 99999-9999", "email": "joao@ipda.com.br"}',
  '2024-01-15 10:00:00',
  '2024-01-15 10:00:00'
);
```

## ⚠️ Considerações Importantes

### Validações
- **nomeIPDA** é obrigatório e deve ser único
- **dataCadastro** e **dataAtualizacao** são obrigatórios
- **quantidadeMembros** deve ser um número inteiro positivo
- **temEscola** deve ser boolean (true/false)

### Campos JSON
- **endereco** e **pastor** são armazenados como JSONB no banco
- Permitem consultas eficientes usando operadores JSON do PostgreSQL
- Exemplo: `endereco->>'cidade' = 'São Paulo'`

### Compatibilidade
- O sistema mantém compatibilidade com estruturas antigas
- Campos opcionais permitem importação gradual
- Interface do usuário adapta-se automaticamente aos dados disponíveis

## 🔧 Troubleshooting

### Erro: "duplicate key value violates unique constraint"
- **Causa**: nomeIPDA duplicado
- **Solução**: Verificar se há nomes de igrejas repetidos no CSV

### Erro: "invalid input syntax for type json"
- **Causa**: Formato JSON inválido nos campos endereco ou pastor
- **Solução**: Validar a estrutura JSON antes da importação

### Erro: "null value in column violates not-null constraint"
- **Causa**: Campos obrigatórios em branco
- **Solução**: Preencher nomeIPDA, dataCadastro e dataAtualizacao

## 📊 Verificação Pós-Importação

Após a importação, execute estas consultas para verificar os dados:

```sql
-- Verificar total de igrejas importadas
SELECT COUNT(*) FROM public.igreja;

-- Verificar igrejas por classificação
SELECT classificacao, COUNT(*) 
FROM public.igreja 
GROUP BY classificacao;

-- Verificar igrejas por cidade
SELECT endereco->>'cidade' as cidade, COUNT(*) 
FROM public.igreja 
WHERE endereco->>'cidade' IS NOT NULL
GROUP BY endereco->>'cidade'
ORDER BY COUNT(*) DESC;

-- Verificar dados do pastor
SELECT nomeIPDA, pastor->>'nome' as pastor_nome
FROM public.igreja 
WHERE pastor->>'nome' IS NOT NULL
LIMIT 10;
```

---

**Nota**: Este processo garante que os dados do Google Sheets sejam importados corretamente mantendo a integridade e estrutura esperada pelo sistema.