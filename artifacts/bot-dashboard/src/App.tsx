import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";

import { AppLayout } from "@/components/layout/app-layout";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import BotManagement from "@/pages/bot";
import Servers from "@/pages/servers";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  // Call useTheme to ensure the side-effect (adding CSS class to root) runs
  useTheme();
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes wrapped in AppLayout */}
      <Route path="/">
        <AppLayout><Dashboard /></AppLayout>
      </Route>
      <Route path="/bot">
        <AppLayout><BotManagement /></AppLayout>
      </Route>
      <Route path="/servers">
        <AppLayout><Servers /></AppLayout>
      </Route>
      <Route path="/settings">
        <AppLayout><Settings /></AppLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeInitializer>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </ThemeInitializer>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
