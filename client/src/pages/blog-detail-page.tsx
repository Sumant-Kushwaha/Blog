import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BlogEditorModal } from "@/components/blog/blog-editor-modal";
import { CommentsSection } from "@/components/blog/comments-section";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BlogWithAuthor } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Edit, ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface BlogDetailPageProps {
  id: string;
}

export default function BlogDetailPage({ id }: BlogDetailPageProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const {
    data: blog,
    isLoading,
    error,
  } = useQuery<BlogWithAuthor>({
    queryKey: ["/api/blogs", parseInt(id)],
  });
  
  const handleEditClick = () => {
    if (blog) {
      // If user is the author, open in edit mode, otherwise in suggestion mode
      const isAuthor = user?.id === blog.authorId;
      if (isAuthor) {
        setIsEditorOpen(true);
      } else {
        navigate(`/dashboard?blog=${blog.id}&action=suggest`);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </main>
        </div>
      </div>
    );
  }
  
  if (error || !blog) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <svg className="h-12 w-12 text-destructive/60 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-lg font-medium">Blog Not Found</h3>
                  <p className="text-muted-foreground">
                    The blog you're looking for doesn't exist or has been removed.
                  </p>
                  <Link href="/">
                    <Button className="mt-2">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }
  
  const formattedDate = blog.createdAt 
    ? format(new Date(blog.createdAt), "MMMM dd, yyyy")
    : "";
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex flex-1 flex-col">
        <Header />
        
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-3xl px-4 py-8">
            <Link href="/">
              <Button variant="ghost" className="mb-6 -ml-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to blogs
              </Button>
            </Link>
            
            <article>
              <header className="mb-8">
                <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                  {blog.title}
                </h1>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {blog.author?.username.substring(0, 2).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{blog.author?.username}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        <time dateTime={blog.createdAt?.toString()}>{formattedDate}</time>
                      </div>
                    </div>
                  </div>
                  
                  {user && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-auto"
                      onClick={handleEditClick}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {user.id === blog.authorId ? "Edit" : "Suggest Edits"}
                    </Button>
                  )}
                </div>
              </header>
              
              <Separator className="my-8" />
              
              <div 
                className="prose prose-lg dark:prose-invert max-w-none blog-content"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
              
              <Separator className="my-8" />
              
              {/* Comments Section */}
              <CommentsSection blogId={blog.id} />
            </article>
          </div>
        </main>
      </div>
      
      {/* Blog Editor Modal (for author editing) */}
      {user?.id === blog.authorId && (
        <BlogEditorModal
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          blog={blog}
          mode="edit"
        />
      )}
    </div>
  );
}
