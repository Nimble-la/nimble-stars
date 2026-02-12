"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface HeaderProps {
  title?: string;
  actions?: ReactNode;
  onMenuClick: () => void;
}

export function Header({ title, actions, onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>
      {title && (
        <h1 className="text-lg font-semibold">{title}</h1>
      )}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  );
}
