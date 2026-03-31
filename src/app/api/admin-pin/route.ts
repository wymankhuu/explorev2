import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { verifyAdmin } from '@/lib/admin-auth';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_MASTER_DB_ID!;
const MAX_PINNED = 9;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, appName, pinned, collectionName } = body;

  const authError = await verifyAdmin(request, password);
  if (authError) return authError;

  if (!appName) {
    return NextResponse.json({ error: 'Missing app name' }, { status: 400 });
  }

  try {
    if (pinned && collectionName) {
      const countResults = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: {
          and: [
            { property: 'Homepage', checkbox: { equals: true } },
            { property: 'Collection', multi_select: { contains: collectionName } },
          ],
        },
      });
      if (countResults.results.length >= MAX_PINNED) {
        return NextResponse.json(
          { error: `This collection already has ${MAX_PINNED} pinned apps. Unpin one first.` },
          { status: 400 }
        );
      }
    }

    const results = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: { property: 'App Name', title: { equals: appName } },
      page_size: 1,
    });

    if (results.results.length === 0) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    await notion.pages.update({
      page_id: results.results[0].id,
      properties: { Homepage: { checkbox: !!pinned } },
    });

    return NextResponse.json({ success: true, pinned: !!pinned });
  } catch (error: unknown) {
    console.error('Error pinning app:', error);
    return NextResponse.json({ error: 'Failed to update pin' }, { status: 500 });
  }
}
