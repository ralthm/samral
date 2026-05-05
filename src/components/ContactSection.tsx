import { ArrowUpRight } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 py-24 md:py-32 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-muted-foreground">04</span>
            <span className="label-eyebrow">Contact</span>
          </div>
        </div>
        <div className="md:col-span-8 md:pl-8 md:border-l md:border-border">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-[1.1] max-w-[640px]">
            For product enquiries, partnerships, or general questions.
          </h2>
          <a
            href="mailto:samuel@samral.com"
            className="group mt-12 inline-flex items-center gap-3 font-heading text-2xl md:text-3xl text-foreground"
          >
            <span className="border-b border-foreground/40 group-hover:border-foreground pb-1 transition-colors">
              samuel@samral.com
            </span>
            <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
