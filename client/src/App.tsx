import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import LoadersDemo from "@/pages/loaders-demo";
import EventsPage from "@/pages/events";
import ConnectSpotify from "@/pages/connect-spotify";
import ConnectSpotifyDirect from "@/pages/connect-spotify-direct";
import AuthSuccess from "@/pages/auth-success";
import WelcomePage from "@/pages/welcome";
import AnalyzingMusicPage from "@/pages/analyzing-music";
import VerifyEmail from "@/pages/VerifyEmail";
import SpotifyTroubleshooter from "@/pages/spotify-troubleshooter";
import Navigation from "@/components/navigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={WelcomePage} />
      <Route path="/home" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/loaders" component={LoadersDemo} />
      <Route path="/events" component={EventsPage} />
      <Route path="/connect-spotify" component={ConnectSpotify} />
      <Route path="/connect-spotify-direct" component={ConnectSpotifyDirect} />
      <Route path="/auth-success" component={AuthSuccess} />
      <Route path="/analyzing-music" component={AnalyzingMusicPage} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/spotify-troubleshooter" component={SpotifyTroubleshooter} />
      {/* Future routes */}
      {/* <Route path="/api-routes" component={ApiRoutes} /> */}
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
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
