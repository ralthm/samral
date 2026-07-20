import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import About from "./pages/About.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import PlanMyTrip from "./pages/PlanMyTrip.tsx";
import PointsStrategy from "./pages/PointsStrategy.tsx";
import Privacy from "./pages/Privacy.tsx";
import Products from "./pages/Products.tsx";
import Terms from "./pages/Terms.tsx";
import TypographyPreview from "./pages/TypographyPreview.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/plan-my-trip" element={<PlanMyTrip />} />
          <Route path="/trip-planning" element={<PlanMyTrip />} />
          <Route path="/points-strategy" element={<PointsStrategy />} />
          <Route path="/products" element={<Products />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/typography-preview" element={<TypographyPreview />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
