import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Future routes */}
      {/* <Route path="/auth" component={Authentication} /> */}
      {/* <Route path="/api-routes" component={ApiRoutes} /> */}
      {/* <Route path="/events" component={Events} /> */}
      {/* <Route path="/users" component={Users} /> */}
      {/* <Route path="/settings" component={Settings} /> */}
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
