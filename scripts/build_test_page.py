import os
import glob
import re

svg_dir = r"C:\Users\fulba\Downloads\pdficon\ilovepdf-com"
svg_files = glob.glob(os.path.join(svg_dir, "*.svg"))

imports = []
grid_items = []

for filepath in svg_files:
    filename = os.path.basename(filepath)
    name, _ = os.path.splitext(filename)
    comp_name = "Icon_" + re.sub(r'[^a-zA-Z0-9]', '_', name)
    
    imports.append(comp_name)
    grid_items.append(f"""
        <div className="flex flex-col items-center p-4 bg-white dark:bg-neutral-900 border rounded shadow-sm">
            <{comp_name} size={{48}} className="text-rose-600 mb-4" />
            <span className="text-xs text-center break-all font-mono">{filename}</span>
        </div>
    """)

page_content = f"""
import React from 'react';
import {{ {', '.join(imports)} }} from '@/components/icons/IlovePdfIcons';

export default function TestIconsPage() {{
  return (
    <div className="p-10 min-h-screen bg-slate-50 dark:bg-neutral-950">
      <h1 className="text-2xl font-bold mb-8 text-center text-slate-800 dark:text-slate-200">Exported Icons Gallery</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {''.join(grid_items)}
      </div>
    </div>
  );
}}
"""

os.makedirs('src/app/test-icons', exist_ok=True)
with open('src/app/test-icons/page.tsx', 'w', encoding='utf-8') as f:
    f.write(page_content)

print("Test page built.")
