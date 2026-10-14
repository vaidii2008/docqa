import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuraBackground } from "@/components/ui/aura-background";
import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { ProductPreview } from "@/components/landing/product-preview";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Privacy } from "@/components/landing/privacy";
import { FinalCta } from "@/components/landing/final-cta";
import { SiteFooter } from "@/components/landing/site-footer";

export default async function HomePage() {
  const session = await auth();
  // Signed in visitors skip the marketing page and go straight to their
  // documents, which is what this route did before.
  if (session?.user) redirect("/dashboard");

  return (
    <div className="relative isolate min-h-screen">
      <AuraBackground />
      <SiteHeader />
      <main>
        <Hero />
        <ProductPreview />
        <HowItWorks />
        <Privacy />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
