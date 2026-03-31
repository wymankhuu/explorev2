import { Client } from '@notionhq/client';
import { cacheLife, cacheTag } from 'next/cache';
import type { App, Collection, Seed, SeedCollection } from './types';
import { generateCollectionId, getCollectionIcon } from './utils';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const MASTER_DB_ID = process.env.NOTION_MASTER_DB_ID!;
const SEEDS_DB_ID = '32aa9d3778c58188ab27fe250c849732';

// ---------------------------------------------------------------------------
// Collection descriptions
// ---------------------------------------------------------------------------

const COLLECTION_DESCRIPTIONS: Record<string, string> = {
  'AI Assistants': 'Educators are reimagining what a teaching assistant can be. You\'ll find co-teachers, lesson scaffolders, real-time student support bots, and AI helpers shaped by dozens of different classroom contexts.',
  'Arts & Design': 'Where creativity meets craft. Explore tools for visual arts, graphic design, design thinking challenges, portfolio builders, and creative expression across every medium.',
  'Assessment & Feedback': 'Dozens of different approaches to understanding what students know. Quick formative checks, rubric generators, peer review facilitators, standards-aligned quiz builders, and deep feedback tools all live here.',
  'Career & Vocational': 'Resume builders, mock interview coaches, industry simulations, career exploration tools, and job-readiness apps helping students connect learning to life beyond the classroom.',
  'Creative & Engagement': 'Apps that use storytelling, play, mystery, gamification, and surprise to pull students in. Every one takes a different angle on what "engaging" really means.',
  'Data-Driven Instruction': 'Tools that turn data into something actionable. Includes grade analyzers, progress trackers, intervention planners, and dashboards built by educators for their own teams.',
  'Differentiation & Access': 'Apps that flex, adapt, and meet students where they actually are. Scaffolding tools, reading level adjusters, choice boards, and personalized pathway builders representing many approaches to access.',
  'ELA & Literacy': 'Phonics coaches, reading comprehension partners, literary analysis tools, vocabulary builders, and writing scaffolds shaped by educators\' unique understanding of how literacy grows.',
  'ELL & Multilingual': 'Translation helpers, bilingual vocabulary builders, sheltered instruction planners, and cultural context tools built by educators who understand the richness of multilingual classrooms.',
  'Elementary': 'Playful, patient, and purposeful apps built for young learners. Phonics games, math manipulatives, story starters, science explorations, and social skills builders designed with early childhood in mind.',
  'Flowers': 'See how individuals across the Playlab community are building to reflect their unique contexts, roles, and goals. Each flower represents one person\'s creative vision.',
  'Gamified Learning': 'Points, quests, narratives, leaderboards, escape rooms, and trivia generators. Educators have found countless creative ways to make learning feel like play.',
  'Health & PE': 'Apps that meet students in the fullness of who they are. Nutrition trackers, fitness planners, mental health check-ins, anatomy explorers, and wellness journals reflecting many approaches to whole-student health.',
  'High School': 'Sophisticated support for advanced coursework, college prep, SAT/ACT practice, research projects, and the complex social-emotional landscape of adolescence.',
  'Higher Ed': 'Apps bringing AI into higher education. Research assistants, citation managers, lecture summarizers, study group coordinators, and academic writing coaches built for university contexts.',
  'Illustrative Mathematics': 'Interactive practice, lesson internalization, and student support true to the IM philosophy. Built by educators deeply familiar with the curriculum.',
  'Lesson Planning': 'Tools turning the invisible work of preparation into something more structured and shareable. Unit designers, bell ringer generators, substitute plan creators, and pacing guides of every shape.',
  'Math': 'Visual models, AI tutors, curriculum-aligned practice, word problem generators, graphing assistants, and conceptual explainers. Many approaches to helping students think mathematically.',
  'Middle School': 'Engaging, age-appropriate tools built for early adolescence. Bridging elementary foundations and high school rigor with apps that respect where middle schoolers actually are.',
  'Music & Performing Arts': 'AI tools that enhance the deeply human experience of making music and art together. Composition helpers, practice coaches, lyric writers, and performance preparation tools.',
  'Niche & Emerging': 'The edges are where innovation happens. Unusual subjects, experimental formats, cross-disciplinary mashups, and tomorrow\'s ideas from educators pushing boundaries.',
  'Professional Development': 'Apps supporting coaching, reflection, and growth. Session planners, PLC facilitators, observation debriefers, and self-assessment tools built for professional learning that changes practice.',
  'Project-Based Learning': 'Tools supporting open-ended inquiry, student agency, and real-world connection. Project planners, research guides, reflection journals, and presentation builders for PBL classrooms.',
  'Reading Intervention': 'Targeted, evidence-informed approaches to helping every student become a reader. Fluency trackers, comprehension scaffolds, decodable text generators, and progress monitors.',
  'SEL & Wellbeing': 'Tools helping students develop self-awareness, empathy, and resilience. Mood trackers, conflict resolution guides, mindfulness prompts, and relationship-building activities from many perspectives.',
  'School Leadership': 'Tools for principals, coaches, and district leaders. Meeting facilitators, observation trackers, staff development planners, data dashboards, and strategic planning aids.',
  'Science & STEM': 'Biology simulations, physics visualizers, engineering design challenges, chemistry lab guides, and coding tutorials. Tools that make abstract concepts tangible and explorable.',
  'Social Studies & History': 'Apps helping students engage with primary sources, multiple perspectives, geographic reasoning, civic participation, and the complexity of human societies past and present.',
  'Special Education': 'Apps that flex to meet individual needs with patience and precision. IEP helpers, sensory-friendly interfaces, behavior trackers, communication boards, and transition planning tools.',
  'Student-Built Apps': 'When students become builders, something shifts. These apps were created by students themselves, proving that making something meaningful is one of the best ways to learn.',
  'Study Partners': 'AI companions meeting students in their moments of need. Flashcard generators, concept explainers, quiz prep tools, and homework helpers spanning every subject and style.',
  'Teacher Tools': 'The largest and most diverse collection in the community. Admin shortcuts, parent communication templates, grading helpers, and pedagogical experiments of every kind.',
  'Tutoring & Practice': 'Patient, adaptive support that meets students where they are. Math drills, reading practice, science review, language exercises, and test prep tools with many different pedagogical approaches.',
  'World Languages': 'Apps helping students learn languages across many traditions. Conversation practice bots, grammar coaches, cultural context builders, and vocabulary games for Spanish, French, Mandarin, and beyond.',
  'Writing Coaches': 'AI coaches helping students at every stage of the writing process while preserving their voice. Brainstorming tools, outline builders, revision assistants, and genre-specific writing guides.',
  'Family & Community': 'Tools helping families participate in their children\'s education. Newsletter creators, progress update generators, volunteer coordinators, and bilingual communication bridges.',
};

