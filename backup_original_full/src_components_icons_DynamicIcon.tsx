"use client";

import React from "react";
import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
// @ts-expect-error - indexing Lucide icons dynamically
const IconComponent = Icons[name] || Icons.HelpCircle;
return <IconComponent {...props} />;
}
