"use client";

import React, { useState } from "react";
import { Link2, Loader2, Check, Copy } from "lucide-react";
import { storage } from "@/lib/appwrite";
import { ID_GEN } from "@/lib/appwrite";
import { useToast } from "@/components/ui/Toast";

interface ShareLinkButtonProps {
  fileBlob: Blob | null;
  fileName: string;
  iconOnly?: boolean;
}

export function ShareLinkButton({ fileBlob, fileName, iconOnly = false }: ShareLinkButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!fileBlob) return;
    setIsUploading(true);

    try {
      const file = new File([fileBlob], fileName, { type: fileBlob.type });
      const uploadedFile = await storage.createFile("TemporaryDownloads", ID_GEN.unique(), file);

      const shortUrl = `${window.location.origin}/d/${uploadedFile.$id}`;

      await navigator.clipboard.writeText(shortUrl);
      setIsCopied(true);
      toast("The shareable link has been copied to your clipboard.", "success");

      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      console.error("Error creating shareable link:", error);
      toast("Failed to generate shareable link. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleShare}
        disabled={isUploading || !fileBlob}
        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Copy Shareable Link"
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isCopied ? (
          <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Copy className="w-5 h-5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      disabled={isUploading || !fileBlob}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-200/50 dark:border-indigo-700/50 shadow-sm"
      title="Create a 7-day shareable link for this file"
    >
      {isUploading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isCopied ? (
        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
      {isCopied ? "Copied!" : "Copy Shareable Link"}
    </button>
  );
}