// Collections to hide
const HIDDEN_COLLECTIONS = ['religious studies'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function richTextToString(prop: any): string {
  if (!prop || !prop.rich_text) return '';
  return prop.rich_text.map((t: any) => t.plain_text).join('').trim();
}

function parseRow(props: any): App | null {
  const nameArr = props['App Name']?.title || [];
  const name = nameArr.map((t: any) => t.plain_text).join('').trim();
  if (!name) return null;

  const url: string = props['URL']?.url || '';
  let appId = '';
  if (url) {
    const match = url.match(/\/project\/([a-zA-Z0-9-]+)/);
    if (match) appId = match[1];
  }

  const collections = (props['Collection']?.multi_select || []).map((s: any) => s.name);

  return {
    id: appId || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    description: richTextToString(props['Description']),
    url,
    creator: richTextToString(props['Creator']),
    role: richTextToString(props['Role']),
    usage: richTextToString(props["How It's Being Used"]),
    impact: richTextToString(props['Impact']),
    sessions: props['Sessions']?.number || 0,
    iterations: props['Iterations']?.number || 0,
    pinned: !!props['Homepage']?.checkbox,
    homepageOrder: props['Homepage Order']?.number ?? 999,
    tags: collections,
  };
}

async function fetchAllRows(databaseId: string, filter?: any): Promise<any[]> {
  const rows: any[] = [];
  let cursor: string | undefined;
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
      ...(filter ? { filter } : {}),
    });
    rows.push(...response.results);
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return rows;
}

// ---------------------------------------------------------------------------
// Core fetch
// ---------------------------------------------------------------------------

