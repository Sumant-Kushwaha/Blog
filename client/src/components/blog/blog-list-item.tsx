import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Blog, User } from "@shared/schema";

interface BlogListItemProps {
  blog: Blog;
  author: User;
}

export function BlogListItem({ blog, author }: BlogListItemProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const readTime = blog.readTime || 5; // fallback to 5 minutes
  const date = new Date(blog.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const handleReadMore = () => {
    if (user) {
      navigate(`/blog/${blog.id}`);
    } else {
      navigate('/auth');
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="sm:flex">
          {blog.coverImage && (
            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
              <img 
                src={blog.coverImage} 
                alt={`Thumbnail for ${blog.title}`} 
                className="h-24 w-24 sm:h-32 sm:w-32 object-cover rounded"
              />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <Badge variant="secondary" className="mr-2">{blog.category}</Badge>
                  <span className="text-xs text-gray-500">{date} · {readTime} min read</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 mb-2">
                  {blog.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {blog.excerpt}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {/* Author info */}
                  <div className="flex-shrink-0 mr-2">
                    {/* Use initials as fallback for avatar */}
                    <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center text-xs font-medium">
                      {author.fullName.split(' ').map(name => name[0]).join('')}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{author.fullName}</p>
                </div>
                
                <Button 
                  variant="link" 
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  onClick={handleReadMore}
                >
                  {user ? "Read More" : "Sign in to read"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BlogListItemSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="sm:flex">
          <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
            <div className="h-24 w-24 sm:h-32 sm:w-32 bg-gray-200 animate-pulse rounded" />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="h-5 bg-gray-200 animate-pulse w-16 rounded-full mr-2" />
                  <div className="h-4 bg-gray-200 animate-pulse w-32 rounded" />
                </div>
                
                <div className="h-6 bg-gray-200 animate-pulse w-3/4 rounded mb-2" />
                
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 animate-pulse w-full rounded" />
                  <div className="h-4 bg-gray-200 animate-pulse w-full rounded" />
                  <div className="h-4 bg-gray-200 animate-pulse w-2/3 rounded" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse mr-2" />
                  <div className="h-4 bg-gray-200 animate-pulse w-24 rounded" />
                </div>
                
                <div className="h-5 bg-gray-200 animate-pulse w-20 rounded" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
