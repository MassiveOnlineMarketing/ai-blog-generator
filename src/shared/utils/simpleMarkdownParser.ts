/**
 * Eenvoudige Markdown to Prismic Slice Parser
 * 
 * Deze parser herkent de speciale slice markers en splitst markdown content
 * in blokken die geconverteerd kunnen worden naar Prismic slices
 */

export interface ParsedBlock {
  type: 'typography' | 'notification' | 'accordion' | 'pros-cons' | 'image' | 'divider' | 'blog-link' | 'checklist' | 'tips' | 'table' | 'dos-donts' | 'quote' | 'call-to-action';
  variation?: string;
  content: string;
  metadata?: Record<string, any>;
}

export class SimpleMarkdownParser {
  
  /**
   * Parse markdown content en return een array van blokken
   */
  parseToBlocks(markdown: string): ParsedBlock[] {
    const blocks: ParsedBlock[] = [];
    
    // Normaliseer line endings
    const normalizedMarkdown = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Split op slice markers
    const sliceRegex = /:::([\w-]+)(?::([\w\/-]+))?\n([\s\S]*?)\n:::/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = sliceRegex.exec(normalizedMarkdown)) !== null) {
      // Voeg normale content voor de slice toe
      if (match.index > lastIndex) {
        const normalContent = normalizedMarkdown.slice(lastIndex, match.index).trim();
        if (normalContent) {
          blocks.push({
            type: 'typography',
            content: normalContent
          });
        }
      }
      
      // Voeg slice toe
      const sliceType = match[1] as ParsedBlock['type'];
      const variation = match[2];
      const content = match[3]?.trim() || '';
      
      blocks.push({
        type: sliceType,
        variation,
        content,
        metadata: this.extractMetadata(sliceType, content, variation)
      });
      
      lastIndex = sliceRegex.lastIndex;
    }
    
    // Voeg overgebleven content toe
    if (lastIndex < normalizedMarkdown.length) {
      const remainingContent = normalizedMarkdown.slice(lastIndex).trim();
      if (remainingContent) {
        blocks.push({
          type: 'typography',
          content: remainingContent
        });
      }
    }
    
    return blocks;
  }
  
  /**
   * Extracteer metadata van een slice type
   */
  private extractMetadata(type: ParsedBlock['type'], content: string, variation?: string): Record<string, any> {
    switch (type) {
      case 'notification':
        return this.extractNotificationData(content, variation);
      case 'accordion':
        return this.extractAccordionData(content);
      case 'pros-cons':
        return this.extractProsConsData(content);
      case 'image':
        return this.extractImageData(content);
      case 'blog-link':
        return this.extractBlogLinkData(content, variation);
      case 'checklist':
        return this.extractChecklistData(content);
      case 'tips':
        return this.extractTipsData(content, variation);
      case 'table':
        return this.extractTableData(content);
      case 'dos-donts':
        return this.extractDosDontsData(content);
      case 'quote':
        return this.extractQuoteData(content, variation);
      case 'call-to-action':
        return this.extractCallToActionData(content, variation);
      default:
        return {};
    }
  }
  
  private extractNotificationData(content: string, variation?: string) {
    const boldMatch = content.match(/\*\*(.*?)\*\*/);
    const boldText = boldMatch ? boldMatch[1] : '';
    const restContent = content.replace(/\*\*(.*?)\*\*\s*/, '').trim();
    
    return {
      boldText,
      restContent,
      variation: variation || 'default'
    };
  }
  
  private extractAccordionData(content: string) {
    const items: Array<{title: string, content: string}> = [];
    const sections = content.split(/^## /m).filter(Boolean);
    
    for (const section of sections) {
      const lines = section.split('\n');
      const title = lines[0]?.trim() || '';
      const itemContent = lines.slice(1).join('\n').trim();
      
      if (title && itemContent) {
        items.push({ title, content: itemContent });
      }
    }
    
    return { items };
  }
  
  private extractProsConsData(content: string) {
    const lines = content.split('\n');
    let prosTitle = '';
    let consTitle = '';
    const pros: string[] = [];
    const cons: string[] = [];
    
    let currentSection: 'pros' | 'cons' | 'none' = 'none';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('**') && trimmed.includes(':**')) {
        const title = trimmed.replace(/\*\*(.*?):\*\*/, '$1');
        if (title.toLowerCase().includes('voordel') || title.toLowerCase().includes('pro')) {
          prosTitle = title;
          currentSection = 'pros';
        } else if (title.toLowerCase().includes('nadel') || title.toLowerCase().includes('con')) {
          consTitle = title;
          currentSection = 'cons';
        }
      } else if (trimmed.startsWith('- ')) {
        const itemText = trimmed.substring(2);
        if (currentSection === 'pros') {
          pros.push(itemText);
        } else if (currentSection === 'cons') {
          cons.push(itemText);
        }
      }
    }
    
    return { prosTitle, pros, consTitle, cons };
  }
  
  private extractImageData(content: string) {
    const imageMatch = content.match(/!\[(.*?)\]\((.*?)\)/);
    
    if (!imageMatch) {
      return { error: 'Invalid image markdown' };
    }
    
    const alt = imageMatch[1] || '';
    const url = imageMatch[2] || '';
    
    // Extract dimensions from placeholder URL
    const dimensionMatch = url.match(/(\d+)x(\d+)/);
    const width = dimensionMatch ? parseInt(dimensionMatch[1] || '800') : 800;
    const height = dimensionMatch ? parseInt(dimensionMatch[2] || '600') : 600;
    
    return { alt, url, width, height };
  }
  
  private extractBlogLinkData(content: string, variation?: string) {
    return {
      linkText: content.trim(),
      slug: variation || ''
    };
  }
  
  private extractChecklistData(content: string) {
    const lines = content.split('\n');
    let title = '';
    let description = '';
    const items: string[] = [];
    
    let foundTitle = false;
    let foundDescription = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && !foundTitle) {
        title = trimmed.replace(/\*\*(.*?)\*\*/, '$1');
        foundTitle = true;
      } else if (!trimmed.startsWith('- ') && trimmed.length > 0 && foundTitle && !foundDescription && !trimmed.startsWith('**')) {
        description = trimmed;
        foundDescription = true;
      } else if (trimmed.startsWith('- ')) {
        items.push(trimmed.substring(2));
      }
    }
    
    return { title, description, items };
  }
  
  private extractTipsData(content: string, variation?: string) {
    const lines = content.split('\n');
    let title = '';
    const tips: Array<{title: string, content: string}> = [];
    
    // Extract title
    const titleMatch = content.match(/\*\*(.*?)\*\*/);
    if (titleMatch) {
      title = titleMatch[1] || '';
    }
    
    // Split on ## headers for tips
    const sections = content.split(/^## /m).filter(Boolean);
    
    for (const section of sections) {
      if (section.includes('**')) continue; // Skip title section
      
      const sectionLines = section.split('\n');
      const tipTitle = sectionLines[0]?.trim() || '';
      const tipContent = sectionLines.slice(1).join('\n').trim();
      
      if (tipTitle && tipContent) {
        tips.push({ title: tipTitle, content: tipContent });
      }
    }
    
    return { title, tips, variation: variation || 'default' };
  }
  
  private extractTableData(content: string) {
    const lines = content.split('\n');
    let title = '';
    const headers: string[] = [];
    const rows: string[][] = [];
    
    // Extract title
    const titleMatch = content.match(/\*\*(.*?)\*\*/);
    if (titleMatch) {
      title = titleMatch[1] || '';
    }
    
    // Find table
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (line?.startsWith('|') && line.endsWith('|')) {
        // This is a table row
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        
        if (headers.length === 0) {
          headers.push(...cells);
        } else if (!line.includes('---')) { // Skip separator row
          rows.push(cells);
        }
      }
    }
    
    return { title, headers, rows };
  }
  
  private extractDosDontsData(content: string) {
    const lines = content.split('\n');
    let dosTitle = '';
    let dontsTitle = '';
    const dos: string[] = [];
    const donts: string[] = [];
    
    let currentSection: 'dos' | 'donts' | 'none' = 'none';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('**') && trimmed.includes('Do\'s:**')) {
        dosTitle = trimmed.replace(/\*\*(.*?):\*\*/, '$1');
        currentSection = 'dos';
      } else if (trimmed.startsWith('**') && trimmed.includes('Don\'ts:**')) {
        dontsTitle = trimmed.replace(/\*\*(.*?):\*\*/, '$1');
        currentSection = 'donts';
      } else if (trimmed.startsWith('- ')) {
        const itemText = trimmed.substring(2);
        if (currentSection === 'dos') {
          dos.push(itemText);
        } else if (currentSection === 'donts') {
          donts.push(itemText);
        }
      }
    }
    
    return { dosTitle, dos, dontsTitle, donts };
  }
  
  private extractQuoteData(content: string, variation?: string) {
    const lines = content.split('\n');
    let quoteText = '';
    let author = '';
    let authorTitle = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('> ')) {
        quoteText += trimmed.substring(2) + '\n';
      } else if (trimmed.startsWith('**—') && trimmed.includes('**')) {
        // Author line: **— Author Name**, Title
        const authorMatch = trimmed.match(/\*\*—\s*(.*?)\*\*,?\s*(.*)/);
        if (authorMatch) {
          author = authorMatch[1] || '';
          authorTitle = authorMatch[2] || '';
        }
      }
    }
    
    return { 
      quoteText: quoteText.trim(), 
      author, 
      authorTitle, 
      variation: variation || 'default' 
    };
  }
  
  private extractCallToActionData(content: string, variation?: string) {
    const lines = content.split('\n');
    let title = '';
    let description = '';
    let buttonText = '';
    let buttonLink = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        title = trimmed.replace(/\*\*(.*?)\*\*/, '$1');
      } else if (trimmed.startsWith('[') && trimmed.includes('|')) {
        // Button format: [Button Text|/link]
        const buttonMatch = trimmed.match(/\[(.*?)\|(.*?)\]/);
        if (buttonMatch) {
          buttonText = buttonMatch[1] || '';
          buttonLink = buttonMatch[2] || '';
        }
      } else if (trimmed.length > 0 && !trimmed.startsWith('**') && !trimmed.startsWith('[')) {
        description += trimmed + '\n';
      }
    }
    
    return { 
      title, 
      description: description.trim(), 
      buttonText, 
      buttonLink, 
      variation: variation || 'default' 
    };
  }
}

