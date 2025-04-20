import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogEditorModal } from "@/components/blog/blog-editor-modal";
import { SuggestionReviewModal } from "@/components/blog/suggestion-review-modal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogWithAuthor, EditSuggestionWithDetails } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, AlertTriangle, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Parse URL query parameters
  const params = new URLSearchParams(location.split("?")[1]);
  const tabParam = params.get("tab");
  const blogIdParam = params.get("blog");
  const actionParam = params.get("action");
  
  // UI state
  const [activeTab, setActiveTab] = useState(tabParam || "blogs");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSuggestionReviewOpen, setIsSuggestionReviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | "suggestion">("create");
  const [currentBlog, setCurrentBlog] = useState<BlogWithAuthor | undefined>(undefined);
  const [currentSuggestion, setCurrentSuggestion] = useState<EditSuggestionWithDetails | undefined>(undefined);
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);
  
  // Fetch user's blogs
  const { 
    data: blogs = [], 
    isLoading: isLoadingBlogs 
  } = useQuery<BlogWithAuthor[]>({
    queryKey: ["/api/blogs", { authorId: user?.id }],
    enabled: !!user,
  });
  
  // Fetch edit suggestions for user's blogs
  const { 
    data: suggestions = [], 
    isLoading: isLoadingSuggestions 
  } = useQuery<EditSuggestionWithDetails[]>({
    queryKey: ["/api/suggestions"],
    enabled: !!user,
  });
  
  // Filter suggestions for blogs owned by the user and with pending status
  const pendingApprovals = suggestions.filter(
    s => blogs.some(b => b.id === s.blogId) && s.status === "pending"
  );
  
  // Delete blog mutation
  const deleteBlogMutation = useMutation({
    mutationFn: async (blogId: number) => {
      await apiRequest("DELETE", `/api/blogs/${blogId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({
        title: "Blog deleted",
        description: "Your blog has been successfully deleted",
      });
      setBlogToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete blog",
        description: error.message,
        variant: "destructive",
      });
      setBlogToDelete(null);
    },
  });
  
  // Publish blog mutation
  const publishBlogMutation = useMutation({
    mutationFn: async (blogId: number) => {
      await apiRequest("PUT", `/api/blogs/${blogId}`, { status: "published" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({
        title: "Blog published",
        description: "Your blog has been published successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to publish blog",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle URL parameters for opening specific blog/suggestion
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
    
    if (blogIdParam && actionParam) {
      const blogId = parseInt(blogIdParam);
      if (actionParam === "edit" || actionParam === "suggest") {
        const blog = blogs.find(b => b.id === blogId);
        if (blog) {
          setCurrentBlog(blog);
          setEditorMode(actionParam as "edit" | "suggestion");
          setIsEditorOpen(true);
        }
      }
    }
  }, [tabParam, blogIdParam, actionParam, blogs]);
  
  // Handle creating a new blog
  const handleCreateBlog = () => {
    setCurrentBlog(undefined);
    setEditorMode("create");
    setIsEditorOpen(true);
  };
  
  // Handle editing a blog
  const handleEditBlog = (blog: BlogWithAuthor) => {
    setCurrentBlog(blog);
    setEditorMode(user?.id === blog.authorId ? "edit" : "suggestion");
    setIsEditorOpen(true);
  };
  
  // Handle publishing a draft blog
  const handlePublishBlog = (blogId: number) => {
    publishBlogMutation.mutate(blogId);
  };
  
  // Handle deleting a blog
  const handleDeleteConfirm = () => {
    if (blogToDelete !== null) {
      deleteBlogMutation.mutate(blogToDelete);
    }
  };
  
  // Handle opening suggestion review modal
  const handleReviewSuggestion = (suggestion: EditSuggestionWithDetails) => {
    setCurrentSuggestion(suggestion);
    setIsSuggestionReviewOpen(true);
  };
  
  return (
    <div className="flex min-h-screen">
      <Sidebar suggestionsCount={pendingApprovals.length} />
      
      <div className="flex flex-1 flex-col">
        <Header />
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="mb-6 flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your blogs and collaborations
              </p>
            </div>
            
            <Button onClick={handleCreateBlog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Blog
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="blogs">My Blogs</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="suggestions" className="relative">
                Suggestions
                {pendingApprovals.length > 0 && (
                  <Badge variant="destructive" className="ml-2 absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {pendingApprovals.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* My Published Blogs Tab */}
            <TabsContent value="blogs">
              {isLoadingBlogs ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {blogs.filter(blog => blog.status === "published").length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {blogs
                        .filter(blog => blog.status === "published")
                        .map((blog) => (
                          <BlogCard
                            key={blog.id}
                            blog={blog}
                            onEdit={() => handleEditBlog(blog)}
                            onDelete={() => {
                              setBlogToDelete(blog.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/20 rounded-lg">
                      <h3 className="text-lg font-medium">No published blogs yet</h3>
                      <p className="text-muted-foreground mt-2">
                        Create a new blog and publish it to see it here
                      </p>
                      <Button className="mt-4" onClick={handleCreateBlog}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Blog
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            {/* Drafts Tab */}
            <TabsContent value="drafts">
              {isLoadingBlogs ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {blogs.filter(blog => blog.status === "draft").length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {blogs
                        .filter(blog => blog.status === "draft")
                        .map((blog) => (
                          <BlogCard
                            key={blog.id}
                            blog={blog}
                            onEdit={() => handleEditBlog(blog)}
                            onPublish={() => handlePublishBlog(blog.id)}
                            onDelete={() => {
                              setBlogToDelete(blog.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/20 rounded-lg">
                      <h3 className="text-lg font-medium">No draft blogs</h3>
                      <p className="text-muted-foreground mt-2">
                        Create a new blog and save it as a draft to see it here
                      </p>
                      <Button className="mt-4" onClick={handleCreateBlog}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Draft
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            {/* Suggestions Tab */}
            <TabsContent value="suggestions">
              {isLoadingSuggestions ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {pendingApprovals.length > 0 ? (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Pending Edit Suggestions</h2>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {pendingApprovals.map((suggestion) => (
                          <div key={suggestion.id} className="border rounded-lg overflow-hidden bg-card">
                            <div className="p-5">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current"></span>
                                  Pending Review
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(suggestion.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <div className="mt-4">
                                <p className="text-sm text-muted-foreground">Original Title:</p>
                                <h3 className="text-lg font-medium">{suggestion.originalTitle}</h3>
                              </div>
                              
                              <div className="mt-3">
                                <p className="text-sm text-muted-foreground">Suggested Title:</p>
                                <h3 className="text-lg font-medium text-primary">{suggestion.suggestedTitle}</h3>
                              </div>
                              
                              <div className="mt-4 flex items-center">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {suggestion.editor?.username.substring(0, 2).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-2">
                                  <p className="text-xs">
                                    Edited by <span className="font-medium">{suggestion.editor?.username}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-muted/50 px-5 py-3 flex justify-between">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-muted-foreground"
                              >
                                <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                Add Comment
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleReviewSuggestion(suggestion)}
                              >
                                Review Changes
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/20 rounded-lg">
                      <h3 className="text-lg font-medium">No pending suggestions</h3>
                      <p className="text-muted-foreground mt-2">
                        When someone suggests edits to your blogs, they'll appear here
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Blog Editor Modal */}
      <BlogEditorModal
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        blog={currentBlog}
        mode={editorMode}
      />
      
      {/* Suggestion Review Modal */}
      {currentSuggestion && (
        <SuggestionReviewModal
          open={isSuggestionReviewOpen}
          onOpenChange={setIsSuggestionReviewOpen}
          suggestion={currentSuggestion}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected blog and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBlogMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
