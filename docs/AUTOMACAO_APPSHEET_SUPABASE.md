# Automacao AppSheet -> Supabase - Documentacao Completa

**Data:** 21/01/2026
**Status:** IMPLEMENTADO E FUNCIONANDO

---

## Visao Geral

Sistema de sincronizacao automatica de lancamentos financeiros do AppSheet (celular) para o banco de dados Supabase, para os setores PRIVADO e PUBLICO.

### Arquitetura

```
+------------------+     +------------------+     +------------------+
|    AppSheet      |     |  Edge Function   |     |    Supabase      |
|    (Celular)     | --> |   (Webhook)      | --> |   (Banco)        |
+------------------+     +------------------+     +------------------+
        |                        ^
        v                        |
+------------------+             |
|  Google Sheets   | ------------+
|  (Apps Script)   |   (Backup a cada 1 min)
+------------------+
```

### Tabelas de Destino

| Tipo | Centro de Custo | Tabela |
|------|-----------------|--------|
| DESPESA | PROJETISTA | designer_payments |
| RECEITA | PAGAMENTO | contract_income |
| DESPESA | Outros | company_expenses |

---

## SETOR PRIVADO

### Edge Function

- **Nome:** `appsheet-lancamento-pvt`
- **URL:** `https://kfwqjlokyealnkiqnnsc.supabase.co/functions/v1/appsheet-lancamento-pvt`
- **Versao:** 2

### Colunas da Planilha (9 colunas)

| Coluna | Campo | Uso |
|--------|-------|-----|
| A | ID_Lancamento | Identificador unico |
| B | Datas | Data do lancamento |
| C | Tipo | DESPESA ou RECEITA |
| D | Valor | Valor em R$ |
| E | Descricao | Descricao do lancamento |
| F | Contrato | Nome do contrato |
| G | Centro de Custo | Categoria |
| H | Responsavel | **NOME DO PROJETISTA** |
| I | Disciplina | Disciplina do projeto |

**IMPORTANTE:** No PRIVADO, o campo `Responsavel` e o nome do projetista.

### Apps Script - PRIVADO

```javascript
var WEBHOOK_URL = "https://kfwqjlokyealnkiqnnsc.supabase.co/functions/v1/appsheet-lancamento-pvt";
var ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmd3FqbG9reWVhbG5raXFubnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI4OTEyODcsImV4cCI6MjAzODQ2NzI4N30.N6YN9lmtVZaOd5u3Q7SmA9rz3GJQTH2w7AUQRDsE2eQ";
var SHEET_NAME = "Lancamentos";
var LAST_PROCESSED_KEY = "lastProcessedRow_PVT";

function syncNewRowsToSupabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    Logger.log("Aba nao encontrada: " + SHEET_NAME);
    return;
  }
  var lastRow = sheet.getLastRow();
  var properties = PropertiesService.getScriptProperties();
  var lastProcessed = parseInt(properties.getProperty(LAST_PROCESSED_KEY)) || 1;
  if (lastProcessed < 1) lastProcessed = 1;
  Logger.log("Ultima linha processada: " + lastProcessed);
  Logger.log("Ultima linha da planilha: " + lastRow);
  for (var row = lastProcessed + 1; row <= lastRow; row++) {
    var values = sheet.getRange(row, 1, 1, 9).getValues()[0];
    if (!values[0] || values[0] === "") {
      Logger.log("Linha " + row + " vazia, pulando...");
      continue;
    }
    var payload = {
      ID_Lancamento: String(values[0]),
      Datas: formatDate(values[1]),
      Tipo: String(values[2] || ""),
      Valor: String(values[3] || ""),
      Descricao: String(values[4] || ""),
      Contrato: String(values[5] || ""),
      Centro_de_Custo: String(values[6] || ""),
      Responsavel: String(values[7] || ""),
      Disciplina: String(values[8] || "")
    };
    Logger.log("Enviando linha " + row + ": " + JSON.stringify(payload));
    try {
      var response = sendToWebhook(payload);
      Logger.log("Resposta da linha " + row + ": " + response);
      properties.setProperty(LAST_PROCESSED_KEY, String(row));
    } catch (error) {
      Logger.log("Erro na linha " + row + ": " + error.message);
      break;
    }
  }
}

function formatDate(value) {
  if (!value) return "";
  if (value instanceof Date) {
    var day = String(value.getDate()).padStart(2, "0");
    var month = String(value.getMonth() + 1).padStart(2, "0");
    var year = value.getFullYear();
    return day + "/" + month + "/" + year;
  }
  return String(value);
}

function sendToWebhook(payload) {
  var options = {
    method: "POST",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + ANON_KEY
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  var response = UrlFetchApp.fetch(WEBHOOK_URL, options);
  return response.getContentText();
}

function createTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "syncNewRowsToSupabase") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("syncNewRowsToSupabase").timeBased().everyMinutes(1).create();
  Logger.log("Trigger criado com sucesso!");
}

function checkLastProcessed() {
  var last = PropertiesService.getScriptProperties().getProperty(LAST_PROCESSED_KEY);
  Logger.log("Ultima linha processada: " + (last || "1"));
}
```

