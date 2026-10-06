import { demoEnabled } from "@/lib/supabase/config";
import { MarketingHeader } from "./MarketingHeader";
import { Hero } from "./Hero";
import { Benefits } from "./Benefits";
import { HowItWorks } from "./HowItWorks";
import { TemplateShowcase } from "./TemplateShowcase";
import { Pricing } from "./Pricing";
import { MarketingFooter } from "./MarketingFooter";
import { Faq } from "./Faq";
import "./marketing.css";

// El contenido comercial se renderiza en servidor; solo los controles y las animaciones hidratan.
export function Landing() {
  return (
    <div className="marketing-page">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <MarketingHeader />
      <main id="contenido">
        <Hero demoAvailable={demoEnabled()} />
        <Benefits />
        <HowItWorks demoAvailable={demoEnabled()} />
        <TemplateShowcase />
        <Pricing />
        <Faq />
      </main>
      <MarketingFooter />
    </div>
  );
}
