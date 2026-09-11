"use client";

import { ToolDropzone } from "@/components/ui/ToolDropzone";

import React, { useState, useRef, useCallback, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  UploadCloud,
  Trash2,
  Loader2,
  CheckCircle2,
  Download,
  FileBox,
  Type,
  Image as ImageIcon,
  Highlighter,
  Eraser,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Hand,
  Square,
  Circle,
  Minus,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Plus,
  ArrowRight,
  ChevronDown,
  Link2,
} from "lucide-react";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
}

type ToolType = "select" | "hand" | "text" | "image" | "highlight" | "eraser" | "shape_rect" | "shape_circle" | "shape_line";

type TextFormat = {
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  alignment: 'left' | 'center' | 'right' | 'justify';
  color: string;
};

const DEFAULT_TEXT_FORMAT: TextFormat = {
  fontFamily: 'Helvetica',
  fontSize: 14,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  alignment: 'left',
  color: '#000000'
};

const ContentEditableDiv = React.forwardRef(({ html, id, ...props }: any, ref) => {
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (innerRef.current && html !== undefined && innerRef.current.innerHTML !== html) {
      innerRef.current.innerHTML = html;
    }
  }, [html]);

  return (
    <div
      ref={(node) => {
        (innerRef as any).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as any).current = node;
      }}
      id={id}
      {...props}
    />
  );
});

