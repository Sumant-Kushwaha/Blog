import React, { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Editor } from "@/components/ui/editor";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft } from "lucide-react";

export default function BlogCreatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("General");
  const [coverImage, setCoverImage] = useState("");
  const [readTime, setReadTime] = useState("5");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!title.trim()) {
        throw new Error("Title is required");
      }
      
      if (!content.trim()) {
        throw new Error("Content is required");
      }
      
      if (!excerpt.trim()) {
        throw new Error("Excerpt is required");
      }
      
      const blogData = {
        title,
        content,
        excerpt,
        category,
        coverImage: coverImage || undefined,
        readTime: parseInt(readTime),
        authorId: user.id,
      };
      
      const response = await apiRequest("POST", "/api/blogs", blogData);
      const newBlog = await response.json();
      
      // Update cache and show success message
      queryClient.invalidateQueries({ queryKey: ["/api/my-blogs"] });
      
      toast({
        title: "Blog created",
        description: "Your blog post has been created successfully.",
      });
      
      // Navigate to the new blog
      navigate(`/blog/${newBlog.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Create New Blog Post</h1>
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Programming">Programming</SelectItem>
                  <SelectItem value="Web Design">Web Design</SelectItem>
                  <SelectItem value="UX/UI">UX/UI</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="readTime">Read Time (minutes)</Label>
              <Input
                id="readTime"
                type="number"
                min="1"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="coverImage">Cover Image URL (optional)</Label>
              <Input
                id="coverImage"
                type="text"
                placeholder="https://example.com/image.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a URL to an image that represents your blog post.
              </p>
            </div>
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
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
