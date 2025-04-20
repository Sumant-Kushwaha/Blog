import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import BlogViewPage from "@/pages/blog-view-page";
import BlogCreatePage from "@/pages/blog-create-page";
import BlogEditPage from "@/pages/blog-edit-page";
import MyBlogsPage from "@/pages/my-blogs-page";
import DashboardPage from "@/pages/dashboard-page";
import BlogsPage from "@/pages/blogs-page";
import VerifyEmailPage from "@/pages/verify-email-page";
import ResetPasswordPage from "@/pages/reset-password-page";
import PendingEditsPage from "@/pages/dashboard/pending-edits-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/blogs" component={BlogsPage} />
      <Route path="/verify-email/:token" component={VerifyEmailPage} />
      <Route path="/reset-password/:token" component={ResetPasswordPage} />
      <ProtectedRoute path="/blog/create" component={BlogCreatePage} />
      <ProtectedRoute path="/blog/:id" component={BlogViewPage} />
      <ProtectedRoute path="/blog/:id/edit" component={BlogEditPage} />
      <ProtectedRoute path="/my-blogs" component={MyBlogsPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/dashboard/pending-edits" component={PendingEditsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
