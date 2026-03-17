import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="px-6 py-24 md:py-32 bg-card">
      <div className="max-w-[800px] mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl text-foreground mb-6">
          Interested in what I'm building?
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-[550px] mx-auto">
          Whether you want to follow the journey, connect, or explore future collaborations, feel free to reach out.
        </p>
        <Button asChild size="lg" className="gap-2 px-8">
          <a href="mailto:hello@samral.com">
            Contact <Mail className="!size-4" />
          </a>
        </Button>
      </div>
    </section>
  );
};

export default ContactSection;
