# Complete Prompt Templates voor Alle Content Types

Je hebt nu een volledig uitgewerkt prompt systeem voor alle 6 content types zoals gedefinieerd in je content strategie.

## 📋 Overzicht Content Types

| Code | Type | Beschrijving | Woorden | Reading Time |
|------|------|-------------|---------|--------------|
| **P** | Pillar Page | Uitgebreide hub voor breed onderwerp | >2500 | 15-25 min |
| **C** | Cluster | Gedetailleerde subonderwerp artikelen | 1000-2000 | 8-12 min |
| **S** | Support | Korte, specifieke FAQ/definities | 500-1000 | 3-6 min |
| **D** | Dienst | Service pagina's gericht op conversie | 800-1500 | 5-10 min |
| **L** | Collectie | Overzichtspagina's van gerelateerde items | 800-1500 | 5-10 min |
| **T** | Product/Tool | Detailpagina's over specifieke tools | 800-1500 | 5-10 min |

## 🎯 Ontwikkelde Prompt Templates

### ✅ **Pillar Page Prompts** (`P`)
- **Doel**: Centrale hub content die autoriteit toont
- **Focus**: Diepgaande, complete behandeling van breed onderwerp  
- **Structuur**: Uitgebreide inhoudsopgave, meerdere H2/H3 secties
- **Elementen**: Alle slice types, strategisch verdeeld
- **Linking**: Hub voor cluster en support content

### ✅ **Cluster Content Prompts** (`C`) 
- **Doel**: Praktische, actionable content over subonderwerpen
- **Focus**: "Hoe doe je het" meer dan "wat is het"
- **Structuur**: Praktische stappen, concrete voorbeelden
- **Elementen**: Checklists, tips, do's & don'ts, tabellen
- **Linking**: Naar pillar en gerelateerde support content

### ✅ **Support Content Prompts** (`S`)
- **Doel**: Directe antwoorden op specifieke vragen
- **Focus**: Quick reference, scanbare content
- **Structuur**: Direct antwoord, korte uitleg, praktische tips
- **Elementen**: Max 1 element, focus op duidelijkheid
- **Linking**: Naar diepere cluster/pillar content

### ✅ **Service/Dienst Prompts** (`D`)
- **Doel**: Informatief maar conversion-gericht
- **Focus**: Probleem-oplossing, vertrouwen opbouwen
- **Structuur**: Probleem → Oplossing → Voordelen → Proces → Actie
- **Elementen**: Trust-building, testimonials, CTA's
- **Linking**: Naar gerelateerde expertise content

### ✅ **Collection/Collectie Prompts** (`L`)
- **Doel**: Overzicht en beslissingsondersteuning
- **Focus**: Organisatie, vergelijking, navigatie
- **Structuur**: Categorisering, vergelijkingen, aanbevelingen
- **Elementen**: Tabellen, checklists, navigatie-elementen
- **Linking**: Naar alle items in de collectie

### ✅ **Product/Tool Prompts** (`T`)
- **Doel**: Feature uitleg en praktische implementatie
- **Focus**: Wat doet het, hoe werkt het, hoe gebruik je het
- **Structuur**: Overzicht → Features → Gebruik → Specificaties
- **Elementen**: Specificatie tabellen, usage tips, FAQ's
- **Linking**: Naar gerelateerde tools en implementatie content

## 🔧 Technische Implementatie

### AI Model Configuraties
```typescript
P: { model: 'gpt-4.1', maxTokens: 8000 }     // Pillar - hoogste kwaliteit
C: { model: 'gpt-4o-mini', maxTokens: 6000 } // Cluster - balanced 
S: { model: 'gpt-3.5-turbo', maxTokens: 4000 } // Support - efficient
D/L/T: { model: 'gpt-4o-mini', maxTokens: 6000 } // Cluster-level complexity
```

### Reading Time Ranges
- **Pillar (P)**: 15-25 min (>2500 woorden)
- **Cluster (C)**: 8-12 min (1000-2000 woorden)  
- **Support (S)**: 3-6 min (500-1000 woorden)
- **Service/Collection/Product (D/L/T)**: 5-10 min (800-1500 woorden)

### Slice Integration
Alle templates zijn geoptimaliseerd voor:
- ✅ Prismic slice markers (notification, checklist, tips, etc.)
- ✅ Markdown to Prismic conversie
- ✅ SEO-geoptimaliseerde structuren
- ✅ Interne linking strategieën

## 🚀 Usage

### Basis Generatie
```typescript
import { generateBlogFromTopicalMapWithPrismic } from './src/features/blog-generation/blog-generator';

const result = await generateBlogFromTopicalMapWithPrismic(entry, 'C'); // Voor cluster content
```

### Alle Types Testen
```bash
pnpm ts-node examples/comprehensive-content-types-example.ts
```

## 📁 Bestanden Structuur

```
src/features/blog-generation/prompts/
├── pillar-prompts.ts      # P - Pillar Page prompts
├── cluster-prompts.ts     # C - Cluster content prompts  
├── support-prompts.ts     # S - Support content prompts
├── service-prompts.ts     # D - Dienst/Service prompts
├── collection-prompts.ts  # L - Collectie/Collection prompts
├── product-tool-prompts.ts # T - Product/Tool prompts
├── base-prompts.ts        # Shared slice definitions
└── index.ts              # Export alle prompt functions
```

## 🎯 Content Strategieën per Type

### Pillar Pages (`P`)
- Diepgaande expertise tonen
- Semantische zoekwoord dekking
- Centrale linking hub
- Lange-vorm authoritative content

### Cluster Content (`C`)  
- Praktische implementatie focus
- Stap-voor-stap instructies
- Concrete voorbeelden en case studies
- Actionable takeaways

### Support Content (`S`)
- Direct antwoord op specifieke vraag
- Scanbare, quick-reference format
- Featured snippet optimalisatie
- Long-tail keyword targeting

### Service Pages (`D`)
- Probleem-oplossing positionering
- Trust en credibility building
- Subtiele conversion elementen
- Proces transparantie

### Collection Pages (`L`)
- Organisatie en categorisering
- Vergelijkende elementen
- Beslissingsondersteuning
- Navigatie hub functionaliteit

### Product/Tool Pages (`T`)
- Feature-benefit translatie
- Praktische gebruik scenarios
- Technical specs toegankelijk maken
- Implementation guidance

## ✅ Volgende Stappen

Het prompt systeem is nu **volledig klaar** voor gebruik. Je kunt:

1. **Direct beginnen** met content generatie voor alle 6 types
2. **Test de templates** met de comprehensive example script
3. **Pas prompts aan** voor specifieke use cases
4. **Integreer met database** voor automatische batch generatie
5. **Monitor resultaten** en optimaliseer prompts op basis van performance

Alle templates zijn geoptimaliseerd voor je Prismic workflow en Nederlandse content strategie! 🎉
