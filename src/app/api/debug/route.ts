import { NextResponse } from 'next/server';
import { getAllData } from '@/lib/notion';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const envCheck = {
    NOTION_API_KEY: !!process.env.NOTION_API_KEY,
    NOTION_MASTER_DB_ID: !!process.env.NOTION_MASTER_DB_ID,
    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
  };

  let notionTest = 'not tested';
  if (process.env.NOTION_API_KEY && process.env.NOTION_MASTER_DB_ID) {
    try {
      const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_MASTER_DB_ID}`, {
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
      });
      notionTest = res.ok ? `ok (${res.status})` : `failed (${res.status}: ${await res.text().then(t => t.slice(0, 200))})`;
    } catch (e: any) {
      notionTest = `error: ${e.message}`;
    }
  }

  let dataTest = 'not tested';
  try {
    const data = await getAllData();
    dataTest = `ok (${data.apps.length} apps, ${data.collections.length} collections, ${data.seedCollections.length} seed collections)`;
  } catch (e: any) {
    dataTest = `error: ${e.message}\n${e.stack?.slice(0, 500)}`;
  }

  return NextResponse.json({ envCheck, notionTest, dataTest });
}
