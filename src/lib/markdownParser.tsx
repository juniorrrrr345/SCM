import React from 'react';

/**
 * Parser Markdown simple pour les descriptions de produits
 * Supporte : **gras**, *italique*, __souligné__, ~~barré~~
 */

export interface MarkdownNode {
  type: 'text' | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'linebreak';
  content: string;
  children?: MarkdownNode[];
}

export function parseMarkdown(text: string): MarkdownNode[] {
  if (!text) return [];

  const nodes: MarkdownNode[] = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    // Vérifier les différents formats
    const boldMatch = text.slice(currentIndex).match(/^\*\*(.*?)\*\*/);
    const italicMatch = text.slice(currentIndex).match(/^\*(.*?)\*/);
    const underlineMatch = text.slice(currentIndex).match(/^__(.*?)__/);
    const strikethroughMatch = text.slice(currentIndex).match(/^~~(.*?)~~/);
    const linebreakMatch = text.slice(currentIndex).match(/^\n/);

    if (boldMatch) {
      nodes.push({
        type: 'bold',
        content: boldMatch[1],
        children: parseMarkdown(boldMatch[1])
      });
      currentIndex += boldMatch[0].length;
    } else if (italicMatch) {
      nodes.push({
        type: 'italic',
        content: italicMatch[1],
        children: parseMarkdown(italicMatch[1])
      });
      currentIndex += italicMatch[0].length;
    } else if (underlineMatch) {
      nodes.push({
        type: 'underline',
        content: underlineMatch[1],
        children: parseMarkdown(underlineMatch[1])
      });
      currentIndex += underlineMatch[0].length;
    } else if (strikethroughMatch) {
      nodes.push({
        type: 'strikethrough',
        content: strikethroughMatch[1],
        children: parseMarkdown(strikethroughMatch[1])
      });
      currentIndex += strikethroughMatch[0].length;
    } else if (linebreakMatch) {
      nodes.push({
        type: 'linebreak',
        content: '\n'
      });
      currentIndex += 1;
    } else {
      // Texte normal - prendre jusqu'au prochain format ou fin
      let nextIndex = currentIndex + 1;
      while (nextIndex < text.length && 
             !text.slice(nextIndex).match(/^(\*\*|\*|__|~~|\n)/)) {
        nextIndex++;
      }
      
      const textContent = text.slice(currentIndex, nextIndex);
      if (textContent) {
        nodes.push({
          type: 'text',
          content: textContent
        });
      }
      currentIndex = nextIndex;
    }
  }

  return nodes;
}

export function renderMarkdownToHTML(nodes: MarkdownNode[]): string {
  return nodes.map(node => {
    switch (node.type) {
      case 'bold':
        return `<strong>${renderMarkdownToHTML(node.children || [node])}</strong>`;
      case 'italic':
        return `<em>${renderMarkdownToHTML(node.children || [node])}</em>`;
      case 'underline':
        return `<u>${renderMarkdownToHTML(node.children || [node])}</u>`;
      case 'strikethrough':
        return `<del>${renderMarkdownToHTML(node.children || [node])}</del>`;
      case 'linebreak':
        return '<br>';
      case 'text':
      default:
        return node.content;
    }
  }).join('');
}

export function renderMarkdownToJSX(nodes: MarkdownNode[]): React.ReactNode[] {
  return nodes.map((node, index) => {
    switch (node.type) {
      case 'bold':
        return (
          <strong key={index}>
            {renderMarkdownToJSX(node.children || [node])}
          </strong>
        );
      case 'italic':
        return (
          <em key={index}>
            {renderMarkdownToJSX(node.children || [node])}
          </em>
        );
      case 'underline':
        return (
          <u key={index}>
            {renderMarkdownToJSX(node.children || [node])}
          </u>
        );
      case 'strikethrough':
        return (
          <del key={index}>
            {renderMarkdownToJSX(node.children || [node])}
          </del>
        );
      case 'linebreak':
        return <br key={index} />;
      case 'text':
      default:
        return node.content;
    }
  });
}