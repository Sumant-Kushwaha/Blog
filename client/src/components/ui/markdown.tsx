import React from "react";

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  // This is a very basic markdown renderer
  // In a real app, you would use a library like marked or remark
  
  const renderMarkdown = (text: string) => {
    // Replace headings
    let html = text
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
      .replace(/^###### (.*$)/gm, '<h6>$1</h6>');
      
    // Replace bold and italic
    html = html
      .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gm, '<em>$1</em>')
      .replace(/\_\_(.*)\_\_/gm, '<strong>$1</strong>')
      .replace(/\_(.*)\_/gm, '<em>$1</em>');
      
    // Replace code blocks
    html = html.replace(/```([\s\S]*?)```/gm, '<pre><code>$1</code></pre>');
    
    // Replace inline code
    html = html.replace(/`([^`]+)`/gm, '<code>$1</code>');
    
    // Replace links
    html = html.replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Replace lists
    html = html.replace(/^\s*\*\s(.*$)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n)+/gm, '<ul>$&</ul>');
    
    // Replace numbered lists
    html = html.replace(/^\s*\d+\.\s(.*$)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n)+/gm, '<ol>$&</ol>');
    
    // Replace paragraphs (split by newlines)
    html = html.replace(/^(?!<[hou]|<li|<pre|<table)(.+)$/gm, '<p>$1</p>');
    
    return html;
  };
  
  return (
    <div 
      className="markdown"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
