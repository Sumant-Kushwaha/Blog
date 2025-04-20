import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Card, CardContent } from "@/components/ui/card";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  height = "200px",
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Quill toolbar configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image", "code-block"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "link",
    "image",
    "code-block",
  ];

  if (!mounted) {
    // Return a placeholder during SSR
    return (
      <Card>
        <CardContent className="p-4">
          <div 
            className="border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center"
            style={{ height }}
          >
            Loading editor...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rich-text-editor">
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: ${height};
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          background-color: #f9fafb;
        }
        .dark .rich-text-editor .ql-toolbar {
          background-color: #1f2937;
          border-color: #374151;
        }
        .dark .rich-text-editor .ql-container {
          border-color: #374151;
        }
        .dark .rich-text-editor .ql-editor {
          color: #e5e7eb;
          background-color: #111827;
        }
        .dark .rich-text-editor .ql-picker,
        .dark .rich-text-editor .ql-stroke {
          color: #e5e7eb;
          stroke: #e5e7eb;
        }
        .dark .rich-text-editor .ql-fill {
          fill: #e5e7eb;
        }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
