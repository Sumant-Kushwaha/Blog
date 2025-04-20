import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BlogCard, BlogCardSkeleton } from "@/components/blog/blog-card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Blog, User } from "@shared/schema";
import { Search, Filter } from "lucide-react";

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  
  // Fetch all blogs
  const { 
    data: blogs = [], 
    isLoading: isLoadingBlogs 
  } = useQuery<Blog[]>({
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
  const { 
    data: users = [], 
    isLoading: isLoadingUsers 
  } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      // In a real app, we would fetch the users
      // For now, we'll create mock users based on the blog authorIds
      const authorIds = [...new Set(blogs.map(blog => blog.authorId))];
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
    enabled: blogs.length > 0,
  });
  
  // Filter and sort blogs
  const filteredBlogs = React.useMemo(() => {
    if (!blogs.length) return [];
    
    return blogs.filter(blog => {
      // Filter by search query
      const matchesSearch = 
        searchQuery === "" || 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by category
      const matchesCategory = 
        category === "all" || 
        blog.category.toLowerCase() === category.toLowerCase();
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      // Sort by selected option
      if (sortBy === "latest") {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      } else if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "title-desc") {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });
  }, [blogs, searchQuery, category, sortBy]);
  
  // Extract unique categories from blogs
  const categories = React.useMemo(() => {
    if (!blogs.length) return [];
    
    const uniqueCategories = [...new Set(blogs.map(blog => blog.category))];
    return uniqueCategories.sort();
  }, [blogs]);
  
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

  const isLoading = isLoadingBlogs || isLoadingUsers;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Blogs</h1>
          <p className="text-gray-600 max-w-3xl">
            Explore our collection of blogs on various topics. Use the filters below to find blogs that interest you.
          </p>
        </div>
        
        {/* Filters and Search */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-full md:w-auto">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {searchQuery || category !== "all" ? (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setCategory("all");
                }}
              >
                Clear Filters
              </Button>
            ) : null}
          </div>
        </div>
        
        {/* Blogs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <BlogCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">No blogs found</h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setCategory("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredBlogs.length} {filteredBlogs.length === 1 ? 'blog' : 'blogs'}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <BlogCard 
                  key={blog.id}
                  blog={blog}
                  author={getAuthorById(blog.authorId)}
                />
              ))}
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
