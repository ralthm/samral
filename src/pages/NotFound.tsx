import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    document.title = "Page not found | Samral";
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center px-5 py-20 sm:px-6">
        <p className="eyebrow mb-6 text-clay">404</p>
        <h1 className="font-display text-4xl text-ink md:text-6xl">
          This page has taken a detour.
        </h1>
        <p className="mt-6 text-[16px] leading-relaxed text-ink/80">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
        <Link
          to="/"
          className="mt-10 inline-flex min-h-12 items-center justify-center rounded-sm bg-ink px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
        >
          Return to homepage &nbsp;&rarr;
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
};

export default NotFound;
