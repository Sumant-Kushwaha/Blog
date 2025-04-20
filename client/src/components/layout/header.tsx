import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search for:", searchQuery);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="md:hidden w-8">
          {/* Space for mobile menu button (in Sidebar component) */}
        </div>
        
        <div className="flex-1 md:flex md:justify-center md:max-w-sm">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Input
                className="w-full pl-10 bg-muted"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </form>
        </div>
        
        <div className="flex items-center space-x-2">
          {user && (
            <>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </>
          )}
          
          {!user && (
            <Link href="/auth">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
