import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { EditSuggestionWithDetails } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Check, X } from "lucide-react";

interface SuggestionReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestion: EditSuggestionWithDetails;
  onSuccess?: () => void;
}

export function SuggestionReviewModal({
  open,
  onOpenChange,
  suggestion,
  onSuccess,
}: SuggestionReviewModalProps) {
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState<"original" | "suggested" | "diff">("diff");

  const handleTabChange = (value: string) => {
    setActiveTab(value as "original" | "suggested" | "diff");
  };

  const reviewMutation = useMutation({
    mutationFn: async (data: { status: "accepted" | "rejected"; comment?: string }) => {
      const res = await apiRequest("PUT", `/api/suggestions/${suggestion.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({
        title: "Review submitted",
        description: reviewMutation.variables?.status === "accepted" 
          ? "The suggested changes have been applied to your blog" 
          : "The suggested changes have been rejected",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAccept = () => {
    reviewMutation.mutate({ status: "accepted", comment });
  };

  const handleReject = () => {
    reviewMutation.mutate({ status: "rejected", comment });
  };

  const formattedDate = suggestion.createdAt 
    ? formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })
    : "";

  // Create a simple diff view by highlighting the changes
  const renderDiffView = () => {
    const originalContent = suggestion.originalContent;
    const suggestedContent = suggestion.suggestedContent;
    
    if (originalContent === suggestedContent) {
      return (
        <div className="p-4 border rounded bg-background">
          <p className="text-muted-foreground italic">No changes to content</p>
          <div className="mt-2" dangerouslySetInnerHTML={{ __html: originalContent }} />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {suggestion.originalTitle !== suggestion.suggestedTitle && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Title Changes:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded bg-background">
                <p className="text-xs text-muted-foreground mb-1">Original:</p>
                <p className="text-red-500 line-through">{suggestion.originalTitle}</p>
              </div>
              <div className="p-3 border rounded bg-background">
                <p className="text-xs text-muted-foreground mb-1">Suggested:</p>
                <p className="text-green-500">{suggestion.suggestedTitle}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Content Changes:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded bg-background">
              <p className="text-xs text-muted-foreground mb-1">Original:</p>
              <div className="text-red-500 blog-content" dangerouslySetInnerHTML={{ __html: originalContent }} />
            </div>
            <div className="p-3 border rounded bg-background">
              <p className="text-xs text-muted-foreground mb-1">Suggested:</p>
              <div className="text-green-500 blog-content" dangerouslySetInnerHTML={{ __html: suggestedContent }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Suggested Changes</DialogTitle>
          <DialogDescription>
            Review the changes suggested by {suggestion.editor?.username}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {suggestion.editor?.username.substring(0, 2).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{suggestion.editor?.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Suggested {formattedDate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="diff" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="diff">Changes</TabsTrigger>
              <TabsTrigger value="original">Original</TabsTrigger>
              <TabsTrigger value="suggested">Suggested</TabsTrigger>
            </TabsList>
            <TabsContent value="diff" className="mt-4">
              {renderDiffView()}
            </TabsContent>
            <TabsContent value="original" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{suggestion.originalTitle}</h3>
                <div className="p-4 border rounded bg-background">
                  <div className="blog-content" dangerouslySetInnerHTML={{ __html: suggestion.originalContent }} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="suggested" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{suggestion.suggestedTitle}</h3>
                <div className="p-4 border rounded bg-background">
                  <div className="blog-content" dangerouslySetInnerHTML={{ __html: suggestion.suggestedContent }} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Add a comment (optional)
            </label>
            <Textarea
              id="comment"
              placeholder="Add feedback or reasons for acceptance/rejection..."
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={reviewMutation.isPending}
          >
            {reviewMutation.isPending && reviewMutation.variables?.status === "rejected" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-2 h-4 w-4" />
            )}
            Reject Changes
          </Button>
          <div className="flex flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="default"
              onClick={handleAccept}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending && reviewMutation.variables?.status === "accepted" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Accept Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
