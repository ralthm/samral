import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";

// Route-level code splitting: only the landing page ships in the initial
// bundle. Heavier routes (notably the miles calculator and its data tables)
// load on demand.
const About = lazy(() => import("./pages/About.tsx"));
const AdminMilesCalculator = lazy(() => import("./pages/AdminMilesCalculator.tsx"));
const GuideArticle = lazy(() => import("./pages/GuideArticle.tsx"));
const MilesCalculator = lazy(() => import("./pages/MilesCalculator.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const PlanMyTrip = lazy(() => import("./pages/PlanMyTrip.tsx"));
const PointsStrategy = lazy(() => import("./pages/PointsStrategy.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Products = lazy(() => import("./pages/Products.tsx"));
const Terms = lazy(() => import("./pages/Terms.tsx"));
const TypographyPreview = lazy(() => import("./pages/TypographyPreview.tsx"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-ink" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/plan-my-trip" element={<PlanMyTrip />} />
            <Route path="/trip-planning" element={<PlanMyTrip />} />
            <Route path="/guides/:slug" element={<GuideArticle />} />
            <Route path="/points-strategy" element={<PointsStrategy />} />
            <Route path="/products" element={<Products />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/miles-calculator" element={<MilesCalculator />} />
            <Route path="/admin/miles-calculator" element={<AdminMilesCalculator />} />
            <Route path="/typography-preview" element={<TypographyPreview />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
