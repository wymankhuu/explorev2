/** Format large numbers: 1000 → "1.0K" */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

/** First 1-2 sentences, max 200 chars */
export function shortDesc(str: string): string {
  if (!str) return '';
  const sentences = str.match(/[^.!?]+[.!?]+/g);
  if (!sentences) return str.length > 150 ? str.slice(0, 150).trim() + '\u2026' : str;
  const short = sentences.slice(0, 2).join('').trim();
  return short.length > 200 ? short.slice(0, 200).trim() + '\u2026' : short;
}

/** Generate a consistent color from a string */
export function stringToColor(str: string): string {
  const colors = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#10B981',
    '#6366F1', '#14B8A6', '#F59E0B', '#EF4444', '#06B6D4',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/** Get initials from a name */
export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Generate a collection slug from name */
export function generateCollectionId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Generate a creator slug from name */
export function generateCreatorSlug(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Collection Lucide icon name mapping */
const COLLECTION_ICONS: Record<string, string> = {
  'Math': 'Calculator',
  'Science & STEM': 'FlaskConical',
  'Science / STEM': 'FlaskConical',
  'ELA & Literacy': 'BookOpen',
  'ELA / Literacy': 'BookOpen',
  'Social Studies & History': 'Globe',
  'Social Studies / History': 'Globe',
  'Arts & Design': 'Palette',
  'Assessment & Feedback': 'ClipboardCheck',
  'Teacher Tools': 'Wrench',
  'Writing Coaches': 'PenTool',
  'SEL & Wellbeing': 'Heart',
  'SEL / Wellbeing': 'Heart',
  'Gamified Learning': 'Gamepad2',
  'Creative & Engagement': 'Sparkles',
  'Elementary': 'Sun',
  'Middle School': 'School',
  'High School': 'GraduationCap',
  'Higher Ed': 'GraduationCap',
  'Special Education': 'Accessibility',
  'AI Assistants': 'Bot',
  'Tutoring & Practice': 'BookMarked',
  'Study Partners': 'Users',
  'Lesson Planning': 'LayoutList',
  'Professional Development': 'Sprout',
  'Career & Vocational': 'Briefcase',
  'Health & PE': 'Activity',
  'Music & Performing Arts': 'Music',
  'World Languages': 'Languages',
  'ELL & Multilingual': 'MessageCircle',
  'ELL / ESL': 'MessageCircle',
  'Data-Driven Instruction': 'BarChart3',
  'Project-Based Learning': 'Hammer',
  'School Leadership': 'Landmark',
  'Student-Built Apps': 'Code',
  'Differentiation & Access': 'Target',
  'Family & Community': 'HomeIcon',
  'Reading Intervention': 'BookOpenCheck',
  'Flowers': 'Flower2',
  'Niche & Emerging': 'Lightbulb',
};

export function getCollectionIcon(name: string): string {
  return COLLECTION_ICONS[name] || 'FolderOpen';
}

/** Container color themes for collections — cycles through these */
export const CONTAINER_THEMES = [
  { bg: 'from-green-50 via-emerald-50/70 to-teal-50/80', border: 'border-green-300', iconBg: 'bg-green-100', iconColor: 'text-green-700', accent: 'bg-green-500' },
  { bg: 'from-blue-50 via-sky-50/70 to-cyan-50/80', border: 'border-blue-300', iconBg: 'bg-blue-100', iconColor: 'text-blue-700', accent: 'bg-blue-500' },
  { bg: 'from-purple-50 via-violet-50/70 to-fuchsia-50/80', border: 'border-purple-300', iconBg: 'bg-purple-100', iconColor: 'text-purple-700', accent: 'bg-purple-500' },
  { bg: 'from-amber-50 via-yellow-50/70 to-orange-50/80', border: 'border-amber-300', iconBg: 'bg-amber-100', iconColor: 'text-amber-700', accent: 'bg-amber-500' },
  { bg: 'from-rose-50 via-pink-50/70 to-red-50/80', border: 'border-rose-300', iconBg: 'bg-rose-100', iconColor: 'text-rose-700', accent: 'bg-rose-500' },
  { bg: 'from-teal-50 via-cyan-50/70 to-sky-50/80', border: 'border-teal-300', iconBg: 'bg-teal-100', iconColor: 'text-teal-700', accent: 'bg-teal-500' },
  { bg: 'from-indigo-50 via-blue-50/70 to-violet-50/80', border: 'border-indigo-300', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-700', accent: 'bg-indigo-500' },
  { bg: 'from-lime-50 via-green-50/70 to-emerald-50/80', border: 'border-lime-300', iconBg: 'bg-lime-100', iconColor: 'text-lime-700', accent: 'bg-lime-500' },
];

export function getContainerTheme(index: number) {
  return CONTAINER_THEMES[index % CONTAINER_THEMES.length];
}

/** Highlight matching text by splitting into segments */
export function highlightSegments(text: string, query: string): { text: string; match: boolean }[] {
  if (!query || !text) return [{ text, match: false }];
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.split(regex).filter(Boolean).map((part) => ({
    text: part,
    match: regex.test(part) || part.toLowerCase() === query.toLowerCase(),
  }));
}

/** Filter category definitions */
export const FILTER_OPTIONS = {
  gradeLevel: ['Elementary', 'Middle School', 'High School', 'Higher Ed'],
  context: ['Math', 'Science & STEM', 'ELA & Literacy', 'Social Studies & History', 'Arts & Design', 'Health & PE', 'World Languages'],
  useCases: ['Assessment & Feedback', 'Tutoring & Practice', 'Lesson Planning', 'Writing Coaches', 'AI Assistants', 'Gamified Learning', 'Study Partners', 'SEL & Wellbeing'],
  features: ['Teacher Tools', 'Student-Built Apps', 'Professional Development', 'Special Education', 'ELL & Multilingual', 'Differentiation & Access'],
};
