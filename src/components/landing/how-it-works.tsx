const STEPS = [
  {
    title: "Upload",
    body: "Add PDFs to your private workspace. The text is extracted and split into overlapping chunks, so no idea is cut in half at a boundary.",
  },
  {
    title: "Index",
    body: "Each chunk becomes a 768 dimension embedding, stored beside its text in Postgres with pgvector.",
  },
  {
    title: "Ask",
    body: "Your question is matched to the closest passages by cosine similarity, and the answer streams in with numbered citations.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="mx-auto w-full max-w-6xl scroll-mt-6 px-5 pt-22 pb-10"
    >
      <h2
        id="how-title"
        className="text-center text-[clamp(2rem,4vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance"
      >
        From PDF to <span className="glow-text">cited answer</span>
      </h2>
      <p className="text-fg-muted mx-auto mt-4 max-w-xl text-center text-lg text-pretty">
        Three steps, and you can check the result of every one.
      </p>

      {/* An ordered list, because the order is the point. The big numbers
          are decoration; the list itself tells screen readers the sequence. */}
      <ol className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="bg-surface flex flex-col gap-3 rounded-[28px] p-7.5"
          >
            <span
              aria-hidden="true"
              className="glow-text text-[52px] leading-none font-bold"
            >
              {index + 1}
            </span>
            <h3 className="mt-2 text-[22px] font-semibold">{step.title}</h3>
            <p className="text-fg-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
