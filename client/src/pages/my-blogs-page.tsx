import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Blog } from "@shared/schema";
import { PenSquare, MoreVertical, Pencil, Trash2, Clock, Calendar } from "lucide-react";

export default function MyBlogsPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  
  // Fetch user's blogs
  const { 
    data: blogs = [], 
    isLoading, 
    error 
  } = useQuery<Blog[]>({
    queryKey: ["/api/my-blogs"],
    enabled: !!user,
  });

  // Handle blog deletion
  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/blogs/${blogToDelete.id}`, undefined);
      
      queryClient.invalidateQueries({ queryKey: ["/api/my-blogs"] });
      
      toast({
        title: "Blog deleted",
        description: "Your blog post has been deleted successfully.",
      });
      
      setBlogToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Blogs</h1>
          <Button onClick={() => navigate("/blog/create")}>
            <PenSquare className="mr-2 h-4 w-4" />
            Create New Blog
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Failed to load your blogs</p>
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/my-blogs"] })}>
              Try Again
            </Button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <PenSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">No blogs yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't created any blog posts yet. Get started by creating your first blog post.
            </p>
            <Button onClick={() => navigate("/blog/create")}>
              Create Your First Blog
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {blogs.map((blog) => (
              <Card key={blog.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 
                          className="text-xl font-semibold text-gray-900 hover:text-primary-600 cursor-pointer"
                          onClick={() => navigate(`/blog/${blog.id}`)}
                        >
                          {blog.title}
                        </h3>
                        <Badge className="ml-3">{blog.category}</Badge>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <div className="flex items-center mr-4">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(blog.publishedAt)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{blog.readTime} min read</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {blog.excerpt}
                      </p>
                      
                      <Button 
                        variant="link" 
                        className="px-0 text-primary-600 hover:text-primary-800"
                        onClick={() => navigate(`/blog/${blog.id}`)}
                      >
                        View Blog
                      </Button>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/blog/${blog.id}/edit`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setBlogToDelete(blog)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!blogToDelete} onOpenChange={() => setBlogToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the blog "{blogToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBlog}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
