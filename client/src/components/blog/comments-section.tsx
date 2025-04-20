import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CommentWithAuthor } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Trash, Edit, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

interface CommentsSectionProps {
  blogId: number;
}

export function CommentsSection({ blogId }: CommentsSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  
  // Fetch comments for this blog
  const { data: comments = [], isLoading } = useQuery<CommentWithAuthor[]>({
    queryKey: ["/api/comments", { blogId }],
    enabled: !!blogId,
  });
  
  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/comments", {
        content,
        blogId,
      });
      return await res.json();
    },
    onSuccess: () => {
      setCommentContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/comments", { blogId }] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      const res = await apiRequest("PUT", `/api/comments/${id}`, {
        content,
      });
      return await res.json();
    },
    onSuccess: () => {
      setEditingCommentId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/comments", { blogId }] });
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/comments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", { blogId }] });
      toast({
        title: "Comment deleted",
        description: "The comment has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle comment submission
  const handleSubmitComment = () => {
    if (!commentContent.trim()) return;
    createCommentMutation.mutate(commentContent);
  };
  
  // Start editing a comment
  const handleEditComment = (comment: CommentWithAuthor) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };
  
  // Save edited comment
  const handleSaveEdit = (id: number) => {
    if (!editContent.trim()) return;
    updateCommentMutation.mutate({ id, content: editContent });
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };
  
  // Delete a comment
  const handleDeleteComment = (id: number) => {
    deleteCommentMutation.mutate(id);
  };
  
  // Check if user can edit/delete comment
  const canModifyComment = (comment: CommentWithAuthor) => {
    if (!user) return false;
    return comment.authorId === user.id;
  };
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comments</h2>
      
      {user ? (
        <div className="mb-6">
          <Textarea
            placeholder="Write a comment..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            className="min-h-[100px] mb-2"
          />
          <Button 
            onClick={handleSubmitComment}
            disabled={createCommentMutation.isPending || !commentContent.trim()}
          >
            {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      ) : (
        <div className="bg-muted p-4 rounded-lg mb-6">
          <p className="text-muted-foreground">
            Please <Link href="/auth" className="text-primary hover:underline">sign in</Link> to leave a comment.
          </p>
        </div>
      )}
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarFallback>
                        {comment.author?.username.substring(0, 2).toUpperCase() || "UN"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{comment.author?.username || "Unknown User"}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  {canModifyComment(comment) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditComment(comment)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {editingCommentId === comment.id ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px] mb-2"
                    autoFocus
                  />
                ) : (
                  <p>{comment.content}</p>
                )}
              </CardContent>
              
              {editingCommentId === comment.id && (
                <CardFooter className="flex justify-end space-x-2 pt-0">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCancelEdit}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleSaveEdit(comment.id)}
                    disabled={updateCommentMutation.isPending || !editContent.trim()}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
}