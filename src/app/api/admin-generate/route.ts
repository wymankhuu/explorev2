import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, appName, description, field } = body;

  const authError = await verifyAdmin(request, password);
  if (authError) return authError;

  if (!appName || !field) {
    return NextResponse.json({ error: 'Missing appName or field' }, { status: 400 });
  }

  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI generation not configured (missing OPENAI_API_KEY)' }, { status: 503 });
  }

  const prompts: Record<string, string> = {
    usage: `You are writing for a community education app showcase. Given this app name and description, write 2-3 sentences describing how an educator might use this app in their classroom or school. Be specific, practical, and grounded. Write in third person ("Educators use this to...").

App: "${appName}"
Description: "${description || 'No description provided'}"

Write the usage description:`,
    impact: `You are writing for a community education app showcase. Given this app name and description, write 2-3 sentences describing the potential impact this app has on student learning, teacher effectiveness, or school operations. Be specific and optimistic but realistic. Write in third person.

App: "${appName}"
Description: "${description || 'No description provided'}"

Write the impact description:`,
  };

  const prompt = prompts[field];
  if (!prompt) {
    return NextResponse.json({ error: 'Invalid field. Use "usage" or "impact".' }, { status: 400 });
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('OpenAI error:', err);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 502 });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }
}
