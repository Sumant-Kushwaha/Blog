import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Blog, BlogVersion, User } from "@shared/schema";
import { Markdown } from "@/components/ui/markdown";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface EditPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: BlogVersion;
  originalBlog: Blog;
  editor: User;
}

export function EditPreviewModal({
  isOpen,
  onClose,
  version,
  originalBlog,
  editor,
}: EditPreviewModalProps) {
  const [activeTab, setActiveTab] = useState("diff");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Format the date for display
  const formattedDate = new Date(version.createdAt).toLocaleString();

  // Basic diff highlighting function
  const highlightDiffs = (original: string, edited: string) => {
    // This is a very simplistic diff approach for demonstration
    // A real implementation would use a proper diff algorithm
    const words1 = original.split(" ");
    const words2 = edited.split(" ");
    const result = [];
    
    // Find words that are in edited but not in original
    for (let i = 0; i < words2.length; i++) {
      if (!words1.includes(words2[i])) {
        result.push(`<span class="bg-green-100">${words2[i]}</span>`);
      } else {
        result.push(words2[i]);
      }
    }
    
    return result.join(" ");
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await apiRequest("POST", `/api/blog-versions/${version.id}/approve`, {});
      toast({
        title: "Changes Approved",
        description: "The suggested edits have been applied to your blog post.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pending-edits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs", originalBlog.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-blogs"] });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await apiRequest("POST", `/api/blog-versions/${version.id}/reject`, {});
      toast({
        title: "Changes Rejected",
        description: "The suggested edits have been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pending-edits"] });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Review Suggested Edits</DialogTitle>
          <DialogDescription>
            Edited by {editor.fullName} · {formattedDate}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-5">
            <TabsTrigger value="diff">Differences</TabsTrigger>
            <TabsTrigger value="original">Original</TabsTrigger>
            <TabsTrigger value="edited">Edited Version</TabsTrigger>
          </TabsList>

          <TabsContent value="diff" className="max-h-96 overflow-y-auto border rounded p-4 bg-gray-50">
            <h1 className="text-2xl font-bold mb-4">
              {originalBlog.title !== version.title ? (
                <>
                  <span className="bg-red-100 line-through">{originalBlog.title}</span>{" "}
                  <span className="bg-green-100">{version.title}</span>
                </>
              ) : (
                originalBlog.title
              )}
            </h1>

            <div className="mb-4">
              {originalBlog.excerpt !== version.excerpt ? (
                <>
                  <p className="bg-red-100 line-through mb-2">{originalBlog.excerpt}</p>
                  <p className="bg-green-100">{version.excerpt}</p>
                </>
              ) : (
                <p>{originalBlog.excerpt}</p>
              )}
            </div>

            <div className="prose prose-sm">
              {originalBlog.content !== version.content ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: `<p class="bg-red-100 line-through mb-2">${originalBlog.content}</p>
                             <p class="bg-green-100">${version.content}</p>`,
                  }}
                />
              ) : (
                <Markdown content={originalBlog.content} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="original" className="max-h-96 overflow-y-auto border rounded p-4">
            <h1 className="text-2xl font-bold mb-4">{originalBlog.title}</h1>
            <p className="mb-4">{originalBlog.excerpt}</p>
            <div className="prose prose-sm">
              <Markdown content={originalBlog.content} />
            </div>
          </TabsContent>

          <TabsContent value="edited" className="max-h-96 overflow-y-auto border rounded p-4">
            <h1 className="text-2xl font-bold mb-4">{version.title}</h1>
            <p className="mb-4">{version.excerpt}</p>
            <div className="prose prose-sm">
              <Markdown content={version.content} />
            </div>
          </TabsContent>
        </Tabs>

        {version.revisionComment && (
          <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm text-gray-700 font-medium">Revision Comment:</p>
            <p className="text-sm text-gray-600">{version.revisionComment}</p>
          </div>
        )}

        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Close
          </Button>
          <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Reject Changes
          </Button>
          <Button onClick={handleApprove} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Accept Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
