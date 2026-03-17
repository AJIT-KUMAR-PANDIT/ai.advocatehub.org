# Components Documentation

## Home Components

### Header.js
Main navigation header with logo, navigation links, and mode toggle button.

**Location:** `app/components/Home/Header.js`

**Features:**
- Logo with hover animation
- Navigation links (Search, AI Workspace)
- Mode toggle button
- Responsive design

### Footer.js
Footer component with site links and branding.

**Location:** `app/components/Home/Footer.js`

### Logo.js
Logo display component with optional caption.

**Location:** `app/components/Home/Logo.js`

**Props:**
- `compact`: boolean - Use compact size
- `caption`: string - Caption text
- `showCaption`: boolean - Show/hide caption

### SearchBar.js
Search input component with two variants.

**Location:** `app/components/Home/SearchBar.js`

**Props:**
- `defaultValue`: string - Initial search value
- `variant`: "hero" | "compact" - Display variant
- `additionalParams`: object - Additional URL params

**Features:**
- Search icon with gradient background
- Auto-focus on hero variant
- Smooth focus animations
- Submit button with arrow icon

### ModeToggle.js
Toggle between Search and AI Mode.

**Location:** `app/components/Home/ModeToggle.js`

---

## Search Components

### SearchResultsClient.js
Main search results display with lazy loading and infinite scroll.

**Location:** `app/components/Search/SearchResultsClient.js`

**Features:**
- AI summary card display
- Multiple result type support (text, images, videos)
- Infinite scroll loading
- Filter bar
- Loading skeletons
- Error handling

### SearchHeader.js
Header for search results page.

**Location:** `app/components/Search/SearchHeader.js`

### SearchFiltersBar.js
Filter options for search results.

**Location:** `app/components/Search/SearchFiltersBar.js`

**Filters:**
- Result type (All, Web, PDF, DOCX, Images, Videos, Audio, etc.)
- Site restrict (Official, Government, Courts)
- Date restrict (Past day, week, month, year)

### SearchSummaryCard.js
AI-generated summary display card.

**Location:** `app/components/Search/SearchSummaryCard.js`

### ResultItem.js
Individual text result display.

**Location:** `app/components/Search/ResultItem.js`

**Features:**
- Result type badge (PDF, DOCX, Video, etc.)
- Title with link
- Snippet display
- Source URL

### ResultImageItem.js
Image result thumbnail display.

**Location:** `app/components/Search/ResultImageItem.js`

**Features:**
- Thumbnail image
- Title overlay
- Source indicator
- Grid-friendly layout

### ResultVideoItem.js
Video result display with thumbnail.

**Location:** `app/components/Search/ResultVideoItem.js`

**Features:**
- Video thumbnail
- Duration badge
- Play button overlay
- Title and source

### VideoPlaylist.js
Video playlist with inline player.

**Location:** `app/components/Search/VideoPlaylist.js`

**Features:**
- Video tiles grid view
- Click to play in modal
- Inline video player (YouTube, Vimeo, Dailymotion)
- "Visit Site" external link button
- Close button and escape key support
- Infinite scroll for more videos

### ResultSkeleton.js
Loading skeleton for results.

**Location:** `app/components/Search/ResultSkeleton.js`

---

## AI Mode Components

### ChatMessage.js
Chat message bubble component.

**Location:** `app/components/AImode/ChatMessage.js`

**Features:**
- User and assistant message styles
- Markdown rendering
- Code block support
- Copy button

### AttachmentChip.js
File attachment indicator.

**Location:** `app/components/AImode/AttachmentChip.js`

### SourceCard.js
Citation/source reference card.

**Location:** `app/components/AImode/SourceCard.js`

---

## Styling Classes

### Surface Components
```css
.surface-panel      /* Glassmorphism panel */
.surface-card       /* Elevated card */
.surface-panel-strong /* Strong glass effect */
```

### Buttons
```css
.action-primary     /* Orange gradient button */
.action-secondary   /* White outlined button */
```

### Animations
```css
.fade-in-up        /* Fade in from bottom */
.pulse-glow        /* Accent dot pulse */
.ambient-float     /* Background float effect */
```

### Text
```css
.brand-gradient-text  /* Gradient text effect */
.font-display         /* Serif display font */
```

## Theme Colors

| Variable | Value | Usage |
|----------|-------|-------|
| --background | #fff7ef | Page background |
| --foreground | #2d1b12 | Main text |
| --accent | #ff6e41 | Primary accent (orange) |
| --warm | #ffbe4a | Secondary accent (yellow) |
| --muted | #7b5b42 | Muted text |
