import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Menu, Bell, Search, PenSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Get unread notifications count
  const { data: notificationCount = 0, isLoading: isLoadingNotifications } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count"],
    queryFn: async () => {
      if (!user) return { count: 0 };
      const res = await fetch("/api/notifications/count", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    enabled: !!user,
  });

  // Get notifications for dropdown
  const { data: notifications = [], isLoading: isLoadingNotificationList } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch("/api/notifications", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    enabled: !!user && isNotificationOpen,
  });

  // Mark notification as read
  const handleNotificationClick = async (id: number) => {
    try {
      await apiRequest("POST", `/api/notifications/${id}/read`, {});
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.fullName) return "U";
    return user.fullName.split(" ").map(name => name[0]).join("");
  };

  // Check if a route is active
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <PenSquare className="text-primary-600 text-2xl mr-2" />
                <span className="font-bold text-xl text-primary-700">BlogCollab</span>
              </Link>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/") 
                    ? "border-primary-500 text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}>
                  Home
                </a>
              </Link>
              
              <Link href="/blogs">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/blogs") 
                    ? "border-primary-500 text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}>
                  Browse
                </a>
              </Link>
              
              {user && (
                <>
                  <Link href="/my-blogs">
                    <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive("/my-blogs") 
                        ? "border-primary-500 text-gray-900" 
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}>
                      My Blogs
                    </a>
                  </Link>
                  
                  <Link href="/dashboard">
                    <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive("/dashboard") 
                        ? "border-primary-500 text-gray-900" 
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}>
                      Dashboard
                    </a>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Desktop Right Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <>
                {/* Create New Blog Button */}
                <Link href="/blog/create">
                  <Button size="sm" className="mr-4">
                    <PenSquare className="h-4 w-4 mr-2" />
                    New Blog
                  </Button>
                </Link>
                
                {/* Notification Dropdown */}
                <div className="ml-3 relative">
                  <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {notificationCount.count > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            {notificationCount.count}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <div className="p-2 font-medium">Notifications</div>
                      <DropdownMenuSeparator />
                      <div className="max-h-96 overflow-y-auto">
                        {isLoadingNotificationList ? (
                          <div className="p-4 text-center">
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification: any) => (
                            <DropdownMenuItem 
                              key={notification.id}
                              className={`p-3 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                              onClick={() => handleNotificationClick(notification.id)}
                            >
                              <div>
                                <div className="flex justify-between items-start mb-1">
                                  <div className="font-medium text-sm">
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
                                  <div className="mt-2 flex space-x-2">
                                    <Link href={`/dashboard/pending-edits`}>
                                      <Button size="sm" variant="outline" className="text-xs h-7">
                                        View
                                      </Button>
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Profile Dropdown */}
                <div className="ml-3 relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary-100 text-primary-800">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="px-4 py-3">
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <Link href="/profile">
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                      </Link>
                      <Link href="/settings">
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                        {logoutMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth">
                  <Button variant="outline" size="sm">Log In</Button>
                </Link>
                <Link href="/auth?tab=register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            {user && (
              <>
                <Link href="/blog/create">
                  <Button size="icon" variant="ghost" className="mr-1">
                    <PenSquare className="h-5 w-5" />
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative mr-2">
                      <Bell className="h-5 w-5" />
                      {notificationCount.count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {notificationCount.count}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    {/* Same notification content as desktop */}
                    <div className="p-2 font-medium">Notifications</div>
                    <DropdownMenuSeparator />
                    <div className="max-h-96 overflow-y-auto">
                      {isLoadingNotificationList ? (
                        <div className="p-4 text-center">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification: any) => (
                          <DropdownMenuItem 
                            key={notification.id}
                            className={`p-3 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                            onClick={() => handleNotificationClick(notification.id)}
                          >
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <div className="font-medium text-sm">
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
                                <div className="mt-2 flex space-x-2">
                                  <Link href={`/dashboard/pending-edits`}>
                                    <Button size="sm" variant="outline" className="text-xs h-7">
                                      View
                                    </Button>
                                  </Link>
                                </div>
                              )}
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="py-4 space-y-4">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <a className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive("/") 
                        ? "bg-primary-50 border-primary-500 text-primary-700" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}>
                      Home
                    </a>
                  </Link>
                  
                  <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)}>
                    <a className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive("/blogs") 
                        ? "bg-primary-50 border-primary-500 text-primary-700" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}>
                      Browse
                    </a>
                  </Link>
                  
                  {user ? (
                    <>
                      <Link href="/my-blogs" onClick={() => setIsMobileMenuOpen(false)}>
                        <a className={`block px-3 py-2 rounded-md text-base font-medium ${
                          isActive("/my-blogs") 
                            ? "bg-primary-50 border-primary-500 text-primary-700" 
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                        }`}>
                          My Blogs
                        </a>
                      </Link>
                      
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <a className={`block px-3 py-2 rounded-md text-base font-medium ${
                          isActive("/dashboard") 
                            ? "bg-primary-50 border-primary-500 text-primary-700" 
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                        }`}>
                          Dashboard
                        </a>
                      </Link>
                      
                      <div className="pt-4 pb-3 border-t border-gray-200">
                        <div className="flex items-center px-4">
                          <div className="flex-shrink-0">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary-100 text-primary-800">
                                {getUserInitials()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="ml-3">
                            <div className="text-base font-medium text-gray-800">{user.fullName}</div>
                            <div className="text-sm font-medium text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-1">
                          <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                            <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                              Your Profile
                            </a>
                          </Link>
                          <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                            <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                              Settings
                            </a>
                          </Link>
                          <button 
                            onClick={() => {
                              handleLogout();
                              setIsMobileMenuOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                            disabled={logoutMutation.isPending}
                          >
                            {logoutMutation.isPending ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing out...
                              </div>
                            ) : (
                              "Sign out"
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="pt-4 pb-3 border-t border-gray-200">
                      <div className="space-y-2 px-3">
                        <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">Log In</Button>
                        </Link>
                        <Link href="/auth?tab=register" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full">Sign Up</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
