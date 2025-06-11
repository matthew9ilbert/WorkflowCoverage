import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import ContactDirectory from "@/pages/ContactDirectory";
import ShiftCoverage from "@/pages/ShiftCoverage";
import TaskManagement from "@/pages/TaskManagement";
import Templates from "@/pages/Templates";
import Announcements from "@/pages/Announcements";
import TextScanning from "@/pages/TextScanning";
import MessageMonitoring from "@/pages/MessageMonitoring";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/not-found";
import CommunicationHub from '@/pages/CommunicationHub';

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/" nest>
          <AppLayout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/contacts" component={ContactDirectory} />
              <Route path="/coverage" component={ShiftCoverage} />
              <Route path="/tasks" component={TaskManagement} />
              <Route path="/templates" component={Templates} />
              <Route path="/announcements" component={Announcements} />
              <Route path="/communication-hub" component={CommunicationHub} />
              <Route path="/scanning" component={TextScanning} />
              <Route path="/monitoring" component={MessageMonitoring} />
              <Route path="/analytics" component={Analytics} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </Route>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;