"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Megaphone,
  Plus,
  Copy,
  CheckCircle2,
  Trash2,
  Edit3,
  ToggleLeft,
  ToggleRight,
  CopyPlus,
  Eye,
  X,
  ExternalLink,
  Code2,
  AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OverlayType = "banner" | "corner" | "modal";

type OverlayPosition =
  | "top"
  | "bottom"
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "center";

interface CtaOverlay {
  id: string;
  name: string;
  type: OverlayType;
  message: string;
  buttonText: string;
  buttonUrl: string;
  bgColor: string;
  textColor: string;
  position: OverlayPosition;
  active: boolean;
  createdAt: number;
}

type EditorMode = "create" | "edit";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "needtools_cta_overlays";
const MAX_OVERLAYS = 50;

const OVERLAY_TYPES: { value: OverlayType; label: string; description: string }[] = [
  { value: "banner", label: "Banner", description: "Full-width bar at top or bottom" },
  { value: "corner", label: "Corner Widget", description: "Small floating card in a corner" },
  { value: "modal", label: "Modal", description: "Centered overlay dialog" },
];

const POSITION_OPTIONS: Record<OverlayType, { value: OverlayPosition; label: string }[]> = {
  banner: [
    { value: "top", label: "Top" },
    { value: "bottom", label: "Bottom" },
  ],
  corner: [
    { value: "bottom-right", label: "Bottom Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "top-right", label: "Top Right" },
    { value: "top-left", label: "Top Left" },
  ],
  modal: [{ value: "center", label: "Center" }],
};

const DEFAULT_OVERLAY: Omit<CtaOverlay, "id" | "createdAt"> = {
  name: "",
  type: "banner",
  message: "Check out our latest offer!",
  buttonText: "Learn More",
  buttonUrl: "https://example.com",
  bgColor: "#1a1a2e",
  textColor: "#ffffff",
  position: "top",
  active: true,
};

const COLOR_PRESETS = [
  { bg: "#1a1a2e", text: "#ffffff", label: "Dark Navy" },
  { bg: "#e63946", text: "#ffffff", label: "Red Alert" },
  { bg: "#2d6a4f", text: "#ffffff", label: "Forest" },
  { bg: "#7209b7", text: "#ffffff", label: "Purple" },
  { bg: "#fb8500", text: "#1a1a2e", label: "Amber" },
  { bg: "#ffffff", text: "#1a1a2e", label: "Clean White" },
];

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

function loadOverlays(): CtaOverlay[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CtaOverlay[];
  } catch {
    return [];
  }
}

function saveOverlays(overlays: CtaOverlay[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overlays.slice(0, MAX_OVERLAYS)));
  } catch {
    // localStorage may be unavailable
  }
}

// ---------------------------------------------------------------------------
// Appwrite persistence (best-effort; falls back to localStorage above)
// ---------------------------------------------------------------------------

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "6a789c5430b868b6d118";
const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_CTA_OVERLAYS_COL_ID || "";

async function persistToAppwrite(overlay: CtaOverlay): Promise<void> {
  if (!COL_ID) return; // Collection not configured yet — skip silently
  try {
    const { databases } = await import("@/lib/appwrite");
    await databases.createDocument(DB_ID, COL_ID, overlay.id, {
      ownerId: "", // Will be populated when auth is wired up
      name: overlay.name,
      type: overlay.type,
      message: overlay.message,
      buttonText: overlay.buttonText,
      buttonUrl: overlay.buttonUrl,
      bgColor: overlay.bgColor,
      textColor: overlay.textColor,
      position: overlay.position,
      active: overlay.active,
    });
  } catch {
    // Appwrite not available — local-only is fine
  }
}

async function deleteFromAppwrite(overlayId: string): Promise<void> {
  if (!COL_ID) return;
  try {
    const { databases } = await import("@/lib/appwrite");
    await databases.deleteDocument(DB_ID, COL_ID, overlayId);
  } catch {
    // ignore
  }
}

