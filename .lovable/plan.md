

## Plano: Filtro por Nome de Projeto e Correção de Desmarcar Entrega

### Problema 1: Filtro por Nome do Projeto

A página MinhasTarefas já tem um filtro de projeto por select, mas não tem busca por **nome do projeto** no campo de pesquisa. O `searchTerm` só busca no título e descrição da tarefa (linha 101-102).

**Solução:** Expandir o filtro de busca para incluir o nome do projeto associado à tarefa.

**Arquivo:** `src/pages/MinhasTarefas.tsx` (linha ~101)

```typescript
const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  projects.find(p => p.id === task.project_id)?.name.toLowerCase().includes(searchTerm.toLowerCase());
```

---

### Problema 2: Não Consegue Desmarcar "Entrega Realizada"

**Causa:** O `useEffect` na linha 178-190 do TaskModal monitora `formData.last_delivery`. Quando o campo tem valor, força o status para `CONCLUIDA`. Porém, quando você **limpa** o campo (valor vira `''`), o `useEffect` não faz nada — o status continua `CONCLUIDA` e não volta ao anterior.

Além disso, o `completed_at` na linha 243-245 define `undefined` quando não é CONCLUIDA, mas o status não é revertido automaticamente.

**Solução:** Adicionar lógica no `useEffect` para reverter o status quando `last_delivery` é limpo:

**Arquivo:** `src/components/TaskModal.tsx` (linhas 178-190)

```typescript
useEffect(() => {
  if (formData.last_delivery && formData.status !== 'CONCLUIDA') {
    setFormData(prev => ({ 
      ...prev, 
      status: 'CONCLUIDA',
      completed_at: formData.last_delivery + 'T18:00:00.000Z'
    }));
    setAutoCompletedMessage(true);
    setTimeout(() => setAutoCompletedMessage(false), 3000);
  } else if (!formData.last_delivery && formData.status === 'CONCLUIDA') {
    // Reverter status quando entrega é desmarcada
    setFormData(prev => ({ 
      ...prev, 
      status: task?.status && task.status !== 'CONCLUIDA' ? task.status : 'EM_ANDAMENTO',
      completed_at: undefined
    }));
  }
}, [formData.last_delivery]);
```

Também garantir que ao salvar com `last_delivery` vazio, o `completed_at` seja explicitamente `null`:

```typescript
completed_at: (taskData.status === 'CONCLUIDA' && taskData.last_delivery)
  ? (taskData.last_delivery + 'T18:00:00.000Z')
  : null,  // null em vez de undefined para limpar no banco
```

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/MinhasTarefas.tsx` | Incluir nome do projeto na busca por texto |
| `src/components/TaskModal.tsx` | Reverter status ao limpar entrega + salvar `null` no `completed_at` |

### Resultado Esperado

1. Digitar o nome de um projeto no campo de busca filtra as tarefas desse projeto
2. Limpar o campo "Entrega Realizada" reverte o status de CONCLUIDA para EM_ANDAMENTO
3. Salvar com entrega limpa remove o `completed_at` do banco

