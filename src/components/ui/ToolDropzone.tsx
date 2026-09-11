"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FilePlus, X, ExternalLink, KeyRound, Check, Info } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// Icons
const GoogleDriveIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 87.3 78" className={className}>
    <path d="M66.9 78l20.4-35.4L66.9 7.2H26.1l20.4 35.4L66.9 78z" fill="#0066da" />
    <path d="M20.4 78L0 42.6 20.4 7.2h40.8L40.8 42.6 20.4 78z" fill="#00ac47" />
    <path d="M40.8 78L20.4 42.6 40.8 7.2h40.8L61.2 42.6 40.8 78z" fill="#ea4335" />
    <path d="M66.9 78L26.1 78 5.7 42.6 26.1 7.2h40.8l20.4 35.4L66.9 78z" fill="#ffba00" />
  </svg>
);

const DropboxIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 43 40" className={className}>
    <path d="M10.74 0L0 6.94l10.74 8.78L21.5 6.94 10.74 0zM32.26 0L21.5 6.94l10.76 8.78L43 6.94 32.26 0zM0 24.52l10.74 6.94L21.5 22.7 10.74 13.9 0 24.52zm43 0L32.26 13.9 21.5 22.7l10.76 8.76L43 24.52zM21.5 24.3l-10.76 8.8L21.5 40l10.76-6.9L21.5 24.3z" fill="#0061FE" />
  </svg>
);

// Acrobat-like PDF Paper icon matching the user screenshot
const PdfFileGraphic = () => (
  <div className="relative mb-5 drop-shadow-md group-hover:scale-105 transition-transform duration-300">
    <svg width="60" height="72" viewBox="0 0 60 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Paper Body */}
      <path
        d="M6 0C2.68629 0 0 2.68629 0 6V66C0 69.3137 2.68629 72 6 72H54C57.3137 72 60 69.3137 60 66V18L42 0H6Z"
        fill="white"
      />
      {/* Top-Right Fold */}
      <path
        d="M42 0V14C42 16.2091 43.7909 18 46 18H60L42 0Z"
        fill="#E2E8F0"
      />
      {/* Stylized Adobe Ribbon Graphic */}
      <g transform="translate(14, 25)">
        <path
          d="M16 2.5C13.5 6.8 11.2 11.6 9.4 16C7.5 12 5.5 8 3.5 4.5C2.5 6.5 1.5 9 1 12C0.5 15 0.5 17.5 1.2 19.5C2 21.5 3.8 22.5 6.2 22.5C8.8 22.5 11.2 21 13.2 18.5C15 16.2 16.2 13.8 17 11.8C17.8 13.8 19 16.2 20.8 18.5C22.8 21 25.2 22.5 27.8 22.5C30.2 22.5 32 21.5 32.8 19.5C33.5 17.5 33.5 15 33 12C32.5 9 31.5 6.5 30.5 4.5C28.5 8 26.5 12 24.6 16C22.8 11.6 20.5 6.8 18 2.5C17.5 1.6 16.5 1.6 16 2.5ZM6.5 19.5C5 19.5 4 18.8 3.5 17.5C3 16.2 3.2 14.5 3.8 12.5C4.8 14.5 6 16.8 7.5 18.8C7.1 19.2 6.8 19.5 6.5 19.5ZM27.5 19.5C27.2 19.5 26.9 19.2 26.5 18.8C28 16.8 29.2 14.5 30.2 12.5C30.8 14.5 31 16.2 30.5 17.5C30 18.8 29 19.5 27.5 19.5Z"
          fill="#5C4DEB"
        />
      </g>
    </svg>
  </div>
);

// Image Paper Icon for image tools
const ImageFileGraphic = () => (
  <div className="relative mb-5 drop-shadow-md group-hover:scale-105 transition-transform duration-300">
    <svg width="60" height="72" viewBox="0 0 60 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 0C2.68629 0 0 2.68629 0 6V66C0 69.3137 2.68629 72 6 72H54C57.3137 72 60 69.3137 60 66V18L42 0H6Z"
        fill="white"
      />
      <path
        d="M42 0V14C42 16.2091 43.7909 18 46 18H60L42 0Z"
        fill="#E2E8F0"
      />
      <g transform="translate(15, 26)">
        <rect x="0" y="0" width="30" height="24" rx="3" fill="#EEF2FF" stroke="#5C4DEB" strokeWidth="2" />
        <circle cx="8" cy="7" r="2.5" fill="#5C4DEB" />
        <path d="M3 20L11 11L18 18L22 14L27 20H3Z" fill="#5C4DEB" />
      </g>
    </svg>
  </div>
);

