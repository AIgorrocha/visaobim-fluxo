# /publicar-artigo - Skill para Publicar Artigos no Blog

## Descricao
Esta skill automatiza a publicacao de artigos no blog da Visao BIM. Voce fornece o texto (markdown), imagens e o sistema processa tudo automaticamente.

## Como Usar

Quando o usuario usar este comando, siga os passos abaixo:

### Passo 1: Coletar Informacoes

Pergunte ao usuario:
1. **Texto do artigo** - arquivo markdown ou texto colado
2. **Imagens** - caminho para imagens (PNG, JPG, PDF de slides)
3. **Titulo** - se nao estiver no markdown
4. **Categoria** - sugerir baseado no conteudo (IA + Arquitetura, BIM, Construcao, etc.)

### Passo 2: Processar Imagens

1. Copiar imagens para `public/assets/images/blog/[slug-do-artigo]/`
2. Converter para WebP se necessario (usando sharp ou outro metodo)
3. Nomear de forma descritiva: `cover.webp`, `infografico.webp`, `slide-01.webp`

### Passo 3: Criar Slug e Metadados

Gerar automaticamente:
- **slug** - baseado no titulo (lowercase, sem acentos, hifens)
- **excerpt** - primeiras 160 caracteres do texto ou resumo
- **readTime** - calcular baseado em 200 palavras/minuto
- **tags** - extrair palavras-chave do texto

### Passo 4: Otimizar para SEO

Gerar automaticamente:
- **seo.title** - titulo otimizado (max 60 caracteres) + "| Visao BIM"
- **seo.description** - descricao meta (max 160 caracteres)
- **seo.keywords** - array de 8-10 palavras-chave relevantes

### Passo 5: Adicionar ao blogPosts.ts

Adicionar novo objeto ao array `blogPosts` em `src/data/blogPosts.ts` com todos os campos preenchidos.

### Passo 6: Verificar e Testar

1. Rodar `npm run dev` para verificar se nao ha erros
2. Verificar se o artigo aparece em `/blog`
3. Verificar se a pagina individual carrega corretamente

### Passo 7: Reportar ao Usuario

Mostrar ao usuario:
- URL do novo artigo
- Resumo do SEO configurado
- Proximos passos (commit, deploy)

---

## Template de Artigo

```typescript
{
  id: "[slug]",
  slug: "[slug]",
  title: "[Titulo do Artigo]",
  excerpt: "[Resumo em 160 caracteres]",
  category: "[Categoria]",
  author: {
    name: "Igor Rocha",
    role: "Engenheiro Civil, Especialista em BIM & AI",
    image: "/assets/images/team/igor.webp"
  },
  coverImage: "/assets/images/blog/[slug]/cover.webp",
  publishedAt: "[YYYY-MM-DD]", // Data de hoje
  readTime: "[X] min",
  tags: ["Tag1", "Tag2", "Tag3"],
  featured: false, // true se for artigo em destaque
  seo: {
    title: "[Titulo SEO] | Visao BIM",
    description: "[Descricao meta em 160 caracteres]",
    keywords: ["keyword1", "keyword2", "..."]
  },
  content: \`
    [Conteudo em Markdown]
  \`
}
```

---

## Palavras-Chave Recomendadas por Categoria

### IA + Arquitetura
- IA na arquitetura
- inteligencia artificial arquitetura
- Midjourney arquitetura
- renderizacao com IA
- projeto arquitetonico com IA
- automacao projeto

### BIM
- projetos BIM
- modelagem BIM
- Revit
- compatibilizacao BIM
- BIM 4D 5D
- construcao virtual

### Construcao
- economia na obra
- reducao de custos construcao
- planejamento de obras
- orçamento de obras
- clash detection

---

## Checklist de Publicacao

- [ ] Texto revisado e formatado em Markdown
- [ ] Imagens copiadas e otimizadas
- [ ] Slug gerado sem acentos
- [ ] Excerpt com max 160 caracteres
- [ ] Tags relevantes (5-8)
- [ ] SEO title com max 60 caracteres
- [ ] SEO description com max 160 caracteres
- [ ] Keywords relevantes (8-10)
- [ ] Categoria definida
- [ ] Tempo de leitura calculado
- [ ] Artigo adicionado ao blogPosts.ts
- [ ] Testado localmente
- [ ] Commit realizado

---

## Exemplo de Uso

Usuario: `/publicar-artigo`

Claude:
"Vou ajudar a publicar um novo artigo no blog. Por favor, me envie:
1. O texto do artigo (markdown ou arquivo)
2. As imagens (PNG, JPG ou PDF de slides)
3. Se quiser, sugira um titulo e categoria

Depois vou processar tudo automaticamente e gerar o SEO."
