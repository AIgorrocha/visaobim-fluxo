# Sessao 2026-04-07 - Agente de Propostas

## O que foi feito

### 1. Criacao do Agente de Propostas
Criados dois arquivos para o sistema de propostas automatizado:

- **Skill** `/proposta` -> `.claude/commands/proposta.md`
  - Ponto de entrada rapido para o usuario
  - Chama o agent `proposta-agent` por baixo

- **Agent** `proposta-agent` -> `.claude/agents/proposta-agent.md`
  - Fluxo em 3 fases: Coleta -> Precificacao -> Geracao no Gamma
  - Conecta com Gamma MCP para gerar propostas visuais
  - Usa tabela CEHOP 2025 como base de precos
  - Disciplinas sem preco por m² -> pergunta ao usuario

### 2. Templates Gamma mapeados
- **Construcao Civil:** `gynr21i5halu750` (ARGOS-CAJAZEIRAS)
- **Infraestrutura:** `oofikpwpg4vyv2i` (EXPOAPI)

### 3. Teste com projeto real - Edificio Residencial Itapeva/SP

**Dados extraidos do PDF** (`propostas/folhas reunidas.pdf` - 11 paginas):
- Cliente: ENNOVA ENGENHARIA
- Endereco: Av. Higino Rodrigues Garcia, S/N - Jd. Dona Miriam - Itapeva/SP
- Responsavel arquitetonico: Arq. Ariel Tomaz de Almeida (CAU/SP: A-303629-4)
- Tipologia: Edificio residencial multifamiliar
- Pavimentos: Subsolo + Terreo + 13 pavimentos (1 torre)
- Area construida total: 8.690 m²
- 92 unidades habitacionais (aptos de 60 m²)
- 93 vagas de estacionamento (43 subsolo + 49 terreo)
- 2 elevadores
- Gabarito: 39,40 m
- Area do lote: 1.465,51 m²
- Zoneamento: ZCS
- Desnivel terreno: ~5m (cotas 699 a 704)
- Terraplenagem: 621,5 m³ corte / 731 m³ aterro

**Metragens separadas:**
- Pav. nao repetitivos: 2.640 m² (subsolo 940 + terreo 940 + 1o pav 320 + 13o pav 370 + tecnico 70)
- Pav. tipo repetitivos (2o ao 12o): 6.050 m² (550 m² × 11 andares)

### 4. Tabela de precificacao VALIDADA

| Disciplina | Valor Total (R$) |
|------------|------------------|
| Projeto Estrutural (pav. nao repetitivos - 2.640 m² × R$18) | R$ 47.520,00 |
| Projeto Estrutural (pav. tipo - 6.050 m² × 30% × R$18) | R$ 32.670,00 |
| Fundacoes Profundas | R$ 20.000,00 |
| Estrutura da Piscina | R$ 5.000,00 |
| **TOTAL** | **R$ 105.190,00** |

**Precificacao:**
- R$ 18,00/m² para estrutural
- Fator de repeticao 30%: pega a area repetitiva, multiplica por 30%, depois multiplica pelo preco normal
- Fundacoes profundas: valor fixo R$20.000 (nao por m²)
- Piscina: valor fixo R$5.000

**Pesquisa de mercado realizada:**
- AltoQi (7.000+ orcamentos): media edificio R$16,60/m², casa R$19,30/m²
- IMEC/MG: R$20,00/m²
- SENGE minimo: R$14,00/m²
- Mercado geral: R$14 a R$50/m²
- R$18/m² escolhido pelo usuario (acima da media AltoQi)

**ROI:**
- CUB R8N SP (marco/2026): R$2.133,91/m²
- Custo estimado obra: R$3.500/m² × 8.690 m² = R$30.415.000,00
- Investimento projetos: R$105.190,00
- Percentual: 0,35% do custo da obra
- Economia conservadora (5%): R$1.520.750,00
- Economia usual (10%): R$3.041.500,00

**Condicoes:**
- Prazo: 75 dias
- Pagamento: 34% entrada, 33% projeto basico, 33% entrega final ou a NEGOCIAR
- Validade: 10 dias
- NAO incluso: ART e Contencoes
- Incluso: Acesso ao modelo 3D via nuvem, compatibilizacao, quantitativos

### 5. Estrutura da proposta no Gamma (pronta para gerar)
9 paginas seguindo template Construcao Civil:
1. Capa com nome do projeto
2. Nosso Compromisso (BIM, economia, resultados)
3. Descricao do empreendimento (8.690 m², 4 disciplinas)
4. Simulacao de economia (5% e 10%)
5. Como projetos geram economia real
6. Escopo e investimento (tabela com 3 disciplinas + total R$105.190)
7. ROI (0,35% do custo da obra)
8. Condicoes comerciais
9. Contatos e equipe

### 6. Instalacoes feitas
- PyMuPDF (pymupdf) - ja estava instalado, converte PDF em imagens
- pytesseract + pdf2image - instalados via pip
- Tesseract OCR e Poppler - NAO instalados (winget deu erro 403)
- Para OCR completo: instalar Tesseract e Poppler manualmente

### 7. Arquivos temporarios criados
- `propostas/page_1.png` ate `propostas/page_11.png` (imagens do PDF)

## Pendencias

1. **GERAR A PROPOSTA NO GAMMA** - tabela validada, estrutura definida, falta executar
2. **Atualizar o agent** com as regras aprendidas:
   - Fator de repeticao: area × 30% × preco (nao preco × 70%)
   - Separar metragens repetitivas vs nao repetitivas
   - Fundacoes, piscina, contencoes = preco fixo (nao por m²)
   - Pesquisar CUB da regiao + multiplicar por fator para ROI
   - Usar PyMuPDF para converter PDF em imagens quando pdfplumber nao conseguir
3. **Instalar Tesseract + Poppler** no Windows para OCR completo
4. **Limpar imagens temporarias** (page_*.png)
