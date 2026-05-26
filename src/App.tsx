import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./pages/AppShell";
import LoginPage from "./pages/LoginPage";
import FormsPage from "./pages/FormsPage";
import BuilderPage from "./pages/BuilderPage";
import ResponsesPage from "./pages/ResponsesPage";
import StatsPage from "./pages/StatsPage";
import ProfilePage from "./pages/ProfilePage";
import FormPublicPage from "./pages/FormPublicPageRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/forms" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/form/:slug" element={<FormPublicPage />} />

          <Route element={<AppShell />}>
            <Route path="/forms" element={<FormsPage />} />
            <Route path="/builder" element={<BuilderPage />} />
            <Route path="/builder/:formId" element={<BuilderPage />} />
            <Route path="/responses" element={<ResponsesPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
