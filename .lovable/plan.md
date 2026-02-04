

## Plano: Corrigir Scroll e Adicionar Cálculo Automático de Porcentagem

### Problema 1: Scroll não Funciona no Modal

**Causa:** O `DialogContent` do modal de precificação (linha 672) não tem as classes CSS para permitir scroll em conteúdo longo.

**Solução:** Adicionar `max-h-[80vh] overflow-y-auto` ao DialogContent, igual ao modal de disciplinas que já funciona corretamente.

```tsx
// Antes
<DialogContent className="sm:max-w-[500px]">

// Depois
<DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
```

---

### Problema 2: Calcular Porcentagem Automaticamente

**Situação atual:**
- Modo "Total → Projetista": Você digita o valor total + porcentagem fixa → calcula valor do projetista
- Modo "Projetista → Total": Você digita o valor do projetista + porcentagem fixa → calcula valor total

**O que você quer:**
- Digitar o valor total da disciplina E o valor do projetista
- Sistema calcular automaticamente a porcentagem (%)

**Solução:** Adicionar um **terceiro modo de entrada**: "Ambos → Porcentagem"

| Modo | O que você digita | O que é calculado |
|------|-------------------|-------------------|
| Total → Projetista | Valor Total + % | Valor Projetista |
| Projetista → Total | Valor Projetista + % | Valor Total |
| **Ambos → %** (NOVO) | Valor Total + Valor Projetista | % calculada |

**Fórmula para o novo modo:**
```
Porcentagem = (Valor Projetista / Valor Total) × 100
```

Exemplo:
- Valor Total da Disciplina: R$ 10.000
- Valor do Projetista: R$ 4.500
- Sistema calcula: 45%

---

### Alterações no Código

**Arquivo:** `src/pages/PrecificacaoProjetos.tsx`

1. **Adicionar classe de scroll no DialogContent (linha 672):**
```tsx
<DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
```

2. **Alterar tipo InputMode:**
```tsx
type InputMode = 'total' | 'designer' | 'both';
```

3. **Adicionar terceiro botão no toggle:**
```tsx
<Button
  type="button"
  variant={inputMode === 'both' ? 'default' : 'outline'}
  size="sm"
  onClick={() => setInputMode('both')}
  className="flex-1"
>
  Ambos → %
</Button>
```

4. **Adicionar UI para modo "both":**
- Dois campos editáveis: Valor Total e Valor Projetista
- Porcentagem calculada e exibida como somente leitura
- Cálculo automático: `designer_percentage = (designer_value / total_value) * 100`

5. **Ajustar lógica de salvamento:**
- Quando `inputMode === 'both'`, usar os valores digitados diretamente
- A porcentagem calculada já estará no `formData.designer_percentage`

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/PrecificacaoProjetos.tsx` | Adicionar scroll, novo modo de entrada "both" |

---

### Resultado Esperado

1. **Scroll funcionando**: Poderá rolar até o final do modal e clicar em Salvar
2. **Novo modo de entrada**: Três opções - Total→Projetista, Projetista→Total, Ambos→%
3. **Cálculo automático de %**: Digite os dois valores e a porcentagem é calculada automaticamente

