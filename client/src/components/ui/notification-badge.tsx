import { useQuery } from "@tanstack/react-query";
import { EditSuggestionWithDetails } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export function NotificationBadge() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  
  // Fetch user's blogs and suggestions if user is logged in
  const { data: blogs = [] } = useQuery({
    queryKey: ["/api/blogs", { authorId: user?.id }],
    enabled: !!user,
  });
  
  const { data: suggestions = [] } = useQuery<EditSuggestionWithDetails[]>({
    queryKey: ["/api/suggestions"],
    enabled: !!user,
  });
  
  // Filter suggestions for blogs owned by the user and with pending status
  const pendingApprovals = suggestions.filter(
    s => blogs.some(b => b.id === s.blogId) && s.status === "pending"
  );
  
  const notificationCount = pendingApprovals.length;
  
  const handleNotificationClick = (suggestionId: number) => {
    navigate(`/dashboard?tab=suggestions`);
  };
  
  if (!user) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {notificationCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          {notificationCount > 0 ? (
            pendingApprovals.slice(0, 5).map((suggestion) => (
              <DropdownMenuItem 
                key={suggestion.id} 
                className="cursor-pointer py-3"
                onClick={() => handleNotificationClick(suggestion.id)}
              >
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Edit Suggestion</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mt-1 line-clamp-2">
                    <span className="font-medium">{suggestion.editor?.username}</span> suggested edits for <span className="font-medium italic">{suggestion.originalTitle}</span>
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No new notifications</p>
            </div>
          )}
        </DropdownMenuGroup>
        
        {notificationCount > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard?tab=suggestions" className="w-full text-center text-sm text-primary cursor-pointer">
                View all {notificationCount} suggestions
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        {notificationCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard?tab=suggestions" className="w-full text-center text-sm cursor-pointer">
                Go to suggestion management
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
