"use client";

import React, { useEffect } from "react";

/**
* Auto-focuses the first primary input/textarea inside the tool workspace.
* Skipped on coarse pointers (mobile) to prevent the virtual keyboard
* from popping open uninvited — which harms the mobile UX.
*/
export function ToolFocusWrapper({ children }: { children: React.ReactNode }) {
useEffect(() => {
// Only desktop keyboards benefit from auto-focus
if (window.matchMedia("(pointer: coarse)").matches) return;

const timer = setTimeout(() => {
const el = document.querySelector<HTMLElement>(
"[data-tool-workspace] textarea:not([readonly]), " +
"[data-tool-workspace] input[type='text'], " +
"[data-tool-workspace] input:not([type='checkbox']):not([type='range']):not([type='color']):not([type='radio']):not([type='button'])"
);
el?.focus();
}, 150);

return () => clearTimeout(timer);
}, []);

return (
<div data-tool-workspace="true" className="contents">
{children}
</div>
);
}
