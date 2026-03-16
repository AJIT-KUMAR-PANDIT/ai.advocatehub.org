export const PDF_MIME_TYPE = "application/pdf";
export const DOC_MIME_TYPE = "application/msword";
export const DOCX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const TEXT_MIME_TYPE = "text/plain";

export const MAX_ATTACHMENT_COUNT = 5;
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_TOTAL_ATTACHMENT_BYTES = 20 * 1024 * 1024;
export const MAX_ATTACHMENT_TEXT_CHARS = 16000;
export const ATTACHMENT_ACCEPT = ".pdf,.doc,.docx,.txt,image/*";

const EXTENSION_TO_MIME = {
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif":  "image/gif",
    ".pdf":  PDF_MIME_TYPE,
    ".doc":  DOC_MIME_TYPE,
    ".docx": DOCX_MIME_TYPE,
    ".txt":  TEXT_MIME_TYPE,
};

export function getFileExtension(filename = "") {
    const match = filename.toLowerCase().match(/(\.[a-z0-9]+)$/);
    return match ? match[1] : "";
}

export function getAttachmentMimeType({ mimeType = "", name = "" } = {}) {
    if (mimeType && (mimeType.startsWith("image/") || Object.values(EXTENSION_TO_MIME).includes(mimeType))) {
        return mimeType;
    }

    return EXTENSION_TO_MIME[getFileExtension(name)] || "";
}

export function getAttachmentKind(fileLike = {}) {
    const mimeType = getAttachmentMimeType(fileLike);

    if (!mimeType) {
        return "unsupported";
    }

    if (mimeType.startsWith("image/")) {
        return "image";
    }

    if (mimeType === PDF_MIME_TYPE) {
        return "pdf";
    }

    if (mimeType === DOC_MIME_TYPE || mimeType === DOCX_MIME_TYPE) {
        return "document";
    }

    if (mimeType === TEXT_MIME_TYPE) {
        return "text";
    }

    return "unsupported";
}

export function isSupportedAttachment(fileLike = {}) {
    return getAttachmentKind(fileLike) !== "unsupported";
}

export function formatFileSize(bytes = 0) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "0 B";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
