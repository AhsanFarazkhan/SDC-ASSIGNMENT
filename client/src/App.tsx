import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import AdminDashboard from "@/pages/admin-dashboard";
import ParentDashboard from "@/pages/parent-dashboard";
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";

function Router() {
  console.log("Router component rendering");
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <AdminRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/parent" component={ParentDashboard} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
