"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Header from "../components/Home/Header";
import Logo from "../components/Home/Logo";
import ModeToggle from "../components/Home/ModeToggle";
import Footer from "../components/Home/Footer";
import ChatMessage from "../components/AImode/ChatMessage";
import SourceCard from "../components/AImode/SourceCard";

// Stable incrementing ID — avoids Date.now() collisions when two messages
// are created in the same millisecond.
let _msgId = 0;
const nextId = () => ++_msgId;

const SUGGESTED_PROMPTS = [
    "What is Section 302 of the Indian Penal Code?",
    "Draft a non-disclosure agreement under Indian law",
    "Explain the latest Supreme Court ruling on bail",
    "What are tenant rights under Rent Control Act?",
    "How to file a consumer complaint in India?",
    "What is a PIL and how to file one?",
];

export default function AImode() {
    const [messages,    setMessages]    = useState([]);
    const [inputValue,  setInputValue]  = useState("");
    const [isLoading,   setIsLoading]   = useState(false);
    const [sources,     setSources]     = useState([]);
    const [showWelcome, setShowWelcome] = useState(true);
    const [error,       setError]       = useState(null);

    const messagesEndRef  = useRef(null);
    const inputRef        = useRef(null);
    const abortController = useRef(null);
    // Keep a ref to current messages so async functions always have the latest value
    const messagesRef     = useRef([]);

    // Keep messagesRef in sync
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Auto-scroll to bottom whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Build Gemini-compatible history from message array
    function buildHistory(msgs) {
        return msgs
            .filter((m) => m.role === "user" || (m.role === "model" && m.text && !m.isStreaming))
            .map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
    }

    // ── Stream the AI response ────────────────────────────────
    async function startStream(userText, signal) {
        const aiMsgId = nextId();

        // Add empty AI placeholder
        setMessages((prev) => [
            ...prev,
            { id: aiMsgId, role: "model", text: "", isStreaming: true },
        ]);

        try {
            // Use the ref so we always have the latest history (including the user msg we just added)
            const history = buildHistory(messagesRef.current);

            const res = await fetch("/api/ai", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userText,
                    // history excludes the very last user message (it's the current prompt)
                    history: history.slice(0, -1),
                }),
                signal,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "AI service unavailable" }));
                throw new Error(err.error || `HTTP ${res.status}`);
            }

            const reader  = res.body.getReader();
            const decoder = new TextDecoder();
            let   buffer  = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const events = buffer.split("\n\n");
                buffer = events.pop() ?? "";

                for (const event of events) {
                    if (!event.startsWith("data: ")) continue;
                    try {
                        const payload = JSON.parse(event.slice(6));

                        if (payload.type === "chunk") {
                            setMessages((prev) =>
                                prev.map((m) =>
                                    m.id === aiMsgId
                                        ? { ...m, text: m.text + payload.text }
                                        : m
                                )
                            );
                        } else if (payload.type === "sources") {
                            setSources(payload.sources || []);
                        } else if (payload.type === "error") {
                            throw new Error(payload.message);
                        }
                    } catch {
                        // Skip malformed SSE events
                    }
                }
            }

        } catch (err) {
            if (err.name === "AbortError") return;
            console.error("[AI chat] Stream error:", err);
            setError(err.message || "Something went wrong. Please try again.");
            // Remove empty placeholder on error
            setMessages((prev) => prev.filter((m) => !(m.id === aiMsgId && m.text === "")));
        } finally {
            // Mark streaming done regardless of success/error
            setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, isStreaming: false } : m))
            );
            setIsLoading(false);
            inputRef.current?.focus();
        }
    }

    // ── Send a message ────────────────────────────────────────
    const sendMessage = useCallback((text) => {
        const userText = text.trim();
        if (!userText || isLoading) return;

        // Cancel any ongoing generation
        abortController.current?.abort();
        abortController.current = new AbortController();
        const signal = abortController.current.signal;

        setError(null);
        setSources([]);
        setShowWelcome(false);
        setIsLoading(true);
        setInputValue("");

        // Add user message
        const userMsg = { id: nextId(), role: "user", text: userText };
        setMessages((prev) => [...prev, userMsg]);

        // Start the AI stream — messagesRef will be updated by useEffect before startStream reads it,
        // but we pass userText directly so the prompt is always correct.
        startStream(userText, signal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);

    function handleSubmit(e) {
        e.preventDefault();
        sendMessage(inputValue);
    }

    function handlePromptClick(prompt) {
        sendMessage(prompt);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputValue);
        }
    }

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="flex flex-col min-h-screen bg-ai-gradient transition-all duration-700">
            <Header />

            <main className="flex-grow flex flex-col w-full max-w-[800px] mx-auto px-4 sm:px-6 pt-4 pb-0">

                {/* ── Welcome / Empty state ── */}
                {showWelcome && (
                    <div className="flex flex-col items-center justify-center flex-grow mt-[-10vh]">
                        <Logo />
                        <ModeToggle />

                        <p className="text-gray-500 text-sm mt-2 mb-6 text-center max-w-md">
                            Ask me anything about Indian law — grounded with real-time Google Search and Gemini AI.
                        </p>

                        {/* Suggested Prompts — click to send immediately */}
                        <div className="flex flex-wrap gap-2 justify-center max-w-[680px] mb-8">
                            {SUGGESTED_PROMPTS.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handlePromptClick(prompt)}
                                    className="px-4 py-2 bg-white/60 hover:bg-white/95 border border-white/40 shadow-sm rounded-full text-[13px] text-gray-700 font-medium transition-all hover:shadow-md hover:border-purple-200 hover:text-purple-700"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Chat Messages ── */}
                {!showWelcome && (
                    <div
                        className="flex-grow overflow-y-auto py-4"
                        style={{ minHeight: 0 }}
                    >
                        {messages.map((msg) => (
                            <ChatMessage
                                key={msg.id}
                                message={msg}
                                isStreaming={msg.isStreaming}
                            />
                        ))}

                        {/* Error banner */}
                        {error && (
                            <div className="mx-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Grounding Sources */}
                        {sources.length > 0 && (
                            <div className="mx-2 mb-4">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Grounded Sources
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {sources.map((src, i) => (
                                        <SourceCard key={i} source={src} index={i} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* ── Input Bar ── */}
                <div className="sticky bottom-0 pb-4 pt-2 bg-transparent">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full flex items-end gap-2 rounded-2xl shadow-lg px-4 py-3 bg-white/90 backdrop-blur-md ai-search-glow"
                    >
                        {/* Sparkle icon */}
                        <div className="flex-shrink-0 mb-0.5">
                            <svg className="w-5 h-5 text-purple-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>

                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                e.target.style.height = "auto";
                                e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask AdvocateHub AI anything about Indian law..."
                            rows={1}
                            disabled={isLoading}
                            className="flex-grow outline-none text-sm bg-transparent text-gray-800 placeholder-gray-400 resize-none leading-relaxed disabled:opacity-50"
                            style={{ minHeight: "28px", maxHeight: "160px" }}
                            autoFocus
                        />

                        {/* Send / Stop button */}
                        <button
                            type={isLoading ? "button" : "submit"}
                            onClick={isLoading ? () => abortController.current?.abort() : undefined}
                            disabled={!isLoading && !inputValue.trim()}
                            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all
                                       bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700
                                       text-white shadow-sm hover:shadow-md
                                       disabled:opacity-30 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300"
                            title={isLoading ? "Stop generation" : "Send"}
                        >
                            {isLoading ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="6" width="12" height="12" rx="2" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[10px] text-gray-400 mt-1">
                        Powered by Google Gemini · Grounded with real-time Google Search
                    </p>
                </div>

            </main>

            <Footer />
        </div>
    );
}
