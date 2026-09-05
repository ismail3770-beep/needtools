import React from "react";
import { ToolItem } from "@/types/tool";
import { CheckCircle2, ChevronRight, FileCheck, Layers } from "lucide-react";

interface HowToUseSectionProps {
  tool: ToolItem;
}

export function HowToUseSection({ tool }: HowToUseSectionProps) {
  return (
    <section className="py-12 space-y-16">
      
      {/* Features Grid (Top) */}
      {tool.features && tool.features.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {tool.features.map((feat, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="shrink-0 pt-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
          {/* Always add a generic privacy feature if they don't have exactly 4 to fill the 2x2 grid nicely, though map is fine */}
          {tool.features.length % 2 !== 0 && (
            <div className="flex gap-4">
              <div className="shrink-0 pt-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Safe & Secure at Every Step
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  NeedTools uses client-side processing. Your files never leave your device, ensuring maximum privacy and security.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* How-To Box (Bottom) */}
      {tool.howToSteps && tool.howToSteps.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="flex flex-col lg:flex-row items-center">
            
            {/* Steps Left Side */}
            <div className="lg:w-1/2 p-8 sm:p-12 space-y-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                How to use {tool.name} Online for Free
              </h2>
              
              <ul className="space-y-6">
                {tool.howToSteps.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="pt-1 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                      <strong>{step.title.replace(/^\d+\.\s*/, '')}:</strong> {step.description}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Illustration Right Side */}
            <div className="lg:w-1/2 w-full p-8 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 self-stretch min-h-[300px]">
               <div className="relative w-full max-w-sm aspect-video flex items-center justify-center gap-4">
                  {/* Fake File Graphic */}
                  <div className="w-24 h-32 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col p-3">
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                      <FileCheck className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded mt-2" />
                  </div>

                  <ChevronRight className="w-8 h-8 text-slate-400" />

                  {/* Fake Processed Graphic */}
                  <div className="w-24 h-32 bg-blue-600 rounded-xl shadow-sm border border-blue-700 flex flex-col p-3 text-white">
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-blue-400/50 rounded-lg">
                       <Layers className="w-8 h-8 text-white" />
                    </div>
                    <div className="h-4 w-full bg-blue-500 rounded mt-2" />
                  </div>
               </div>
            </div>

          </div>
        </div>
      )}
      
    </section>
  );
}
