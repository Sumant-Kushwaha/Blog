import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EditPreviewModal } from "@/components/blog/edit-preview-modal";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Edit3 } from "lucide-react";
import { Blog, BlogVersion, User } from "@shared/schema";

export default function PendingEditsPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [selectedEdit, setSelectedEdit] = useState<{
    version: BlogVersion;
    blog: Blog;
    editor: User;
  } | null>(null);
  
  // Fetch pending edits
  const { 
    data: pendingEdits = [], 
    isLoading 
  } = useQuery({
    queryKey: ["/api/pending-edits"],
    enabled: !!user,
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle opening edit preview
  const handleOpenPreview = async (edit: any) => {
    try {
      // In a real app, we would fetch the blog and editor information
      // For this implementation, we'll use what we have available in the edit
      
      // Get the blog
      const blog = {
        id: edit.version.blogId,
        title: edit.blogTitle || "Blog Title",
        content: "", // Original content would come from the API
        excerpt: "", // Original excerpt would come from the API
        authorId: user?.id || 0,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: "General",
        readTime: 5,
        coverImage: ""
      };
      
      // Get the editor
      const editor = {
        id: edit.version.editorId,
        username: `user${edit.version.editorId}`,
        email: `user${edit.version.editorId}@example.com`,
        fullName: edit.editorName || "Unknown Editor",
        password: "",
        isVerified: true,
        verificationToken: null,
        resetToken: null,
        resetTokenExpiry: null
      };
      
      setSelectedEdit({
        version: edit.version,
        blog,
        editor
      });
    } catch (error) {
      console.error("Failed to load edit preview", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Pending Edit Suggestions</h1>
            <p className="text-gray-600">Review and manage edit suggestions for your blog posts</p>
          </div>
          
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Awaiting Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-60" />
                      </div>
                      <Skeleton className="h-10 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : pendingEdits.length === 0 ? (
              <div className="text-center py-12">
                <Edit3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Edits</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  You don't have any pending edit suggestions to review. When someone suggests edits to your blogs, they'll appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingEdits.map((edit: any) => (
                  <div key={edit.version.id} className="border rounded-lg p-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-start space-y-4 md:space-y-0 mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{edit.blogTitle}</h3>
                        <p className="text-sm text-gray-600">
                          Edited by <span className="font-medium">{edit.editorName}</span> on {formatDate(edit.version.createdAt)}
                        </p>
                      </div>
                      
                      <Button onClick={() => handleOpenPreview(edit)}>
                        Review Changes
                      </Button>
                    </div>
                    
                    {edit.version.revisionComment && (
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-1">Revision Comment:</p>
                        <p className="text-sm text-gray-600 italic">"{edit.version.revisionComment}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
      
      {/* Edit Preview Modal */}
      {selectedEdit && (
        <EditPreviewModal
          isOpen={!!selectedEdit}
          onClose={() => setSelectedEdit(null)}
          version={selectedEdit.version}
          originalBlog={selectedEdit.blog}
          editor={selectedEdit.editor}
        />
      )}
    </div>
  );
}