async function updateInAppwrite(overlay: CtaOverlay): Promise<void> {
  if (!COL_ID) return;
  try {
    const { databases } = await import("@/lib/appwrite");
    await databases.updateDocument(DB_ID, COL_ID, overlay.id, {
      name: overlay.name,
      type: overlay.type,
      message: overlay.message,
      buttonText: overlay.buttonText,
      buttonUrl: overlay.buttonUrl,
      bgColor: overlay.bgColor,
      textColor: overlay.textColor,
      position: overlay.position,
      active: overlay.active,
    });
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Mock browser frame showing how the overlay renders over a sample page */
function LivePreview({ overlay }: { overlay: Omit<CtaOverlay, "id" | "createdAt"> }) {
  const renderBanner = () => (
    <div
      className="flex items-center justify-between px-3 py-2 text-xs sm:text-sm"
      style={{ backgroundColor: overlay.bgColor, color: overlay.textColor }}
    >
      <span className="truncate font-medium">{overlay.message || "Your message here"}</span>
      <button
        className="shrink-0 ml-2 px-3 py-1 rounded-md text-xs font-bold transition-opacity hover:opacity-80"
        style={{
          backgroundColor: overlay.textColor,
          color: overlay.bgColor,
        }}
      >
        {overlay.buttonText || "Button"}
      </button>
    </div>
  );

  const renderCorner = () => {
    const pos = overlay.position;
    const isBottom = pos.startsWith("bottom");
    const isRight = pos.endsWith("right") || pos === "bottom-right" || pos === "top-right";
    return (
      <div
        className="absolute m-2 max-w-[180px] rounded-xl shadow-lg p-3"
        style={{
          backgroundColor: overlay.bgColor,
          color: overlay.textColor,
          ...(isBottom ? { bottom: 0 } : { top: 36 }),
          ...(isRight ? { right: 0 } : { left: 0 }),
        }}
      >
        <p className="text-xs font-medium mb-2 leading-snug">
          {overlay.message || "Your message here"}
        </p>
        <button
          className="w-full px-2 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
          style={{
            backgroundColor: overlay.textColor,
            color: overlay.bgColor,
          }}
        >
          {overlay.buttonText || "Button"}
        </button>
      </div>
    );
  };

  const renderModal = () => (
    <div className="absolute inset-0 flex items-center justify-center" style={{ top: 36 }}>
      <div className="absolute inset-0 bg-black/30" style={{ top: 0 }} />
      <div
        className="relative rounded-2xl shadow-2xl p-4 mx-4 max-w-[220px] w-full text-center"
        style={{ backgroundColor: overlay.bgColor, color: overlay.textColor }}
      >
        <div
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs cursor-pointer opacity-70 hover:opacity-100"
          style={{ backgroundColor: overlay.textColor + "22", color: overlay.textColor }}
        >
          &times;
        </div>
        <p className="text-xs font-semibold mb-3 leading-snug mt-1">
          {overlay.message || "Your message here"}
        </p>
        <button
          className="w-full px-3 py-2 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
          style={{
            backgroundColor: overlay.textColor,
            color: overlay.bgColor,
          }}
        >
          {overlay.buttonText || "Button"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-black/10 dark:border-white/10">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-2 px-3 py-1 bg-white dark:bg-zinc-700 rounded-md text-[10px] text-black/40 dark:text-white/40 font-mono truncate">
          example.com/landing-page
        </div>
      </div>

      {/* Page body with overlay */}
      <div className="relative" style={{ minHeight: 280 }}>
        {/* Banner — top */}
        {overlay.type === "banner" && overlay.position === "top" && renderBanner()}

        {/* Fake page content */}
        <div className="p-4 space-y-3">
          <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-3 w-5/6 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-20 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 mt-2" />
          <div className="h-3 w-4/6 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-3 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>

        {/* Corner widget */}
        {overlay.type === "corner" && renderCorner()}

        {/* Modal */}
        {overlay.type === "modal" && renderModal()}

        {/* Banner — bottom */}
        {overlay.type === "banner" && overlay.position === "bottom" && (
          <div className="absolute bottom-0 left-0 right-0">{renderBanner()}</div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CtaOverlaysUI() {
  const [overlays, setOverlays] = useState<CtaOverlay[]>([]);
  const [editorMode, setEditorMode] = useState<EditorMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<Omit<CtaOverlay, "id" | "createdAt">>(DEFAULT_OVERLAY);

  useEffect(() => {
    setOverlays(loadOverlays());
  }, []);

  // Sync to localStorage whenever overlays change
  useEffect(() => {
    if (overlays.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      saveOverlays(overlays);
    }
  }, [overlays]);

  const positionOptions = useMemo(
    () => POSITION_OPTIONS[form.type] || POSITION_OPTIONS.banner,
    [form.type]
  );

  const updateForm = useCallback(
    <K extends keyof Omit<CtaOverlay, "id" | "createdAt">>(
      field: K,
      value: Omit<CtaOverlay, "id" | "createdAt">[K]
    ) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        // Reset position when type changes so it's always valid
        if (field === "type") {
          const opts = POSITION_OPTIONS[value as OverlayType];
          if (opts && !opts.find((o) => o.value === prev.position)) {
            next.position = opts[0].value;
          }
        }
        return next;
      });
      setError(null);
    },
    []
  );

  const handleSave = useCallback(() => {
    if (!form.name.trim()) {
      setError("Give your overlay a name.");
      return;
    }
    if (!form.message.trim()) {
      setError("Message is required.");
      return;
    }

    if (editorMode === "edit" && editingId) {
      // Update existing
      const updated: CtaOverlay = {
        ...form,
        id: editingId,
        createdAt:
          overlays.find((o) => o.id === editingId)?.createdAt ?? Date.now(),
      };
      setOverlays((prev) =>
        prev.map((o) => (o.id === editingId ? updated : o))
      );
      updateInAppwrite(updated);
    } else {
      // Create new
      const newOverlay: CtaOverlay = {
        ...form,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      setOverlays((prev) => [newOverlay, ...prev]);
      persistToAppwrite(newOverlay);
    }

    resetEditor();
  }, [form, editorMode, editingId, overlays]);

  const resetEditor = useCallback(() => {
    setForm(DEFAULT_OVERLAY);
    setEditorMode("create");
    setEditingId(null);
    setShowEditor(false);
    setError(null);
  }, []);

  const handleEdit = useCallback(
    (overlay: CtaOverlay) => {
      setForm({
        name: overlay.name,
        type: overlay.type,
        message: overlay.message,
        buttonText: overlay.buttonText,
        buttonUrl: overlay.buttonUrl,
        bgColor: overlay.bgColor,
        textColor: overlay.textColor,
        position: overlay.position,
        active: overlay.active,
      });
      setEditorMode("edit");
      setEditingId(overlay.id);
      setShowEditor(true);
      setError(null);
    },
    []
  );

  const handleDuplicate = useCallback(
    (overlay: CtaOverlay) => {
      const dup: CtaOverlay = {
        ...overlay,
        id: crypto.randomUUID(),
        name: overlay.name + " (copy)",
        createdAt: Date.now(),
      };
      setOverlays((prev) => [dup, ...prev]);
      persistToAppwrite(dup);
    },
    []
  );

  const handleDelete = useCallback(
    (id: string) => {
      setOverlays((prev) => prev.filter((o) => o.id !== id));
      deleteFromAppwrite(id);
      if (editingId === id) resetEditor();
    },
    [editingId, resetEditor]
  );

  const handleToggleActive = useCallback(
    (id: string) => {
      setOverlays((prev) =>
        prev.map((o) => {
          if (o.id !== id) return o;
          const toggled = { ...o, active: !o.active };
          updateInAppwrite(toggled);
          return toggled;
        })
      );
    },
    []
  );

  /**
   * Generate a snippet / link param that would apply this overlay.
   *
   * Mechanism: The overlay id is appended as a `?cta=<id>` query param on
   * a tracked/shortened link. When the link redirector serves the destination,
   * it injects a small script tag that fetches the overlay config from the
   * API and renders it over the page (via an iframe or injected DOM).
   *
   * Actual injection logic is a follow-up; for now we provide the
   * link parameter and a ready-to-paste HTML embed snippet.
   */
  const generateSnippet = useCallback(
    (overlay: CtaOverlay): string => {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://needtools.app";
      return `<!-- NeedTools CTA Overlay — ${overlay.name} -->
<!-- Attach to any tracked link by appending ?cta=${overlay.id} -->
<!-- Or embed directly with this snippet: -->
<script
  src="${baseUrl}/embed/cta.js"
  data-overlay-id="${overlay.id}"
  data-message="${overlay.message.replace(/"/g, "&quot;")}"
  data-button-text="${overlay.buttonText.replace(/"/g, "&quot;")}"
  data-button-url="${overlay.buttonUrl.replace(/"/g, "&quot;")}"
  data-type="${overlay.type}"
  data-position="${overlay.position}"
  data-bg-color="${overlay.bgColor}"
  data-text-color="${overlay.textColor}"
  async
></script>`;
    },
    []
  );

  const handleCopySnippet = useCallback(
    (overlay: CtaOverlay) => {
      const snippet = generateSnippet(overlay);
      navigator.clipboard.writeText(snippet);
      setCopied(overlay.id);
      setTimeout(() => setCopied(null), 2000);
    },
    [generateSnippet]
  );

  const handleCopyLinkParam = useCallback(
    (overlay: CtaOverlay) => {
      navigator.clipboard.writeText(`?cta=${overlay.id}`);
      setCopied(`param-${overlay.id}`);
      setTimeout(() => setCopied(null), 2000);
    },
    []
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 mb-4">
          <Megaphone className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          CTA Overlays
        </h2>
        <p className="text-black/50 dark:text-white/50 max-w-lg mx-auto">
          Create call-to-action banners, corner widgets, or modals to display
          over any destination page via a tracked link.
        </p>
      </div>

      {/* New Overlay button */}
      {!showEditor && (
        <div className="flex justify-center mb-8">
          <button
            onClick={() => {
              resetEditor();
              setShowEditor(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Overlay
          </button>
        </div>
      )}

      {/* ---- Editor ---- */}
      {showEditor && (
        <div className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm p-6 sm:p-8 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-400/10 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

              <div className="relative z-10 space-y-5">
                {/* Editor title */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    {editorMode === "edit" ? "Edit Overlay" : "New Overlay"}
                  </p>
                  <button
                    onClick={resetEditor}
                    className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    title="Close editor"
                  >
                    <X className="w-4 h-4 text-black/40 dark:text-white/40" />
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="cta-name" className="block text-sm font-semibold mb-1.5">
                    Overlay Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cta-name"
                    type="text"
                    placeholder="e.g. Summer Sale Banner"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    className="w-full h-12 px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-shadow text-sm"
                  />
                </div>

                {/* Type selector (pill tabs) */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Overlay Type
                  </label>
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5">
                    {OVERLAY_TYPES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => updateForm("type", t.value)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                          form.type === t.value
                            ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white"
                            : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-black/40 dark:text-white/40">
                    {OVERLAY_TYPES.find((t) => t.value === form.type)?.description}
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="cta-message" className="block text-sm font-semibold mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="cta-message"
                    rows={2}
                    placeholder="Your CTA message..."
                    value={form.message}
                    onChange={(e) => updateForm("message", e.target.value)}
                    className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-shadow text-sm resize-none"
                  />
                </div>

                {/* Button text + URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cta-btn-text" className="block text-sm font-semibold mb-1.5">
                      Button Text
                    </label>
                    <input
                      id="cta-btn-text"
                      type="text"
                      placeholder="Learn More"
                      value={form.buttonText}
                      onChange={(e) => updateForm("buttonText", e.target.value)}
                      className="w-full h-12 px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-shadow text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="cta-btn-url" className="block text-sm font-semibold mb-1.5">
                      Button URL
                    </label>
                    <input
                      id="cta-btn-url"
                      type="url"
                      placeholder="https://example.com"
                      value={form.buttonUrl}
                      onChange={(e) => updateForm("buttonUrl", e.target.value)}
                      className="w-full h-12 px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-shadow text-sm"
                    />
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Colors
                  </label>

                  {/* Presets */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          updateForm("bgColor", preset.bg);
                          updateForm("textColor", preset.text);
                        }}
                        title={preset.label}
                        className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                          form.bgColor === preset.bg && form.textColor === preset.text
                            ? "border-orange-500 scale-110"
                            : "border-black/10 dark:border-white/10"
                        }`}
                        style={{ backgroundColor: preset.bg }}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10">
                      <input
                        type="color"
                        value={form.bgColor}
                        onChange={(e) => updateForm("bgColor", e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <div>
                        <p className="text-[10px] text-black/40 dark:text-white/40 font-medium uppercase tracking-wider">
                          Background
                        </p>
                        <input
                          type="text"
                          value={form.bgColor}
                          onChange={(e) => updateForm("bgColor", e.target.value)}
                          className="bg-transparent text-xs font-mono w-20 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10">
                      <input
                        type="color"
                        value={form.textColor}
                        onChange={(e) => updateForm("textColor", e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <div>
                        <p className="text-[10px] text-black/40 dark:text-white/40 font-medium uppercase tracking-wider">
                          Text
                        </p>
                        <input
                          type="text"
                          value={form.textColor}
                          onChange={(e) => updateForm("textColor", e.target.value)}
                          className="bg-transparent text-xs font-mono w-20 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Position
                  </label>
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5 flex-wrap">
                    {positionOptions.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => updateForm("position", p.value)}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                          form.position === p.value
                            ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white"
                            : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 h-12 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-black/80 dark:hover:bg-white/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {editorMode === "edit" ? "Save Changes" : "Create Overlay"}
                  </button>
                  <button
                    onClick={resetEditor}
                    className="h-12 px-5 border border-black/10 dark:border-white/10 rounded-xl text-sm font-semibold text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4 text-black/40 dark:text-white/40" />
                  <p className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
                    Live Preview
                  </p>
                </div>
                <LivePreview overlay={form} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Saved Overlays List ---- */}
      {overlays.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm font-bold text-black/70 dark:text-white/70 uppercase tracking-wider">
              Saved Overlays
            </p>
            <span className="text-xs font-medium text-black/30 dark:text-white/30">
              ({overlays.length})
            </span>
          </div>

          <div className="space-y-3">
            {overlays.map((overlay) => (
              <div
                key={overlay.id}
                className={`bg-white dark:bg-neutral-950 border rounded-2xl shadow-sm p-4 sm:p-5 transition-all ${
                  overlay.active
                    ? "border-black/10 dark:border-white/10"
                    : "border-dashed border-black/10 dark:border-white/10 opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Colour swatch + info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: overlay.bgColor, color: overlay.textColor }}
                    >
                      {overlay.type === "banner" ? "B" : overlay.type === "corner" ? "C" : "M"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{overlay.name}</p>
                      <p className="text-xs text-black/40 dark:text-white/40 truncate">
                        {overlay.type.charAt(0).toUpperCase() + overlay.type.slice(1)} &middot;{" "}
                        {overlay.position} &middot;{" "}
                        {overlay.active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle active */}
                    <button
                      onClick={() => handleToggleActive(overlay.id)}
                      className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title={overlay.active ? "Deactivate" : "Activate"}
                    >
                      {overlay.active ? (
                        <ToggleRight className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-black/30 dark:text-white/30" />
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleEdit(overlay)}
                      className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4 text-black/50 dark:text-white/50" />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => handleDuplicate(overlay)}
                      className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="Duplicate"
                    >
                      <CopyPlus className="w-4 h-4 text-black/50 dark:text-white/50" />
                    </button>

                    {/* Copy link param */}
                    <button
                      onClick={() => handleCopyLinkParam(overlay)}
                      className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="Copy link parameter (?cta=...)"
                    >
                      {copied === `param-${overlay.id}` ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ExternalLink className="w-4 h-4 text-black/50 dark:text-white/50" />
                      )}
                    </button>

                    {/* Copy embed snippet */}
                    <button
                      onClick={() => handleCopySnippet(overlay)}
                      className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="Copy embed snippet"
                    >
                      {copied === overlay.id ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Code2 className="w-4 h-4 text-black/50 dark:text-white/50" />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(overlay.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-black/30 dark:text-white/30 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {overlays.length === 0 && !showEditor && (
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-8 h-8 text-black/20 dark:text-white/20" />
          </div>
          <p className="text-sm text-black/40 dark:text-white/40 max-w-xs mx-auto">
            No overlays yet. Create your first CTA overlay to get started.
          </p>
        </div>
      )}
    </div>
  );
}
