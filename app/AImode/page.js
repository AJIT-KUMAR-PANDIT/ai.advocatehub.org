"use client";

import { useState, useRef, useEffect } from "react";
import Header from "../components/Home/Header";
import Logo from "../components/Home/Logo";
import ModeToggle from "../components/Home/ModeToggle";
import Footer from "../components/Home/Footer";
import ChatMessage from "../components/AImode/ChatMessage";
import AttachmentChip from "../components/AImode/AttachmentChip";
import SourceCard from "../components/AImode/SourceCard";
import {
    ATTACHMENT_ACCEPT,
    formatFileSize,
    getAttachmentMimeType,
    isSupportedAttachment,
    MAX_ATTACHMENT_COUNT,
    MAX_ATTACHMENT_SIZE_BYTES,
} from "@/lib/attachmentUtils";

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

const WELCOME_PANELS = [
    {
        title: "Upload evidence",
        description: "Work from PDFs, Word files, text files, or images when the answer depends on the record itself.",
    },
    {
        title: "Web + file RAG",
        description: "Use live search grounding, uploaded documents, and embeddings-ready context instead of blind completion.",
    },
    {
        title: "Draft faster",
        description: "Turn research into summaries, issue lists, first drafts, and client-ready explanations in one thread.",
    },
];

const LLM_SETTINGS_STORAGE_KEY = "advocatehub.customLlmSettings";
const DEFAULT_LLM_SETTINGS = {
    enabled: false,
    url: "",
    apiKey: "",
    model: "",
};

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
                return;
            }

            reject(new Error(`Failed to read ${file.name}.`));
        };

        reader.onerror = () => reject(new Error(`Failed to read ${file.name}.`));
        reader.readAsDataURL(file);
    });
}

