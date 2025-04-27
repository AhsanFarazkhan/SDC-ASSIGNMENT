import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { apiRequest } from "./queryClient";
import { User } from "@shared/schema";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/user", {
          credentials: "include"
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
      } catch (err) {
        console.error("Error in ProtectedRoute:", err);
        setError(err as Error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    getUser();
  }, []);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (error) {
    console.error("Authentication error:", error);
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}

export function AdminRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/user", {
          credentials: "include"
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
      } catch (err) {
        console.error("Error in AdminRoute:", err);
        setError(err as Error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    getUser();
  }, []);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (error) {
    console.error("Authentication error:", error);
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (user.role !== "admin") {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}