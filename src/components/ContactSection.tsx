import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="px-6 py-24 md:py-32 bg-card border-t border-border">
      <div className="max-w-[860px] mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Contact</p>
        <h2 className="text-3xl sm:text-4xl text-foreground mb-6 tracking-tight">Get in Touch</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-[600px]">
          For product enquiries, partnerships, or general questions.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button asChild size="lg" className="gap-2 px-8">
            <a href="mailto:samuel@samral.com">
              Email Samral <Mail className="!size-4" />
            </a>
          </Button>
          <a
            href="mailto:samuel@samral.com"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            samuel@samral.com
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