export default function AImode() {
    const [messages,    setMessages]    = useState([]);
    const [inputValue,  setInputValue]  = useState("");
    const [isLoading,   setIsLoading]   = useState(false);
    const [sources,     setSources]     = useState([]);
    const [showWelcome, setShowWelcome] = useState(true);
    const [error,       setError]       = useState(null);
    const [pendingAttachments, setPendingAttachments] = useState([]);
    const [showLlmSettings, setShowLlmSettings] = useState(false);
    const [llmSettings, setLlmSettings] = useState(() => ({ ...DEFAULT_LLM_SETTINGS }));
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    const messagesEndRef  = useRef(null);
    const inputRef        = useRef(null);
    const fileInputRef    = useRef(null);
    const abortController = useRef(null);
    // Keep a ref to current messages so async functions always have the latest value
    const messagesRef     = useRef([]);

    // Keep messagesRef in sync
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        try {
            const savedSettings = window.localStorage.getItem(LLM_SETTINGS_STORAGE_KEY);

            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                setLlmSettings({
                    enabled: Boolean(parsed?.enabled),
                    url:     typeof parsed?.url === "string" ? parsed.url : (parsed?.baseUrl || ""),
                    apiKey:  typeof parsed?.apiKey === "string" ? parsed.apiKey : "",
                    model:   typeof parsed?.model === "string" ? parsed.model : "",
                });
            }
        } catch (err) {
            console.warn("[AI chat] Failed to load custom LLM settings:", err);
        } finally {
            setSettingsLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!settingsLoaded) return;

        try {
            window.localStorage.setItem(LLM_SETTINGS_STORAGE_KEY, JSON.stringify(llmSettings));
        } catch (err) {
            console.warn("[AI chat] Failed to save custom LLM settings:", err);
        }
    }, [llmSettings, settingsLoaded]);

    // Auto-scroll to bottom whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function updateLlmSetting(field, value) {
        setLlmSettings((prev) => ({ ...prev, [field]: value }));
    }

    function resetLlmSettings() {
        setLlmSettings({ ...DEFAULT_LLM_SETTINGS });
    }

    function getConversationAttachments(msgs, nextAttachments = []) {
        const merged = [
            ...msgs.flatMap((message) => (
                message.role === "user" && Array.isArray(message.attachments)
                    ? message.attachments
                    : []
            )),
            ...nextAttachments,
        ];

        return merged.slice(-MAX_ATTACHMENT_COUNT).map((attachment) => ({
            id:       attachment.id,
            name:     attachment.name,
            mimeType: attachment.mimeType,
            size:     attachment.size,
            dataUrl:  attachment.dataUrl,
        }));
    }

    function removePendingAttachment(attachmentId) {
        setPendingAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId));
    }

    async function handleAttachmentSelect(e) {
        const files = Array.from(e.target.files || []);
        e.target.value = "";

        if (files.length === 0) {
            return;
        }

        try {
            const selectedAttachments = await Promise.all(files.map(async (file, index) => {
                if (!isSupportedAttachment({ mimeType: file.type, name: file.name })) {
                    throw new Error(`Unsupported file type for ${file.name}. Please upload PDF, DOC, DOCX, TXT, or image files.`);
                }

                if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
                    throw new Error(`${file.name} is too large. Keep each file under ${formatFileSize(MAX_ATTACHMENT_SIZE_BYTES)}.`);
                }

                const mimeType = getAttachmentMimeType({ mimeType: file.type, name: file.name });
                const dataUrl  = await readFileAsDataUrl(file);

                return {
                    id:       `${file.name}-${file.size}-${Date.now()}-${index}`,
                    name:     file.name,
                    mimeType,
                    size:     file.size,
                    dataUrl,
                };
            }));

            const existingAttachments = getConversationAttachments(messagesRef.current, pendingAttachments);
            const totalAttachments    = existingAttachments.length + selectedAttachments.length;

            if (totalAttachments > MAX_ATTACHMENT_COUNT) {
                throw new Error(`You can keep up to ${MAX_ATTACHMENT_COUNT} uploaded files in the active chat.`);
            }

            setError(null);
            setPendingAttachments((prev) => [...prev, ...selectedAttachments]);
        } catch (err) {
            setError(err.message || "Unable to attach files right now.");
        }
    }

    // Build provider-compatible history from message array
    function buildHistory(msgs) {
        return msgs
            .filter((m) => m.role === "user" || (m.role === "model" && m.text && !m.isStreaming))
            .map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
    }

    // ── Stream the AI response ────────────────────────────────
    async function startStream(userText, signal, attachments) {
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
                    // The current prompt is sent separately as "message", so history only needs prior turns.
                    history,
                    llmConfig: {
                        enabled: llmSettings.enabled,
                        url:     llmSettings.url.trim(),
                        apiKey:  llmSettings.apiKey.trim(),
                        model:   llmSettings.model.trim(),
                    },
                    attachments,
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
    function sendMessage(text) {
        const userText = text.trim();
        const attachmentsForMessage = pendingAttachments;
        const promptText = userText || "Analyze the attached files and answer based on them.";

        if ((!userText && attachmentsForMessage.length === 0) || isLoading) return;

        // Cancel any ongoing generation
        abortController.current?.abort();
        abortController.current = new AbortController();
        const signal = abortController.current.signal;
        const conversationAttachments = getConversationAttachments(messagesRef.current, attachmentsForMessage);

        setError(null);
        setSources([]);
        setShowWelcome(false);
        setIsLoading(true);
        setInputValue("");
        setPendingAttachments([]);

        // Add user message
        const userMsg = {
            id: nextId(),
            role: "user",
            text: userText,
            attachments: attachmentsForMessage,
        };
        setMessages((prev) => [...prev, userMsg]);

        // The current prompt and newly attached files are sent explicitly on the request.
        startStream(promptText, signal, conversationAttachments);
    }

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
        <div className="app-shell flex min-h-screen flex-col bg-ai-gradient transition-all duration-700">
            <Header />

            <main className="flex-grow flex w-full max-w-[1100px] flex-col mx-auto px-4 sm:px-6 pt-6 pb-2">

                {/* ── Welcome / Empty state ── */}
                {showWelcome && (
                    <div className="flex flex-grow items-center justify-center py-4 sm:py-8">
                        <div className="ai-surface-strong w-full rounded-[36px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
                            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                                <div>
                                    <div className="ai-kicker">
                                        <span className="accent-dot" />
                                        AI Research Workspace
                                    </div>
                                    <div className="mt-6">
                                        <Logo compact />
                                    </div>
                                    <div className="mt-3">
                                        <ModeToggle />
                                    </div>

                                    <h1 className="font-display mt-8 max-w-3xl text-4xl font-semibold leading-tight text-[#fff4de] sm:text-5xl">
                                        Draft, analyze, and reason from the actual legal record.
                                    </h1>
                                    <p className="ai-subtle mt-5 max-w-2xl text-base leading-7">
                                        Ask about Indian law, attach source documents, compare search-grounded answers,
                                        and switch between the built-in Gemini workflow or your own OpenAI-compatible endpoint.
                                    </p>

                                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                        {SUGGESTED_PROMPTS.map((prompt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handlePromptClick(prompt)}
                                                className="ai-surface text-left rounded-[24px] px-4 py-4 text-sm font-medium leading-6 text-[#ffe3bb] hover:border-[#ffbe4a]/40 hover:text-white"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {WELCOME_PANELS.map((panel) => (
                                        <div key={panel.title} className="ai-surface rounded-[28px] p-5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffd697]">
                                                Workspace
                                            </p>
                                            <h2 className="font-display mt-3 text-2xl font-semibold leading-tight text-white">
                                                {panel.title}
                                            </h2>
                                            <p className="ai-subtle mt-3 text-sm leading-7">
                                                {panel.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Chat Messages ── */}
                {!showWelcome && (
                    <div
                        className="ai-surface-strong flex-grow overflow-y-auto rounded-[32px] p-3 sm:p-4"
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
                            <div className="mx-2 mb-4 flex items-start gap-2 rounded-[22px] border border-[#ff9d7a]/40 bg-[#5b1d12]/80 p-4 text-sm text-[#ffd4c7]">
                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Grounding Sources */}
                        {sources.length > 0 && (
                            <div className="mx-2 mb-4">
                                <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ffd697]">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Grounded Sources
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ATTACHMENT_ACCEPT}
                        multiple
                        onChange={handleAttachmentSelect}
                        className="hidden"
                    />

                    <div className="mb-2 flex items-center justify-between gap-3 px-1">
                        <button
                            type="button"
                            onClick={() => setShowLlmSettings((prev) => !prev)}
                            className="ai-surface inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-[#ffe3bb] hover:bg-white/10"
                        >
                            <svg className="h-3.5 w-3.5 text-[#ffbe4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M7 12h10M10 17h4" />
                            </svg>
                            {showLlmSettings ? "Hide LLM settings" : "Use your own LLM"}
                        </button>

                        <p className="ai-subtle text-right text-[11px]">
                            {llmSettings.enabled
                                ? "Custom endpoint enabled"
                                : "Using built-in Gemini"}
                        </p>
                    </div>

                    {showLlmSettings && (
                        <div className="ai-surface-strong mb-3 rounded-[28px] p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h2 className="font-display text-2xl font-semibold text-white">Bring your own LLM</h2>
                                    <p className="ai-subtle mt-2 max-w-2xl text-sm leading-7">
                                        Connect an OpenAI-compatible endpoint such as OpenAI, OpenRouter, Groq, Ollama, or LM Studio.
                                        When this is off, AdvocateHub keeps using Gemini with Google Search grounding.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={resetLlmSettings}
                                    className="ai-action-secondary self-start px-4 py-2 text-xs font-semibold hover:text-white"
                                >
                                    Clear saved values
                                </button>
                            </div>

                            <label className="mt-5 flex items-start gap-3 rounded-[24px] border border-[#ffbe4a]/16 bg-white/6 px-4 py-4">
                                <input
                                    type="checkbox"
                                    checked={llmSettings.enabled}
                                    onChange={(e) => updateLlmSetting("enabled", e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#ffbe4a] focus:ring-[#ffbe4a]"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-white">Use my own endpoint for chat</p>
                                    <p className="ai-subtle mt-1 text-sm leading-6">
                                        Turn this on to send chat requests through your own provider instead of the built-in Gemini setup.
                                    </p>
                                </div>
                            </label>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#ffd697]">
                                        Endpoint URL
                                    </span>
                                    <input
                                        type="text"
                                        value={llmSettings.url}
                                        onChange={(e) => updateLlmSetting("url", e.target.value)}
                                        placeholder="http://localhost:11434/v1 or https://openrouter.ai/api/v1"
                                        className="w-full rounded-2xl border border-[#ffbe4a]/14 bg-[#1f0d09] px-4 py-3 text-sm text-[#fff4de] outline-none transition-colors focus:border-[#ffbe4a] focus:ring-2 focus:ring-[#ffbe4a]/14"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#ffd697]">
                                        Model
                                    </span>
                                    <input
                                        type="text"
                                        value={llmSettings.model}
                                        onChange={(e) => updateLlmSetting("model", e.target.value)}
                                        placeholder="gpt-4o-mini, openai/gpt-4.1-mini, llama3.1"
                                        className="w-full rounded-2xl border border-[#ffbe4a]/14 bg-[#1f0d09] px-4 py-3 text-sm text-[#fff4de] outline-none transition-colors focus:border-[#ffbe4a] focus:ring-2 focus:ring-[#ffbe4a]/14"
                                    />
                                </label>

                                <label className="block sm:col-span-2">
                                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#ffd697]">
                                        API Key
                                    </span>
                                    <input
                                        type="password"
                                        value={llmSettings.apiKey}
                                        onChange={(e) => updateLlmSetting("apiKey", e.target.value)}
                                        placeholder="Optional for local or self-hosted servers"
                                        className="w-full rounded-2xl border border-[#ffbe4a]/14 bg-[#1f0d09] px-4 py-3 text-sm text-[#fff4de] outline-none transition-colors focus:border-[#ffbe4a] focus:ring-2 focus:ring-[#ffbe4a]/14"
                                    />
                                </label>
                            </div>

                            <p className="ai-subtle mt-3 text-[11px] leading-relaxed">
                                Saved in this browser only. Leave fields blank if you want to rely on
                                {" "}
                                <code className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-[#fff4de]">CUSTOM_LLM_*</code>
                                {" "}
                                values from
                                {" "}
                                <code className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-[#fff4de]">.env</code>
                                .
                            </p>

                            {llmSettings.enabled && (
                                <p className="mt-2 text-[11px] leading-relaxed text-[#ffd697]">
                                    Custom endpoints will answer directly and usually will not return Google-grounded source cards unless your provider adds its own citations.
                                </p>
                            )}
                        </div>
                    )}

                    {pendingAttachments.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2 px-1">
                            {pendingAttachments.map((attachment) => (
                                <AttachmentChip
                                    key={attachment.id}
                                    attachment={attachment}
                                    onRemove={removePendingAttachment}
                                />
                            ))}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="ai-surface-strong ai-input ai-search-glow w-full flex items-end gap-3 rounded-[28px] px-4 py-4"
                    >
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[#ffbe4a]/14 bg-white/8 text-[#ffe3bb] transition-all hover:border-[#ffbe4a]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            title="Attach PDFs, docs, or images"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828a4 4 0 10-5.657-5.657L5.757 10.757a6 6 0 108.486 8.486L20 13" />
                            </svg>
                        </button>

                        {/* Sparkle icon */}
                        <div className="flex-shrink-0 mb-0.5">
                            <svg className="w-5 h-5 text-[#ffbe4a] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            className="flex-grow resize-none bg-transparent text-sm leading-relaxed text-[#fff4de] outline-none placeholder:text-[#d5a98b] disabled:opacity-50"
                            style={{ minHeight: "28px", maxHeight: "160px" }}
                            autoFocus
                        />

                        {/* Send / Stop button */}
                        <button
                            type={isLoading ? "button" : "submit"}
                            onClick={isLoading ? () => abortController.current?.abort() : undefined}
                            disabled={!isLoading && !inputValue.trim()}
                            className="ai-action-primary flex-shrink-0 w-11 h-11 rounded-2xl transition-all
                                       shadow-sm hover:shadow-md
                                       disabled:opacity-30 disabled:cursor-not-allowed"
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

                    <p className="ai-subtle mt-2 text-center text-[10px]">
                        {llmSettings.enabled
                            ? "Using your custom OpenAI-compatible endpoint · Uploads support PDF, DOC, DOCX, TXT, and images"
                            : "Powered by Google Gemini · Grounded with real-time Google Search · Uploads support PDF, DOC, DOCX, TXT, and images"}
                    </p>
                </div>

            </main>

            <Footer />
        </div>
    );
}
