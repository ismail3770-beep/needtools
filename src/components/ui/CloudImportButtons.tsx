"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { useToast } from "@/components/ui/Toast";

// Icons for the buttons
const GoogleDriveIcon = () => (
  <svg viewBox="0 0 87.3 78" className="w-5 h-5 shrink-0">
    <path d="M66.9 78l20.4-35.4L66.9 7.2H26.1l20.4 35.4L66.9 78z" fill="#0066da" />
    <path d="M20.4 78L0 42.6 20.4 7.2h40.8L40.8 42.6 20.4 78z" fill="#00ac47" />
    <path d="M40.8 78L20.4 42.6 40.8 7.2h40.8L61.2 42.6 40.8 78z" fill="#ea4335" />
    <path d="M66.9 78L26.1 78 5.7 42.6 26.1 7.2h40.8l20.4 35.4L66.9 78z" fill="#ffba00" />
  </svg>
);

const DropboxIcon = () => (
  <svg viewBox="0 0 43 40" className="w-5 h-5 shrink-0">
    <path d="M10.74 0L0 6.94l10.74 8.78L21.5 6.94 10.74 0zM32.26 0L21.5 6.94l10.76 8.78L43 6.94 32.26 0zM0 24.52l10.74 6.94L21.5 22.7 10.74 13.9 0 24.52zm43 0L32.26 13.9 21.5 22.7l10.76 8.76L43 24.52zM21.5 24.3l-10.76 8.8L21.5 40l10.76-6.9L21.5 24.3z" fill="#0061FE"/>
  </svg>
);

interface CloudImportButtonsProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
    Dropbox: any;
  }
}

export function CloudImportButtons({ onFiles, accept, multiple = true }: CloudImportButtonsProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const [gisLoaded, setGisLoaded] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);

  // Load Google Scripts
  useEffect(() => {
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
      window.gapi.load("picker", () => setGapiLoaded(true));
    });
  }, []);

  const downloadBlob = async (url: string, fileName: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  };

  const handleGoogleDrive = () => {
    if (!gisLoaded || !gapiLoaded) {
      toast("Google Drive API is still loading. Please try again in a moment.", "error");
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    if (!clientId || !apiKey) {
      toast("Google Drive API keys are not configured.", "error");
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
                setIsProcessing(true);
                try {
                  const fetchedFiles = await Promise.all(
                    data.docs.map(async (doc: any) => {
                      const url = `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`;
                      return await downloadBlob(url, doc.name, tokenResponse.access_token);
                    })
                  );
                  onFiles(fetchedFiles);
                } catch (err) {
                  toast("Failed to download files from Google Drive.", "error");
                  console.error(err);
                } finally {
                  setIsProcessing(false);
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

  const handleDropbox = () => {
    const appKey = process.env.NEXT_PUBLIC_DROPBOX_APP_KEY;
    if (!appKey) {
      toast("Dropbox App Key is not configured.", "error");
      return;
    }

    if (!window.Dropbox) {
      toast("Dropbox API is still loading.", "error");
      return;
    }

    window.Dropbox.choose({
      success: async (files: any[]) => {
        setIsProcessing(true);
        try {
          const fetchedFiles = await Promise.all(
            files.map(async (file: any) => {
              return await downloadBlob(file.link, file.name);
            })
          );
          onFiles(fetchedFiles);
        } catch (err) {
          toast("Failed to download files from Dropbox.", "error");
          console.error(err);
        } finally {
          setIsProcessing(false);
        }
      },
      cancel: () => {},
      linkType: "direct",
      multiselect: multiple,
      // extensions can be mapped from 'accept' prop if needed, omitting for now
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center mt-4 mb-2 relative z-10" onClick={(e) => e.stopPropagation()}>
      <Script 
        src="https://www.dropbox.com/static/api/2/dropins.js" 
        id="dropboxjs" 
        data-app-key={process.env.NEXT_PUBLIC_DROPBOX_APP_KEY || ""} 
        strategy="lazyOnload" 
      />
      
      {isProcessing && (
        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center rounded-xl z-20">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Importing from cloud...
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleDrive}
        disabled={isProcessing}
        className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
      >
        <GoogleDriveIcon />
        Google Drive
      </button>

      <button
        type="button"
        onClick={handleDropbox}
        disabled={isProcessing}
        className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
      >
        <DropboxIcon />
        Dropbox
      </button>
    </div>
  );
}
