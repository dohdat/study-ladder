export type SystemDesignSection = {
  id: string;
  title: string;
  items: string[];
};

export type SystemDesignQuestion = {
  id: string;
  title: string;
  durationMinutes: number;
  focus: string[];
  prompt: string;
  scenario: string;
  radio: SystemDesignSection[];
  optimizations: string[];
  deepDive: string[];
  rubric: string[];
};

type FrontendSystemDesignSpec = {
  id: string;
  title: string;
  product: string;
  focus: string[];
  surfaces: string[];
  components: string[];
  entities: string[];
  interfaces: string[];
  optimizations: string[];
  deepDive: string[];
};

function createFrontendSystemDesignQuestion(spec: FrontendSystemDesignSpec): SystemDesignQuestion {
  return {
    id: spec.id,
    title: spec.title,
    durationMinutes: 20,
    focus: ["Frontend", ...spec.focus],
    prompt: `Design the frontend system for ${spec.product}.`,
    scenario: `Users expect ${spec.product} to feel fast, resilient, and accessible across desktop and mobile. Focus on the client architecture, rendering model, data flow, state ownership, error states, and measurable frontend performance.`,
    radio: [
      {
        id: "requirements",
        title: "R - Requirements",
        items: [
          `Identify the primary user workflows for ${spec.product}.`,
          `Define core UI surfaces: ${spec.surfaces.join(", ")}.`,
          "Cover loading, empty, error, offline, and permission states.",
          "Define accessibility, keyboard, responsive, and internationalization expectations."
        ]
      },
      {
        id: "architecture",
        title: "A - Architecture",
        items: [
          `Draw the main frontend components: ${spec.components.join(", ")}.`,
          "Separate server data, local UI state, ephemeral interaction state, and cached derived state.",
          "Show how navigation, routing, composition, and cross-component events work.",
          "Identify which work belongs in React/components, shared stores, workers, browser APIs, or platform services."
        ]
      },
      {
        id: "data",
        title: "D - Data Model",
        items: [
          `Model the key client entities: ${spec.entities.join(", ")}.`,
          "Define normalized cache shape, ordering lists, pagination cursors, and optimistic update metadata.",
          "Explain how stale data, deduping, local drafts, and rollback state are represented.",
          "Name the derived view models needed to render the page efficiently."
        ]
      },
      {
        id: "interface",
        title: "I - Interfaces",
        items: [
          `Define the frontend-facing API contracts: ${spec.interfaces.join(", ")}.`,
          "Describe request lifecycle, cancellation, retry, streaming, subscriptions, or prefetch behavior.",
          "Define analytics, impression, error-reporting, and feature-flag interfaces.",
          "Explain how the frontend handles schema changes, partial responses, and versioning."
        ]
      },
      {
        id: "optimizations",
        title: "O - Optimizations",
        items: spec.optimizations.slice(0, 4)
      }
    ],
    optimizations: spec.optimizations,
    deepDive: spec.deepDive,
    rubric: [
      "Separates UI state, server cache, interaction state, and derived render state clearly.",
      "Names concrete rendering, network, memory, and scheduling optimizations.",
      "Handles failure, accessibility, mobile, and edge cases without vague hand-waving.",
      "Defines measurable frontend success metrics such as LCP, INP, CLS, memory, dropped frames, or task latency."
    ]
  };
}

