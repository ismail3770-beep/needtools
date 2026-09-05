import React from "react";
import { ToolItem } from "@/types/tool";
import { FileIcon, ImageIcon, Wand2Icon, Code2Icon, LineChartIcon, Settings2Icon, CheckCircle2Icon } from "lucide-react";

export function ToolHeroMockup({ tool }: { tool: ToolItem }) {
  // Determine which fake UI to render based on category
  const renderCategoryUI = () => {
    switch (tool.category) {
      case "pdf":
        return (
          <>
            <div className="rounded-xl bg-black/5 dark:bg-white/5 p-4 flex flex-col items-center justify-center mb-4 border border-black/5 dark:border-white/5 h-40">
               <FileIcon className="w-12 h-12 text-rose-500 mb-3" strokeWidth={1.5} />
               <div className="h-2 w-24 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden relative">
                 <div className="absolute top-0 left-0 h-full w-2/3 bg-rose-500 rounded-full animate-pulse"></div>
               </div>
               <span className="text-[10px] text-black/40 dark:text-white/40 font-semibold mt-3 uppercase tracking-widest">Processing PDF...</span>
            </div>
            <div className="space-y-3">
               <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Compression Level</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="flex-1 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60">Low</button>
                    <button className="flex-1 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold bg-rose-500 text-white border border-rose-600">Medium</button>
                    <button className="flex-1 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60">Extreme</button>
                  </div>
               </div>
            </div>
          </>
        );

      case "image":
        return (
          <>
            <div className="rounded-xl bg-black/5 dark:bg-white/5 p-4 flex flex-col items-center justify-center mb-4 border border-black/5 dark:border-white/5 h-40 overflow-hidden relative group">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-sky-400 opacity-20"></div>
               <ImageIcon className="w-12 h-12 text-sky-500 z-10" strokeWidth={1.5} />
               <div className="absolute inset-x-0 bottom-0 h-1/2 bg-black/10 dark:bg-white/10 backdrop-blur-sm border-t border-white/20 transform translate-y-2 group-hover:translate-y-0 transition-transform"></div>
            </div>
            <div className="space-y-3">
               <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Output Format</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="flex-1 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60">JPG</button>
                    <button className="flex-1 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold bg-sky-500 text-white border border-sky-600">WEBP</button>
                    <button className="flex-1 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60">PNG</button>
                  </div>
               </div>
            </div>
          </>
        );

      case "ai":
        return (
          <>
            <div className="rounded-xl bg-black/5 dark:bg-white/5 p-4 flex flex-col justify-end mb-4 border border-black/5 dark:border-white/5 h-40 space-y-3 relative overflow-hidden">
               <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full"></div>
               <div className="self-end bg-black/10 dark:bg-white/10 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                 <div className="h-1.5 w-12 bg-black/20 dark:bg-white/20 rounded-full"></div>
               </div>
               <div className="self-start bg-indigo-500 text-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-[90%] space-y-1.5 shadow-sm">
                 <div className="flex items-center gap-1.5 mb-1"><Wand2Icon className="w-3 h-3" /><span className="text-[9px] font-bold">AI</span></div>
                 <div className="h-1 w-16 bg-white/40 rounded-full"></div>
                 <div className="h-1 w-20 bg-white/40 rounded-full"></div>
                 <div className="h-1 w-12 bg-white/40 rounded-full"></div>
               </div>
            </div>
            <div className="space-y-3">
               <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Model Engine</span>
                  </div>
                  <div className="h-7 w-full rounded-lg border border-black/10 dark:border-white/10 flex items-center px-2 justify-between bg-black/5 dark:bg-white/5">
                     <span className="text-[10px] font-semibold text-black/60 dark:text-white/60">GPT-4 Turbo</span>
                     <Settings2Icon className="w-3.5 h-3.5 text-black/40 dark:text-white/40" />
                  </div>
               </div>
            </div>
          </>
        );

      case "seo":
        return (
          <>
            <div className="rounded-xl bg-black/5 dark:bg-white/5 p-4 flex flex-col mb-4 border border-black/5 dark:border-white/5 h-40">
               <div className="flex items-center gap-2 mb-3">
                 <LineChartIcon className="w-5 h-5 text-emerald-500" strokeWidth={2} />
                 <span className="text-[10px] font-bold text-black/70 dark:text-white/70 tracking-tight">SEO Score</span>
               </div>
               <div className="flex items-end gap-1.5 h-16 w-full mb-3">
                  <div className="w-1/4 bg-emerald-500/40 rounded-t-sm h-[40%]"></div>
                  <div className="w-1/4 bg-emerald-500/60 rounded-t-sm h-[60%]"></div>
                  <div className="w-1/4 bg-emerald-500/80 rounded-t-sm h-[85%]"></div>
                  <div className="w-1/4 bg-emerald-500 rounded-t-sm h-[100%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
               </div>
               <div className="mt-auto flex items-center gap-2">
                 <CheckCircle2Icon className="w-4 h-4 text-emerald-500" />
                 <span className="text-[9px] font-medium text-black/50 dark:text-white/50">All tags optimized</span>
               </div>
            </div>
            <div className="space-y-2">
                <div className="h-6 w-full rounded-md border border-black/10 dark:border-white/10 flex items-center px-2 gap-2">
                    <Code2Icon className="w-3 h-3 text-black/40 dark:text-white/40" />
                    <div className="h-1.5 flex-1 bg-black/5 dark:bg-white/5 rounded-full"></div>
                </div>
                <div className="h-6 w-full rounded-md border border-black/10 dark:border-white/10 flex items-center px-2 gap-2">
                    <Code2Icon className="w-3 h-3 text-black/40 dark:text-white/40" />
                    <div className="h-1.5 flex-1 bg-black/5 dark:bg-white/5 rounded-full"></div>
                </div>
            </div>
          </>
        );

      default:
        // Generic utility mockup
        return (
          <>
            <div className="rounded-xl bg-black/5 dark:bg-white/5 p-4 flex flex-col items-center justify-center mb-4 border border-black/5 dark:border-white/5 h-40">
               <Settings2Icon className="w-10 h-10 text-slate-400 animate-pulse mb-4" strokeWidth={1.5} />
               <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-black/10 dark:bg-white/10 border border-black/5 dark:border-white/5"></div>
                  <div className="w-8 h-8 rounded-lg bg-black dark:bg-white shadow-md"></div>
                  <div className="w-8 h-8 rounded-lg bg-black/10 dark:bg-white/10 border border-black/5 dark:border-white/5"></div>
               </div>
            </div>
            <div className="space-y-3">
               <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Action</span>
                  </div>
                  <button className="w-full h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold shadow-md">
                     Process Data
                  </button>
               </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="w-full max-w-[280px] rounded-2xl bg-white p-4 shadow-2xl dark:bg-neutral-900 text-black dark:text-white relative z-10 mx-auto transform hover:scale-105 transition-transform duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 truncate max-w-[150px]">
          {tool.name}
        </span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-black/20 dark:bg-white/20"></div>
          <div className="w-2 h-2 rounded-full bg-black/20 dark:bg-white/20"></div>
          <div className="w-2 h-2 rounded-full bg-black/20 dark:bg-white/20"></div>
        </div>
      </div>
      
      {/* Dynamic Fake UI Content */}
      {renderCategoryUI()}
    </div>
  );
}
