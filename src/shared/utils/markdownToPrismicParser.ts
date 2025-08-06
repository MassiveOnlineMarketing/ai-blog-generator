/**
 * Markdown to Prismic Slices Parser
 * 
 * Deze parser converteert markdown met speciale slice markers naar Prismic slice structures
 */

interface PrismicSlice {
  slice_type: string;
  variation: string;
  primary: any;
}

export class MarkdownToPrismicParser {
  
  /**
   * Parse markdown content naar Prismic slices
   */
  parseMarkdownToSlices(markdown: string): PrismicSlice[] {
    const slices: PrismicSlice[] = [];
    
    // First, convert :::blog-link: markers to markdown links before any other processing
    markdown = markdown.replace(/:::blog-link:(.*?)\n(.*?)\n:::/gs, '[$2]($1)');
    
    // Split content in blokken op basis van slice markers en normale content
    const blocks = this.splitIntoBlocks(markdown);
    
    for (const block of blocks) {
      if (block.type === 'slice' && block.marker) {
        const slice = this.parseSliceBlock(block.content, block.marker);
        if (slice) slices.push(slice);
      } else if (block.type === 'typography') {
        // Normale markdown content wordt een typography slice
        const slice = this.createTypographySlice(block.content);
        if (slice) slices.push(slice);
      }
    }
    
    return slices;
  }
  
