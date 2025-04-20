import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Blog, User } from "@shared/schema";

interface BlogCardProps {
  blog: Blog;
  author: User;
}

export function BlogCard({ blog, author }: BlogCardProps) {
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
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
      {blog.coverImage && (
        <div className="h-48 overflow-hidden">
          <img 
            src={blog.coverImage} 
            alt={`Cover image for ${blog.title}`} 
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 line-clamp-2">
            {blog.title}
          </h3>
          <Badge variant="secondary">{blog.category}</Badge>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {blog.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Author info */}
            <div className="flex-shrink-0 mr-2">
              {/* Use initials as fallback for avatar */}
              <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center text-xs font-medium">
                {author.fullName.split(' ').map(name => name[0]).join('')}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{author.fullName}</p>
              <p className="text-xs text-gray-500">{date} · {readTime} min read</p>
            </div>
          </div>
          
          <Button 
            variant="link" 
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            onClick={handleReadMore}
          >
            {user ? "Read More" : "Sign in to read"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function BlogCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <div className="h-48 bg-gray-200 animate-pulse" />
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="h-6 bg-gray-200 animate-pulse w-3/4 rounded" />
          <div className="h-6 bg-gray-200 animate-pulse w-1/5 rounded-full" />
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 animate-pulse w-full rounded" />
          <div className="h-4 bg-gray-200 animate-pulse w-full rounded" />
          <div className="h-4 bg-gray-200 animate-pulse w-2/3 rounded" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse mr-2" />
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 animate-pulse w-24 rounded" />
              <div className="h-3 bg-gray-200 animate-pulse w-32 rounded" />
            </div>
          </div>
          
          <div className="h-5 bg-gray-200 animate-pulse w-20 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
