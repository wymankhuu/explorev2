import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { verifyAdmin } from '@/lib/admin-auth';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_MASTER_DB_ID!;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, appName, creator, role, description, usage, impact } = body;

  const authError = await verifyAdmin(request, password);
  if (authError) return authError;

  if (!appName) {
    return NextResponse.json({ error: 'Missing app name' }, { status: 400 });
  }

  try {
    const results = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: { property: 'App Name', title: { equals: appName } },
      page_size: 1,
    });

    if (results.results.length === 0) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    const pageId = results.results[0].id;
    const properties: Record<string, unknown> = {};

    if (creator !== undefined) {
      properties['Creator'] = { rich_text: [{ text: { content: (creator || '').slice(0, 2000) } }] };
    }
    if (role !== undefined) {
      properties['Role'] = { rich_text: [{ text: { content: (role || '').slice(0, 2000) } }] };
    }
    if (description !== undefined) {
      properties['Description'] = { rich_text: [{ text: { content: (description || '').slice(0, 2000) } }] };
    }
    if (usage !== undefined) {
      properties["How It's Being Used"] = { rich_text: [{ text: { content: (usage || '').slice(0, 2000) } }] };
    }
    if (impact !== undefined) {
      properties['Impact'] = { rich_text: [{ text: { content: (impact || '').slice(0, 2000) } }] };
    }

    await notion.pages.update({ page_id: pageId, properties: properties as any });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error saving app:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
