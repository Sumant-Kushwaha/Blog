import React, { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Markdown } from "@/components/ui/markdown";

interface EditorProps {
  title: string;
  content: string;
  excerpt: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  onSave: () => void;
  isSubmitting: boolean;
  revisionComment?: string;
  onRevisionCommentChange?: (value: string) => void;
  showRevisionComment?: boolean;
}

export function Editor({
  title,
  content,
  excerpt,
  onTitleChange,
  onContentChange,
  onExcerptChange,
  onSave,
  isSubmitting,
  revisionComment = "",
  onRevisionCommentChange,
  showRevisionComment = false,
}: EditorProps) {
  const [activeTab, setActiveTab] = React.useState("edit");

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <Label htmlFor="title" className="text-base">
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-xl font-semibold mt-1"
          placeholder="Enter a title for your blog post"
        />
      </div>

      <div>
        <Label htmlFor="excerpt" className="text-base">
          Excerpt
        </Label>
        <Textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          className="mt-1 resize-none"
          rows={3}
          placeholder="Enter a brief summary of your blog post"
        />
      </div>

      <div className="flex-grow">
        <Label htmlFor="content" className="text-base">
          Content
        </Label>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-1">
          <TabsList className="mb-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="min-h-[300px]">
            <Textarea
              id="content"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="min-h-[300px] font-mono"
              placeholder="Write your blog post content here. Markdown is supported."
            />
          </TabsContent>
          <TabsContent value="preview" className="min-h-[300px]">
            <Card>
              <CardContent className="p-4 prose prose-sm sm:prose max-w-none min-h-[300px]">
                <Markdown content={content} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showRevisionComment && onRevisionCommentChange && (
        <div>
          <Label htmlFor="revisionComment" className="text-base">
            Revision Comment
          </Label>
          <Textarea
            id="revisionComment"
            value={revisionComment}
            onChange={(e) => onRevisionCommentChange(e.target.value)}
            className="mt-1 resize-none"
            rows={2}
            placeholder="Describe the changes you made and why"
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
