import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { Editor } from "@/components/ui/editor";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Pencil, Clock, Calendar, UserCircle, RotateCcw, Loader2 } from "lucide-react";
import { Blog, User } from "@shared/schema";

export default function BlogViewPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedExcerpt, setEditedExcerpt] = useState("");
  const [revisionComment, setRevisionComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch blog data
  const { 
    data: blog, 
    isLoading: isBlogLoading,
    error: blogError
  } = useQuery<Blog>({
    queryKey: ["/api/blogs", parseInt(id)],
    enabled: !!id,
  });

  // Fetch blog author
  const { 
    data: author, 
    isLoading: isAuthorLoading 
  } = useQuery<User>({
    queryKey: ["/api/users", blog?.authorId],
    queryFn: async () => {
      // In a real app, we would fetch the author
      // For now, we'll create a mock author based on the blog's authorId
      return {
        id: blog?.authorId || 0,
        username: `user${blog?.authorId}`,
        email: `user${blog?.authorId}@example.com`,
        fullName: `User ${blog?.authorId}`,
        password: "",
        isVerified: true,
        verificationToken: null,
        resetToken: null,
        resetTokenExpiry: null
      };
    },
    enabled: !!blog?.authorId,
  });

  // Fetch blog versions/history
  const { 
    data: versions = [], 
    isLoading: isVersionsLoading 
  } = useQuery({
    queryKey: ["/api/blogs", parseInt(id), "versions"],
    queryFn: async () => {
      const response = await fetch(`/api/blogs/${id}/versions`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch blog versions");
      return response.json();
    },
    enabled: !!id && showHistory,
  });

  // Handle starting edit mode
  const handleEdit = () => {
    if (!blog) return;
    
    setEditedTitle(blog.title);
    setEditedContent(blog.content);
    setEditedExcerpt(blog.excerpt);
    setIsEditing(true);
  };

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setRevisionComment("");
  };

  // Handle saving edits
  const handleSaveEdit = async () => {
    if (!blog || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const isOwnBlog = user.id === blog.authorId;
      const editData = {
        title: editedTitle,
        content: editedContent,
        excerpt: editedExcerpt,
        revisionComment: !isOwnBlog ? revisionComment : undefined,
      };
      
      const response = await apiRequest("PUT", `/api/blogs/${id}`, editData);
      const result = await response.json();
      
      setIsEditing(false);
      setRevisionComment("");
      
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

  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isBlogLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-2 mt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (blogError || !blog) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Blog Not Found</h1>
            <p className="text-gray-600 mb-6">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/blogs")}>
              Browse All Blogs
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
        {isEditing ? (
          // Edit Mode
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>
            
            <Editor 
              title={editedTitle}
              content={editedContent}
              excerpt={editedExcerpt}
              onTitleChange={setEditedTitle}
              onContentChange={setEditedContent}
              onExcerptChange={setEditedExcerpt}
              onSave={handleSaveEdit}
              isSubmitting={isSubmitting}
              revisionComment={revisionComment}
              onRevisionCommentChange={setRevisionComment}
              showRevisionComment={user?.id !== blog.authorId}
            />
            
            <div className="flex justify-end mt-6 space-x-2">
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // View Mode
          <article className="bg-white p-6 rounded-lg shadow-sm">
            <header className="mb-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{blog.title}</h1>
                <Badge>{blog.category}</Badge>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <div className="flex items-center mr-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(blog.publishedAt)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{blog.readTime} min read</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center text-sm font-medium mr-3">
                  {isAuthorLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    author?.fullName.split(' ').map(name => name[0]).join('')
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {isAuthorLoading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      author?.fullName
                    )}
                  </p>
                  <p className="text-sm text-gray-500">Author</p>
                </div>
              </div>
            </header>
            
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-gray-600 text-lg mb-6 italic">{blog.excerpt}</p>
              <Markdown content={blog.content} />
            </div>
            
            <footer className="border-t border-gray-200 pt-6 mt-10 flex flex-wrap justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {showHistory ? "Hide History" : "View History"}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Blog
                </Button>
              </div>
              
              <div className="text-sm text-gray-500">
                Last updated: {formatDate(blog.updatedAt)}
              </div>
            </footer>
            
            {/* Edit History */}
            {showHistory && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold mb-4">Edit History</h2>
                
                {isVersionsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : versions.length === 0 ? (
                  <p className="text-gray-500">No edit history available.</p>
                ) : (
                  <ul className="space-y-4">
                    {versions.map((version: any) => (
                      <li key={version.id} className="border border-gray-200 rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <UserCircle className="h-5 w-5 mr-2 text-gray-500" />
                            <span className="font-medium">
                              {version.editorName || "Unknown editor"}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(version.createdAt).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          {version.revisionComment || "No revision comment"}
                        </div>
                        
                        <div className="flex space-x-2 text-sm">
                          <Badge
                            variant={version.isApproved ? "success" : version.isRejected ? "destructive" : "outline"}
                          >
                            {version.isApproved ? "Approved" : version.isRejected ? "Rejected" : "Pending"}
                          </Badge>
                          
                          {/* If the version is the current version, show a "Current" badge */}
                          {version.isApproved && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </article>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
