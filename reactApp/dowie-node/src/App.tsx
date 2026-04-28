import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MonteCarloLanding from "./pages/MonteCarloLanding";
import MonteCarloTool from "./pages/MonteCarloTool";
import SimulationHistory from "./pages/SimulationHistory";
import LicenseLanding from "./pages/license/LicenseLanding";
import LicenseSignup from "./pages/license/LicenseSignup";
import LicenseLogin from "./pages/license/LicenseLogin";
import LicenseDashboard from "./pages/license/LicenseDashboard";
import LicenseProfile from "./pages/license/LicenseProfile";
import LicenseSettings from "./pages/license/LicenseSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tools/monte-carlo" element={<MonteCarloLanding />} />
          <Route path="/tools/monte-carlo/simulator" element={<MonteCarloTool />} />
          <Route path="/history" element={<SimulationHistory />} />
          <Route path="/license" element={<LicenseLanding />} />
          <Route path="/license/signup" element={<LicenseSignup />} />
          <Route path="/license/login" element={<LicenseLogin />} />
          <Route path="/license/dashboard" element={<LicenseDashboard />} />
          <Route path="/license/profile" element={<LicenseProfile />} />
          <Route path="/license/settings" element={<LicenseSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