### Bot AppSheet - PRIVADO

**Body do Webhook:**
```json
{
  "ID_Lancamento": "<<[ID_Lancamento]>>",
  "Datas": "<<[Datas]>>",
  "Tipo": "<<[Tipo]>>",
  "Valor": "<<[Valor]>>",
  "Descricao": "<<[Descricao]>>",
  "Contrato": "<<[Contrato]>>",
  "Centro_de_Custo": "<<[Centro de Custo]>>",
  "Responsavel": "<<[Responsavel]>>",
  "Disciplina": "<<[Disciplina]>>"
}
```

### Mapeamento de Contratos - PRIVADO

| Contrato AppSheet | project_id |
|-------------------|------------|
| GERAL | null |
| SERVFAZ-AGROPARQUE | 7cceaad6-63f5-4662-a932-ae3400d6bb35 |
| WILLIAM-ACADEMIA | 2493bcbe-4041-4e8e-8333-ae8f37c632d8 |
| ZOOBOTANICO-INCENDIO | 7dc309a4-f54d-4244-9597-4ee420778e77 |
| ZOOBOTANICO-PARQUE AQUATICO | 030821d6-daa5-45a4-a74a-08b7ec36f30c |
| THALES-LAIS&SAROM | 29d13dbf-33ff-4d67-ab12-c4e570dd0d71 |
| THALES-ROSANETE&ESEQUIAS | f77079e1-5fad-46a6-861e-50896af0d627 |
| THALES-GILVANDO&CARINE | 313fb989-27c2-4518-89e6-f013960bba4f |
| PABLO-CASA | f2da7595-7d89-4235-8f5d-1160560356ca |
| BRENO-CASA | 03990012-9e4a-443d-97a6-7dc0ad5bf269 |
| FENIX-COWORKING | d40b2c51-8713-4566-ae13-87c02497f908 |
| NORBERTO-SALAS COMERCIAIS | baad7c70-0f03-40b0-bea2-4a2e8d3aeb57 |
| IRIS-REFORCO EST | 7638c70a-7a2b-4608-b7b0-b198edb584dd |
| CARVALHO-PORTAL DA ALEGRIA | b940baaf-1bab-481d-925a-98d2479bf334 |
| THALES-CLEBER&IGOR | b33bcd77-e2b5-4259-ad22-799fa193e0c6 |
| TALISMA-ESCOLA | cf93d712-1113-4723-8c76-5fe9c28b5f2c |
| ADENILSON-PREDIO COMERCIAL | d3e03294-4e54-4279-8e90-474522cec221 |
| ANDRE LOSS-ORCAMENTO | cbce33b2-e4b0-4715-a9dd-904c3bfadc08 |

---

## SETOR PUBLICO

### Edge Function

- **Nome:** `appsheet-lancamento-pub`
- **URL:** `https://kfwqjlokyealnkiqnnsc.supabase.co/functions/v1/appsheet-lancamento-pub`
- **Versao:** 1

### Colunas da Planilha (10 colunas)

| Coluna | Campo | Uso |
|--------|-------|-----|
| A | ID_Lancamento | Identificador unico |
| B | Datas | Data do lancamento |
| C | Tipo | DESPESA ou RECEITA |
| D | Valor | Valor em R$ |
| E | Descricao | Descricao do lancamento |
| F | Contrato | Nome do contrato |
| G | Centro de Custo | Categoria |
| H | Responsavel | **QUEM REGISTROU (IGOR/STAEL)** |
| I | Projetista | **NOME DO PROJETISTA** |
| J | Disciplina | Disciplina do projeto |

**IMPORTANTE:** No PUBLICO, o campo `Responsavel` e quem registrou (IGOR ou STAEL), e o campo `Projetista` e o nome do projetista.

### Apps Script - PUBLICO