// Voorbeeld gebruik:
const exampleMarkdown = `
# SEO Gids 2025

Dit is een inleiding tot de SEO gids met wat achtergrond informatie.

:::notification:base100
**Belangrijke Tip:** Google waardeert expertise meer dan ooit

Dit betekent dat je niet alleen technisch correcte content moet maken, maar ook autoriteit moet tonen in je vakgebied.
:::

## Keyword Research

Keyword research is de basis van elke SEO strategie. Het helpt je om te begrijpen wat je doelgroep zoekt.

:::pros-cons
**Voordelen van Keyword Research:**
- Inzicht in zoekintentie
- Betere content planning
- Verhoogde vindbaarheid

**Nadelen van Keyword Research:**
- Tijdrovend proces
- Tools kunnen duur zijn
- Resultaten zijn schattingen
:::

Voor meer informatie over keyword research:

:::blog-link:/blog/keyword-research-complete-guide
Complete Keyword Research Gids
:::

:::image:default
![SEO Keyword Research Dashboard](https://via.placeholder.com/800x600/E5E7EB/374151?text=Keyword+Research+Dashboard)
:::

## Veelgestelde Vragen

:::accordion
## Wat is het verschil tussen SEO en SEA?
SEO (Search Engine Optimization) richt zich op organische zoekresultaten, terwijl SEA (Search Engine Advertising) betaalde advertenties betreft.

## Hoe lang duurt het voordat SEO resultaten zichtbaar zijn?
Gemiddeld zie je de eerste resultaten na 3-6 maanden, maar significante verbeteringen kunnen 6-12 maanden duren.
:::

## Conclusie

Dit was een overzicht van de belangrijkste SEO principes voor 2025.
`;

// Test de parser
const parser = new SimpleMarkdownParser();
const blocks = parser.parseToBlocks(exampleMarkdown);

console.log('Parsed blocks:');
blocks.forEach((block, index) => {
  console.log(`${index + 1}. ${block.type}${block.variation ? ':' + block.variation : ''}`);
  if (block.metadata && Object.keys(block.metadata).length > 0) {
    console.log('   Metadata:', block.metadata);
  }
});

export { exampleMarkdown };