export const frontendSystemDesignQuestions: SystemDesignQuestion[] = [
  createFrontendSystemDesignQuestion({
    id: "frontend-system-news-feed",
    title: "News Feed (e.g. Facebook)",
    product: "a personalized social news feed",
    focus: ["Feed", "Ranking", "Infinite Scroll"],
    surfaces: ["feed list", "composer entry", "story cards", "reaction controls", "comments preview"],
    components: ["feed shell", "ranking/pagination controller", "post card", "media renderer", "reaction/comment modules"],
    entities: ["FeedEdge", "Post", "Author", "ReactionState", "CommentPreview"],
    interfaces: ["GET /feed?cursor", "POST /reactions", "POST /comments", "POST /impressions"],
    optimizations: [
      "Virtualize long sessions and preserve scroll anchors by post id.",
      "Prefetch the next cursor and critical media near the viewport edge.",
      "Render stable media boxes from server-provided aspect ratios to reduce CLS.",
      "Batch impressions and reactions outside the scroll-critical path.",
      "Use optimistic reactions with rollback and request deduping.",
      "Defer non-visible comments, embeds, and heavy media hydration."
    ],
    deepDive: [
      "How do you restore scroll position after opening a post and going back?",
      "How do you dedupe posts when ranking changes between page fetches?",
      "How do you prevent ads, analytics, and embeds from causing scroll jank?",
      "What do you cache in memory versus persistent storage?",
      "How would you handle offline reactions or failed comment submits?",
      "Which metrics prove the feed feels fast?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-autocomplete",
    title: "Autocomplete",
    product: "a typeahead autocomplete experience",
    focus: ["Search", "Latency", "Keyboard"],
    surfaces: ["input", "suggestion list", "highlighted match text", "recent searches", "empty state"],
    components: ["query input", "debounce controller", "suggestion cache", "keyboard navigation manager", "results popover"],
    entities: ["Query", "Suggestion", "RecentSearch", "SelectionState", "FetchStatus"],
    interfaces: ["GET /suggest?q=", "GET /recent-searches", "POST /search-clicks"],
    optimizations: [
      "Debounce network requests while keeping local input updates immediate.",
      "Cancel or ignore stale responses using request ids or AbortController.",
      "Cache suggestions by normalized prefix with short TTLs.",
      "Preload likely completions from recent searches and popular prefixes.",
      "Keep keyboard navigation independent from network status.",
      "Limit list rendering and avoid layout shifts as suggestions arrive."
    ],
    deepDive: [
      "How do you guarantee stale responses never overwrite newer suggestions?",
      "When would you use debounce, throttle, or speculative prefetch?",
      "How do you support IME input, screen readers, and keyboard-only users?",
      "How would you highlight matches without unsafe HTML?",
      "What metrics separate typing latency from network latency?",
      "How do you handle personalized suggestions securely?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-pinterest",
    title: "Pinterest",
    product: "a masonry visual discovery feed",
    focus: ["Masonry", "Images", "Discovery"],
    surfaces: ["masonry grid", "pin card", "save action", "detail overlay", "topic filters"],
    components: ["masonry layout engine", "pin data cache", "image loader", "save controller", "detail modal"],
    entities: ["Pin", "Board", "ImageVariant", "FeedCursor", "SaveState"],
    interfaces: ["GET /pins?cursor", "GET /pins/:id", "POST /saves", "POST /pin-impressions"],
    optimizations: [
      "Compute masonry placement from known image dimensions before media loads.",
      "Lazy-load images with responsive variants and blur placeholders.",
      "Virtualize columns while preserving visual order and scroll anchors.",
      "Prefetch detail data for pins close to the viewport.",
      "Evict decoded images outside the viewport on low-memory devices.",
      "Batch save and impression analytics off the rendering path."
    ],
    deepDive: [
      "How do you avoid masonry layout shifts when image dimensions are missing?",
      "How do you restore a user to the same pin after closing detail view?",
      "How do you balance image prefetching with mobile data usage?",
      "How would you support infinite feed dedupe across ranking changes?",
      "What should happen when a save mutation fails?",
      "What are the key Core Web Vitals risks?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-rich-text-editor",
    title: "Rich Text Editor",
    product: "a rich text editor",
    focus: ["Editor", "Selection", "Commands"],
    surfaces: ["editable document", "toolbar", "inline formatting", "link editor", "undo/redo"],
    components: ["editor core", "document model adapter", "selection manager", "command registry", "toolbar"],
    entities: ["DocumentNode", "TextMark", "SelectionRange", "Command", "HistoryEntry"],
    interfaces: ["local command API", "paste sanitizer", "serialization format", "autosave adapter"],
    optimizations: [
      "Represent document state structurally instead of mutating raw HTML.",
      "Memoize decorations and formatting by node version.",
      "Batch keystroke updates without delaying local cursor feedback.",
      "Virtualize or chunk very long documents by block.",
      "Move expensive parsing, sanitizing, or highlighting to idle time.",
      "Keep selection overlays separate from document rendering."
    ],
    deepDive: [
      "How do undo and redo interact with formatting commands?",
      "How do you preserve selection after document transformations?",
      "How do you sanitize paste content without blocking typing?",
      "When would you choose an existing editor engine?",
      "How do you test selection behavior deterministically?",
      "How do you support accessibility for toolbar and editing actions?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-google-docs",
    title: "Google Docs",
    product: "a collaborative document editor like Google Docs",
    focus: ["Collaboration", "Offline", "Presence"],
    surfaces: ["document editor", "comments", "presence cursors", "suggesting mode", "version state"],
    components: ["editor engine", "operation log", "collaboration transport", "presence layer", "comment layer"],
    entities: ["Document", "Operation", "Presence", "CommentThread", "AckState"],
    interfaces: ["GET /documents/:id", "POST /documents/:id/ops", "subscribe document ops", "subscribe presence"],
    optimizations: [
      "Apply local-first edits immediately and reconcile server acknowledgements later.",
      "Keep presence ephemeral and separate from durable document operations.",
      "Snapshot periodically so reload avoids replaying huge operation logs.",
      "Throttle remote cursor rendering and collapse inactive collaborators.",
      "Persist pending ops in IndexedDB before sending.",
      "Virtualize long documents by block while preserving selection mapping."
    ],
    deepDive: [
      "How do you resolve offline edits when the edited text moved or was deleted?",
      "How do undo and redo behave when remote edits arrive between local edits?",
      "How do comments stay anchored to text across edits?",
      "How would you choose between OT and CRDT?",
      "How do you recover from duplicate or out-of-order operations?",
      "How would you measure collaboration latency?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-design-drawing-tool",
    title: "Design / Drawing Tool (e.g. Figma)",
    product: "a collaborative design and drawing canvas",
    focus: ["Canvas", "Collaboration", "Rendering"],
    surfaces: ["infinite canvas", "layers panel", "properties panel", "toolbar", "multiplayer cursors"],
    components: ["canvas renderer", "scene graph", "tool state machine", "selection manager", "collaboration sync"],
    entities: ["Node", "Frame", "Layer", "Selection", "ViewportTransform"],
    interfaces: ["GET /files/:id", "POST /file-ops", "subscribe file ops", "asset upload/download"],
    optimizations: [
      "Use canvas/WebGL rendering for dense scenes and DOM only for UI chrome.",
      "Spatially index visible objects and render only viewport-intersecting nodes.",
      "Batch pointer events and rendering through requestAnimationFrame.",
      "Separate tool interaction state from durable scene graph state.",
      "Cache rasterized thumbnails and expensive vector effects.",
      "Send compact scene operations instead of whole-document updates."
    ],
    deepDive: [
      "How do you support infinite zoom and pan without precision issues?",
      "How do multiplayer cursors avoid slowing down local drawing?",
      "How do you handle undo for local and remote scene operations?",
      "When does the DOM become the bottleneck compared with canvas/WebGL?",
      "How would you store and load large design files progressively?",
      "How do you test pointer interactions and rendering correctness?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-video-streaming",
    title: "Video Streaming (e.g. Netflix)",
    product: "a video streaming web app",
    focus: ["Media", "Playback", "Discovery"],
    surfaces: ["home rows", "video player", "continue watching", "details page", "profiles"],
    components: ["catalog shell", "carousel rows", "player controller", "adaptive streaming adapter", "watch progress store"],
    entities: ["Title", "PlaybackSession", "VideoVariant", "Profile", "WatchProgress"],
    interfaces: ["GET /home", "GET /titles/:id", "GET /playback-manifest", "POST /watch-progress"],
    optimizations: [
      "Lazy-load rows and artwork with responsive image variants.",
      "Prefetch playback manifest and hero artwork for likely selections.",
      "Keep player state isolated from browsing UI rerenders.",
      "Use adaptive bitrate streaming and expose buffering state clearly.",
      "Persist watch progress with throttled background updates.",
      "Defer non-critical recommendations until primary content is interactive."
    ],
    deepDive: [
      "How do you reduce time from clicking play to first frame?",
      "How do you avoid carousels causing layout shift?",
      "How do you recover from playback errors or expired manifests?",
      "How should autoplay previews be handled for data and accessibility?",
      "What gets cached at the frontend versus CDN?",
      "Which metrics matter: startup time, rebuffering, INP, or LCP?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-ecommerce-marketplace",
    title: "E-commerce Marketplace (e.g. Amazon)",
    product: "an e-commerce marketplace",
    focus: ["Search", "Checkout", "Inventory"],
    surfaces: ["search results", "product cards", "product details", "cart", "checkout entry"],
    components: ["search shell", "filter state manager", "product cache", "cart controller", "recommendation slots"],
    entities: ["Product", "Offer", "InventoryState", "CartItem", "FilterState"],
    interfaces: ["GET /search", "GET /products/:id", "POST /cart/items", "GET /recommendations"],
    optimizations: [
      "Stream or progressively render above-the-fold results first.",
      "Cache product summaries separately from detail payloads.",
      "Use optimistic cart updates with inventory validation rollback.",
      "Virtualize large result grids and filter panels.",
      "Prefetch detail data for hovered or near-viewport products.",
      "Keep price, inventory, and promotion data freshness visible."
    ],
    deepDive: [
      "How do you prevent stale price or inventory from misleading users?",
      "How do filters and sorting stay shareable through URLs?",
      "How would you handle sponsored results and analytics without jank?",
      "What should happen when cart mutation fails?",
      "How do you optimize image-heavy product grids?",
      "What metrics matter for search-to-cart conversion?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-travel-booking",
    title: "Travel Booking (e.g. Airbnb)",
    product: "a travel booking marketplace",
    focus: ["Search", "Maps", "Booking"],
    surfaces: ["destination search", "listing results", "map", "filters", "booking panel"],
    components: ["search form", "results cache", "map synchronization layer", "listing card", "availability/pricing module"],
    entities: ["Listing", "AvailabilityWindow", "PriceQuote", "MapBounds", "ReservationDraft"],
    interfaces: ["GET /listings", "GET /availability", "GET /price-quote", "POST /reservations"],
    optimizations: [
      "Debounce map-bound searches and cancel stale requests.",
      "Render list and map markers from the same normalized listing cache.",
      "Prefetch availability and price quote only for high-intent listings.",
      "Virtualize result lists while keeping map state stable.",
      "Cache destination metadata and recent searches.",
      "Separate draft reservation state from confirmed booking state."
    ],
    deepDive: [
      "How do list and map stay synchronized without request storms?",
      "How do you show price freshness and avoid stale booking quotes?",
      "How do you handle timezone and date edge cases?",
      "What should happen when a listing becomes unavailable during checkout?",
      "How do you optimize map marker rendering?",
      "How do you support deep links to filtered searches?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-chat-app",
    title: "Chat App (e.g. Messenger)",
    product: "a real-time chat application",
    focus: ["Realtime", "Messaging", "Offline"],
    surfaces: ["conversation list", "message thread", "composer", "typing indicators", "read receipts"],
    components: ["conversation cache", "message timeline", "composer state", "realtime transport", "notification bridge"],
    entities: ["Conversation", "Message", "Draft", "Participant", "DeliveryReceipt"],
    interfaces: ["GET /conversations", "GET /messages?cursor", "POST /messages", "subscribe message events"],
    optimizations: [
      "Virtualize long message threads with reverse infinite scroll.",
      "Apply optimistic sends with pending, sent, failed, and retry states.",
      "Deduplicate websocket and REST-loaded messages by client/server id.",
      "Persist drafts locally per conversation.",
      "Throttle typing indicators and presence updates.",
      "Preserve scroll anchor when older messages prepend."
    ],
    deepDive: [
      "How do you maintain scroll position when loading older messages?",
      "How do optimistic client ids reconcile with server ids?",
      "How do you handle offline sends and retries?",
      "How do read receipts work across devices?",
      "How do you prevent duplicate messages after reconnect?",
      "What latency and reliability metrics matter?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-photo-sharing",
    title: "Photo Sharing (e.g. Instagram)",
    product: "a photo sharing app",
    focus: ["Media", "Feed", "Stories"],
    surfaces: ["home feed", "story tray", "photo detail", "comments", "upload flow"],
    components: ["feed renderer", "media loader", "story player", "comment module", "upload manager"],
    entities: ["PhotoPost", "Story", "MediaAsset", "Comment", "UploadDraft"],
    interfaces: ["GET /feed", "GET /stories", "POST /likes", "POST /uploads", "POST /comments"],
    optimizations: [
      "Use responsive image variants and reserve aspect-ratio boxes.",
      "Prefetch next stories and near-viewport feed media.",
      "Pause videos or animations outside the viewport.",
      "Batch likes, comments, and impression analytics.",
      "Optimize upload previews with local object URLs and background progress.",
      "Evict decoded media outside the viewport on memory pressure."
    ],
    deepDive: [
      "How do you make story playback feel instant?",
      "How do you recover failed uploads without losing the local draft?",
      "How do you prevent feed media from exhausting memory?",
      "How do you handle optimistic likes and comments?",
      "How would you support accessibility for image-only content?",
      "Which Core Web Vitals are hardest here?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-music-streaming",
    title: "Music Streaming (e.g. Spotify)",
    product: "a music streaming app",
    focus: ["Audio", "Playback", "Library"],
    surfaces: ["home", "playlist", "player bar", "queue", "search"],
    components: ["audio player controller", "queue manager", "playlist cache", "search surface", "offline/download manager"],
    entities: ["Track", "Playlist", "PlaybackState", "QueueItem", "LibrarySave"],
    interfaces: ["GET /home", "GET /playlists/:id", "GET /stream-url", "POST /playback-events"],
    optimizations: [
      "Keep audio playback state outside route-level rerenders.",
      "Prefetch stream URLs and album art for next queue items.",
      "Throttle progress updates and persist them in batches.",
      "Cache playlist metadata and artwork aggressively.",
      "Support offline state for downloaded tracks.",
      "Use media session APIs for system controls."
    ],
    deepDive: [
      "How do you keep playback uninterrupted across route changes?",
      "How do queue updates synchronize across devices?",
      "How do you handle expired stream URLs?",
      "What gets stored for offline playback versus streamed live?",
      "How do you design the player state machine?",
      "Which metrics indicate playback quality?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-video-conferencing",
    title: "Video Conferencing",
    product: "a video conferencing application",
    focus: ["WebRTC", "Realtime", "Media"],
    surfaces: ["meeting grid", "screen share", "participant list", "chat", "device settings"],
    components: ["media device manager", "WebRTC transport adapter", "tile grid renderer", "active speaker detector", "meeting controls"],
    entities: ["Participant", "MediaTrackState", "MeetingSession", "DevicePreference", "ChatMessage"],
    interfaces: ["GET /meetings/:id", "POST /join", "signaling channel", "media track events"],
    optimizations: [
      "Virtualize or prioritize video tiles when participant count grows.",
      "Render active speaker and pinned tiles at higher priority.",
      "Avoid React rerenders for high-frequency audio/video stats.",
      "Degrade video quality based on bandwidth and device limits.",
      "Separate media stream lifecycle from UI control state.",
      "Throttle meeting telemetry and network quality updates."
    ],
    deepDive: [
      "How do you prevent 30 video tiles from overwhelming the browser?",
      "How do you recover when a camera or microphone permission changes?",
      "How do you handle screen share layout and priority?",
      "Where should WebRTC state live relative to React?",
      "How would you debug audio/video quality issues?",
      "What should happen on network reconnect?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-google-sheets",
    title: "Google Sheets",
    product: "a collaborative spreadsheet",
    focus: ["Grid", "Formula", "Collaboration"],
    surfaces: ["cell grid", "formula bar", "sheet tabs", "selection ranges", "collaborator cursors"],
    components: ["grid virtualizer", "formula engine adapter", "selection manager", "sheet model", "collaboration transport"],
    entities: ["Workbook", "Sheet", "Cell", "FormulaDependency", "SelectionRange"],
    interfaces: ["GET /workbooks/:id", "POST /cell-ops", "subscribe workbook ops", "formula evaluation service"],
    optimizations: [
      "Virtualize rows and columns with frozen panes and stable cell coordinates.",
      "Recalculate only affected formula dependency subgraphs.",
      "Keep selection overlays independent from cell rendering.",
      "Batch cell edits and collaboration updates.",
      "Use workers for large formula recalculation or import parsing.",
      "Persist local edits before sending to support offline recovery."
    ],
    deepDive: [
      "How do you virtualize both rows and columns while preserving selection?",
      "How do formula dependencies update after inserting rows or columns?",
      "How do remote edits affect local undo?",
      "How do you handle huge paste operations?",
      "What lives in a worker versus React state?",
      "How do you measure grid interaction latency?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-dropdown-menu",
    title: "Dropdown Menu",
    product: "a reusable dropdown menu component",
    focus: ["Component", "Accessibility", "Positioning"],
    surfaces: ["trigger", "menu", "menu items", "nested submenu", "keyboard focus"],
    components: ["trigger controller", "positioning layer", "focus manager", "menu item registry", "dismissal handler"],
    entities: ["MenuState", "MenuItem", "FocusIndex", "AnchorRect", "DismissReason"],
    interfaces: ["component props API", "controlled/uncontrolled state API", "keyboard event contract"],
    optimizations: [
      "Use a positioning strategy that handles viewport collisions and scrolling containers.",
      "Keep focus updates local and avoid full app rerenders.",
      "Mount portals carefully to avoid clipping while preserving accessibility.",
      "Debounce expensive layout measurement only when needed.",
      "Support typeahead search without rebuilding the item tree.",
      "Avoid hidden menus trapping focus or screen reader navigation."
    ],
    deepDive: [
      "How do you implement roving tabindex and arrow-key navigation?",
      "How do you close on outside click without breaking nested menus?",
      "How do you handle menus inside scrollable containers?",
      "How do controlled and uncontrolled modes interact?",
      "How do you test keyboard and screen reader behavior?",
      "When should menu contents stay mounted?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-image-carousel",
    title: "Image Carousel",
    product: "an image carousel component",
    focus: ["Component", "Images", "Gestures"],
    surfaces: ["slides", "pagination dots", "next/previous buttons", "touch gestures", "captions"],
    components: ["slide track", "gesture controller", "image preloader", "accessibility controls", "autoplay state machine"],
    entities: ["Slide", "CarouselState", "GestureState", "ImageVariant", "AutoplayPolicy"],
    interfaces: ["component props API", "image loading callbacks", "analytics impression hooks"],
    optimizations: [
      "Preload adjacent slides and lazy-load distant slides.",
      "Reserve slide dimensions to avoid CLS.",
      "Use transform-based animation and avoid layout-affecting transitions.",
      "Pause autoplay on hover, focus, hidden tab, and reduced-motion settings.",
      "Keep only a small slide window mounted for large galleries.",
      "Use responsive image variants based on viewport and DPR."
    ],
    deepDive: [
      "How do you support touch swipe without blocking page scroll?",
      "How do you make autoplay accessible and non-annoying?",
      "How do you handle variable image aspect ratios?",
      "How do you measure slide impression accurately?",
      "How would you support infinite looping without duplicate semantics?",
      "What should happen when an image fails to load?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-modal-dialog",
    title: "Modal Dialog",
    product: "a reusable modal dialog system",
    focus: ["Component", "Accessibility", "Focus"],
    surfaces: ["modal content", "backdrop", "close controls", "nested dialogs", "focus trap"],
    components: ["modal manager", "portal layer", "focus trap", "scroll lock", "dismissal controller"],
    entities: ["ModalStack", "FocusRestorePoint", "DismissReason", "ScrollLockState", "DialogProps"],
    interfaces: ["component props API", "imperative open/close API", "route-backed modal API"],
    optimizations: [
      "Render through a portal while preserving accessible labels and ownership.",
      "Trap focus and restore focus to the trigger on close.",
      "Avoid layout shifts from scroll locking by compensating scrollbar width.",
      "Keep stacked modal z-index and dismissal behavior deterministic.",
      "Lazy-mount heavy dialog content only when opened.",
      "Prevent background interaction without breaking screen readers."
    ],
    deepDive: [
      "How do Escape and outside click behave with nested dialogs?",
      "How do you make modal content screen-reader friendly?",
      "How do route-backed modals work with browser back?",
      "How do you avoid body scroll issues on mobile Safari?",
      "How should destructive confirmations differ from normal dialogs?",
      "How do you test focus trap behavior?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-data-table",
    title: "Data Table",
    product: "a data table for operational workflows",
    focus: ["Grid", "Filtering", "Virtualization"],
    surfaces: ["table rows", "column headers", "filters", "sorting", "pagination/virtual scroll"],
    components: ["table shell", "query state manager", "row virtualizer", "column model", "selection manager"],
    entities: ["Row", "ColumnDef", "SortState", "FilterState", "SelectionState"],
    interfaces: ["GET /rows", "column config API", "export API", "bulk action API"],
    optimizations: [
      "Virtualize rows and optionally columns for large datasets.",
      "Keep sort/filter state URL-shareable and server-compatible.",
      "Memoize cell renderers and avoid rerendering all rows on selection changes.",
      "Use request cancellation for rapid filter edits.",
      "Support sticky headers without layout thrash.",
      "Batch bulk action state and optimistic updates carefully."
    ],
    deepDive: [
      "When should sorting/filtering be client-side versus server-side?",
      "How do you preserve selection across pagination and filtering?",
      "How do sticky columns affect virtualization?",
      "How do you support keyboard navigation and screen readers?",
      "How do you render custom cells without killing performance?",
      "Which table interactions should be measured?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-poll-widget",
    title: "Poll Widget",
    product: "an embeddable poll widget",
    focus: ["Component", "Realtime", "Embeds"],
    surfaces: ["question", "options", "vote button", "results chart", "embed container"],
    components: ["poll renderer", "vote controller", "results subscription", "embed adapter", "analytics tracker"],
    entities: ["Poll", "Option", "VoteState", "ResultCount", "EmbedConfig"],
    interfaces: ["GET /polls/:id", "POST /votes", "subscribe poll results", "embed configuration API"],
    optimizations: [
      "Optimistically show the user's vote while preventing duplicate votes.",
      "Update result counts through lightweight polling or subscriptions.",
      "Keep the embed bundle small and isolate styles from host pages.",
      "Render charts with minimal DOM for frequent result updates.",
      "Cache poll config but keep results freshness visible.",
      "Handle third-party iframe resize and theme constraints."
    ],
    deepDive: [
      "How do you prevent double voting on the frontend while waiting for server validation?",
      "How do you design this as an embeddable widget?",
      "How do live results update without visual jitter?",
      "How do you handle anonymous versus authenticated votes?",
      "How do you make charts accessible?",
      "How do you keep host page CSS from breaking the widget?"
    ]
  }),
  createFrontendSystemDesignQuestion({
    id: "frontend-system-email-client",
    title: "Email Client (e.g. Gmail / Outlook)",
    product: "a web email client",
    focus: ["Inbox", "Search", "Offline"],
    surfaces: ["folder list", "message list", "reading pane", "composer", "search"],
    components: ["mailbox cache", "thread list virtualizer", "message renderer", "composer draft store", "sync engine"],
    entities: ["Thread", "Message", "Mailbox", "Draft", "Attachment"],
    interfaces: ["GET /mailboxes/:id/threads", "GET /threads/:id", "POST /send", "POST /drafts", "search API"],
    optimizations: [
      "Virtualize thread lists and preserve selection across folders.",
      "Cache message summaries separately from full message bodies.",
      "Persist drafts locally and sync them safely across tabs.",
      "Lazy-load attachments and sanitize remote email HTML.",
      "Use incremental search results with cancellation.",
      "Batch read/unread/archive mutations with optimistic rollback."
    ],
    deepDive: [
      "How do you safely render arbitrary email HTML?",
      "How do drafts sync across tabs and devices?",
      "How do you support offline reading and composing?",
      "How do you preserve list position while threads update live?",
      "How do you handle large attachments and slow networks?",
      "What metrics matter for inbox productivity?"
    ]
  })
];