```javascript
var WEBHOOK_URL = "https://kfwqjlokyealnkiqnnsc.supabase.co/functions/v1/appsheet-lancamento-pub";
var ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmd3FqbG9reWVhbG5raXFubnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI4OTEyODcsImV4cCI6MjAzODQ2NzI4N30.N6YN9lmtVZaOd5u3Q7SmA9rz3GJQTH2w7AUQRDsE2eQ";
var SHEET_NAME = "Lancamentos";
var LAST_PROCESSED_KEY = "lastProcessedRow_PUB";

function syncNewRowsToSupabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    Logger.log("Aba nao encontrada: " + SHEET_NAME);
    return;
  }
  var lastRow = sheet.getLastRow();
  var properties = PropertiesService.getScriptProperties();
  var lastProcessed = parseInt(properties.getProperty(LAST_PROCESSED_KEY)) || 1;
  if (lastProcessed < 1) lastProcessed = 1;
  Logger.log("Ultima linha processada: " + lastProcessed);
  Logger.log("Ultima linha da planilha: " + lastRow);
  for (var row = lastProcessed + 1; row <= lastRow; row++) {
    var values = sheet.getRange(row, 1, 1, 10).getValues()[0];
    if (!values[0] || values[0] === "") {
      Logger.log("Linha " + row + " vazia, pulando...");
      continue;
    }
    var payload = {
      ID_Lancamento: String(values[0]),
      Datas: formatDate(values[1]),
      Tipo: String(values[2] || ""),
      Valor: String(values[3] || ""),
      Descricao: String(values[4] || ""),
      Contrato: String(values[5] || ""),
      Centro_de_Custo: String(values[6] || ""),
      Responsavel: String(values[7] || ""),
      Projetista: String(values[8] || ""),
      Disciplina: String(values[9] || "")
    };
    Logger.log("Enviando linha " + row + ": " + JSON.stringify(payload));
    try {
      var response = sendToWebhook(payload);
      Logger.log("Resposta da linha " + row + ": " + response);
      properties.setProperty(LAST_PROCESSED_KEY, String(row));
    } catch (error) {
      Logger.log("Erro na linha " + row + ": " + error.message);
      break;
    }
  }
}

function formatDate(value) {
  if (!value) return "";
  if (value instanceof Date) {
    var day = String(value.getDate()).padStart(2, "0");
    var month = String(value.getMonth() + 1).padStart(2, "0");
    var year = value.getFullYear();
    return day + "/" + month + "/" + year;
  }
  return String(value);
}

function sendToWebhook(payload) {
  var options = {
    method: "POST",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + ANON_KEY
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  var response = UrlFetchApp.fetch(WEBHOOK_URL, options);
  return response.getContentText();
}

function createTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "syncNewRowsToSupabase") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("syncNewRowsToSupabase").timeBased().everyMinutes(1).create();
  Logger.log("Trigger criado com sucesso!");
}

function checkLastProcessed() {
  var last = PropertiesService.getScriptProperties().getProperty(LAST_PROCESSED_KEY);
  Logger.log("Ultima linha processada: " + (last || "1"));
}
```

### Bot AppSheet - PUBLICO

**Body do Webhook:**
```json
{
  "ID_Lancamento": "<<[ID_Lancamento]>>",
  "Datas": "<<[Datas]>>",
  "Tipo": "<<[Tipo]>>",
  "Valor": "<<[Valor]>>",
  "Descricao": "<<[Descricao]>>",
  "Contrato": "<<[Contrato]>>",
  "Centro_de_Custo": "<<[Centro de Custo]>>",
  "Responsavel": "<<[Responsavel]>>",
  "Projetista": "<<[Projetista]>>",
  "Disciplina": "<<[Disciplina]>>"
}
```

### Mapeamento de Contratos - PUBLICO

| Contrato AppSheet | project_id |
|-------------------|------------|
| GERAL | null |
| DRF-PV | f9ef85e6-a442-4b35-bb82-004cbe331fa4 |
| TRE-AC | 01c53ae7-2236-4fa0-b63f-27137a05189c |
| LACEN / LACEN-AC | e5a473bc-1ba6-4e37-a451-78f871e348d7 |
| GINASIOS / GINASIOS-AC | 2196fb07-7126-4793-8240-a57d7a5fed15 |
| HTR | 3142ffab-1005-4710-9fb0-e838ba069e97 |
| PRODESP | 65598f7a-0883-4cc5-89e0-ff3efeaba35c |
| CELESC-TUBARAO | bbf35b14-5047-4ea5-ad21-d9e9733a5040 |
| CELESC-EST CENTRAL | a602e340-23e8-4b2d-bf4e-d06c26f9dc3c |
| SPRF-AL | 60a49d27-05d9-4e60-aa18-accffc94cca1 |
| SPF-RO | 04e09afb-8b45-4ab8-b6ff-8e57dd0ed0b5 |
| UNESPAR-ELE | ae4caf7d-730c-4d22-991d-0a255bfeb695 |
| IBC-RJ | null (nao existe no Supabase) |
| CIAP-SP | null (nao existe no Supabase) |
| CMB-SP | null (nao existe no Supabase) |

