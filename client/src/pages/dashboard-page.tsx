import React from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { PenSquare, BookOpen, Edit3, Bell, ArrowRight } from "lucide-react";
import { Blog, Notification } from "@shared/schema";

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Fetch user's blogs
  const { 
    data: blogs = [], 
    isLoading: isLoadingBlogs 
  } = useQuery<Blog[]>({
    queryKey: ["/api/my-blogs"],
    enabled: !!user,
  });
  
  // Fetch pending edits that need approval
  const { 
    data: pendingEdits = [], 
    isLoading: isLoadingPendingEdits 
  } = useQuery({
    queryKey: ["/api/pending-edits"],
    enabled: !!user,
  });
  
  // Fetch user's notifications
  const { 
    data: notifications = [], 
    isLoading: isLoadingNotifications 
  } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.fullName}</p>
          </div>
          
          <Button onClick={() => navigate("/blog/create")}>
            <PenSquare className="mr-2 h-4 w-4" />
            Create New Blog
          </Button>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Blogs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-primary-500 mr-2" />
                <span className="text-2xl font-bold">
                  {isLoadingBlogs ? (
                    <Skeleton className="h-8 w-10 inline-block" />
                  ) : (
                    blogs.length
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Pending Edits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Edit3 className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-2xl font-bold">
                  {isLoadingPendingEdits ? (
                    <Skeleton className="h-8 w-10 inline-block" />
                  ) : (
                    pendingEdits.length
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Unread Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">
                  {isLoadingNotifications ? (
                    <Skeleton className="h-8 w-10 inline-block" />
                  ) : (
                    notifications.filter((n: any) => !n.isRead).length
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Dashboard Content */}
        <Tabs defaultValue="pending-edits" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending-edits">Pending Edits</TabsTrigger>
            <TabsTrigger value="recent-blogs">Recent Blogs</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          {/* Pending Edits Tab */}
          <TabsContent value="pending-edits">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Edits Requiring Your Approval</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPendingEdits ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex justify-between items-center p-4 border rounded-md">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-60" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))}
                  </div>
                ) : pendingEdits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Edit3 className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No pending edit suggestions to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingEdits.map((edit: any) => (
                      <div key={edit.version.id} className="flex justify-between items-start p-4 border rounded-md">
                        <div>
                          <h3 className="font-medium mb-1">{edit.blogTitle}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Edited by {edit.editorName} · {new Date(edit.version.createdAt).toLocaleDateString()}
                          </p>
                          {edit.version.revisionComment && (
                            <p className="text-sm italic bg-gray-50 p-2 rounded">
                              "{edit.version.revisionComment}"
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate("/dashboard/pending-edits")}
                        >
                          Review
                        </Button>
                      </div>
                    ))}
                    
                    {pendingEdits.length > 3 && (
                      <div className="text-center mt-4">
                        <Button 
                          variant="link" 
                          className="text-primary-600"
                          onClick={() => navigate("/dashboard/pending-edits")}
                        >
                          View All Pending Edits <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Recent Blogs Tab */}
          <TabsContent value="recent-blogs">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Recent Blogs</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingBlogs ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border rounded-md">
                        <div className="flex justify-between mb-2">
                          <Skeleton className="h-6 w-40" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : blogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>You haven't created any blogs yet</p>
                    <Button 
                      variant="link" 
                      className="text-primary-600 mt-2"
                      onClick={() => navigate("/blog/create")}
                    >
                      Create Your First Blog
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blogs.slice(0, 3).map((blog) => (
                      <div key={blog.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <h3 
                            className="font-medium hover:text-primary-600 cursor-pointer"
                            onClick={() => navigate(`/blog/${blog.id}`)}
                          >
                            {blog.title}
                          </h3>
                          <Badge>{blog.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {blog.excerpt}
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">
                            Published {formatDate(blog.publishedAt)}
                          </span>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-primary-600"
                            onClick={() => navigate(`/blog/${blog.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {blogs.length > 3 && (
                      <div className="text-center mt-4">
                        <Button 
                          variant="link" 
                          className="text-primary-600"
                          onClick={() => navigate("/my-blogs")}
                        >
                          View All Blogs <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingNotifications ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border rounded-md">
                        <div className="flex justify-between mb-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification: any) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border rounded-md ${!notification.isRead ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium">
                            {notification.type === 'edit_suggestion' ? 'Edit Suggestion' : 
                            notification.type === 'edit_approved' ? 'Edit Approved' :
                            notification.type === 'edit_rejected' ? 'Edit Rejected' : 'System Notification'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString(undefined, { 
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        
                        {notification.type === 'edit_suggestion' && notification.relatedId && (
                          <div className="mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate("/dashboard/pending-edits")}
                            >
                              Review
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