  /**
   * Split markdown in blokken van normale content en slice markers
   */
  private splitIntoBlocks(markdown: string) {
    const blocks: Array<{type: 'slice' | 'typography', content: string, marker?: string}> = [];
    
    // Remove standalone --- dividers first
    markdown = markdown.replace(/^---\s*$/gm, '');
    
    // Regex voor slice markers: :::marker:variation tot :::
    // Updated to handle blog-link URLs with slashes and other special characters
    const sliceRegex = /:::([\w-]+)(?::([^\n]+))?\n([\s\S]*?)\n:::/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = sliceRegex.exec(markdown)) !== null) {
      // Voeg normale content voor de slice toe
      if (match.index > lastIndex) {
        const normalContent = markdown.slice(lastIndex, match.index).trim();
        if (normalContent) {
          blocks.push({type: 'typography', content: normalContent});
        }
      }
      
      // Voeg slice toe
      blocks.push({
        type: 'slice',
        content: match[3]?.trim() || '',
        marker: `${match[1]}${match[2] ? ':' + match[2] : ''}`
      });
      
      lastIndex = sliceRegex.lastIndex;
    }
    
    // Voeg overgebleven content toe
    if (lastIndex < markdown.length) {
      const remainingContent = markdown.slice(lastIndex).trim();
      if (remainingContent) {
        blocks.push({type: 'typography', content: remainingContent});
      }
    }
    
    return blocks;
  }
  
  /**
   * Parse een specifiek slice block
   */
  private parseSliceBlock(content: string, marker: string): PrismicSlice | null {
    const [sliceType, variation = 'default'] = marker.split(':');
    
    switch (sliceType) {
      case 'notification':
        return this.parseNotificationSlice(content, variation);
      case 'accordion':
        return this.parseAccordionSlice(content);
      case 'pros-cons':
        return this.parseProsConsSlice(content);
      case 'checklist':
        return this.parseChecklistSlice(content);
      case 'tips':
        return this.parseTipsSlice(content, variation);
      case 'table':
        return this.parseTableSlice(content);
      case 'dos-donts':
        return this.parseDosDontsSlice(content);
      case 'quote':
        return this.parseQuoteSlice(content, variation);
      case 'call-to-action':
        return this.parseCallToActionSlice(content, variation);
      case 'image':
        return this.parseImageSlice(content, variation);
      case 'divider':
        return this.parseDividerSlice();
      default:
        console.warn(`Unknown slice type: ${sliceType}`);
        return null;
    }
  }
  
  /**
   * Parse notification slice
   */
  private parseNotificationSlice(content: string, variation: string): PrismicSlice {
    // Extract bold text (eerste ** ** block)
    const boldMatch = content.match(/\*\*(.*?)\*\*/);
    const boldText = boldMatch ? boldMatch[1] : '';
    
    // Rest van content (na eerste bold text)
    const restContent = content.replace(/\*\*(.*?)\*\*\s*/, '').trim();
    
    return {
      slice_type: 'notification',
      variation: variation || 'default',
      primary: {
        bold_text: boldText,
        content: this.markdownToRichText(restContent)
      }
    };
  }
  
  /**
   * Parse accordion slice
   */
  private parseAccordionSlice(content: string): PrismicSlice {
    const items: Array<{title: string, content: any}> = [];
    
    // Split op ## headers
    const sections = content.split(/^## /m).filter(Boolean);
    
    for (const section of sections) {
      const lines = section.split('\n');
      let title = lines[0]?.trim() || '';
      const itemContent = lines.slice(1).join('\n').trim();
      
      // Clean markdown formatting from title
      title = this.cleanTextForSpans(title);
      
      if (title && itemContent) {
        items.push({
          title,
          content: this.markdownToRichText(itemContent)
        });
      }
    }
    
    return {
      slice_type: 'accordion',
      variation: 'default',
      primary: {
        accordion_item: items
      }
    };
  }
  
  /**
   * Parse pros/cons slice
   */
  private parseProsConsSlice(content: string): PrismicSlice {
    const lines = content.split('\n');
    let prosTitle = '';
    let consTitle = '';
    const pros: Array<{title: string}> = [];
    const cons: Array<{title: string}> = [];
    
    let currentSection: 'pros' | 'cons' | 'none' = 'none';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('**') && trimmed.includes(':**')) {
        // Dit is een sectie titel
        const title = trimmed.replace(/\*\*(.*?):\*\*/, '$1');
        if (title.toLowerCase().includes('voordel') || title.toLowerCase().includes('pro')) {
          prosTitle = title;
          currentSection = 'pros';
        } else if (title.toLowerCase().includes('nadel') || title.toLowerCase().includes('con')) {
          consTitle = title;
          currentSection = 'cons';
        }
      } else if (trimmed.startsWith('- ')) {
        // Dit is een lijst item - remove markdown formatting from the title
        let itemText = trimmed.substring(2);
        // Clean markdown formatting for display
        itemText = this.cleanTextForSpans(itemText);
        
        if (currentSection === 'pros') {
          pros.push({title: itemText});
        } else if (currentSection === 'cons') {
          cons.push({title: itemText});
        }
      }
    }
    
    return {
      slice_type: 'pros_cons',
      variation: 'default',
      primary: {
        custom_marker: false,
        pros_title: prosTitle,
        pros,
        cons_title: consTitle,
        cons
      }
    };
  }
  
  /**
   * Parse checklist slice
   */
  private parseChecklistSlice(content: string): PrismicSlice {
    const lines = content.split('\n');
    let title = '';
    let description = '';
    const items: Array<{item: string}> = [];
    
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
        items.push({item: trimmed.substring(2)});
      }
    }
    
    return {
      slice_type: 'checklist',
      variation: 'default',
      primary: {
        title,
        description: description ? this.markdownToRichText(description) : [],
        checklist_items: items
      }
    };
  }
  
  /**
   * Parse tips slice
   */
  private parseTipsSlice(content: string, variation: string): PrismicSlice {
    const lines = content.split('\n');
    let title = '';
    const tips: Array<{tip_title: string, tip_content: any}> = [];
    
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
        tips.push({
          tip_title: tipTitle,
          tip_content: this.markdownToRichText(tipContent)
        });
      }
    }
    
    return {
      slice_type: 'tips',
      variation: variation || 'default',
      primary: {
        title,
        tips
      }
    };
  }
  
  /**
   * Parse table slice
   */
  private parseTableSlice(content: string): PrismicSlice {
    const lines = content.split('\n');
    let title = '';
    const headers: Array<{header: string}> = [];
    const rows: Array<{cells: Array<{cell: string}>}> = [];
    
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
          // First row is headers
          headers.push(...cells.map(cell => ({header: cell})));
        } else if (!line.includes('---')) { // Skip separator row
          // Data row
          rows.push({
            cells: cells.map(cell => ({cell}))
          });
        }
      }
    }
    
    return {
      slice_type: 'table',
      variation: 'default',
      primary: {
        title,
        table_headers: headers,
        table_rows: rows
      }
    };
  }
  
  /**
   * Parse dos & don'ts slice
   */
  private parseDosDontsSlice(content: string): PrismicSlice {
    const lines = content.split('\n');
    let dosTitle = '';
    let dontsTitle = '';
    const dos: Array<{item: string}> = [];
    const donts: Array<{item: string}> = [];
    let currentSection: 'dos' | 'donts' | 'none' = 'none';
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('**') && trimmed.includes("Do's:**")) {
        dosTitle = trimmed.replace(/\*\*(.*?):\*\*/, '$1');
        currentSection = 'dos';
      } else if (trimmed.startsWith('**') && trimmed.includes("Don'ts:**")) {
        dontsTitle = trimmed.replace(/\*\*(.*?):\*\*/, '$1');
        currentSection = 'donts';
      } else if (trimmed.startsWith('- ')) {
        const itemText = trimmed.substring(2);
        if (currentSection === 'dos') {
          dos.push({item: itemText});
        } else if (currentSection === 'donts') {
          donts.push({item: itemText});
        }
      }
    }
    return {
      slice_type: 'dos_donts',
      variation: 'default',
      primary: {
        dos_title: dosTitle,
        dos,
        donts_title: dontsTitle,
        donts
      }
    };
  }
  
  /**
   * Parse quote slice
   */
  private parseQuoteSlice(content: string, variation: string): PrismicSlice {
    // Extract quote text (tussen > en nieuwe regel)
    const quoteMatch = content.match(/^\s*>\s*(.*?)\s*$/m);
    const quoteText = quoteMatch ? quoteMatch[1] : '';
    
    // Rest van content (na quote)
    const restContent = content.replace(/^\s*>\s*.*?\s*$/m, '').trim();
    
    return {
      slice_type: 'quote',
      variation: variation || 'default',
      primary: {
        quote: quoteText,
        author: restContent ? this.markdownToRichText(restContent) : []
      }
    };
  }
  
  /**
   * Parse call to action slice
   */
  private parseCallToActionSlice(content: string, variation: string): PrismicSlice {
    // Verwacht format: [Link tekst](url "Titel")
    const linkMatch = content.match(/\[(.*?)\]\((.*?)\s*"?(.*?)"?\)/);
    let linkText = '';
    let url = '';
    let title = '';
    
    if (linkMatch) {
      linkText = linkMatch[1] ?? '';
      url = linkMatch[2] ?? '';
      title = linkMatch[3] ?? '';
    }
    
    return {
      slice_type: 'call_to_action',
      variation: variation || 'default',
      primary: {
        link_text: linkText,
        url,
        title
      }
    };
  }
  
  /**
   * Parse image slice
   */
  private parseImageSlice(content: string, variation: string): PrismicSlice {
    // Verwacht format: ![Alt tekst](url "Titel")
    const imageMatch = content.match(/!\[(.*?)\]\((.*?)\s*"?(.*?)"?\)/);
    let altText = '';
    let url = '';
    let title = '';
    
    if (imageMatch) {
      altText = imageMatch[1] ?? '';
      url = imageMatch[2] ?? '';
      title = imageMatch[3] ?? '';
    }
    
    return {
      slice_type: 'image',
      variation: variation || 'default',
      primary: {
        alt_text: altText,
        url,
        title
      }
    };
  }
  
  /**
   * Parse divider slice
   */
  private parseDividerSlice(): PrismicSlice {
    return {
      slice_type: 'divider',
      variation: 'default',
      primary: {}
    };
  }
  
  /**
   * Convert markdown to Prismic rich text format
   * Now supports headings (#, ##, ###, etc.) as Prismic heading types
   * and hyperlinks as Prismic spans in paragraphs
   */
  private markdownToRichText(markdown: string) {
    // Split by double newlines to get blocks (paragraphs or headings)
    const blocks = markdown.split(/\n\n+/);
    const richText = [];

    for (let block of blocks) {
      block = block.trim();
      if (!block) continue;

      // Heading detection
      const headingMatch = block.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch && headingMatch[1] && headingMatch[2]) {
        const level = headingMatch[1].length;
        let text = headingMatch[2];
        const spans = this.extractSpansFromText(text);
        text = this.cleanTextForSpans(text);
        
        richText.push({
          type: `heading${level}`,
          text,
          spans,
          direction: 'ltr'
        });
        continue;
      }

      // Handle bullet lists (lines starting with -)
      if (block.includes('\n- ')) {
        const lines = block.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('- ')) {
            let listText = trimmed.substring(2);
            const spans = this.extractSpansFromText(listText);
            listText = this.cleanTextForSpans(listText);
            
            richText.push({
              type: 'list-item',
              text: listText,
              spans,
              direction: 'ltr'
            });
          } else if (trimmed && !trimmed.startsWith('- ')) {
            // Non-list content in between
            let text = trimmed;
            const spans = this.extractSpansFromText(text);
            text = this.cleanTextForSpans(text);
            
            richText.push({
              type: 'paragraph',
              text,
              spans,
              direction: 'ltr'
            });
          }
        }
        continue;
      }

      // Handle numbered lists (lines starting with numbers)
      if (block.match(/^\d+\.\s/m)) {
        const lines = block.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.match(/^\d+\.\s/)) {
            let listText = trimmed.replace(/^\d+\.\s/, '');
            const spans = this.extractSpansFromText(listText);
            listText = this.cleanTextForSpans(listText);
            
            richText.push({
              type: 'o-list-item',
              text: listText,
              spans,
              direction: 'ltr'
            });
          } else if (trimmed && !trimmed.match(/^\d+\.\s/)) {
            // Non-list content in between
            let text = trimmed;
            const spans = this.extractSpansFromText(text);
            text = this.cleanTextForSpans(text);
            
            richText.push({
              type: 'paragraph',
              text,
              spans,
              direction: 'ltr'
            });
          }
        }
        continue;
      }

      // Regular paragraph with spans
      let text = block;
      const spans = this.extractSpansFromText(text);
      text = this.cleanTextForSpans(text);
      
      richText.push({
        type: 'paragraph',
        text,
        spans,
        direction: 'ltr'
      });
    }
    return richText;
  }

  /**
   * Extract spans (bold, italic, links) from text and calculate positions
   */
  private extractSpansFromText(text: string) {
    const spans = [];
    let workingText = text;
    let offset = 0;

    // Handle bold text (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let boldMatch;
    while ((boldMatch = boldRegex.exec(text)) !== null) {
      if (boldMatch[1] !== undefined) {
        const start = boldMatch.index - offset;
        const length = boldMatch[1].length;
        spans.push({
          start,
          end: start + length,
          type: 'strong'
        });
        offset += 4; // Remove ** at start and end
      }
    }

    // Handle italic text (*text*)
    const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
    let italicMatch;
    while ((italicMatch = italicRegex.exec(text)) !== null) {
      if (italicMatch[1] !== undefined) {
        const start = italicMatch.index - offset;
        const length = italicMatch[1].length;
        spans.push({
          start,
          end: start + length,
          type: 'em'
        });
        offset += 2; // Remove * at start and end
      }
    }

    // Handle hyperlinks [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(text)) !== null) {
      const linkText = linkMatch[1] ?? '';
      const url = linkMatch[2] ?? '';
      const start = linkMatch.index - offset;
      const length = linkText.length;
      
      spans.push({
        start,
        end: start + length,
        type: 'hyperlink',
        data: {
          link_type: 'Web',
          url: url,
          target: '_self'
        }
      });
      
      // Adjust offset for removed markdown syntax
      offset += linkMatch[0].length - linkText.length;
    }

    return spans.sort((a, b) => a.start - b.start);
  }

  /**
   * Clean text by removing markdown syntax while preserving content
   */
  private cleanTextForSpans(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1') // Remove italic  
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links, keep text
  }  /**
   * Create a paragraph with hyperlink spans
   */
  private createParagraphWithSpans(text: string) {
    // Remove bold formatting for plain text
    let cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1');
    const spans = [];
    
    // Handle hyperlinks
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let newText = '';
    let lastIndex = 0;
    let match;
    
    while ((match = linkRegex.exec(cleanText)) !== null) {
      // Add text before the link
      newText += cleanText.slice(lastIndex, match.index);
      const linkText = match[1] ?? '';
      const url = match[2] ?? '';
      const start = newText.length;
      newText += linkText;
      const end = newText.length;
      
      spans.push({
        start,
        end,
        type: 'hyperlink',
        data: {
          link_type: 'Web',
          url: url,
          target: '_self'
        }
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after last link
    newText += cleanText.slice(lastIndex);
    
    // Handle bold and italic formatting
    this.addFormattingSpans(newText, text, spans);
    
    return {
      type: 'paragraph',
      text: newText,
      spans,
      direction: 'ltr'
    };
  }
  
  /**
   * Add bold and italic formatting spans
   */
  private addFormattingSpans(cleanText: string, originalText: string, spans: any[]) {
    // For now, we'll skip bold/italic formatting to avoid complexity
    // This can be enhanced later if needed
  }
  
  /**
   * Create een standaard typography slice
   */
  private createTypographySlice(content: string): PrismicSlice {
    return {
      slice_type: 'typography',
      variation: 'default',
      primary: {
        content: this.markdownToRichText(content)
      }
    };
  }
}
