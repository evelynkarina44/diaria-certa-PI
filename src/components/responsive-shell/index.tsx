import React, { type ReactNode } from 'react';
export type ShellProps = { children: ReactNode; routeName: string; navigation: any };
// Native keeps the existing stack, safe areas, and mobile menu unchanged.
export function ResponsiveShell({ children }: ShellProps) { return <>{children}</>; }
