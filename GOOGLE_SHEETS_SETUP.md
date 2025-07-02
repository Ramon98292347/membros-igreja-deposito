# Configuração da Integração com Google Sheets

Este guia explica como usar a integração do sistema de membros com suas planilhas do Google Sheets já configuradas.

## 📋 Informações das Suas Planilhas

### Planilha Principal: "Cadastro de Membros e Obreiros de Vitória (Respostas)"
- **ID da Planilha**: `1kBJxwPR0kEU_9MScxXpniU9HDYJVUgTWlRyIjdlmImI`
- **Range**: `A:W` (colunas A até W)
- **URL**: https://docs.google.com/spreadsheets/d/1kBJxwPR0kEU_9MScxXpniU9HDYJVUgTWlRyIjdlmImI/edit

### Planilha Secundária: "Todas as igrejas estaduais de vitória"
- **ID da Planilha**: `1RAUT5S_8AC_p0P3FzTZCqzhnmUGFTyHDSIWonrVGIqs`
- **Range**: `A:V` (colunas A até V)
- **URL**: https://docs.google.com/spreadsheets/d/1RAUT5S_8AC_p0P3FzTZCqzhnmUGFTyHDSIWonrVGIqs/edit

## 🔧 Credenciais Configuradas

### Google API
- **Client ID**: `SEU_CLIENT_ID_AQUI`
- **Client Secret**: `SEU_CLIENT_SECRET_AQUI`

## 📊 Estrutura da Planilha de Membros

| Coluna | Campo | Descrição |
|--------|-------|----------|
| A | ID | Identificador único |
| B | Carimbo de data/hora | Timestamp de criação |
| C | Nome Completo | Nome completo do membro |
| D | Imagem | URL da foto |
| E | Endereço de email | Email do membro |
| F | Endereço | Endereço completo |
| G | Bairro | Bairro |
| H | Número da casa | Número da residência |
| I | Cidade | Cidade |
| J | Estado | Estado/UF |
| K | CEP | Código postal |
| L | CPF | Cadastro de Pessoa Física |
| M | RG | Registro Geral |
| N | Cidade de Nascimento | Local de nascimento |
| O | Estado: Da Cidade | UF do local de nascimento |
| P | Data de Nascimento | Data no formato DD/MM/AAAA |
| Q | Idade | Idade calculada |
| R | Estado Civil | Solteiro(a), Casado(a), etc. |
| S | Telefone | Número de telefone |
| T | Profissão | Profissão do membro |
| U | Tem Filho | Informação sobre filhos |
| V | Data de Batismo | Data do batismo |
| W | Função Ministerial | Pastor, Presbítero, Diácono, etc. |

## 🚀 Próximos Passos para Ativação

### Passo 1: Ativar a API do Google Sheets

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione ou crie um projeto
3. No menu lateral, vá em "APIs e serviços" → "Biblioteca"
4. Pesquise por "Google Sheets API"
5. Clique na API e depois em "Ativar"

### Passo 2: Configurar Credenciais OAuth 2.0

1. Vá em "APIs e serviços" → "Credenciais"
2. Clique em "+ Criar credenciais" → "ID do cliente OAuth 2.0"
3. Selecione "Aplicativo da Web"
4. Configure:
   - **Nome**: Sistema de Membros
   - **URIs de redirecionamento autorizados**: `http://localhost:5173`
5. Use as credenciais já fornecidas ou substitua no `.env.local`

### Passo 3: Configurar Permissões das Planilhas

**Para a planilha de membros:**
1. Abra: https://docs.google.com/spreadsheets/d/1kBJxwPR0kEU_9MScxXpniU9HDYJVUgTWlRyIjdlmImI/edit
2. Clique em "Compartilhar" (canto superior direito)
3. Adicione o email do projeto Google Cloud ou configure como "Qualquer pessoa com o link"
4. Defina a permissão como "Editor"

**Para a planilha de igrejas:**
1. Abra: https://docs.google.com/spreadsheets/d/1RAUT5S_8AC_p0P3FzTZCqzhnmUGFTyHDSIWonrVGIqs/edit
2. Repita o mesmo processo

## ⚙️ Configuração no Sistema

### Arquivo .env.local (exemplo):
```env
# Google Sheets API Configuration
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui
VITE_GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
VITE_GOOGLE_REDIRECT_URI=http://localhost:8080
VITE_GOOGLE_API_KEY=sua_api_key_aqui
```

### Configuração no Sistema

1. O sistema já está configurado com suas planilhas por padrão
2. Acesse a página "Membros" no sistema
3. Use os botões de sincronização:
   - **Importar**: Busca dados da planilha do Google Sheets
   - **Exportar**: Envia dados do sistema para a planilha
   - **Configurar**: Permite alterar configurações se necessário

## 🔄 Como Usar a Sincronização

### Importar Dados (Google Sheets → Sistema)

1. Clique no botão "Sincronizar" (ícone de nuvem)
2. Selecione "Importar do Google Sheets"
3. Os dados da planilha serão baixados e exibidos no sistema
4. O sistema automaticamente usa sua planilha de membros configurada

### Exportar Dados (Sistema → Google Sheets)

1. Certifique-se de ter membros cadastrados no sistema
2. Clique no botão "Sincronizar"
3. Selecione "Exportar para Google Sheets"
4. Os dados serão enviados para sua planilha de membros

## 🛠️ Solução de Problemas

### Erro: "Falha ao conectar com Google Sheets"

**Possíveis causas:**
- Credenciais OAuth não configuradas corretamente
- Planilha não compartilhada adequadamente
- API do Google Sheets não ativada

**Soluções:**
1. Verifique se a API do Google Sheets está ativada
2. Confirme que as planilhas estão compartilhadas
3. Teste as credenciais OAuth no Google Cloud Console
4. Verifique se o projeto tem as permissões necessárias

### Erro de Autenticação

**Causa:** Problemas com OAuth 2.0

**Solução:**
1. Verifique se o Client ID e Client Secret estão corretos
2. Confirme que a URI de redirecionamento está configurada
3. Teste a autenticação manualmente

### Dados não aparecem após sincronização

**Possíveis causas:**
- Estrutura da planilha alterada
- Dados em formato incorreto
- Permissões insuficientes

**Soluções:**
1. Verifique se a estrutura da planilha não foi alterada
2. Confirme que os dados estão nas colunas corretas
3. Verifique as permissões de acesso à planilha

## 📝 Dicas Importantes

1. **Backup**: Sempre mantenha um backup dos seus dados
2. **Teste**: Teste a sincronização com poucos dados primeiro
3. **Permissões**: Mantenha as permissões das planilhas adequadas
4. **Limites**: A API do Google tem limites de uso - monitore o consumo
5. **Formato de Dados**: Mantenha consistência nos formatos

## 🔐 Segurança

- **Nunca** compartilhe suas credenciais publicamente
- As credenciais estão configuradas em variáveis de ambiente
- Configure restrições de API no Google Cloud Console se necessário
- Monitore o uso da API regularmente
- Mantenha as planilhas com permissões adequadas

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do navegador (F12 → Console)
2. Confirme se a API do Google Sheets está ativada
3. Teste as permissões das planilhas
4. Verifique se as credenciais OAuth estão corretas

---

**Sistema configurado para:**
- Planilha de Membros: Cadastro de Membros e Obreiros de Vitória
- Planilha de Igrejas: Todas as igrejas estaduais de vitória
- **Última atualização:** Janeiro 2025