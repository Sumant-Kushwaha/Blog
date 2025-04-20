import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BlogCard, BlogCardSkeleton } from "@/components/blog/blog-card";
import { BlogListItem, BlogListItemSkeleton } from "@/components/blog/blog-list-item";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";
import { Blog, User } from "@shared/schema";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const [sortBy, setSortBy] = useState("latest");
  
  // Fetch featured blogs
  const { data: featuredBlogs = [], isLoading: isLoadingFeatured } = useQuery<Blog[]>({
    queryKey: ["/api/blogs"],
    queryFn: async () => {
      const res = await fetch("/api/blogs", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch blogs");
      return res.json();
    },
  });
  
  // Fetch users for blogs
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      // In a real app, we would fetch the users
      // For now, we'll create mock users based on the blog authorIds
      const authorIds = [...new Set(featuredBlogs.map(blog => blog.authorId))];
      return authorIds.map(id => ({
        id,
        username: `user${id}`,
        email: `user${id}@example.com`,
        fullName: `User ${id}`,
        password: "",
        isVerified: true,
        verificationToken: null,
        resetToken: null,
        resetTokenExpiry: null
      }));
    },
    enabled: featuredBlogs.length > 0,
  });
  
  // Sort and filter blogs
  const sortedFeaturedBlogs = React.useMemo(() => {
    if (!featuredBlogs.length) return [];
    
    return [...featuredBlogs].sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      // Add more sorting options as needed
      return 0;
    }).slice(0, 3); // Just take the first 3 for featured
  }, [featuredBlogs, sortBy]);
  
  // Get recent blogs (different from featured)
  const recentBlogs = React.useMemo(() => {
    if (!featuredBlogs.length) return [];
    
    return [...featuredBlogs]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 2); // Just take the first 2 for recent
  }, [featuredBlogs]);
  
  // Helper to find author by ID
  const getAuthorById = (authorId: number): User => {
    return users.find(user => user.id === authorId) || {
      id: authorId,
      username: "unknown",
      email: "unknown@example.com",
      fullName: "Unknown User",
      password: "",
      isVerified: true,
      verificationToken: null,
      resetToken: null,
      resetTokenExpiry: null
    };
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Featured Blogs Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Blogs</h2>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Featured Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingFeatured || isLoadingUsers ? (
              // Show skeletons when loading
              Array(3).fill(0).map((_, index) => (
                <BlogCardSkeleton key={index} />
              ))
            ) : sortedFeaturedBlogs.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No blogs found. Be the first to create a blog!
              </div>
            ) : (
              // Map through featured blogs
              sortedFeaturedBlogs.map(blog => (
                <BlogCard 
                  key={blog.id}
                  blog={blog}
                  author={getAuthorById(blog.authorId)}
                />
              ))
            )}
          </div>
        </section>
        
        {/* Recent Blogs Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Blogs</h2>
            <Link href="/blogs">
              <Button variant="link" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {/* Recent Blogs List */}
          <div className="space-y-6">
            {isLoadingFeatured || isLoadingUsers ? (
              // Show skeletons when loading
              Array(2).fill(0).map((_, index) => (
                <BlogListItemSkeleton key={index} />
              ))
            ) : recentBlogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent blogs found.
              </div>
            ) : (
              // Map through recent blogs
              recentBlogs.map(blog => (
                <BlogListItem 
                  key={blog.id}
                  blog={blog}
                  author={getAuthorById(blog.authorId)}
                />
              ))
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
