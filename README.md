# DocQA — AI-Powered Document Q&A

[![CI](https://github.com/vaidii2008/docqa/actions/workflows/ci.yml/badge.svg)](https://github.com/vaidii2008/docqa/actions/workflows/ci.yml)

> Upload PDFs into private workspaces and ask questions. DocQA answers in
> streamed text with citations back to the exact source passages. Applied RAG
> (Retrieval-Augmented Generation) wrapped in a real product.

**🔗 Live demo:** _coming soon_

![DocQA screenshot](./docs/screenshot.png)
<!-- screenshot placeholder — added in Phase 8 -->

## The problem

Finding a specific answer buried inside a long document is slow. DocQA lets you
ask a question in plain English and get a cited answer pulled from your own
uploaded files — no manual skimming.

## Features

- 🔐 **Auth + private workspaces** — users only see their own documents
- 📄 **Upload & parsing** — PDF → clean text → overlapping chunks
- 🔎 **Semantic search** — vector similarity retrieval over embeddings
- 💬 **Streaming answers with citations** — token-by-token, linked to sources
- 🗂️ **Persistent chat history** — per workspace
- 🚦 **Usage rate-limiting** — per-user request caps

## Tech stack

| Layer            | Choice                               |
| ---------------- | ------------------------------------ |
| Framework        | Next.js 15 (App Router) + TypeScript |
| Database         | Postgres + pgvector                  |
| ORM              | Prisma                               |
| Auth             | Auth.js (NextAuth v5)                |
| AI / streaming   | Vercel AI SDK                        |
| Cache / limiting | Upstash Redis                        |
| Testing          | Vitest + Playwright                  |
| CI/CD            | GitHub Actions → Vercel              |

## Local setup

_Setup steps added in Phase 8._

## Engineering decisions & trade-offs

_Added in Phase 8._

## License

[MIT](./LICENSE)
