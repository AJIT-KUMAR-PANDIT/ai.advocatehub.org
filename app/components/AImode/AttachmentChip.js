"use client";

import { formatFileSize, getAttachmentKind } from "@/lib/attachmentUtils";

function AttachmentIcon({ kind, className }) {
    if (kind === "image") {
        return (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14m-6-8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        );
    }

    if (kind === "pdf") {
        return (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7V5a2 2 0 012-2h6l4 4v12a2 2 0 01-2 2H9a2 2 0 01-2-2v-2m0-10h8m-8 4h8m-8 4h5M15 3v4h4" />
            </svg>
        );
    }

    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7V5a2 2 0 012-2h6l4 4v12a2 2 0 01-2 2H9a2 2 0 01-2-2V7zm8-4v4h4M9 11h6M9 15h6" />
        </svg>
    );
}

export default function AttachmentChip({ attachment, onRemove, tone = "neutral" }) {
    const kind = getAttachmentKind(attachment);
    const classes = tone === "user"
        ? {
            wrapper: "border border-[#2a1610]/10 bg-[#2a1610]/10 text-[#2a1610] backdrop-blur-sm",
            meta:    "text-[#523327]",
            button:  "text-[#523327] hover:bg-[#2a1610]/10 hover:text-[#2a1610]",
            icon:    "text-[#2a1610]",
        }
        : {
            wrapper: "border border-[#ffbe4a]/12 bg-[#3a1b12]/82 text-[#fff4de] shadow-sm backdrop-blur-sm",
            meta:    "text-[#d6a88a]",
            button:  "text-[#d6a88a] hover:bg-white/10 hover:text-white",
            icon:    "text-[#ffbe4a]",
        };

    return (
        <div className={`inline-flex max-w-full items-center gap-2 rounded-2xl px-3 py-2 text-left ${classes.wrapper}`}>
            <AttachmentIcon kind={kind} className={`h-4 w-4 flex-shrink-0 ${classes.icon}`} />

            <div className="min-w-0">
                <p className="truncate text-xs font-medium">{attachment.name}</p>
                <p className={`text-[10px] ${classes.meta}`}>
                    {formatFileSize(attachment.size)}
                </p>
            </div>

            {onRemove && (
                <button
                    type="button"
                    onClick={() => onRemove(attachment.id)}
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors ${classes.button}`}
                    title={`Remove ${attachment.name}`}
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}
