import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Editor } from "@/components/ui/editor";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Blog } from "@shared/schema";

export default function BlogEditPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revisionComment, setRevisionComment] = useState("");

  // Fetch blog data
  const { 
    data: blog, 
    isLoading, 
    error 
  } = useQuery<Blog>({
    queryKey: ["/api/blogs", parseInt(id)],
    enabled: !!id,
  });

  // Initialize form with blog data when it's loaded
  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setContent(blog.content);
      setExcerpt(blog.excerpt);
    }
  }, [blog]);

  const handleSave = async () => {
    if (!blog || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const isOwnBlog = user.id === blog.authorId;
      const editData = {
        title,
        content,
        excerpt,
        revisionComment: !isOwnBlog ? revisionComment : undefined,
      };
      
      const response = await apiRequest("PUT", `/api/blogs/${id}`, editData);
      const result = await response.json();
      
      if (isOwnBlog) {
        // If it's the author's own blog, the changes are applied directly
        queryClient.invalidateQueries({ queryKey: ["/api/blogs", parseInt(id)] });
        toast({
          title: "Blog updated",
          description: "Your blog post has been updated successfully.",
        });
      } else {
        // If it's someone else's blog, the changes are submitted for approval
        toast({
          title: "Edit suggestion submitted",
          description: "Your edit suggestion has been submitted to the author for approval.",
        });
      }
      
      // Navigate back to the blog view
      navigate(`/blog/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save blog edits. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
          <Skeleton className="h-8 w-40 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load blog. The blog post might not exist or you don't have permission to edit it.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate("/my-blogs")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Blogs
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Blog Post</h1>
            <Button variant="outline" onClick={() => navigate(`/blog/${id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </div>
          
          <Editor 
            title={title}
            content={content}
            excerpt={excerpt}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onExcerptChange={setExcerpt}
            onSave={handleSave}
            isSubmitting={isSubmitting}
            revisionComment={revisionComment}
            onRevisionCommentChange={setRevisionComment}
            showRevisionComment={user?.id !== blog.authorId}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
