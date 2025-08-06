# Markdown to Prismic Slice System

Dit systeem genereert blog content in markdown formaat met speciale markers die automatisch geconverteerd kunnen worden naar Prismic slices.

## Overzicht

1. **AI Prompt System**: Genereert content met speciale slice markers
2. **Markdown Parser**: Parseert markdown en herkent slice markers  
3. **Prismic Converter**: Converteert parsed blokken naar Prismic slice structuren

## Slice Markers

### 1. Notification Slices
Voor belangrijke informatie, tips, waarschuwingen:

```markdown
:::notification:default
**Belangrijke Tip:** [korte krachtige titel]

[Content in markdown met paragrafen en lijsten]
:::
```

**Variaties:**
- `:default` - grijs
- `:base100` - huisstyle  
- `:purple` - paars
- `:orange` - oranje

### 2. Accordion/FAQ Slices
Voor veelgestelde vragen of uitklapbare content:

```markdown
:::accordion
## [Vraag of titel 1]
[Antwoord content in markdown]

## [Vraag of titel 2] 
[Antwoord content in markdown]
:::
```

### 3. Pros/Cons Slices
Voor alle voor-/nadeel content (vervangt gewone lijsten):

```markdown
:::pros-cons
**Voordelen van [onderwerp]:**
- [Voordeel 1]
- [Voordeel 2]
- [Voordeel 3]

**Nadelen van [onderwerp]:**
- [Nadeel 1]
- [Nadeel 2]
- [Nadeel 3]
:::
```

### 4. Checklist Slices
Voor praktische stappen en overzichten:

```markdown
:::checklist
**[Titel van checklist]**

[Optionele beschrijving]

- [Checklist item 1]
- [Checklist item 2]
- [Checklist item 3]
:::
```

### 5. Tips Slices
Voor praktische tips en adviezen:

```markdown
:::tips:numbered
**[Titel van tips sectie]**

## [Tip titel 1]
[Tip uitleg]

## [Tip titel 2]
[Tip uitleg]
:::
```

**Variaties:**
- `:default` - basis tips
- `:numbered` - genummerde tips
- `:bulleted` - bullet points

### 6. Do's & Don'ts Slices
Voor do's en don'ts lijsten:

```markdown
:::dos-donts
**SEO Do's:**
- [Do item 1]
- [Do item 2]

**SEO Don'ts:**
- [Don't item 1]
- [Don't item 2]
:::
```

### 7. Table Slices
Voor vergelijkingen en gestructureerde data:

```markdown
:::table
**[Tabel titel]**

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
:::
```

### 8. Quote Slices
Voor citaten en testimonials:

```markdown
:::quote:highlight
> [Quote tekst hier]

**— [Auteur naam]**, [Functie/titel]
:::
```

**Variaties:**
- `:default` - gewone quote
- `:highlight` - gemarkeerde quote
- `:testimonial` - klantquote

### 9. Call-to-Action Slices
Voor acties die de lezer moet ondernemen:

```markdown
:::call-to-action:primary
**[CTA titel]**

[CTA beschrijving]

[Button: Tekst|/link]
:::
```

**Variaties:**
- `:default` - basis CTA
- `:primary` - prominente CTA
- `:secondary` - subtiele CTA

### 10. Image Slices
Voor afbeeldingen met placeholder URLs:

```markdown
:::image:default
![Alt text beschrijving](https://via.placeholder.com/800x600/E5E7EB/374151?text=BESCHRIJVING)
:::
```

**Variaties:**
- `:default` - normale afbeelding
- `:imageWithBorder` - met border

### 11. Divider Slices
Voor visuele scheiding:

```markdown
:::divider
:::
```

### 12. Blog Link Slices
Voor interne verwijzingen naar gerelateerde blog posts:

```markdown
:::blog-link:/blog/slug-van-gerelateerde-post
[Link tekst die getoond wordt]
:::
```

## Gebruiksflow

### 1. Content Generatie
De AI prompts (`pillar-system-prompt-v2-prismic.md` en `pillar-user-prompt.md`) instrueren de AI om content te genereren met de juiste slice markers.

### 2. Markdown Parsing
```typescript
import { SimpleMarkdownParser } from './utils/simpleMarkdownParser';

const parser = new SimpleMarkdownParser();
const blocks = parser.parseToBlocks(markdownContent);
```

### 3. Prismic Conversie
```typescript
import { MarkdownToPrismicParser } from './utils/markdownToPrismicParser';

const prismicParser = new MarkdownToPrismicParser();
const slices = prismicParser.parseMarkdownToSlices(markdownContent);
```

## Voorbeeld Output

**Input Markdown:**
```markdown
# SEO Gids 2025

Dit is een inleiding.

:::notification:base100
**SEO Pro Tip:** Google waardeert expertise

Dit betekent dat je autoriteit moet tonen.
:::

:::checklist
**SEO Basis Checklist**

Volg deze stappen voor een goede start.

- Controleer je titel tags
- Optimaliseer je meta descriptions
- Test je website snelheid
:::

:::pros-cons
**Voordelen van SEO:**
- Duurzame groei
- Organisch verkeer

**Nadelen van SEO:**
- Tijdrovend proces
- Lange termijn investering
:::

:::tips:numbered
**Praktische SEO Tips**

## Focus op gebruikers
Denk altijd eerst aan wat je bezoekers willen.

## Monitor je resultaten
Gebruik Google Analytics voor inzichten.
:::
```

**Output Prismic Slices:**
```json
[
  {
    "slice_type": "typography",
    "variation": "default",
    "primary": {
      "content": [...],
      "show_divider": true
    }
  },
  {
    "slice_type": "notification", 
    "variation": "base100",
    "primary": {
      "bold_text": "SEO Pro Tip: Google waardeert expertise",
      "content": [...]
    }
  },
  {
    "slice_type": "pros_cons",
    "variation": "default", 
    "primary": {
      "pros_title": "Voordelen van SEO",
      "pros": [
        {"title": "Duurzame groei"},
        {"title": "Organisch verkeer"}
      ],
      "cons_title": "Nadelen van SEO",
      "cons": [
        {"title": "Tijdrovend proces"},
        {"title": "Lange termijn investering"}
      ]
    }
  }
]
```

## Voordelen van dit Systeem

1. **Gestructureerde Content**: AI genereert direct parseerbare content
2. **Flexibiliteit**: Gemakkelijk nieuwe slice types toevoegen
3. **Consistentie**: Standaard markers zorgen voor uniforme output
4. **Schaalbaarheid**: Automatische conversie van markdown naar Prismic

## Best Practices

1. **Gebruik slice markers spaarzaam**: Max 1-2 per subsectie
2. **Prioriteer leesflow**: Voeg verbindende tekst toe tussen slices
3. **Kies relevante slices**: Alleen als ze echte waarde toevoegen
4. **Test de output**: Controleer of de parsing correct werkt

## Implementatie Stappen

1. Update je AI prompts om slice markers te gebruiken
2. Implementeer de markdown parser in je content pipeline
3. Test met voorbeeldcontent
4. Integreer met je Prismic publishing workflow
5. Monitor en optimaliseer de resultaten

## Toekomstige Uitbreidingen

- Ondersteuning voor custom slice types
- Rich text formatting binnen slices
- Automatische image optimization
- Batch processing van meerdere blogs
- Preview functionaliteit voor slice output
