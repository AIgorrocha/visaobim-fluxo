
## Plano: Flexibilizar Entrada de Valores na Precificação

### Problema Atual

O formulário de precificação só permite preencher **em uma direção**:
1. Você digita o **Valor Total da Disciplina**
2. O sistema calcula o **Valor do Projetista** = (Total × Porcentagem) + Majoração

**Você quer poder fazer o inverso também**, além de poder digitar o valor final majorado diretamente.

---

### Solução Proposta

Adicionar **opções de entrada bidirecional** onde o usuário pode escolher qual campo preencher e o sistema calcula os outros automaticamente.

#### Novos Modos de Entrada

| Campo Preenchido | Campos Calculados |
|------------------|-------------------|
| Valor Total da Disciplina | → Valor do Projetista |
| **Valor do Projetista** (NOVO) | → Valor Total da Disciplina |
| **Valor Final Majorado** (NOVO) | → Majoração (diferença) |

---

### Modificações no Formulário

#### 1. Adicionar campo "Valor do Projetista" editável

Novo campo onde você pode digitar diretamente quanto o projetista vai receber. O sistema vai calcular o valor total da disciplina usando a fórmula inversa:

```
Valor Total = Valor Projetista / (Porcentagem / 100)
```

Exemplo:
- Se você quer pagar **R$ 4.000** ao projetista com **40%**
- Sistema calcula: **R$ 10.000** como valor total da disciplina

#### 2. Modificar campo de Majoração

Atualmente você digita o **valor a adicionar** (ex: R$ 500 de majoração).

Nova opção: digitar o **valor final majorado** e o sistema calcula a diferença.

Exemplo:
- Base calculada: R$ 4.000 (40% de R$ 10.000)
- Você digita: R$ 4.500 como valor final
- Sistema calcula: R$ 500 de majoração

#### 3. Interface com Toggle de Modo

Adicionar um seletor para escolher o modo de preenchimento:
- **Modo Normal**: Preenche valor total → calcula valor projetista
- **Modo Inverso**: Preenche valor projetista → calcula valor total

---

### Alterações no Código

**Arquivo:** `src/pages/PrecificacaoProjetos.tsx`

1. **Adicionar estado para modo de entrada:**
```typescript
const [inputMode, setInputMode] = useState<'total' | 'designer'>('total');
const [majoracaoMode, setMajoracaoMode] = useState<'adicional' | 'final'>('adicional');
```

2. **Adicionar campo para valor do projetista direto:**
```typescript
interface PricingFormData {
  // ... campos existentes
  designer_value_direct: number; // NOVO - valor direto do projetista
  designer_value_final: number;  // NOVO - valor final com majoração
}
```

3. **Lógica de cálculo bidirecional:**
```typescript
// Quando inputMode === 'designer' e usuário digita designer_value_direct:
const calculatedTotalValue = formData.designer_value_direct / (formData.designer_percentage / 100);

// Quando majoracaoMode === 'final' e usuário digita designer_value_final:
const calculatedMajoracao = formData.designer_value_final - baseDesignerValue;
```

4. **UI com toggle para escolher modo:**
- Radio buttons ou tabs para alternar entre modos
- Labels dinâmicos explicando qual campo preencher

---

### Correção dos Erros de Build (Edge Functions)

Os erros de TypeScript nas edge functions precisam ser corrigidos também:

**Arquivos:**
- `supabase/functions/appsheet-lancamento-pub/index.ts`
- `supabase/functions/appsheet-lancamento-pvt/index.ts`

**Problema:** `error` é do tipo `unknown`, mas estamos acessando `error.message` diretamente.

**Solução:**
```typescript
} catch (error) {
  console.error('❌ Erro ao processar webhook:', error);
  const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
  return new Response(
    JSON.stringify({ success: false, error: errorMessage }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

---

### Resultado Esperado

1. **Modo Normal (atual):** Digitar valor total → ver valor do projetista calculado
2. **Modo Inverso (novo):** Digitar valor do projetista → ver valor total calculado
3. **Majoração direta:** Digitar valor final majorado → sistema calcula a diferença

O formulário fica mais flexível para você preencher da forma mais conveniente em cada situação.

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/PrecificacaoProjetos.tsx` | Adicionar modos de entrada bidirecional |
| `supabase/functions/appsheet-lancamento-pub/index.ts` | Corrigir tipagem do error |
| `supabase/functions/appsheet-lancamento-pvt/index.ts` | Corrigir tipagem do error |
