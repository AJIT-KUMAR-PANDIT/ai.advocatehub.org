export const SEARCH_RESULT_TYPE_OPTIONS = [
    { value: "all", label: "All" },
    { value: "web", label: "Web" },
    { value: "pdf", label: "PDF" },
    { value: "docx", label: "DOCX" },
    { value: "docs", label: "Docs" },
    { value: "images", label: "Images" },
    { value: "videos", label: "Videos" },
    { value: "audio", label: "Audio" },
    { value: "slides", label: "Slides" },
    { value: "sheets", label: "Sheets" },
    { value: "text", label: "Text" },
    { value: "archives", label: "Archives" },
    { value: "news", label: "News" },
];

export const SEARCH_SCOPE_OPTIONS = [
    { value: "", label: "Any source" },
    { value: "official", label: "Official only" },
    { value: "courts", label: "Courts" },
    { value: "govonly", label: "Government" },
];

export const SEARCH_DATE_OPTIONS = [
    { value: "", label: "Any time" },
    { value: "d1", label: "Past day" },
    { value: "w1", label: "Past week" },
    { value: "m1", label: "Past month" },
    { value: "y1", label: "Past year" },
];

const RESULT_TYPE_ALIASES = {
    all: "all",
    web: "web",
    webpage: "web",
    webpages: "web",
    pdf: "pdf",
    docx: "docx",
    docs: "docs",
    doc: "docs",
    word: "docs",
    images: "images",
    image: "images",
    img: "images",
    videos: "videos",
    video: "videos",
    audio: "audio",
    podcast: "audio",
    podcasts: "audio",
    mp3: "audio",
    wav: "audio",
    slides: "slides",
    slide: "slides",
    presentations: "slides",
    presentation: "slides",
    sheets: "sheets",
    spreadsheets: "sheets",
    spreadsheet: "sheets",
    excel: "sheets",
    text: "text",
    txt: "text",
    archive: "archives",
    archives: "archives",
    zip: "archives",
    rar: "archives",
    news: "news",
};

export function normalizeSearchResultType(value = "all") {
    const compact = value.trim().toLowerCase().replace(/[\s_-]+/g, "");
    return RESULT_TYPE_ALIASES[compact] || "all";
}

export function normalizeSearchScope(value = "") {
    const compact = value.trim().toLowerCase().replace(/[\s_-]+/g, "");

    if (compact === "official") return "official";
    if (compact === "courts" || compact === "court") return "courts";
    if (compact === "govonly" || compact === "government" || compact === "gov") return "govonly";

    return "";
}

export function normalizeSearchDate(value = "") {
    const compact = value.trim().toLowerCase();

    if (["d1", "w1", "m1", "m3", "m6", "y1", "y2", "y5"].includes(compact)) {
        return compact;
    }

    return "";
}