export interface ToolDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  fileTypeLabel?: string; // e.g. "PDFs" or "images" or "files"
  buttonText?: string;    // default "Choose Files"
  iconType?: "pdf" | "image" | "file";
  maxFiles?: number;
  maxSizeBytes?: number;
  className?: string;
  disabled?: boolean;
}

export function ToolDropzone({
  onFiles,
  accept = "application/pdf",
  multiple = true,
  fileTypeLabel = "PDFs",
  buttonText = "Choose Files",
  iconType = "pdf",
  maxFiles = 20,
  maxSizeBytes = 100 * 1024 * 1024,
  className = "",
  disabled = false,
}: ToolDropzoneProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingCloud, setIsProcessingCloud] = useState(false);
  const [setupModalType, setSetupModalType] = useState<"google" | "dropbox" | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  // Cloud API state
  const [gisLoaded, setGisLoaded] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);

  useEffect(() => {
    // Load Google Scripts
    const loadScript = (src: string, onLoad: () => void) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        onLoad();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = onLoad;
      document.body.appendChild(script);
    };

    loadScript("https://accounts.google.com/gsi/client", () => setGisLoaded(true));
    loadScript("https://apis.google.com/js/api.js", () => {
      if (window.gapi) {
        window.gapi.load("picker", () => setGapiLoaded(true));
      }
    });

    // Load Dropbox Script
    const dropboxKey = process.env.NEXT_PUBLIC_DROPBOX_APP_KEY;
    if (dropboxKey && !dropboxKey.includes("placeholder")) {
      const dbScript = document.createElement("script");
      dbScript.src = "https://www.dropbox.com/static/api/2/dropins.js";
      dbScript.id = "dropboxjs";
      dbScript.setAttribute("data-app-key", dropboxKey);
      dbScript.async = true;
      document.body.appendChild(dbScript);
    }
  }, []);

  const validateAndPassFiles = (rawFiles: FileList | File[]) => {
    const list = Array.from(rawFiles);
    if (!list.length) return;

    if (!multiple && list.length > 1) {
      toast("Please select a single file.", "warning");
      onFiles([list[0]]);
      return;
    }

    if (multiple && list.length > maxFiles) {
      toast(`You can select at most ${maxFiles} files at once.`, "warning");
      onFiles(list.slice(0, maxFiles));
      return;
    }

    const oversized = list.find((f) => f.size > maxSizeBytes);
    if (oversized) {
      const mb = Math.round(maxSizeBytes / (1024 * 1024));
      toast(`File "${oversized.name}" exceeds the maximum size limit of ${mb}MB.`, "error");
      return;
    }

    onFiles(list);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFiles(e.dataTransfer.files);
    }
  };

  const downloadBlob = async (url: string, fileName: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  };

  // Google Drive Trigger
  const handleGoogleDrive = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    // Check if real keys are set
    if (!clientId || !apiKey || clientId.includes("placeholder") || apiKey.includes("placeholder")) {
      setSetupModalType("google");
      return;
    }

    if (!gisLoaded || !gapiLoaded || !window.google?.accounts?.oauth2) {
      toast("Google Drive API লোড হচ্ছে, অনুগ্রহ করে কয়েক সেকেন্ড পর আবার চেষ্টা করুন।", "info");
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        callback: (tokenResponse: any) => {
          if (tokenResponse.error !== undefined) {
            toast("Google Drive authentication failed.", "error");
            return;
          }

          const view = new window.google.picker.DocsView();
          view.setIncludeFolders(true);

          const pickerBuilder = new window.google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(tokenResponse.access_token)
            .setDeveloperKey(apiKey)
            .setCallback(async (data: any) => {
              if (data.action === window.google.picker.Action.PICKED) {
                setIsProcessingCloud(true);
                try {
                  const fetchedFiles = await Promise.all(
                    data.docs.map(async (doc: any) => {
                      const url = `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`;
                      return await downloadBlob(url, doc.name, tokenResponse.access_token);
                    })
                  );
                  validateAndPassFiles(fetchedFiles);
                } catch (err) {
                  toast("Failed to download files from Google Drive.", "error");
                  console.error(err);
                } finally {
                  setIsProcessingCloud(false);
                }
              }
            });

          if (multiple) {
            pickerBuilder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
          }

          const picker = pickerBuilder.build();
          picker.setVisible(true);
        },
      });

      tokenClient.requestAccessToken({ prompt: "" });
    } catch (err) {
      toast("Failed to initialize Google Drive picker.", "error");
      console.error(err);
    }
  };

  // Dropbox Trigger
  const handleDropbox = () => {
    const appKey = process.env.NEXT_PUBLIC_DROPBOX_APP_KEY;
    if (!appKey || appKey.includes("placeholder")) {
      setSetupModalType("dropbox");
      return;
    }

    if (!window.Dropbox) {
      toast("Dropbox API লোড হচ্ছে...", "info");
      return;
    }

    window.Dropbox.choose({
      success: async (files: any[]) => {
        setIsProcessingCloud(true);
        try {
          const fetchedFiles = await Promise.all(
            files.map(async (file: any) => {
              return await downloadBlob(file.link, file.name);
            })
          );
          validateAndPassFiles(fetchedFiles);
        } catch (err) {
          toast("Failed to download files from Dropbox.", "error");
          console.error(err);
        } finally {
          setIsProcessingCloud(false);
        }
      },
      cancel: () => {},
      linkType: "direct",
      multiselect: multiple,
    });
  };

  const copyConfigSnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <>
      <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
        {/* Outer Frame with border, gap, and rounded styling matching the screenshot */}
        <div
          className={`relative rounded-2xl sm:rounded-3xl border-[2.5px] border-[#5c4deb] dark:border-brand-500 p-1.5 sm:p-2 bg-white dark:bg-neutral-950 transition-all duration-300 shadow-sm ${
            isDragOver ? "ring-4 ring-[#5c4deb]/30 scale-[1.008]" : ""
          }`}
        >
          {/* Inner Solid Purple Box matching the screenshot */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (!disabled) fileInputRef.current?.click();
            }}
            className={`w-full rounded-xl sm:rounded-2xl bg-[#5c4deb] dark:bg-[#5244e0] py-14 sm:py-16 px-6 sm:px-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none group relative overflow-hidden ${
              isDragOver ? "bg-[#5142e0]" : "hover:bg-[#5647ec]"
            }`}
          >
            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept={accept}
              multiple={multiple}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  validateAndPassFiles(e.target.files);
                }
              }}
            />

            {/* Graphic Icon */}
            {iconType === "image" ? <ImageFileGraphic /> : <PdfFileGraphic />}

            {/* Choose Files Button */}
            <div className="relative z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-2.5 px-7 py-3 sm:px-8 sm:py-3.5 bg-white hover:bg-slate-50 active:scale-95 text-slate-900 font-semibold text-sm sm:text-base rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <FilePlus className="w-5 h-5 text-slate-800 stroke-[2.2]" />
                <span>{buttonText}</span>
              </button>
            </div>

            {/* Subtext */}
            <p className="text-white text-sm font-medium mt-3.5 tracking-wide">
              or drop {fileTypeLabel} here
            </p>

            {/* Cloud Storage Options (Google Drive & Dropbox) */}
            <div
              className="flex flex-wrap items-center justify-center gap-2.5 mt-5 pt-1 relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleGoogleDrive}
                disabled={isProcessingCloud}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-medium backdrop-blur-md border border-white/25 transition-all shadow-sm"
                title="Import from Google Drive"
              >
                <GoogleDriveIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Google Drive</span>
              </button>

              <button
                type="button"
                onClick={handleDropbox}
                disabled={isProcessingCloud}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-medium backdrop-blur-md border border-white/25 transition-all shadow-sm"
                title="Import from Dropbox"
              >
                <DropboxIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Dropbox</span>
              </button>
            </div>

            {/* Cloud Processing Overlay */}
            {isProcessingCloud && (
              <div className="absolute inset-0 bg-[#5c4deb]/90 flex items-center justify-center rounded-xl z-20 backdrop-blur-xs">
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white text-slate-800 shadow-xl font-medium text-sm">
                  <div className="w-4 h-4 border-2 border-[#5c4deb] border-t-transparent rounded-full animate-spin" />
                  <span>ক্লাউড থেকে ফাইল ডাউনলোড হচ্ছে...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Authentication & Setup Guide Modal */}
      {setupModalType &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSetupModalType(null)}
          >
            <div
              className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-7 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  {setupModalType === "google" ? (
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800/40">
                      <GoogleDriveIcon className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800/40">
                      <DropboxIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {setupModalType === "google" ? "Google Drive API সেটআপ" : "Dropbox API সেটআপ"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      ক্লাউড থেকে সরাসরি ফাইল আপলোড চালু করার সহজ গাইড
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSetupModalType(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-4 space-y-3.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {setupModalType === "google" ? (
                  <>
                    <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-3 rounded-xl flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        বর্তমানে Google Drive ক্রেডেনশিয়াল প্লেসহোল্ডার হিসেবে আছে। নিচের ধাপগুলো অনুসরণ করে রিয়েল কী যুক্ত করুন:
                      </span>
                    </p>
                    <ol className="space-y-2 text-xs list-decimal list-inside bg-slate-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-neutral-800">
                      <li>
                        <strong>Google Cloud Console</strong>-এ যান:{" "}
                        <a
                          href="https://console.cloud.google.com/apis/dashboard"
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-1"
                        >
                          console.cloud.google.com <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                      <li>
                        <strong>Enabled APIs & Services</strong> থেকে <code>Google Picker API</code> এনাবল করুন।
                      </li>
                      <li>
                        <strong>Credentials</strong> ট্যাব থেকে একটি <code>OAuth 2.0 Client ID</code> (Web application) এবং একটি <code>API Key</code> তৈরি করুন।
                      </li>
                      <li>
                        অনুমোদিত জাভাস্ক্রিপ্ট অরিজিনে (Authorized JavaScript origins) <code>https://needtools.app</code> ও <code>http://localhost:3000</code> যোগ করুন।
                      </li>
                    </ol>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>আপনার <code>.env.local</code> ফাইলে যুক্ত করুন:</span>
                        <button
                          type="button"
                          onClick={() =>
                            copyConfigSnippet(
                              `NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com\nNEXT_PUBLIC_GOOGLE_API_KEY=your_api_key`
                            )
                          }
                          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          {copiedEnv ? <Check className="w-3 h-3" /> : <KeyRound className="w-3 h-3" />}
                          {copiedEnv ? "কপি হয়েছে!" : "কোড কপি করুন"}
                        </button>
                      </div>
                      <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs overflow-x-auto font-mono">
                        NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com{"\n"}
                        NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key
                      </pre>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-3 rounded-xl flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Dropbox Chooser চালানোর জন্য একটি ফ্রি Dropbox App Key প্রয়োজন:</span>
                    </p>
                    <ol className="space-y-2 text-xs list-decimal list-inside bg-slate-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-neutral-800">
                      <li>
                        <strong>Dropbox App Console</strong>-এ যান:{" "}
                        <a
                          href="https://www.dropbox.com/developers/apps"
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-1"
                        >
                          dropbox.com/developers/apps <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                      <li>একটি নতুন অ্যাপ তৈরি করুন (Scoped access বা Chooser API)।</li>
                      <li>
                        Chooser Domain Whitelist-এ <code>needtools.app</code> ও <code>localhost</code> যোগ করুন।
                      </li>
                      <li>আপনার <strong>App Key</strong> সংগ্রহ করুন।</li>
                    </ol>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>আপনার <code>.env.local</code> ফাইলে যুক্ত করুন:</span>
                        <button
                          type="button"
                          onClick={() => copyConfigSnippet(`NEXT_PUBLIC_DROPBOX_APP_KEY=your_dropbox_app_key`)}
                          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          {copiedEnv ? <Check className="w-3 h-3" /> : <KeyRound className="w-3 h-3" />}
                          {copiedEnv ? "কপি হয়েছে!" : "কোড কপি করুন"}
                        </button>
                      </div>
                      <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs overflow-x-auto font-mono">
                        NEXT_PUBLIC_DROPBOX_APP_KEY=your_dropbox_app_key
                      </pre>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-neutral-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSetupModalType(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  বুঝেছি
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
