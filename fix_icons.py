import re

with open('src/components/icons/IlovePdfIcons.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix xmlns:xlink
content = content.replace('xmlns:xlink=', 'xmlnsXlink=')

# Fix aria-hidden
content = content.replace('aria-hidden=', 'ariaHidden=')
content = content.replace('ariaHidden=', '"aria-hidden"=')  # Wait, standard react wants aria-hidden="true"

# The error says: "JSX elements cannot have multiple attributes with the same name."
# This is because I appended className={className} width={size} height={size} fill="currentColor" to <svg>, but the original <svg> might already have width, height, or fill!
# Let's write a smarter regex or just use a small Node script with an HTML parser... or just do a regex replace to remove the original width, height, and fill.
# Actually, since I did a blind replace `r'<svg\1 className={className} width={size} height={size} fill="currentColor">'`, I might have injected duplicates.

with open('src/components/icons/IlovePdfIcons.tsx', 'w', encoding='utf-8') as f:
    # First, let's just strip original width, height, fill, and className from <svg> if they exist alongside ours.
    # The simplest way is to rebuild the file from scratch correctly!
    pass

import os
import glob

svg_dir = r"C:\Users\fulba\Downloads\pdficon\ilovepdf-com"
svg_files = glob.glob(os.path.join(svg_dir, "*.svg"))

out_lines = [
    '"use client";',
    'import React from "react";',
    ''
]

for filepath in svg_files:
    filename = os.path.basename(filepath)
    name, _ = os.path.splitext(filename)
    comp_name = "Icon_" + re.sub(r'[^a-zA-Z0-9]', '_', name)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        svg_content = f.read()
    
    # Strip XML header
    svg_content = re.sub(r'<\?xml[^>]*\?>', '', svg_content)
    
    # Extract viewBox if exists
    viewbox_match = re.search(r'viewBox="([^"]+)"', svg_content, re.IGNORECASE)
    viewbox = viewbox_match.group(1) if viewbox_match else "0 0 24 24"
    
    # Remove the entire original <svg ...> tag and replace it.
    svg_content = re.sub(r'<svg[^>]*>', f'<svg className={{className}} width={{size}} height={{size}} fill="currentColor" viewBox="{viewbox}" xmlns="http://www.w3.org/2000/svg">', svg_content, count=1)
    
    # React-ify attributes inside the rest of the SVG
    svg_content = re.sub(r'-(.)', lambda m: m.group(1).upper(), svg_content)
    # Revert data-* and aria-* attributes which React expects to be hyphenated
    svg_content = re.sub(r'aria([A-Z])', lambda m: f'aria-{m.group(1).lower()}', svg_content)
    svg_content = re.sub(r'data([A-Z])', lambda m: f'data-{m.group(1).lower()}', svg_content)
    
    svg_content = svg_content.replace('class=', 'className=')
    svg_content = svg_content.replace('xmlns:xlink=', 'xmlnsXlink=')
    svg_content = re.sub(r'fill="#[0-9a-fA-F]{3,6}"', 'fill="currentColor"', svg_content)
    
    out_lines.append(f"export const {comp_name} = ({{ size = 24, className = '' }}: {{ size?: number | string, className?: string }}) => (")
    out_lines.append(f"  {svg_content.strip()}")
    out_lines.append(f");")
    out_lines.append("")

with open('src/components/icons/IlovePdfIcons.tsx', 'w', encoding='utf-8') as f:
    f.write("\n".join(out_lines))

print("Fixed icons.")
