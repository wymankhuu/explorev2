import {
  Calculator, FlaskConical, BookOpen, Globe, Palette, ClipboardCheck,
  Wrench, PenTool, Heart, Gamepad2, Sparkles, Sun, School, GraduationCap,
  Accessibility, Bot, BookMarked, Users, LayoutList, Sprout, Briefcase,
  Activity, Music, Languages, MessageCircle, BarChart3, Hammer, Landmark,
  Code, Target, Home, BookOpenCheck, Flower2, Lightbulb, TrendingUp,
  BookHeart, Settings, Megaphone, Building2, HardHat, MapPin, Globe2,
  Building, Star, FolderOpen,
  type LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Calculator, FlaskConical, BookOpen, Globe, Palette, ClipboardCheck,
  Wrench, PenTool, Heart, Gamepad2, Sparkles, Sun, School, GraduationCap,
  Accessibility, Bot, BookMarked, Users, LayoutList, Sprout, Briefcase,
  Activity, Music, Languages, MessageCircle, BarChart3, Hammer, Landmark,
  Code, Target, HomeIcon: Home, BookOpenCheck, Flower2, Lightbulb, TrendingUp,
  BookHeart, Settings, Megaphone, Building2, HardHat, MapPin, Globe2,
  Building, Star, FolderOpen,
};

export default function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICON_MAP[name] || FolderOpen;
  return <Icon {...props} />;
}
