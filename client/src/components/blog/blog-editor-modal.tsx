import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { BlogWithAuthor } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface BlogEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog?: BlogWithAuthor;
  mode: "create" | "edit" | "suggestion";
  onSuccess?: () => void;
}

export function BlogEditorModal({
  open,
  onOpenChange,
  blog,
  mode,
  onSuccess,
}: BlogEditorModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(blog?.title || "");
  const [content, setContent] = useState(blog?.content || "");

  useEffect(() => {
    if (open) {
      setTitle(blog?.title || "");
      setContent(blog?.content || "");
    }
  }, [open, blog]);

  // Create or update blog mutation
  const blogMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; status?: string }) => {
      if (mode === "edit" && blog) {
        const res = await apiRequest("PUT", `/api/blogs/${blog.id}`, data);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/blogs", data);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs", blog?.id] });
      toast({
        title: mode === "edit" ? "Blog updated" : "Blog created",
        description: mode === "edit" ? "Your blog has been updated successfully" : "Your blog has been created successfully",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: mode === "edit" ? "Failed to update blog" : "Failed to create blog",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create suggestion mutation
  const suggestionMutation = useMutation({
    mutationFn: async (data: {
      blogId: number;
      originalTitle: string;
      suggestedTitle: string;
      originalContent: string;
      suggestedContent: string;
    }) => {
      const res = await apiRequest("POST", "/api/suggestions", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      toast({
        title: "Suggestion sent",
        description: "Your edit suggestion has been sent to the blog owner for review",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send suggestion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveDraft = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your blog",
        variant: "destructive",
      });
      return;
    }

    blogMutation.mutate({ title, content, status: "draft" });
  };

  const handlePublish = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your blog",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your blog",
        variant: "destructive",
      });
      return;
    }

    blogMutation.mutate({ title, content, status: "published" });
  };

  const handleSendForApproval = () => {
    if (!blog) return;

    if (title === blog.title && content === blog.content) {
      toast({
        title: "No changes detected",
        description: "You need to make changes to the blog before sending for approval",
        variant: "destructive",
      });
      return;
    }

    suggestionMutation.mutate({
      blogId: blog.id,
      originalTitle: blog.title,
      suggestedTitle: title,
      originalContent: blog.content,
      suggestedContent: content,
    });
  };

  const isLoading = blogMutation.isPending || suggestionMutation.isPending;
  const modalTitle = mode === "create" ? "Create New Blog" : mode === "edit" ? "Edit Blog" : "Suggest Edits";
  const modalDescription = mode === "suggestion" 
    ? "Make your changes to the blog. The owner will review your suggestions."
    : "Write your blog post and save it as a draft or publish it immediately.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="blog-title">Title</Label>
            <Input
              id="blog-title"
              placeholder="Enter your blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blog-content">Content</Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your blog content here..."
              height="300px"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>

          {mode !== "suggestion" ? (
            <>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={isLoading}
              >
                {isLoading && blogMutation.variables?.status === "draft" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Draft
              </Button>
              <Button 
                type="button" 
                onClick={handlePublish}
                disabled={isLoading}
              >
                {isLoading && blogMutation.variables?.status === "published" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Publish
              </Button>
            </>
          ) : (
            <Button 
              type="button" 
              onClick={handleSendForApproval}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Send for Approval
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
