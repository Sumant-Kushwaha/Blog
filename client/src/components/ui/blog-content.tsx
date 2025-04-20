import { cn } from "@/lib/utils";

interface BlogContentProps {
  content: string;
  className?: string;
}

export function BlogContent({ content, className }: BlogContentProps) {
  return (
    <div 
      className={cn(
        "blog-content",
        "prose prose-gray dark:prose-invert max-w-none",
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-p:leading-7 prose-p:mb-4", 
        "prose-li:leading-7",
        "prose-a:text-primary prose-a:font-medium prose-a:underline-offset-4 hover:prose-a:text-primary/80",
        "prose-img:rounded-lg",
        "prose-pre:rounded-lg prose-pre:bg-muted prose-pre:p-4",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

// Add global styles to be included in index.css
export const blogContentStyles = `
  .blog-content h1 {
    @apply text-3xl font-bold mt-6 mb-4;
  }
  
  .blog-content h2 {
    @apply text-2xl font-bold mt-6 mb-3;
  }
  
  .blog-content h3 {
    @apply text-xl font-bold mt-5 mb-3;
  }
  
  .blog-content ul, .blog-content ol {
    @apply my-4 pl-5;
  }
  
  .blog-content ul {
    @apply list-disc;
  }
  
  .blog-content ol {
    @apply list-decimal;
  }
  
  .blog-content blockquote {
    @apply border-l-4 border-primary/30 pl-4 italic my-4;
  }
  
  .blog-content img {
    @apply max-w-full h-auto my-4;
  }
  
  .blog-content pre {
    @apply font-mono text-sm overflow-x-auto p-4 my-4 bg-muted rounded-md;
  }
  
  .blog-content code {
    @apply font-mono text-sm bg-muted px-1 py-0.5 rounded;
  }
  
  .blog-content table {
    @apply w-full border-collapse my-4;
  }
  
  .blog-content th, .blog-content td {
    @apply border border-border p-2 text-left;
  }
  
  .blog-content th {
    @apply bg-muted font-semibold;
  }
  
  .ql-editor {
    min-height: 200px;
  }

  .dark .ql-snow .ql-stroke {
    stroke: #e5e7eb;
  }
  
  .dark .ql-snow .ql-fill {
    fill: #e5e7eb;
  }
  
  .dark .ql-snow .ql-picker {
    color: #e5e7eb;
  }
  
  .dark .ql-snow .ql-picker-options {
    background-color: #1f2937;
    border-color: #374151;
  }
  
  .dark .ql-snow .ql-picker-item:hover {
    background-color: #374151;
  }
  
  .dark .ql-snow .ql-toolbar button:hover, 
  .dark .ql-snow .ql-toolbar button:focus {
    color: #e5e7eb;
  }
`;
