import os
import glob
import re

svg_dir = r"C:\Users\fulba\Downloads\pdficon\ilovepdf-com"
svg_files = glob.glob(os.path.join(svg_dir, "*.svg"))

out_lines = [
    '"use client";',
    'import React from "react";',
    ''
]

# We will replace fill="#E2E8F0" or similar with "currentColor" where appropriate.
# Since ilovepdf icons often use red (#E5322D) or similar, let's just replace all non-none fills with currentColor.
# Actually, it's safer to just let the user see them first. We can force fill="currentColor" on the SVG tag and remove hardcoded fills.

for filepath in svg_files:
    filename = os.path.basename(filepath)
    name, _ = os.path.splitext(filename)
    # clean name for react component
    comp_name = "Icon_" + re.sub(r'[^a-zA-Z0-9]', '_', name)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        svg_content = f.read()
    
    # Strip <?xml ... ?> if exists
    svg_content = re.sub(r'<\?xml[^>]*\?>', '', svg_content)
    # Strip <svg ...> to insert our own props, or just replace it.
    
    # Let's replace the <svg ...> tag with <svg className={className} width={size} height={size} ...>
    svg_content = re.sub(r'<svg([^>]*)>', r'<svg\1 className={className} width={size} height={size} fill="currentColor">', svg_content, count=1)
    
    # Convert camelCase for React props (e.g., fill-rule -> fillRule)
    svg_content = re.sub(r'-(.)', lambda m: m.group(1).upper(), svg_content)
    svg_content = svg_content.replace('class=', 'className=')
    svg_content = svg_content.replace('viewbox=', 'viewBox=')
    svg_content = svg_content.replace('strokeWidth=', 'strokeWidth=')
    svg_content = svg_content.replace('fillRule=', 'fillRule=')
    svg_content = svg_content.replace('clipRule=', 'clipRule=')
    
    # Try to make them adaptable by replacing specific colors with currentColor, or just strip fill="#..."
    # Ilovepdf uses '#e5322d' (red) heavily. Let's replace it with currentColor.
    svg_content = re.sub(r'fill="[^n][^o][^n][^e][^"]*"', 'fill="currentColor"', svg_content, flags=re.IGNORECASE)
    # Wait, the above regex is bad. Let's just do:
    svg_content = re.sub(r'fill="#[0-9a-fA-F]{3,6}"', 'fill="currentColor"', svg_content)
    
    out_lines.append(f"export const {comp_name} = ({{ size = 24, className = '' }}: {{ size?: number | string, className?: string }}) => (")
    out_lines.append(f"  {svg_content.strip()}")
    out_lines.append(f");")
    out_lines.append("")

with open('src/components/icons/IlovePdfIcons.tsx', 'w', encoding='utf-8') as f:
    f.write("\n".join(out_lines))

print("Icons built.")
