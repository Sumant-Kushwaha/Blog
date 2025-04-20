import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Edit, Eye } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { BlogWithAuthor } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface BlogCardProps {
  blog: BlogWithAuthor;
  onEdit?: () => void;
  onSendForApproval?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
}

export function BlogCard({ blog, onEdit, onSendForApproval, onDelete, onPublish }: BlogCardProps) {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const truncate = (str: string, length: number) => {
    if (!str) return "";
    return str.length > length ? str.substring(0, length) + "..." : str;
  };
  
  const formattedDate = blog.createdAt 
    ? formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })
    : "";
  
  const isOwner = user?.id === blog.authorId;
  const isDraft = blog.status === "draft";

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <Badge variant={isDraft ? "outline" : "default"} className={isDraft ? "text-gray-500" : ""}>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current mr-1"></span>
            {isDraft ? "Draft" : "Published"}
          </Badge>
          
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              
              {isOwner && isDraft && (
                <DropdownMenuItem onClick={onPublish}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Publish</span>
                </DropdownMenuItem>
              )}
              
              {!isOwner && !isDraft && (
                <DropdownMenuItem onClick={onSendForApproval}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Suggest Edits</span>
                </DropdownMenuItem>
              )}
              
              {isOwner && (
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Link href={`/blogs/${blog.id}`}>
          <h3 className="mt-3 cursor-pointer text-lg font-medium line-clamp-1 hover:underline">
            {blog.title}
          </h3>
        </Link>
        
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {blog.excerpt || truncate(blog.content.replace(/<[^>]*>/g, ''), 150)}
        </p>
        
        <div className="mt-4 flex items-center">
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              {blog.author?.username.substring(0, 2).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{blog.author?.username || "Unknown"}</span> • {formattedDate}
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/50 px-5 py-3">
        <div className="flex justify-between text-xs text-muted-foreground w-full">
          <span>124 views</span>
          <span>8 comments</span>
        </div>
      </CardFooter>
    </Card>
  );
}
