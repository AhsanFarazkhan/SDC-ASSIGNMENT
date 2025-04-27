import { Redirect } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { User } from "@shared/schema";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true);
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
        
        toast({
          title: "Welcome to EduPay",
          description: `Logged in as ${userData.name}`,
        });
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Redirect to the appropriate dashboard based on user role
  if (user.role === "admin") {
    return <Redirect to="/admin" />;
  } else {
    return <Redirect to="/parent" />;
  }
}