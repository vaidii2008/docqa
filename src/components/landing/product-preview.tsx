import { Logo } from "@/components/ui/logo";

// A still picture of the chat screen, built from markup rather than a
// screenshot so it stays sharp and follows the theme. It is aria-hidden as a
// whole: screen readers get the caption instead of a tour of fake controls.
export function ProductPreview() {
  return (
    <figure className="mx-auto w-full max-w-6xl px-5 pt-12 pb-10">
      <figcaption className="sr-only">
        The DocQA chat answering a question about annual leave, with numbered
        citations that point to the source documents.
      </figcaption>

      <div
        aria-hidden="true"
        className="bg-surface shadow-soft rounded-[32px] p-2.5"
      >
        <div className="bg-background flex min-h-[520px] overflow-hidden rounded-3xl">
          <div className="bg-surface hidden w-60 shrink-0 flex-col gap-1 px-3 py-4 md:flex">
            <span className="text-fg-muted px-3.5 pb-1.5 text-[13px] font-semibold">
              Documents
            </span>
            <DocRow name="employee-handbook.pdf" status="Ready" active />
            <DocRow name="leave-policy.pdf" status="Ready" />
            <DocRow name="benefits-guide.pdf" status="Indexing" />
            <span className="text-primary mt-2 flex min-h-11 items-center gap-3 rounded-full px-3.5 text-[14.5px] font-semibold">
              <UploadIcon />
              Upload PDF
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col px-[clamp(1rem,4vw,3rem)] pt-4 pb-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[17px] font-semibold">My documents</span>
              <span className="bg-primary-container text-on-primary-container grid size-9 place-items-center rounded-full text-sm font-bold">
                D
              </span>
            </div>

            <div className="mx-auto mt-7 flex w-full max-w-3xl flex-1 flex-col gap-6">
              <p className="bg-surface-2 max-w-[85%] self-end rounded-[24px_6px_24px_24px] px-4.5 py-3">
                How many days of annual leave do new starters get?
              </p>

              <div className="flex items-start gap-4">
                <Logo className="size-8" />
                <div className="flex min-w-0 flex-col gap-4">
                  <p className="mt-0.5 text-[16.5px] leading-[1.7]">
                    New starters get <strong>21 days of annual leave</strong> a
                    year
                    <Cite n={1} />, building up from the first day at 1.75 days
                    per month
                    <Cite n={2} />. Up to 5 unused days can carry over if your
                    manager approves
                    <Cite n={3} />.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <SourceChip n={1} name="employee-handbook.pdf" />
                    <SourceChip n={2} name="employee-handbook.pdf" />
                    <SourceChip n={3} name="leave-policy.pdf" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface mx-auto mt-6 flex w-full max-w-3xl items-center gap-1.5 rounded-[30px] p-2">
              <span className="text-fg-muted grid size-11 place-items-center rounded-full">
                <PlusIcon />
              </span>
              <span className="text-fg-subtle flex-1 px-1">
                Ask about your documents
              </span>
              <span className="bg-surface-3 text-fg-subtle grid size-11 place-items-center rounded-full">
                <ArrowUpIcon />
              </span>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}

function DocRow({
  name,
  status,
  active = false,
}: {
  name: string;
  status: "Ready" | "Indexing";
  active?: boolean;
}) {
  return (
    <span
      className={`flex min-h-11 items-center gap-3 rounded-full px-3.5 text-[14.5px] ${
        active
          ? "bg-primary-container text-on-primary-container font-semibold"
          : "text-fg-muted"
      }`}
    >
      <FileIcon />
      <span className="min-w-0 flex-1 truncate">{name}</span>
      <span
        className={`text-xs font-semibold ${status === "Ready" ? "text-success" : "text-fg-subtle"}`}
      >
        {status}
      </span>
    </span>
  );
}

function Cite({ n }: { n: number }) {
  return (
    <span className="bg-primary-container text-on-primary-container mx-0.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded-full px-[5px] align-[3px] font-mono text-[11px] font-bold">
      {n}
    </span>
  );
}

function SourceChip({ n, name }: { n: number; name: string }) {
  return (
    <span className="bg-surface inline-flex min-h-9 items-center gap-2 rounded-full pr-3.5 pl-1.5 text-[13.5px]">
      <span className="bg-primary-container text-on-primary-container grid size-6 place-items-center rounded-full font-mono text-[11px] font-bold">
        {n}
      </span>
      {name}
    </span>
  );
}

function FileIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    >
      <path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" />
      <path d="M4.5 14.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
    </svg>
  );
}
