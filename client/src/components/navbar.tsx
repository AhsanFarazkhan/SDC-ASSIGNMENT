import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load user data
    async function loadUser() {
      try {
        const res = await fetch('/api/user', {
          credentials: 'include'
        });
        
        if (res.status === 401) {
          setUser(null);
          return;
        }
        
        if (!res.ok) {
          throw new Error(`Error fetching user: ${res.status}`);
        }
        
        const userData = await res.json();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user in Navbar:", error);
      }
    }
    
    loadUser();
  }, []);
  
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
    : "?";

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      window.location.href = "/auth";
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <h1 className="text-xl font-semibold text-primary cursor-pointer">EduPay</h1>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="ml-3 relative">
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white mr-2">
                      <span>{userInitials}</span>
                    </div>
                    <span className="ml-1 text-sm font-medium text-gray-700 hidden sm:block">
                      {user?.name}
                    </span>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}