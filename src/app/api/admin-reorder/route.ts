import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/admin-auth';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_MASTER_DB_ID!;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, appOrder } = body;

  const authError = await verifyAdmin(request, password);
  if (authError) return authError;

  if (!appOrder || !Array.isArray(appOrder) || appOrder.length === 0) {
    return NextResponse.json({ error: 'Missing appOrder array' }, { status: 400 });
  }

  try {
    const updates = appOrder.map(async (item: { appName: string; order: number }) => {
      const results = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: { property: 'App Name', title: { equals: item.appName } },
        page_size: 1,
      });
      if (results.results.length === 0) return;

      await notion.pages.update({
        page_id: results.results[0].id,
        properties: {
          Homepage: { checkbox: true },
          'Homepage Order': { number: item.order },
        },
      });
    });

    await Promise.all(updates);
    revalidatePath('/');

    return NextResponse.json({ success: true, updated: appOrder.length });
  } catch (error: unknown) {
    console.error('Error reordering:', error);
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
