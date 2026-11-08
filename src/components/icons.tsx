"use client";

import {
  Box, Package, Copy, Search, Split, Zap, Brain, Loader, ListOrdered,
  Infinity as InfinityIcon, List, Target, Crown, Compass, Sprout, Cog,
  Star, Footprints, Flame, Trophy, Gem, GitFork, Repeat, Layers,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  box: Box,
  package: Package,
  copy: Copy,
  search: Search,
  split: Split,
  zap: Zap,
  brain: Brain,
  loader: Loader,
  "list-ordered": ListOrdered,
  infinity: InfinityIcon,
  list: List,
  target: Target,
  crown: Crown,
  compass: Compass,
  sprout: Sprout,
  cog: Cog,
  star: Star,
  footprints: Footprints,
  flame: Flame,
  trophy: Trophy,
  gem: Gem,
  "git-fork": GitFork,
  repeat: Repeat,
  layers: Layers,
};

export function LevelIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = MAP[name] ?? Box;
  return <Cmp className={className} />;
}
