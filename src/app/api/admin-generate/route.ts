import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, appName, description, field } = body;

  const authError = await verifyAdmin(request, password);
  if (authError) return authError;

  if (!appName || !field) {
    return NextResponse.json({ error: 'Missing appName or field' }, { status: 400 });
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI generation not configured (missing ANTHROPIC_API_KEY)' }, { status: 503 });
  }

  const prompts: Record<string, string> = {
    usage: `You are writing for a community education app showcase. Given this app name and description, write 2-3 sentences describing how an educator might use this app in their classroom or school. Be specific, practical, and grounded. Write in third person ("Educators use this to..."). Return only the description, no preamble.

App: "${appName}"
Description: "${description || 'No description provided'}"`,
    impact: `You are writing for a community education app showcase. Given this app name and description, write 2-3 sentences describing the potential impact this app has on student learning, teacher effectiveness, or school operations. Be specific and optimistic but realistic. Write in third person. Return only the description, no preamble.

App: "${appName}"
Description: "${description || 'No description provided'}"`,
  };

  const prompt = prompts[field];
  if (!prompt) {
    return NextResponse.json({ error: 'Invalid field. Use "usage" or "impact".' }, { status: 400 });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Anthropic error:', err);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 502 });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim() || '';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }
}
