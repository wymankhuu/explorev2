import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_MASTER_DB_ID!;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success } = await rateLimit(`submit:${ip}`, 5, 3600);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { appName, url, creator, role, description, usage, impact } = body;

  if (!appName || !appName.trim()) {
    return NextResponse.json({ error: 'App Name is required' }, { status: 400 });
  }
  if (!url || !url.trim()) {
    return NextResponse.json({ error: 'App URL is required' }, { status: 400 });
  }
  if (!/^https?:\/\/(www\.)?playlab\.ai\/project\/.+$/.test(url.trim())) {
    return NextResponse.json(
      { error: 'URL must be a valid Playlab project link (playlab.ai/project/...)' },
      { status: 400 },
    );
  }
  if (!creator || !creator.trim()) {
    return NextResponse.json({ error: 'Creator name is required' }, { status: 400 });
  }
  if (!description || !description.trim()) {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 });
  }

  try {
    const properties: Record<string, unknown> = {
      'App Name': { title: [{ text: { content: appName.trim() } }] },
      URL: { url: url.trim() },
      Creator: { rich_text: [{ text: { content: creator.trim() } }] },
      Description: { rich_text: [{ text: { content: description.trim() } }] },
    };

    if (role?.trim()) {
      properties['Role'] = { rich_text: [{ text: { content: role.trim() } }] };
    }
    if (usage?.trim()) {
      properties["How It's Being Used"] = { rich_text: [{ text: { content: usage.trim() } }] };
    }
    if (impact?.trim()) {
      properties['Impact'] = { rich_text: [{ text: { content: impact.trim() } }] };
    }

    await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: properties as any,
    });

    // Slack notification (fire-and-forget)
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    if (slackWebhook) {
      fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `New app submitted!`,
          blocks: [{
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*New App Submission*\n*${appName.trim()}* by ${creator.trim()}${role ? ` (${role.trim()})` : ''}\n${description.trim()}\n<${url.trim()}|Open in Playlab>`,
            },
          }],
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error submitting app:', error);
    return NextResponse.json({ error: 'Failed to submit app. Please try again.' }, { status: 500 });
  }
}
