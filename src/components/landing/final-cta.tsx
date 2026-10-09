import Link from "next/link";
import {
  filledButtonLarge,
  outlineButtonLarge,
} from "@/components/ui/button-variants";
import { AURA_GRADIENT } from "@/components/ui/aura-gradient";

export function FinalCta() {
  return (
    <section
      aria-labelledby="cta-title"
      className="mx-auto w-full max-w-6xl px-5 pt-22 pb-24"
    >
      <div className="bg-surface relative isolate overflow-hidden rounded-[36px] px-6 py-[clamp(2.5rem,7vw,5.5rem)] text-center">
        <div
          aria-hidden="true"
          className="animate-aura absolute inset-0 -z-10 motion-reduce:animate-none"
          style={{ background: AURA_GRADIENT }}
        />
        <h2
          id="cta-title"
          className="mx-auto max-w-3xl text-[clamp(2.125rem,5vw,3.875rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance"
        >
          Your documents already have the answers.
        </h2>
        <p className="text-fg-muted mt-5 text-lg text-pretty">
          Create an account, upload a PDF and ask your first question.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/signup" className={filledButtonLarge}>
            Get started
          </Link>
          <Link href="/login" className={outlineButtonLarge}>
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
