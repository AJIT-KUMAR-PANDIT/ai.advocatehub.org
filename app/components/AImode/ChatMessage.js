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
            elements.push(<h3 key={i} className="font-display mt-3 mb-1 text-lg font-semibold text-[#fff4de]">{line.slice(4)}</h3>);
        } else if (line.startsWith("## ")) {
            elements.push(<h2 key={i} className="font-display mt-4 mb-1 text-xl font-semibold text-[#fff4de]">{line.slice(3)}</h2>);
        } else if (line.startsWith("# ")) {
            elements.push(<h1 key={i} className="font-display mt-4 mb-2 text-2xl font-semibold text-[#fff4de]">{line.slice(2)}</h1>);
        }
        // Bullet points
        else if (line.startsWith("- ") || line.startsWith("* ")) {
            elements.push(
                <li key={i} className="ml-4 list-disc text-sm leading-7 text-[#f3d9be]">
                    {inlineFormat(line.slice(2))}
                </li>
            );
        }
        // Numbered list
        else if (/^\d+\.\s/.test(line)) {
            elements.push(
                <li key={i} className="ml-4 list-decimal text-sm leading-7 text-[#f3d9be]">
                    {inlineFormat(line.replace(/^\d+\.\s/, ""))}
                </li>
            );
        }
        // Horizontal rule
        else if (line.startsWith("---") || line.startsWith("___")) {
            elements.push(<hr key={i} className="my-3 border-white/10" />);
        }
        // Empty line — spacer
        else if (line.trim() === "") {
            elements.push(<div key={i} className="h-2" />);
        }
        // Normal paragraph
        else {
            elements.push(
                <p key={i} className="text-sm leading-7 text-[#f3d9be]">
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
            return <strong key={idx} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*"))
            return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
        if (part.startsWith("`") && part.endsWith("`"))
            return <code key={idx} className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-[#ffbe4a]">{part.slice(1, -1)}</code>;
        return part;
    });
}

export default function ChatMessage({ message, isStreaming }) {
    const isUser = message.role === "user";
    const endRef  = useRef(null);
    const hasAttachments = Array.isArray(message.attachments) && message.attachments.length > 0;

    useEffect(() => {
        if (isStreaming) endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [message.text, isStreaming]);

    if (isUser) {
        return (
            <div className="flex justify-end mb-4 px-2">
                <div className="max-w-[80%] rounded-[26px] rounded-tr-sm bg-[linear-gradient(135deg,#ffbe4a,#ff6e41)] px-4 py-3 text-[#2a1610] shadow-[0_18px_36px_rgba(28,13,9,0.24)]">
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
        );
    }

    return (
        <div className="flex items-start gap-3 mb-5 px-2">
            {/* Avatar */}
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffbe4a,#ff6e41)] shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            </div>

            {/* Bubble */}
            <div className="flex-1 max-w-[85%]">
                <div className="rounded-[28px] rounded-tl-sm border border-[#ffbe4a]/12 bg-[#321710]/78 px-5 py-4 shadow-[0_14px_32px_rgba(14,6,5,0.22)] backdrop-blur-sm">
                    {message.text
                        ? <div className="max-w-none">{renderMarkdown(message.text)}</div>
                        : <div className="flex gap-1 items-center py-1">
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
