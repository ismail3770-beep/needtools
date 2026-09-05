"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  
  if (name === 'CustomPdf') {
    return (
      <svg 
        width={props.size || 24} 
        height={props.size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={props.className}
      >
        <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="#F43F5E" fillOpacity="0.2" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 15C9 13.8954 9.89543 13 11 13H11.5V17H11C9.89543 17 9 16.1046 9 15Z" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 13H16.5C17.3284 13 18 13.6716 18 14.5C18 15.3284 17.3284 16 16.5 16H15V19" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  // @ts-expect-error - indexing Lucide icons dynamically
  const IconComponent = LucideIcons[name] || LucideIcons.HelpCircle;
  return <IconComponent {...props} />;
}
