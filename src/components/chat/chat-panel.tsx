"use client";

import { useState, useRef, useEffect } from "react";

interface Source {
  n: number;
  filename: string;
  similarity: number;
  preview: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export function ChatPanel({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit() {
    const question = input.trim();
    if (!question || isStreaming) return;

    setInput("");
    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    // Add an empty assistant message we will fill as tokens arrive.
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (res.status === 429) {
        const data = await res.json();
        throw new Error(data.error ?? "Rate limit exceeded.");
      }
      if (!res.ok || !res.body) {
        throw new Error("Request failed");
      }

      // Parse the citation sources from the response header.
      const rawSources = res.headers.get("x-sources");
      const sources: Source[] = rawSources
        ? JSON.parse(decodeURIComponent(rawSources))
        : [];

      // Read the streamed answer body chunk by chunk.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: answer };
          return next;
        });
      }

      // Attach sources to the finished assistant message.
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: answer, sources };
        return next;
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Sorry, something went wrong answering that.";
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: message };
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            Ask a question about your documents to get started.
          </p>
        ) : null}

        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
                  : "max-w-[80%] rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-900"
              }
            >
              <p className="whitespace-pre-wrap">
                {m.content || (isStreaming ? "Thinking..." : "")}
              </p>

              {m.sources && m.sources.length > 0 ? (
                <div className="mt-3 border-t border-gray-200 pt-2">
                  <p className="mb-1 text-xs font-medium text-gray-500">
                    Sources
                  </p>
                  <ul className="flex flex-col gap-1">
                    {m.sources.map((s) => (
                      <li key={s.n} className="text-xs text-gray-600">
                        <span className="font-medium">[{s.n}]</span> {s.filename}{" "}
                        <span className="text-gray-400">
                          ({(s.similarity * 100).toFixed(0)}% match)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask a question..."
          disabled={isStreaming}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={isStreaming}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
