"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function AssistantWidget() {
  const t = useTranslations("assistant");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isSending]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          locale,
          history: nextMessages.slice(-8, -1),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.ok ? data.reply : t("error") },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("error") }]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-4 end-4 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-persian-600 px-4 py-3 dark:border-zinc-800">
            <span className="text-sm font-semibold text-white">{t("title")}</span>
            <button
              onClick={() => setOpen(false)}
              aria-label={t("close")}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("greeting")}</p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ms-auto bg-persian-600 text-white"
                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                {m.content}
              </div>
            ))}
            {isSending && (
              <div className="max-w-[85%] rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-400 dark:bg-zinc-800">
                {t("thinking")}
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-zinc-200 p-2 dark:border-zinc-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("placeholder")}
              maxLength={500}
              className="flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-persian-500 dark:border-zinc-700"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="rounded-md bg-persian-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {t("send")}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("openLabel")}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-persian-600 text-2xl text-white shadow-lg hover:bg-persian-700"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
