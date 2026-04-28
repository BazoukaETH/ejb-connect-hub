import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/AppShell";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import MemberDetail from "./pages/MemberDetail";
import Applicants from "./pages/Applicants";
import Payments from "./pages/Payments";
import Team from "./pages/Team";
import Announcements from "./pages/Announcements";
import Events from "./pages/Events";
import Committees from "./pages/Committees";
import Partners from "./pages/Partners";
import Library from "./pages/Library";
import Taxonomies from "./pages/Taxonomies";
import ChatModeration from "./pages/ChatModeration";
import AppContent from "./pages/AppContent";
import AuditLog from "./pages/AuditLog";
import Stub from "./pages/Stub";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/members/:id" element={<MemberDetail />} />
            <Route path="/applicants" element={<Applicants />} />
            <Route path="/onboarding" element={<Stub title="Onboarding queue" description="Track new member onboarding tasks: profile, payment, intro, first event." />} />
            <Route path="/team" element={<Team />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/expenses" element={<Stub title="Expenses" description="Operational expenses, vendor payments, and budget tracking." />} />
            <Route path="/committees" element={<Committees />} />
            <Route path="/events" element={<Events />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/documents" element={<Library />} />
            <Route path="/resources" element={<Library />} />
            <Route path="/templates" element={<Library />} />
            <Route path="/app-content" element={<AppContent />} />
            <Route path="/chat" element={<ChatModeration />} />
            <Route path="/taxonomies" element={<Taxonomies />} />
            <Route path="/audit" element={<AuditLog />} />
            <Route path="/settings" element={<Stub title="Settings" description="Workspace settings, integrations, and notification preferences." />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
