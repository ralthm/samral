import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import VenturesSection from "@/components/VenturesSection";
import VisionSection from "@/components/VisionSection";
import ContactSection from "@/components/ContactSection";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <HeroSection />
      <AboutSection />
      <VenturesSection />
      <VisionSection />
      <ContactSection />
      <SiteFooter />
    </div>
  );
};

export default Index;
