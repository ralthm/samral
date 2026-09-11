import { Suspense } from "react";
import { lazyWithRetry as lazy } from "@/lib/lazyWithRetry";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Route-level code splitting: a visitor landing on any single route downloads
// only that route's code. Nothing else in the app is pulled in eagerly.
const About = lazy(() => import("./pages/About.tsx"));
const AdminCardImages = lazy(() => import("./pages/AdminCardImages.tsx"));
const AdminMilesCalculator = lazy(() => import("./pages/AdminMilesCalculator.tsx"));
const Business = lazy(() => import("./pages/Business.tsx"));
const CardStrategyConfirmed = lazy(() => import("./pages/CardStrategyConfirmed.tsx"));
const GuideArticle = lazy(() => import("./pages/GuideArticle.tsx"));
const Index = lazy(() => import("./pages/Index.tsx"));
const MilesCalculator = lazy(() => import("./pages/MilesCalculator.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const PlanMyTrip = lazy(() => import("./pages/PlanMyTrip.tsx"));
const PointsStrategy = lazy(() => import("./pages/PointsStrategy.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Products = lazy(() => import("./pages/Products.tsx"));
const Terms = lazy(() => import("./pages/Terms.tsx"));


const App = () => (
  <BrowserRouter>
    {/* No full-page spinner: the route chunk is requested in the same tick as
        the app shell, so this renders for at most a frame or two. */}
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/plan-my-trip" element={<PlanMyTrip />} />
        <Route path="/trip-planning" element={<PlanMyTrip />} />
        <Route path="/guides/:slug" element={<GuideArticle />} />
        <Route path="/points-strategy" element={<PointsStrategy />} />
        <Route path="/business" element={<Business />} />
        <Route path="/products" element={<Products />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/miles-calculator" element={<MilesCalculator />} />
        <Route path="/card-strategy-confirmed" element={<CardStrategyConfirmed />} />
        <Route path="/admin/miles-calculator" element={<AdminMilesCalculator />} />
        <Route path="/admin/card-images" element={<AdminCardImages />} />



        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
