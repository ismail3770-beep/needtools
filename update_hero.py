import re

with open('src/components/home/HeroSection.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the mockup container background to be slightly less stark, maybe keep it white but add subtle color
# Actually, the user specifically mentioned the items themselves are black-and-white.

# 1. Image Compressor Mockup
img_mockup_old = """                {/* Image Compressor Mockup */}
                <div className="flex gap-4 p-3 bg-white dark:bg-neutral-950 rounded-xl shadow-sm border border-black/10 dark:border-white/10">
                  <div className="w-12 h-12 rounded-lg bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-black dark:text-white">photo.jpg</span>
                      <span className="text-[10px] font-bold text-black/50 dark:text-white/50">-75%</span>
                    </div>
                    <div className="h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-black dark:bg-white w-[25%] rounded-full" />
                    </div>
                  </div>
                </div>"""

img_mockup_new = """                {/* Image Compressor Mockup */}
                <div className="flex gap-4 p-3 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-blue-100 dark:border-blue-900 hover:border-blue-300 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">photo.jpg</span>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">-75%</span>
                    </div>
                    <div className="h-1.5 bg-blue-50 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[25%] rounded-full" />
                    </div>
                  </div>
                </div>"""

content = content.replace(img_mockup_old, img_mockup_new)


# 2. Password Generator Mockup
pwd_mockup_old = """                {/* Password Generator Mockup */}
                <div className="flex gap-4 p-3 bg-white dark:bg-neutral-950 rounded-xl shadow-sm border border-black/10 dark:border-white/10">
                  <div className="w-12 h-12 rounded-lg bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2 py-1">
                    <span className="text-xs font-bold text-black dark:text-white">Password Generator</span>
                    <div className="h-6 bg-black/5 dark:bg-white/5 rounded flex items-center px-2">
                      <span className="font-mono text-[10px] text-black/60 dark:text-white/60 tracking-widest">q7$Xp9!wM#2k</span>
                    </div>
                  </div>
                </div>"""

pwd_mockup_new = """                {/* Password Generator Mockup */}
                <div className="flex gap-4 p-3 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-emerald-100 dark:border-emerald-900 hover:border-emerald-300 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2 py-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Password Generator</span>
                    <div className="h-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded flex items-center px-2">
                      <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300 tracking-widest">q7$Xp9!wM#2k</span>
                    </div>
                  </div>
                </div>"""
content = content.replace(pwd_mockup_old, pwd_mockup_new)


# 3. QR Code Mockup
qr_mockup_old = """                {/* QR Code Mockup */}
                <div className="flex gap-4 p-3 bg-white dark:bg-neutral-950 rounded-xl shadow-sm border border-black/10 dark:border-white/10">
                  <div className="w-12 h-12 rounded-lg bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 flex items-center justify-center shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2 py-1">
                    <span className="text-xs font-bold text-black dark:text-white">QR Code Link</span>
                    <div className="flex gap-2">
                      <div className="h-4 w-4 bg-black dark:bg-white rounded-sm" />
                      <div className="h-4 w-4 bg-black/20 dark:bg-white/20 rounded-sm" />
                      <div className="h-4 flex-1 bg-black/5 dark:bg-white/10 rounded-sm" />
                    </div>
                  </div>
                </div>"""

qr_mockup_new = """                {/* QR Code Mockup */}
                <div className="flex gap-4 p-3 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-purple-100 dark:border-purple-900 hover:border-purple-300 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2 py-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">QR Code Link</span>
                    <div className="flex gap-2 items-center h-4 mt-1">
                      <div className="h-4 w-4 bg-purple-500 dark:bg-purple-400 rounded-sm" />
                      <div className="h-4 w-4 bg-purple-300 dark:bg-purple-600 rounded-sm" />
                      <div className="h-4 flex-1 bg-gradient-to-r from-purple-100 to-transparent dark:from-purple-900/40 rounded-sm" />
                    </div>
                  </div>
                </div>"""
content = content.replace(qr_mockup_old, qr_mockup_new)

with open('src/components/home/HeroSection.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done replacing.")
