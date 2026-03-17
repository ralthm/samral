import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import VenturesSection from "@/components/VenturesSection";
import VisionSection from "@/components/VisionSection";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