export default function PdfEditorUI() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5); // High DPI scale
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  // Editor State
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [textItems, setTextItems] = useState<any[]>([]);
  const [editedTexts, setEditedTexts] = useState<Record<number, Record<number, { newText: string, item: any }>>>({});
  
  // Advanced Formatting State
  const [textFormats, setTextFormats] = useState<Record<string, TextFormat>>({});
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // Freeform Tools State
  const [drawings, setDrawings] = useState<Record<number, any[]>>({}); // { pageNum: [{id, type, x, y, width, height}] }
  const [newTexts, setNewTexts] = useState<Record<number, any[]>>({}); // { pageNum: [{id, x, y, text}] }
  const [images, setImages] = useState<Record<number, any[]>>({}); // { pageNum: [{id, x, y, width, height, dataUrl}] }
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDraw, setCurrentDraw] = useState<any>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [draggingImageId, setDraggingImageId] = useState<string | null>(null);
  const [draggingShape, setDraggingShape] = useState<{ id: string, startX: number, startY: number } | null>(null);
  
  // Custom Preset Colors
  const [customColors, setCustomColors] = useState<string[]>(['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']);

  // History State
  type HistorySnapshot = {
    drawings: Record<number, any[]>;
    editedTexts: Record<number, Record<number, { newText: string, item: any }>>;
    newTexts: Record<number, any[]>;
    images: Record<number, any[]>;
    textFormats: Record<string, TextFormat>;
  };
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Keep track of latest state for history snapshots
  const stateRef = useRef({ drawings, editedTexts, newTexts, images, textFormats });
  useEffect(() => {
    stateRef.current = { drawings, editedTexts, newTexts, images, textFormats };
  }, [drawings, editedTexts, newTexts, images, textFormats]);

  const saveSnapshot = useCallback(() => {
    setHistory(prev => {
      const current = stateRef.current;
      const newSnapshot = {
        drawings: JSON.parse(JSON.stringify(current.drawings)),
        editedTexts: JSON.parse(JSON.stringify(current.editedTexts)),
        newTexts: JSON.parse(JSON.stringify(current.newTexts)),
        images: JSON.parse(JSON.stringify(current.images)),
        textFormats: JSON.parse(JSON.stringify(current.textFormats)),
      };
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, newSnapshot];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const markFormatAsEdited = useCallback((idStr: string) => {
    const idNum = parseInt(idStr);
    if (!isNaN(idNum) && textItems.find(t => t.id === idNum)) {
      setEditedTexts(prev => {
        if (prev[currentPage]?.[idNum]) return prev;
        const item = textItems.find(t => t.id === idNum);
        if (!item) return prev;
        return {
          ...prev,
          [currentPage]: {
            ...(prev[currentPage] || {}),
            [idNum]: { newText: item.originalText, item }
          }
        };
      });
    }
  }, [currentPage, textItems]);

  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false, color: '#000000' });

  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement?.getAttribute('contenteditable') === 'true') {
        let color = document.queryCommandValue('foreColor');
        if (color) {
          // foreColor returns rgb(r, g, b) string. Let's convert to hex for consistency if needed, 
          // but we can just use the raw string for the UI state for now.
        }
        setActiveFormats({
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
          color: color || '#000000'
        });
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleFormatCommand = useCallback((command: string, value?: string) => {
    if (!selectedTextId) return;
    
    let activeDiv = document.getElementById(`text-edit-${selectedTextId}`);
    if (!activeDiv) return;

    let appliedToSelection = false;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (activeDiv.contains(range.commonAncestorContainer) && !selection.isCollapsed) {
        document.execCommand(command, false, value);
        appliedToSelection = true;
      }
    }

    if (!appliedToSelection) {
      const range = document.createRange();
      range.selectNodeContents(activeDiv);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand(command, false, value);
      sel?.collapseToEnd();
    }

    const newHtml = activeDiv.innerHTML;
    
    if (newTexts[currentPage]?.some(t => t.id === selectedTextId)) {
      setNewTexts(prev => ({
        ...prev,
        [currentPage]: (prev[currentPage] || []).map(p => p.id === selectedTextId ? { ...p, text: newHtml } : p)
      }));
    } else {
      const idNum = parseInt(selectedTextId);
      if (!isNaN(idNum)) {
        setEditedTexts(prev => {
          const item = textItems.find(t => t.id === idNum);
          return {
            ...prev,
            [currentPage]: {
              ...(prev[currentPage] || {}),
              [idNum]: { newText: newHtml, item: item || prev[currentPage]?.[idNum]?.item }
            }
          };
        });
      }
    }
    
    // Update local state to reflect UI changes immediately
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      color: document.queryCommandValue('foreColor') || '#000000'
    });

    setTimeout(saveSnapshot, 0);
  }, [selectedTextId, currentPage, newTexts, textItems, saveSnapshot]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setDrawings(prevState.drawings);
      setEditedTexts(prevState.editedTexts);
      setNewTexts(prevState.newTexts);
      setImages(prevState.images);
      setTextFormats(prevState.textFormats);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setDrawings(nextState.drawings);
      setEditedTexts(nextState.editedTexts);
      setNewTexts(nextState.newTexts);
      setImages(nextState.images);
      setTextFormats(nextState.textFormats);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Save initial snapshot when tool is opened/reset
  useEffect(() => {
    if (history.length === 0 && file) {
      saveSnapshot();
    }
  }, [file, history.length, saveSnapshot]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // File Upload Handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add("border-blue-500", "bg-blue-50/50", "dark:bg-blue-900/20");
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-blue-500", "bg-blue-50/50", "dark:bg-blue-900/20");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-blue-500", "bg-blue-50/50", "dark:bg-blue-900/20");
    }
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      handleFileSelection(droppedFile);
    } else {
      alert("Please drop a valid PDF file.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      handleFileSelection(selectedFile);
    }
  };

  const handleFileSelection = async (selectedFile: File) => {
    setFile(selectedFile);
    setResultBlob(null);
    setThumbnails([]);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const loadedPdf = await loadingTask.promise;
      setPdfDoc(loadedPdf);
      const total = loadedPdf.numPages;
      setTotalPages(total);
      setCurrentPage(1);

      // Generate Thumbnails
      const generatedThumbnails = [];
      for (let i = 1; i <= total; i++) {
        const page = await loadedPdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 }); // Small scale for thumbnail
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const renderContext: any = { canvasContext: context, viewport };
          await page.render(renderContext).promise;
          generatedThumbnails.push(canvas.toDataURL("image/jpeg", 0.7));
        }
      }
      setThumbnails(generatedThumbnails);

    } catch (err) {
      console.error("Error loading PDF:", err);
      alert("Failed to read the PDF file.");
    }
  };

  const resetTool = () => {
    setFile(null);
    setResultBlob(null);
    setPdfDoc(null);
    setIsProcessing(false);
    setCurrentPage(1);
    setTotalPages(0);
    setActiveTool("select");
    setTextItems([]);
    setEditedTexts({});
    setDrawings({});
    setNewTexts({});
    setImages({});
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const [pendingImagePos, setPendingImagePos] = useState<{x: number, y: number} | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingImagePos) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        // Create an image object to get intrinsic dimensions
        const img = new Image();
        img.onload = () => {
          setImages(prev => ({
            ...prev,
            [currentPage]: [
              ...(prev[currentPage] || []),
              {
                id: Date.now().toString(),
                x: pendingImagePos.x,
                y: pendingImagePos.y,
                width: Math.min(img.width, 200), // Default constraint
                height: Math.min(img.width, 200) * (img.height / img.width),
                dataUrl
              }
            ]
          }));
          setPendingImagePos(null);
          setTimeout(saveSnapshot, 0);
          if (imageInputRef.current) imageInputRef.current.value = "";
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const [saveStatus, setSaveStatus] = useState<"idle" | "uploading" | "processing" | "done">("idle");

  const handleSavePdf = async () => {
    if (!file) return;

    // Check if there are any actual edits to send
    const hasEdits =
      Object.keys(drawings).length > 0 ||
      Object.keys(editedTexts).length > 0 ||
      Object.keys(newTexts).length > 0 ||
      Object.keys(images).length > 0;

    if (!hasEdits) {
      alert("No edits to save yet. Make some changes first!");
      return;
    }

    const BACKEND_URL =
      process.env.NEXT_PUBLIC_PDF_EDIT_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "";

    if (!BACKEND_URL) {
      alert("PDF Editor backend is not configured. Please set NEXT_PUBLIC_PDF_EDIT_BACKEND_URL in your environment variables.");
      return;
    }

    setIsProcessing(true);
    setSaveStatus("uploading");

    try {
      // Build the edits payload — keys are 1-based page number strings
      // Include __scale so the backend knows the render scale factor
      const editsPayload: Record<string, unknown> = { __scale: scale };

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const pageDrawings    = drawings[pageNum]    || [];
        const pageEditedTexts = editedTexts[pageNum] || {};
        const pageNewTexts    = newTexts[pageNum]    || [];
        const pageImages      = images[pageNum]      || [];

        const hasPageEdits =
          pageDrawings.length > 0 ||
          Object.keys(pageEditedTexts).length > 0 ||
          pageNewTexts.length > 0 ||
          pageImages.length > 0;

        if (!hasPageEdits) continue;

        // Map editedTexts (keyed by item id) into an array for the backend
        const editedTextsArr = Object.entries(pageEditedTexts).map(
          ([_id, { newText, item }]) => ({
            x:       item.x,
            y:       item.y,
            width:   item.width,
            height:  item.height,
            newText,
            format: textFormats[_id] || { ...DEFAULT_TEXT_FORMAT, fontSize: item.fontSize },
          })
        );

        // Map newTexts — include current format for each
        const newTextsArr = pageNewTexts.map((nt) => ({
          x:      nt.x,
          y:      nt.y,
          text:   nt.text,
          format: textFormats[nt.id] || DEFAULT_TEXT_FORMAT,
        }));

        editsPayload[String(pageNum)] = {
          drawings:    pageDrawings,
          editedTexts: editedTextsArr,
          newTexts:    newTextsArr,
          images:      pageImages,
        };
      }

      setSaveStatus("processing");

      const formData = new FormData();
      formData.append("file",  file, file.name);
      formData.append("edits", JSON.stringify(editsPayload));

      const response = await fetch(`${BACKEND_URL}/api/edit-pdf`, {
        method: "POST",
        body:   formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          (errData as { detail?: string }).detail ||
            `Backend error: ${response.status}`
        );
      }

      const blob = await response.blob();
      setSaveStatus("done");
      setResultBlob(blob);

      // Auto-download
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = `edited_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Error saving PDF via backend:", err);
      alert(
        "Failed to save PDF. Please try again.\n\n" +
          String(err)
      );
    } finally {
      setIsProcessing(false);
      setSaveStatus("idle");
    }
  };

  // Render Page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        
        if (!context) return;
        
        const outputScale = window.devicePixelRatio || 1;
        
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        const transform = outputScale !== 1 
          ? [outputScale, 0, 0, outputScale, 0, 0] 
          : undefined;

        const renderContext: any = {
          canvasContext: context,
          transform: transform as any,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Extract Text Content for editing overlay
        const textContent = await page.getTextContent();
        const extractedItems = textContent.items.map((item: any, index: number) => {
          // item.transform is [scaleX, skewY, skewX, scaleY, tx, ty]
          const tx = item.transform[4];
          const ty = item.transform[5];
          
          // Convert to viewport coordinates (handles Y-axis inversion and scaling)
          const [viewportX, viewportY] = viewport.convertToViewportPoint(tx, ty);
          
          // The scale from transform
          const scaleX = item.transform[0];
          const scaleY = item.transform[3];

          // Calculate dimensions using viewport scale
          const width = item.width * viewport.scale;
          // Approximate height based on font size (scaleY) and viewport scale
          const height = Math.abs(scaleY) * viewport.scale;

          return {
            id: index,
            originalText: item.str,
            x: viewportX,
            // viewportY is the baseline. We subtract the height to get the top-left corner.
            y: viewportY - height, 
            width: width,
            height: height,
            fontName: item.fontName,
            fontSize: height
          };
        });
        
        setTextItems(extractedItems);

      } catch (err) {
        console.error("Error rendering page:", err);
      }
    };
    
    renderPage();
  }, [pdfDoc, currentPage, scale]);

  return (
    <div className="space-y-6">
      {/* Hidden Inputs for File and Image Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* Upload Zone */}
      {!file && (
        <ToolDropzone
          onFiles={(files) => files[0] && handleFileSelection(files[0])}
          accept="application/pdf"
          multiple={false}
          fileTypeLabel="PDFs"
          buttonText="Choose Files"
        />
      )}

      {/* Editor Area (Full Screen Workspace) */}
      {file && !resultBlob && (
        <div className="fixed inset-0 z-[100] bg-slate-100 dark:bg-neutral-900 flex flex-col font-sans">
          
          {/* Top Toolbar */}
          <div className="h-16 bg-white dark:bg-neutral-950 border-b border-black/10 dark:border-white/10 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
            {/* Left: Branding & Close */}
            <div className="flex items-center gap-4">
              <button
                onClick={resetTool}
                className="p-2 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
                title="Close Editor"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1"></div>
              <span className="font-semibold text-black dark:text-white truncate max-w-[200px]">
                {file.name}
              </span>
            </div>

            {/* Center: Tools */}
            <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
              <button 
                onClick={() => setActiveTool("select")}
                className={`p-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${activeTool === 'select' ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70'}`}
                title="Hand Tool (Pan/Select)"
              >
                <Hand className="w-4 h-4" />
                <span>Pan</span>
              </button>
              
              <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1"></div>

              <button 
                onClick={() => setActiveTool("text")}
                className={`p-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${activeTool === 'text' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70'}`}
                title="Edit or Add Text"
              >
                <Type className="w-4 h-4" />
                <span>Text</span>
              </button>
              <button 
                onClick={() => setActiveTool("image")}
                className={`p-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${activeTool === 'image' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70'}`}
                title="Add Image"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Image</span>
              </button>
              
              <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1"></div>

              <button 
                onClick={() => setActiveTool("highlight")}
                className={`p-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${activeTool === 'highlight' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70'}`}
                title="Highlight Text"
              >
                <Highlighter className="w-4 h-4" />
                <span>Highlight</span>
              </button>

              <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1"></div>

              <button 
                onClick={() => setActiveTool("shape_rect")}
                className={`p-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${activeTool === 'shape_rect' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70'}`}
                title="Draw Rectangle"
              >
                <Square className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setActiveTool("shape_circle")}
                className={`p-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${activeTool === 'shape_circle' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70'}`}
                title="Draw Circle"
              >
                <Circle className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setActiveTool("shape_line")}
                className={`p-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${activeTool === 'shape_line' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70'}`}
                title="Draw Line"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Save Button moved to bottom right */}
            <div className="flex items-center gap-4">
              {/* Other top right buttons if any */}
            </div>
          </div>
          
          {/* Workspace Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar: Thumbnails */}
            <div className="w-64 bg-white dark:bg-neutral-950 border-r border-black/10 dark:border-white/10 flex flex-col z-10 shrink-0">
              <div className="p-4 border-b border-black/10 dark:border-white/10">
                <h4 className="font-semibold text-black/80 dark:text-white/80 text-sm">Pages</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {thumbnails.length === 0 ? (
                  // Loading state
                  Array.from({ length: totalPages || 1 }).map((_, i) => (
                    <div key={i} className="w-full aspect-[1/1.4] bg-slate-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg flex items-center justify-center animate-pulse">
                      <span className="text-xs font-bold text-black/30 dark:text-white/30">{i + 1}</span>
                    </div>
                  ))
                ) : (
                  thumbnails.map((src, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-full relative cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${currentPage === idx + 1 ? 'border-blue-500 shadow-sm' : 'border-transparent hover:border-blue-300'}`}
                    >
                      <img src={src} alt={`Page ${idx + 1}`} className="w-full h-auto bg-white" />
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold px-1.5 rounded">
                        {idx + 1}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Center: Main Canvas */}
            <div 
              ref={containerRef}
              className="flex-1 overflow-auto bg-slate-100 dark:bg-neutral-900 p-8 flex flex-col items-center relative"
            >
              <div className="relative bg-white shadow-xl border border-black/5 mx-auto transition-transform origin-top" 
                   style={{ 
                     width: canvasRef.current?.style.width || 'auto', 
                     height: canvasRef.current?.style.height || 'auto',
                     minHeight: "842px", // A4 ratio approx
                     minWidth: "595px" 
                   }}>
                <canvas ref={canvasRef} className="block" />
                
                {/* Interactive Layer */}
                <div 
                  className="absolute inset-0 z-10" 
                  style={{ width: canvasRef.current?.style.width, height: canvasRef.current?.style.height }}
                  onPointerDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    if (activeTool === "select" || activeTool === "hand") {
                      setSelectedTextId(null);
                      if (e.target instanceof Element && e.target.hasAttribute('data-shape-id')) {
                        setDraggingShape({ id: e.target.getAttribute('data-shape-id')!, startX: x, startY: y });
                      }
                      return;
                    }
                    
                    // If text tool and we clicked empty space, create a new text box
                    if (activeTool === "text") {
                      if (e.target instanceof Element && e.target.closest('[contenteditable="true"]')) return;
                      const newId = Date.now().toString();
                      setNewTexts(prev => ({ ...prev, [currentPage]: [...(prev[currentPage] || []), { id: newId, x, y, text: "" }] }));
                      setSelectedTextId(newId);
                      setTimeout(() => {
                        const el = document.getElementById(`text-edit-${newId}`);
                        if (el) el.focus();
                      }, 10);
                      return;
                    }

                    // If image tool, open file picker and save position
                    if (activeTool === "image") {
                      // Allow clicking anywhere to add an image unless clicking an existing image
                      if (e.target instanceof Element && e.target.closest('img')) return;
                      setPendingImagePos({ x, y });
                      imageInputRef.current?.click();
                      return;
                    }

                    if (activeTool === "highlight" || activeTool === "eraser" || activeTool.startsWith("shape_")) {
                      setIsDrawing(true);
                      setCurrentDraw({
                        id: Date.now().toString(),
                        type: activeTool,
                        startX: x,
                        startY: y,
                        x, y,
                        width: 0,
                        height: 0
                      });
                    }
                  }}
                  onPointerMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    if (draggingImageId) {
                      setImages(prev => ({
                        ...prev,
                        [currentPage]: (prev[currentPage] || []).map(img => 
                          img.id === draggingImageId ? { ...img, x: mouseX - img.width / 2, y: mouseY - img.height / 2 } : img
                        )
                      }));
                      return;
                    }

                    if (draggingShape) {
                      const dx = mouseX - draggingShape.startX;
                      const dy = mouseY - draggingShape.startY;
                      setDrawings(prev => ({
                        ...prev,
                        [currentPage]: (prev[currentPage] || []).map(draw => {
                          if (draw.id === draggingShape.id) {
                            if (draw.type === 'shape_line') {
                              return { ...draw, startX: draw.startX + dx, startY: draw.startY + dy, endX: draw.endX + dx, endY: draw.endY + dy };
                            }
                            return { ...draw, x: draw.x + dx, y: draw.y + dy };
                          }
                          return draw;
                        })
                      }));
                      setDraggingShape({ id: draggingShape.id, startX: mouseX, startY: mouseY });
                      return;
                    }

                    if (!isDrawing || !currentDraw) return;
                    
                    setCurrentDraw((prev: any) => ({
                      ...prev,
                      x: Math.min(prev.startX, mouseX),
                      y: Math.min(prev.startY, mouseY),
                      width: Math.abs(mouseX - prev.startX),
                      height: Math.abs(mouseY - prev.startY),
                      endX: mouseX,
                      endY: mouseY
                    }));
                  }}
                  onPointerUp={() => {
                    let changed = false;
                    if (draggingImageId) {
                      setDraggingImageId(null);
                      changed = true;
                    }
                    if (draggingShape) {
                      setDraggingShape(null);
                      changed = true;
                    }
                    if (isDrawing && currentDraw && (currentDraw.width > 5 || currentDraw.height > 5)) {
                      setDrawings(prev => ({ ...prev, [currentPage]: [...(prev[currentPage] || []), currentDraw] }));
                      changed = true;
                    }
                    setIsDrawing(false);
                    setCurrentDraw(null);
                    if (changed) setTimeout(saveSnapshot, 0);
                  }}
                  onPointerLeave={() => {
                    let changed = false;
                    if (draggingImageId) {
                      setDraggingImageId(null);
                      changed = true;
                    }
                    if (draggingShape) {
                      setDraggingShape(null);
                      changed = true;
                    }
                    if (isDrawing && currentDraw && (currentDraw.width > 5 || currentDraw.height > 5)) {
                      setDrawings(prev => ({ ...prev, [currentPage]: [...(prev[currentPage] || []), currentDraw] }));
                      changed = true;
                    }
                    setIsDrawing(false);
                    setCurrentDraw(null);
                    if (changed) setTimeout(saveSnapshot, 0);
                  }}
                >
                  {/* Freeform Drawings & Shapes */}
                  <svg className="absolute inset-0 z-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                    {[...(drawings[currentPage] || []), ...(currentDraw ? [currentDraw] : [])].map(draw => {
                      const shapeProps = {
                        'data-shape-id': draw.id,
                        style: {
                          pointerEvents: activeTool === 'select' ? 'auto' : 'none',
                          cursor: activeTool === 'select' ? 'move' : 'default'
                        } as React.CSSProperties
                      };

                      if (draw.type === 'highlight') {
                        return <rect key={draw.id} x={draw.x} y={draw.y} width={draw.width} height={draw.height} fill="rgba(253, 224, 71, 0.4)" style={{ mixBlendMode: 'multiply' }} />;
                      }
                      if (draw.type === 'eraser') {
                        return <rect key={draw.id} x={draw.x} y={draw.y} width={draw.width} height={draw.height} fill="white" />;
                      }
                      if (draw.type === 'shape_rect') {
                        return <rect key={draw.id} x={draw.x} y={draw.y} width={draw.width} height={draw.height} stroke="black" strokeWidth={3 * scale} fill="transparent" {...shapeProps} />;
                      }
                      if (draw.type === 'shape_circle') {
                        return <ellipse key={draw.id} cx={draw.x + draw.width/2} cy={draw.y + draw.height/2} rx={draw.width/2} ry={draw.height/2} stroke="black" strokeWidth={3 * scale} fill="transparent" {...shapeProps} />;
                      }
                      if (draw.type === 'shape_line') {
                        // For line, we want a larger hit area if possible, but transparent stroke is hard in SVG without a second line.
                        // We'll just add the props and stroke
                        return (
                          <g key={draw.id} {...shapeProps}>
                            {activeTool === 'select' && <line x1={draw.startX} y1={draw.startY} x2={draw.endX} y2={draw.endY} stroke="transparent" strokeWidth={15 * scale} />}
                            <line x1={draw.startX} y1={draw.startY} x2={draw.endX} y2={draw.endY} stroke="black" strokeWidth={3 * scale} />
                          </g>
                        );
                      }
                      return null;
                    })}
                  </svg>

                  {/* New Texts */}
                  {(newTexts[currentPage] || []).map(nt => {
                    const fmt = textFormats[nt.id] || DEFAULT_TEXT_FORMAT;
                    return (
                      <ContentEditableDiv
                        key={nt.id}
                        id={`text-edit-${nt.id}`}
                        contentEditable
                        suppressContentEditableWarning
                        onFocus={() => {
                          setSelectedTextId(nt.id);
                          if (!textFormats[nt.id]) {
                            setTextFormats(prev => ({ ...prev, [nt.id]: DEFAULT_TEXT_FORMAT }));
                          }
                        }}
                        onBlur={(e: any) => {
                          const newVal = e.currentTarget.innerHTML;
                          if (!e.currentTarget.innerText.trim()) {
                            setNewTexts(prev => ({ ...prev, [currentPage]: (prev[currentPage] || []).filter(p => p.id !== nt.id) }));
                          } else {
                            setNewTexts(prev => ({ ...prev, [currentPage]: (prev[currentPage] || []).map(p => p.id === nt.id ? { ...p, text: newVal } : p) }));
                          }
                          setTimeout(saveSnapshot, 0);
                        }}
                        className={`absolute outline-none cursor-text bg-white/80 shadow-[0_0_0_2px_rgba(59,130,246,0.5)] min-w-[120px] min-h-[24px] px-1 ${selectedTextId === nt.id ? 'ring-2 ring-blue-500' : ''}`}
                        style={{
                          left: `${nt.x}px`,
                          top: `${nt.y}px`,
                          fontSize: `${fmt.fontSize}px`,
                          fontFamily: fmt.fontFamily,
                          color: fmt.color,
                          fontWeight: fmt.isBold ? 'bold' : 'normal',
                          fontStyle: fmt.isItalic ? 'italic' : 'normal',
                          textDecoration: fmt.isUnderline ? 'underline' : 'none',
                          textAlign: fmt.alignment,
                          zIndex: 20,
                        }}
                        html={nt.text}
                      />
                    );
                  })}

                  {/* Inserted Images */}
                  {(images[currentPage] || []).map(img => (
                    <div 
                      key={img.id}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDraggingImageId(img.id);
                      }}
                      className="absolute group border-2 border-transparent hover:border-blue-500 cursor-move"
                      style={{ left: img.x, top: img.y, width: img.width, height: img.height }}
                    >
                      <img src={img.dataUrl} alt="Inserted" className="w-full h-full object-contain pointer-events-none" />
                      <button 
                        onClick={() => setImages(prev => ({ ...prev, [currentPage]: (prev[currentPage] || []).filter(p => p.id !== img.id) }))}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hidden group-hover:block z-10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Extracted PDF Texts (Editable Overlay) */}
                  {textItems.map((item) => {
                    const fmt = textFormats[item.id] || { ...DEFAULT_TEXT_FORMAT, fontSize: item.fontSize };
                    return (
                      <ContentEditableDiv
                        key={item.id}
                        id={`text-edit-${item.id}`}
                        contentEditable={activeTool === "text"}
                        suppressContentEditableWarning
                        onFocus={() => {
                          setSelectedTextId(item.id.toString());
                          if (!textFormats[item.id]) {
                            setTextFormats(prev => ({ ...prev, [item.id]: { ...DEFAULT_TEXT_FORMAT, fontSize: item.fontSize } }));
                          }
                        }}
                        onBlur={(e: any) => {
                          const newText = e.currentTarget.innerHTML;
                          if (newText !== item.originalText) {
                            setEditedTexts(prev => ({
                              ...prev,
                              [currentPage]: {
                                ...(prev[currentPage] || {}),
                                [item.id]: { newText, item }
                              }
                            }));
                            setTimeout(saveSnapshot, 0);
                          } else {
                            // if reverted to original, remove from state
                            const copy = { ...editedTexts };
                            if (copy[currentPage]) {
                              const pageCopy = { ...copy[currentPage] };
                              delete pageCopy[item.id];
                              copy[currentPage] = pageCopy;
                            }
                            setEditedTexts(copy);
                            setTimeout(saveSnapshot, 0);
                          }
                        }}
                        className={`absolute outline-none whitespace-pre-wrap
                          ${activeTool === "text" ? "hover:outline hover:outline-blue-400/50 hover:bg-blue-400/10 cursor-text" : "pointer-events-none"}
                          ${editedTexts[currentPage]?.[item.id] !== undefined ? "bg-white shadow-[0_0_0_2px_white]" : "text-transparent"}
                          focus:bg-white focus:shadow-[0_0_0_2px_white] focus:text-black ${selectedTextId === item.id.toString() ? 'ring-2 ring-blue-500' : ''}
                        `}
                        style={{
                          left: `${item.x}px`,
                          top: `${item.y}px`,
                          width: `${item.width}px`,
                          height: `${item.height}px`,
                          fontSize: `${fmt.fontSize}px`,
                          lineHeight: `${item.height}px`,
                          fontFamily: fmt.fontFamily,
                          color: editedTexts[currentPage]?.[item.id] !== undefined || selectedTextId === item.id.toString() ? fmt.color : 'transparent',
                          fontWeight: fmt.isBold ? 'bold' : 'normal',
                          fontStyle: fmt.isItalic ? 'italic' : 'normal',
                          textDecoration: fmt.isUnderline ? 'underline' : 'none',
                          textAlign: fmt.alignment
                        }}
                        html={editedTexts[currentPage]?.[item.id] !== undefined ? editedTexts[currentPage][item.id].newText : item.originalText}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Floating Zoom Controls (Bottom Center of Canvas Area) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 ml-32 flex items-center gap-2 bg-white dark:bg-neutral-900 p-2 rounded-xl shadow-lg border border-black/10 dark:border-white/10 z-20">
              <button 
                onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold w-12 text-center text-black/70 dark:text-white/70">{Math.round(scale * 100)}%</span>
              <button 
                onClick={() => setScale(s => Math.min(3, s + 0.25))}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            {/* Right Sidebar: Text Styles */}
            {(selectedTextId || activeTool === 'text') && (
              <div className="w-[300px] bg-white dark:bg-neutral-950 border-l border-gray-200 dark:border-white/10 flex flex-col z-10 shrink-0 relative pb-20">
                <div className="p-6 space-y-8 overflow-y-auto">
                  {/* Text Styles */}
                  <div className="space-y-4">
                    <h4 className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Text Styles</h4>
                    
                    {/* Font & Size */}
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <select 
                          disabled={!selectedTextId}
                          value={selectedTextId ? textFormats[selectedTextId]?.fontFamily || 'Helvetica' : 'Helvetica'}
                          onChange={(e) => {
                            if (selectedTextId) {
                              setTextFormats(prev => ({ ...prev, [selectedTextId]: { ...prev[selectedTextId], fontFamily: e.target.value } }));
                              markFormatAsEdited(selectedTextId);
                              setTimeout(saveSnapshot, 0);
                            }
                          }}
                          className="w-full text-[13px] px-3 py-1.5 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded appearance-none focus:outline-none focus:border-gray-400 dark:focus:border-neutral-500 disabled:opacity-50 text-gray-700 dark:text-gray-200"
                        >
                          <option value="Helvetica">Arial</option>
                          <option value="Times-Roman">Times New Roman</option>
                          <option value="Courier">Courier</option>
                        </select>
                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                          <ChevronDown className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                        </div>
                      </div>
                      <div className="w-20 relative">
                        <select
                          disabled={!selectedTextId}
                          value={selectedTextId ? Math.round(textFormats[selectedTextId]?.fontSize || 14) : 14}
                          onChange={(e) => {
                            if (selectedTextId) {
                              setTextFormats(prev => ({ ...prev, [selectedTextId]: { ...prev[selectedTextId], fontSize: Number(e.target.value) } }));
                              markFormatAsEdited(selectedTextId);
                              setTimeout(saveSnapshot, 0);
                            }
                          }}
                          className="w-full text-[13px] px-3 py-1.5 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded appearance-none focus:outline-none focus:border-gray-400 dark:focus:border-neutral-500 disabled:opacity-50 text-gray-700 dark:text-gray-200"
                        >
                          {[10, 11, 12, 13, 14, 16, 18, 20, 24, 36].map(size => (
                             <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                          <ChevronDown className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                        </div>
                      </div>
                    </div>

                    {/* Formatting Icons */}
                    <div className="flex gap-4 items-center px-1">
                      <button
                        disabled={!selectedTextId}
                        onPointerDown={(e) => { e.preventDefault(); handleFormatCommand('bold'); }}
                        className={`p-1 transition-colors ${activeFormats.bold ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-neutral-800 rounded' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50'}`}
                      >
                        <Bold className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        disabled={!selectedTextId}
                        onPointerDown={(e) => { e.preventDefault(); handleFormatCommand('italic'); }}
                        className={`p-1 transition-colors ${activeFormats.italic ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-neutral-800 rounded' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50'}`}
                      >
                        <Italic className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        disabled={!selectedTextId}
                        onPointerDown={(e) => { e.preventDefault(); handleFormatCommand('underline'); }}
                        className={`p-1 transition-colors ${activeFormats.underline ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-neutral-800 rounded' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50'}`}
                      >
                        <Underline className="w-[18px] h-[18px]" />
                      </button>
                      <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 relative">
                         <div className="text-[16px] font-serif font-bold italic leading-none">A</div>
                         <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-gray-400 dark:bg-gray-500"></div>
                      </button>
                    </div>

                    {/* Alignment Icons */}
                    <div className="flex gap-4 items-center px-1 pt-1">
                      {(['left', 'center', 'right'] as const).map(align => (
                        <button 
                          key={align}
                          disabled={!selectedTextId}
                          onClick={() => {
                            if (selectedTextId) {
                              setTextFormats(prev => ({ ...prev, [selectedTextId]: { ...prev[selectedTextId], alignment: align } }));
                              markFormatAsEdited(selectedTextId);
                              setTimeout(saveSnapshot, 0);
                            }
                          }}
                          className={`p-1 transition-colors ${selectedTextId && textFormats[selectedTextId]?.alignment === align ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-neutral-800 rounded' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50'}`}
                        >
                          {align === 'left' && <AlignLeft className="w-[18px] h-[18px]" />}
                          {align === 'center' && <AlignCenter className="w-[18px] h-[18px]" />}
                          {align === 'right' && <AlignRight className="w-[18px] h-[18px]" />}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 px-1">
                       <Link2 className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    </div>
                  </div>

                  {/* Current Color */}
                  <div className="space-y-3">
                    <h4 className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Current Color</h4>
                    <div className="flex items-center gap-3">
                      <div className="relative w-6 h-6 rounded-full border border-gray-300 dark:border-neutral-600 shadow-sm flex items-center justify-center p-0.5">
                        <div className="w-full h-full rounded-full" style={{ backgroundColor: activeFormats.color }}></div>
                        <input 
                          type="color" 
                          disabled={!selectedTextId}
                          value={activeFormats.color}
                          onChange={(e) => {
                             if (selectedTextId) {
                               setTextFormats(prev => ({ ...prev, [selectedTextId]: { ...prev[selectedTextId], color: e.target.value } }));
                               handleFormatCommand('foreColor', e.target.value);
                             }
                          }}
                          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                        />
                      </div>
                      <div className="w-5 h-5 border border-gray-300 dark:border-neutral-600 rounded flex items-center justify-center cursor-not-allowed opacity-50">
                        {/* Transparent/Stroke icon mock */}
                        <div className="w-3 h-3 border border-gray-400 dark:border-gray-500"></div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div className="space-y-3">
                    <h4 className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Custom Colors</h4>
                    <div className="flex items-center gap-2">
                      {customColors.slice(0, 3).map(color => (
                        <button
                          key={color}
                          disabled={!selectedTextId}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            if (selectedTextId) {
                               setTextFormats(prev => ({ ...prev, [selectedTextId]: { ...prev[selectedTextId], color: color } }));
                               handleFormatCommand('foreColor', color);
                            }
                          }}
                          className="w-5 h-5 rounded-full border border-gray-300 dark:border-neutral-600 disabled:opacity-50"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <div className="relative w-5 h-5 rounded-full flex items-center justify-center cursor-pointer text-gray-400 dark:text-gray-500 border border-transparent hover:border-gray-200 dark:hover:border-neutral-600">
                        <Plus className="w-4 h-4" />
                        <input
                          type="color"
                          onChange={(e) => {
                            const newColor = e.target.value;
                            if (!customColors.includes(newColor)) {
                              setCustomColors(prev => [...prev, newColor]);
                            }
                            if (selectedTextId) {
                              setTextFormats(prev => ({ ...prev, [selectedTextId]: { ...prev[selectedTextId], color: newColor } }));
                              handleFormatCommand('foreColor', newColor);
                            }
                          }}
                          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                        />
                      </div>
                      <div className="ml-auto p-1 cursor-pointer text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-neutral-600 rounded">
                        <Trash2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Undo / Redo */}
                  <div className="flex items-center gap-4 pt-10">
                    <button
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                      title="Undo"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                      title="Redo"
                    >
                      <Redo2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Save Button (Fixed to bottom) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20" style={{ transform: 'translateX(10px)' }}>
                  <button
                    onClick={handleSavePdf}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#e53935] hover:bg-[#d32f2f] disabled:opacity-70 text-white font-bold rounded-lg shadow-[0_4px_10px_rgba(229,57,53,0.3)] transition-all text-lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {saveStatus === "uploading"  && "Uploading…"}
                        {saveStatus === "processing" && "Processing…"}
                        {saveStatus === "done"       && "Done!"}
                        {saveStatus === "idle"       && "Saving…"}
                      </>
                    ) : (
                      <>
                        Save changes
                        <ArrowRight className="w-5 h-5 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
