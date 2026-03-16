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
            elements.push(<h3 key={i} className="text-base font-semibold text-gray-900 mt-3 mb-1">{line.slice(4)}</h3>);
        } else if (line.startsWith("## ")) {
            elements.push(<h2 key={i} className="text-lg font-bold text-gray-900 mt-4 mb-1">{line.slice(3)}</h2>);
        } else if (line.startsWith("# ")) {
            elements.push(<h1 key={i} className="text-xl font-bold text-gray-900 mt-4 mb-2">{line.slice(2)}</h1>);
        }
        // Bullet points
        else if (line.startsWith("- ") || line.startsWith("* ")) {
            elements.push(
                <li key={i} className="ml-4 list-disc text-gray-700 text-sm leading-relaxed">
                    {inlineFormat(line.slice(2))}
                </li>
            );
        }
        // Numbered list
        else if (/^\d+\.\s/.test(line)) {
            elements.push(
                <li key={i} className="ml-4 list-decimal text-gray-700 text-sm leading-relaxed">
                    {inlineFormat(line.replace(/^\d+\.\s/, ""))}
                </li>
            );
        }
        // Horizontal rule
        else if (line.startsWith("---") || line.startsWith("___")) {
            elements.push(<hr key={i} className="my-3 border-gray-200" />);
        }
        // Empty line — spacer
        else if (line.trim() === "") {
            elements.push(<div key={i} className="h-2" />);
        }
        // Normal paragraph
        else {
            elements.push(
                <p key={i} className="text-gray-700 text-sm leading-relaxed">
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
            return <strong key={idx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*"))
            return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
        if (part.startsWith("`") && part.endsWith("`"))
            return <code key={idx} className="bg-purple-50 text-purple-700 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
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
                <div className="max-w-[75%] bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
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
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3 mb-5 px-2">
            {/* Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            </div>

            {/* Bubble */}
            <div className="flex-1 max-w-[85%]">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                    {message.text
                        ? <div className="prose prose-sm max-w-none">{renderMarkdown(message.text)}</div>
                        : <div className="flex gap-1 items-center py-1">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    }
                    {isStreaming && <span className="inline-block w-0.5 h-4 bg-purple-500 animate-pulse ml-0.5 align-text-bottom" />}
                </div>
                <div ref={endRef} />
            </div>
        </div>
    );
}
