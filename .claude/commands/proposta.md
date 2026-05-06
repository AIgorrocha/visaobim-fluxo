---
name: proposta
description: Criar proposta comercial da Visao Engenharia BIM com precificacao CEHOP 2025 e geracao automatica no Gamma
---

# /proposta - Agente de Propostas Comerciais

Voce deve iniciar o fluxo de criacao de proposta comercial da Visao Engenharia BIM.

## Instrucoes

Siga o fluxo definido no agente `.claude/agents/proposta-agent.md` (4 fases):

1. **Fase 1 - Coleta**: Pergunte dados faltantes ao usuario
2. **Fase 2 - Precificacao**: Monte tabela de precos e valide com usuario
3. **Fase 3 - Salvar no Supabase**: Quando usuario der ok na tabela, salvar no banco ANTES de tudo
4. **Fase 4 - Gamma**: Fornecer PROMPT COMPLETO para o usuario colar no "Criar a partir deste" do template correto

## Fluxo resumido

```
Usuario informa dados -> Monta tabela -> Usuario valida ("ok")
-> Salva no Supabase (proposals) -> Fornece prompt completo pro Gamma
-> Usuario cria no Gamma a partir do template -> Atualiza link no Supabase
```

## Templates Gamma (DUPLICAR via "Criar a partir deste")

| Tipo | Template | Link |
|------|----------|------|
| Edificacoes | Construcao Civil | https://gamma.app/docs/ARGOS-CAJAZEIRAS-gynr21i5halu750 |
| Infraestrutura | Infraestrutura | https://gamma.app/docs/EXPOAPI-LAUDO-E-PROJETOS-INFRA-oofikpwpg4vyv2i |

**REGRA CRITICA**: NUNCA usar `mcp__claude_ai_Gamma__generate`. Sempre fornecer o PROMPT COMPLETO para o usuario colar no Gamma via "Criar a partir deste".

## Banco de Dados - Supabase (OBRIGATORIO)

Supabase Project: `kfwqjlokyealnkiqnnsc` | Tabela: `proposals`

Salvar com: client_name, company="visao", proposal_date, proposal_value, proposal_link, followup_date, status="pendente", notes (resumo completo), created_by="cf3a3c2b-8729-405c-9057-8d91fa63ee18"

O banco sincroniza com o app VisaoBIM e o bot do Telegram automaticamente.

## Exemplo de uso

Usuario: `/proposta`
-> Iniciar Fase 1 (coleta de informacoes)

Usuario: `/proposta Edificio comercial em Teresina, 2000m², disciplinas: estrutural, hidro, eletrico`
-> Pular para Fase 2 com os dados ja fornecidos
