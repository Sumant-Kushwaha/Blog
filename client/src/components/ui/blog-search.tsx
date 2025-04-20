import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BlogWithAuthor } from "@shared/schema";
import { Loader2, Search, X } from "lucide-react";

export function BlogSearch() {
  const [, navigate] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: blogs = [], isLoading } = useQuery<BlogWithAuthor[]>({
    queryKey: ["/api/blogs"],
    enabled: searchOpen, // Only fetch when dialog is open
  });
  
  // Filter blogs based on search query
  const filteredBlogs = blogs.filter(blog => 
    blog.status === "published" && (
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (blog.content.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // If search is already open, just update the filter
    if (!searchOpen) {
      setSearchOpen(true);
    }
  };
  
  const handleSelectBlog = (blogId: number) => {
    setSearchOpen(false);
    navigate(`/blogs/${blogId}`);
  };
  
  // Extract plain text from HTML content
  const extractText = (html: string, maxLength: number = 100) => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim();
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogTrigger asChild>
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 bg-muted dark:bg-muted/50"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0 px-3 text-muted-foreground/70 hover:text-muted-foreground"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Search Results</DialogTitle>
          <DialogDescription>
            Showing results for "{searchQuery || "all blogs"}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <Input
            type="text"
            placeholder="Refine your search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
        
        <div className="mt-4 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBlogs.length > 0 ? (
            <ul className="space-y-3">
              {filteredBlogs.map((blog) => (
                <li key={blog.id} className="cursor-pointer hover:bg-muted p-3 rounded-md">
                  <div onClick={() => handleSelectBlog(blog.id)}>
                    <h3 className="font-medium text-base mb-1">{blog.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {blog.excerpt || extractText(blog.content)}
                    </p>
                    <div className="mt-1 text-xs text-muted-foreground">
                      By {blog.author?.username || "Unknown"} • {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No matching blogs found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
