"use client";

import { useEffect, useRef } from "react";
import AttachmentChip from "./AttachmentChip";

/**
 * Renders markdown-like text: **bold**, *italic*, `code`, ## headings, - bullets
 */
function renderMarkdown(text) {
    const lines = text.split("\n");
    const elements = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Headings
        if (line.startsWith("### ")) {
            elements.push(<h3 key={i} className="font-display mb-1 mt-3 text-lg font-semibold text-[#2d1b12]">{line.slice(4)}</h3>);
        } else if (line.startsWith("## ")) {
            elements.push(<h2 key={i} className="font-display mb-1 mt-4 text-xl font-semibold text-[#2d1b12]">{line.slice(3)}</h2>);
        } else if (line.startsWith("# ")) {
            elements.push(<h1 key={i} className="font-display mb-2 mt-4 text-2xl font-semibold text-[#2d1b12]">{line.slice(2)}</h1>);
        }
        // Bullet points
        else if (line.startsWith("- ") || line.startsWith("* ")) {
            elements.push(
                <li key={i} className="ml-4 list-disc text-sm leading-7 text-[#7b5b42]">
                    {inlineFormat(line.slice(2))}
                </li>
            );
        }
        // Numbered list
        else if (/^\d+\.\s/.test(line)) {
            elements.push(
                <li key={i} className="ml-4 list-decimal text-sm leading-7 text-[#7b5b42]">
                    {inlineFormat(line.replace(/^\d+\.\s/, ""))}
                </li>
            );
        }
        // Horizontal rule
        else if (line.startsWith("---") || line.startsWith("___")) {
            elements.push(<hr key={i} className="my-3 border-[#f1dfc6]" />);
        }
        // Empty line — spacer
        else if (line.trim() === "") {
            elements.push(<div key={i} className="h-2" />);
        }
        // Normal paragraph
        else {
            elements.push(
                <p key={i} className="text-sm leading-7 text-[#7b5b42]">
                    {inlineFormat(line)}
                </p>
            );
        }
        i++;
    }

    return elements;
}

function inlineFormat(text) {
    // Bold, italic, code — basic inline formatting
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**"))
            return <strong key={idx} className="font-semibold text-[#2d1b12]">{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*"))
            return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
        if (part.startsWith("`") && part.endsWith("`"))
            return <code key={idx} className="rounded bg-[#fff1dd] px-1.5 py-0.5 text-xs font-mono text-[#a3471d]">{part.slice(1, -1)}</code>;
        return part;
    });
}

export default function ChatMessage({ message, isStreaming }) {
    const isUser = message.role === "user";
    const endRef = useRef(null);
    const hasAttachments = Array.isArray(message.attachments) && message.attachments.length > 0;

    useEffect(() => {
        if (isStreaming) endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [message.text, isStreaming]);

    if (isUser) {
        return (
            <div className="mb-5 flex justify-end px-1">
                <div className="max-w-[82%]">
                    <p className="mb-2 text-right text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f6a52]">
                        You
                    </p>
                    <div className="rounded-[28px] rounded-tr-sm bg-[linear-gradient(135deg,#ffd27b,#ff8f63)] px-4 py-3 text-[#2a1610] shadow-[0_16px_28px_rgba(28,13,9,0.2)]">
                        {hasAttachments && (
                            <div className="mb-2 flex flex-wrap justify-end gap-2">
                                {message.attachments.map((attachment) => (
                                    <AttachmentChip
                                        key={attachment.id}
                                        attachment={attachment}
                                        tone="user"
                                    />
                                ))}
                            </div>
                        )}

                        {message.text && (
                            <p className="whitespace-pre-wrap text-sm leading-7">{message.text}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6 flex items-start gap-3 px-1">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffbe4a,#ff6e41)] shadow-sm">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            </div>

            <div className="max-w-[88%] flex-1">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f6a52]">
                    AdvocateHub AI
                </p>
                <div className="rounded-[30px] rounded-tl-sm border border-[#f1dfc6] bg-white/88 px-5 py-4 shadow-[0_14px_28px_rgba(77,45,20,0.06)] backdrop-blur-sm">
                    {message.text
                        ? <div className="max-w-none">{renderMarkdown(message.text)}</div>
                        : <div className="flex items-center gap-1 py-1">
                            <span className="h-2 w-2 rounded-full bg-[#ffbe4a] animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="h-2 w-2 rounded-full bg-[#ffbe4a] animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="h-2 w-2 rounded-full bg-[#ffbe4a] animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    }
                    {isStreaming && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#ffbe4a] align-text-bottom" />}
                </div>
                <div ref={endRef} />
            </div>
        </div>
    );
}