---

## Mapeamento de Projetistas (Ambos Setores)

| Nome | designer_id |
|------|-------------|
| NARA | b639705e-c87a-4e3d-bee2-d564e4dc5a9c |
| GUSTAVO | 7526fbed-99da-4d87-b647-422f278e961b |
| PEDRO/LUCAS | 7b13b7de-68df-4dde-9263-0e2a72d481b0 |
| LEONARDO | 5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91 |
| RONDINELLY | 905fde13-5c9f-49be-b76a-f76e4ffd124d |
| THIAGO | 994df657-b61d-4b1e-8a59-416051fd5e99 |
| ELOISY | 6b1b146d-dc85-4030-9558-52b24c1106cb |
| EDILSON | cc32897a-a98d-4319-90c8-15fb63a55665 |
| FERNANDO | 99d8b596-7c2b-44a2-8c08-dfd5ccf9b03f |
| FABIO | e8f3173e-3eb0-4975-81f8-398ca5f593b9 |
| FELIPE MATHEUS | 60a9b85e-a7ec-401a-a04a-5cf6eaec508c |
| SALOMAO | 719d76a2-b7e8-4b77-877c-81d8e3256a58 |
| ARTHUR | b56c5808-5e03-473e-9499-9db5c4fbf428 |
| IGOR | cf3a3c2b-8729-405c-9057-8d91fa63ee18 |
| NICOLAS | 0510e615-438d-400e-886c-fed07c997dc9 |
| BESSA | c96e4c49-6b7b-4d89-b56d-f8779271d6e0 |
| PROJETISTA EXTERNO | 4c3ce88b-abf9-45cd-a919-954bea79aa0c |
| (Nao encontrado) | 4c3ce88b-abf9-45cd-a919-954bea79aa0c (fallback) |

---

## Configuracao do Bot no AppSheet

### Passo a Passo

1. **Abrir AppSheet** > Automation > Bots > New Bot

2. **Configurar Evento:**
   - Table: `Lancamentos`
   - Event type: `Adds only`

3. **Adicionar Processo:**
   - Add a step > Run a task > Call a webhook

4. **Configurar Webhook:**
   - URL: (usar a URL da Edge Function correspondente)
   - HTTP Verb: `POST`
   - HTTP Content Type: `JSON`

5. **Headers:**
   - Name: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmd3FqbG9reWVhbG5raXFubnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI4OTEyODcsImV4cCI6MjAzODQ2NzI4N30.N6YN9lmtVZaOd5u3Q7SmA9rz3GJQTH2w7AUQRDsE2eQ`

6. **Body:** (usar o JSON correspondente ao setor)

7. **Salvar e ativar o Bot**

---

## Diferenca Entre PRIVADO e PUBLICO

| Aspecto | PRIVADO | PUBLICO |
|---------|---------|---------|
| Edge Function | appsheet-lancamento-pvt | appsheet-lancamento-pub |
| Colunas | 9 | 10 |
| Projetista vem de | Responsavel | Projetista |
| Quem registrou | N/A | Responsavel (IGOR/STAEL) |
| Setor no banco | sector: 'privado' | sector: 'publico' |

---

## Centros de Custo

### PRIVADO
PROJETISTA, PAGAMENTO, CONTABILIDADE, IA, CONTEUDO, PATROCINADOS, TAXAS, IMPOSTOS, CREA/CAU, LEVANTAMENTOS, PROLABORE, PROSPECCAO ATIVA

### PUBLICO
PROJETISTA, PAGAMENTO, CREA/CAU, PORTAL, IMPOSTOS, LEVANTAMENTOS, MEDICAO, CONTABILIDADE, PROLABORE, PROSPECCAO ATIVA, TAXAS, OUTROS, JUNTO SEGUROS, FORSETI, GERAL

---

## Verificacao e Manutencao

### Verificar ultima linha processada
Execute `checkLastProcessed()` no Apps Script

### Ver logs da Edge Function
Supabase Dashboard > Edge Functions > Logs

### Contratos nao encontrados
Ficam salvos com `project_id = null` e aparecem na tabela `unmatched_entries` para revisao manual

---

## Resumo

| Item | PRIVADO | PUBLICO |
|------|---------|---------|
| Edge Function | ✅ | ✅ |
| Apps Script | ✅ | ✅ |
| Bot AppSheet | ✅ | ✅ |
| Testado | ✅ | ✅ |

**Implementado em:** 21/01/2026
