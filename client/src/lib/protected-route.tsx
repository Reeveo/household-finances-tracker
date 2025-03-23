import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldAlert } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground text-sm text-center">Loading your financial information...</p>
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
          <ShieldAlert className="h-8 w-8 text-primary mb-4" />
          <h2 className="text-lg font-medium mb-2">Authentication Required</h2>
          <p className="text-muted-foreground text-sm text-center mb-6">
            Please sign in to access your financial dashboard.
          </p>
          <div className="animate-pulse">
            <Redirect to="/auth" />
          </div>
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
