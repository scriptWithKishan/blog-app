"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sun, Moon, Sparkles, Flame, TreePine } from "lucide-react";

const THEMES = [
  { id: "light", name: "Light", icon: Sun },
  { id: "dark", name: "Dark", icon: Moon },
  { id: "midnight", name: "Midnight", icon: Sparkles },
  { id: "rose", name: "Rose", icon: Flame },
  { id: "emerald", name: "Emerald", icon: TreePine },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const selectedTheme = THEMES.find((t) => t.id === theme) || THEMES[1];
  const SelectedIcon = selectedTheme?.icon || Moon;

  return (
    <Select value={theme} onValueChange={(val) => val && setTheme(val)}>
      <SelectTrigger className="w-36">
        <div className="flex items-center gap-2">
          <SelectedIcon className="w-4 h-4" />
          <SelectValue placeholder="Select Theme" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Themes</SelectLabel>
          {THEMES.map((t) => {
            const Icon = t.icon;
            return (
              <SelectItem key={t.id} value={t.id}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{t.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

