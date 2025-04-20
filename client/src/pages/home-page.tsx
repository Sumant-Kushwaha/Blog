import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import { BlogWithAuthor } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle } from "lucide-react";

export default function HomePage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: blogs = [], isLoading } = useQuery<BlogWithAuthor[]>({
    queryKey: ["/api/blogs"],
  });

  // Get only published blogs for public view
  const publishedBlogs = blogs.filter(blog => blog.status === "published");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex flex-1 flex-col">
        <Header />
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="mb-6 flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold">Welcome to SmartBlog</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Discover interesting blogs from our community
              </p>
            </div>
            
            {user ? (
              <Button onClick={() => setLocation("/dashboard")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Blog
              </Button>
            ) : (
              <Link href="/auth">
                <Button>Sign in to create</Button>
              </Link>
            )}
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-lg bg-muted animate-pulse"></div>
              ))}
            </div>
          ) : publishedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedBlogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  onEdit={() => setLocation(`/dashboard?blog=${blog.id}&action=edit`)}
                  onSendForApproval={() => setLocation(`/dashboard?blog=${blog.id}&action=suggest`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No blogs published yet</h3>
              <p className="text-muted-foreground mt-2">
                Be the first to create a blog post!
              </p>
              {user ? (
                <Button className="mt-4" onClick={() => setLocation("/dashboard")}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Blog
                </Button>
              ) : (
                <Link href="/auth">
                  <Button className="mt-4">Sign in to create</Button>
                </Link>
              )}
            </div>
          )}
          
          {/* Notification for non-logged in users */}
          {!user && (
            <div className="mt-10 rounded-lg bg-muted p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-primary">Want to contribute?</h3>
                  <div className="mt-2 text-sm">
                    <p>
                      Sign in or create an account to start writing blogs and collaborating with others.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="flex space-x-4">
                      <Link href="/auth">
                        <Button variant="outline">
                          Sign in
                          <span aria-hidden="true"> →</span>
                        </Button>
                      </Link>
                      <Link href="/auth?register=true">
                        <Button>
                          Create account
                          <span aria-hidden="true"> →</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
