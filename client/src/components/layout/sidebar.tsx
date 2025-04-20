import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import {
  Home,
  FileText,
  Edit,
  Compass,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  LucideIcon,
} from "lucide-react";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}

export function NavItem({ icon: Icon, label, href, active, badge, onClick }: NavItemProps) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 font-normal",
          active && "bg-muted text-primary"
        )}
        onClick={onClick}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
        {badge && badge > 0 && (
          <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {badge}
          </span>
        )}
      </Button>
    </Link>
  );
}

interface SidebarProps {
  suggestionsCount?: number;
}

export function Sidebar({ suggestionsCount = 0 }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const isActive = (path: string) => location === path;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background shadow-lg transition-transform duration-300 ease-in-out md:shadow-none md:translate-x-0 md:relative md:z-0",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">SmartBlog</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={closeMobileSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            <NavItem 
              icon={Home} 
              label="Home" 
              href="/" 
              active={isActive("/")} 
              onClick={closeMobileSidebar}
            />
            
            {user && (
              <>
                <NavItem 
                  icon={FileText} 
                  label="My Blogs" 
                  href="/dashboard" 
                  active={isActive("/dashboard")} 
                  onClick={closeMobileSidebar}
                />
                <NavItem 
                  icon={Edit} 
                  label="Suggestions" 
                  href="/dashboard?tab=suggestions" 
                  active={location.includes("suggestions")} 
                  badge={suggestionsCount}
                  onClick={closeMobileSidebar}
                />
              </>
            )}
            
            <NavItem 
              icon={Compass} 
              label="Explore" 
              href="/explore" 
              active={isActive("/explore")}
              onClick={closeMobileSidebar}
            />
            
            {user && (
              <NavItem 
                icon={User} 
                label="Profile" 
                href="/profile" 
                active={isActive("/profile")}
                onClick={closeMobileSidebar}
              />
            )}
          </nav>
        </ScrollArea>

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="text-sm">Dark Mode</span>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>

          <Separator />

          {user ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => {
                  logoutMutation.mutate();
                  closeMobileSidebar();
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button 
                className="w-full" 
                onClick={closeMobileSidebar}
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