async function fetchAllData(): Promise<{ apps: App[]; collections: Collection[] }> {
  const rows = await fetchAllRows(MASTER_DB_ID);

  const allApps: App[] = [];
  const appsByKey: Record<string, App> = {};
  const collectionMap: Record<string, App[]> = {};

  for (const row of rows) {
    const app = parseRow(row.properties);
    if (!app) continue;

    // Deduplicate by ID
    const key = app.id || app.name.toLowerCase().trim();
    const existing = appsByKey[key];
    if (existing) {
      const existingLen = (existing.description || '').length + (existing.usage || '').length;
      const newLen = (app.description || '').length + (app.usage || '').length;
      if (newLen <= existingLen) continue;
    }
    appsByKey[key] = app;

    // Group by collection tags
    for (const tag of app.tags) {
      if (!collectionMap[tag]) collectionMap[tag] = [];
      collectionMap[tag].push(app);
    }
  }

  // Build unique apps list
  for (const app of Object.values(appsByKey)) {
    allApps.push(app);
  }
  allApps.sort((a, b) => (b.sessions || 0) - (a.sessions || 0));

  // Build collections
  const collections: Collection[] = Object.keys(collectionMap)
    .filter((name) => !HIDDEN_COLLECTIONS.includes(name.toLowerCase()))
    .sort()
    .map((name) => {
      const apps = collectionMap[name];
      // Deduplicate within collection
      const seen = new Set<string>();
      const uniqueApps = apps.filter((app) => {
        const key = app.id || app.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      uniqueApps.sort((a, b) => (b.sessions || 0) - (a.sessions || 0));

      return {
        id: generateCollectionId(name),
        name,
        description: COLLECTION_DESCRIPTIONS[name] || '',
        iconName: getCollectionIcon(name),
        appCount: uniqueApps.length,
        apps: uniqueApps,
      };
    });

  return { apps: allApps, collections };
}

// ---------------------------------------------------------------------------
// Seed collections
// ---------------------------------------------------------------------------

const SEED_COLLECTION_META: Record<string, { id: string; color: string; iconName: string; description: string }> = {
  'Classroom Essentials': {
    id: 'classroom-essentials',
    color: '#e74c3c',
    iconName: 'BookOpenCheck',
    description: 'Starter templates for the tools teachers reach for every day — lesson plans, exit tickets, bellringers, sub plans, and newsletter drafts that save hours of prep time.',
  },
  'Coaching and Feedback': {
    id: 'coaching-feedback',
    color: '#9b59b6',
    iconName: 'MessageSquareHeart',
    description: 'Templates for instructional coaches and school leaders to prepare observation debriefs, write actionable teacher feedback, and plan structured coaching conversations.',
  },
  'Operations and Management': {
    id: 'operations-management',
    color: '#f1c40f',
    iconName: 'Settings',
    description: 'Starter apps for the behind-the-scenes work that keeps schools running — onboarding guides, meeting agendas, policy drafters, event planners, and grant proposals.',
  },
  'Student Facing Apps': {
    id: 'student-facing',
    color: '#2654d4',
    iconName: 'Users',
    description: 'Templates students use directly — study partners, homework helpers, career explorers, and practice tools across math, science, reading, and writing.',
  },
  'The Whole Child': {
    id: 'whole-child',
    color: '#e84393',
    iconName: 'Heart',
    description: 'Seeds focused on the complete student experience — SEL check-ins, digital citizenship, health and wellness, parent conference prep, and community resource connectors.',
  },
};

const SEED_COLLECTION_ORDER = [
  'Classroom Essentials',
  'Coaching and Feedback',
  'Student Facing Apps',
  'Operations and Management',
  'The Whole Child',
];

async function fetchSeedCollections(): Promise<SeedCollection[]> {
  let filter: any = undefined;
  try {
    const db = await notion.databases.retrieve({ database_id: SEEDS_DB_ID });
    if ((db as any).properties['Active']) {
      filter = { property: 'Active', checkbox: { equals: true } };
    }
  } catch {
    // proceed without filter
  }

  const rows = await fetchAllRows(SEEDS_DB_ID, filter);

  const seeds: Seed[] = rows
    .map((row) => {
      const props = row.properties;
      const nameArr = props['App Name']?.title || props['Name']?.title || [];
      const name = nameArr.map((t: any) => t.plain_text).join('').trim();
      if (!name) return null;

      const description = (props['Description']?.rich_text || []).map((t: any) => t.plain_text).join('').trim();
      const remixUrl: string = props['Remix URL']?.url || '';
      const tags = (props['Tags']?.multi_select || []).map((s: any) => s.name);
      const creator = (props['Creator']?.rich_text || []).map((t: any) => t.plain_text).join('').trim();
      const seedCollection = props['Seed Collection ']?.select?.name || '';

      return { id: row.id, name, description, remixUrl, tags, creator, seedCollection };
    })
    .filter(Boolean) as Seed[];

  const collectionMap: Record<string, SeedCollection> = {};
  for (const seed of seeds) {
    if (!seed.seedCollection) continue;
    if (!collectionMap[seed.seedCollection]) {
      const meta = SEED_COLLECTION_META[seed.seedCollection] || {
        id: seed.seedCollection.toLowerCase().replace(/\s+/g, '-'),
        color: '#2D7A3A',
        iconName: 'Sprout',
        description: '',
      };
      collectionMap[seed.seedCollection] = {
        ...meta,
        name: seed.seedCollection,
        apps: [],
      };
    }
    collectionMap[seed.seedCollection].apps.push(seed);
  }

  const result: SeedCollection[] = SEED_COLLECTION_ORDER
    .filter((name) => collectionMap[name])
    .map((name) => collectionMap[name]);

  for (const name of Object.keys(collectionMap)) {
    if (!SEED_COLLECTION_ORDER.includes(name)) {
      result.push(collectionMap[name]);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Cached exports
// ---------------------------------------------------------------------------

async function getCachedData(): Promise<{ apps: App[]; collections: Collection[] }> {
  'use cache';
  cacheLife('hours');
  cacheTag('explore-all-data');
  return fetchAllData();
}

async function getCachedSeeds(): Promise<SeedCollection[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('explore-seeds');
  return fetchSeedCollections();
}

export async function getAllData(): Promise<{ apps: App[]; collections: Collection[]; seedCollections: SeedCollection[] }> {
  const [data, seedCollections] = await Promise.all([getCachedData(), getCachedSeeds()]);
  return { ...data, seedCollections };
}
