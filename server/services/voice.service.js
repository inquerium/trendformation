import Anthropic from '@anthropic-ai/sdk';

const SYSTEM = `You are a fitness data extractor. Parse natural language health/fitness log entries and extract ALL measurements mentioned. Return ONLY valid JSON — no markdown, no explanation.

Return this exact shape:
{
  "entries": [
    {
      "category": "weight|sleep|caffeine|nutrition|calories|workout",
      "data": { ...category fields... },
      "summary": "brief confirmation string"
    }
  ]
}

Category data fields:
- weight:    { "weight": number, "unit": "lbs"|"kg" }
- sleep:     { "hours_slept": number, "sleep_score": number? (0-100) }
- caffeine:  { "mg": number, "source": string? }
- nutrition: { "calories": number?, "protein_g": number?, "carbs_g": number?, "fats_g": number? }
- calories:  { "active_calories": number?, "activity_type": string? }
- workout:   { "name": string?, "duration_min": number? }

Rules:
- "2 cups of coffee" ≈ 200mg caffeine
- "espresso" ≈ 64mg caffeine per shot
- If something is not health/fitness related, skip it
- If no data can be extracted, return { "entries": [] }`;

export async function parseTranscript(transcript) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-api-key') {
    const err = new Error('Anthropic API key not configured');
    err.status = 503;
    throw err;
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM,
    messages: [{ role: 'user', content: `Transcript: "${transcript}"` }],
  });

  const text = msg.content[0].text.trim();
  try {
    return JSON.parse(text);
  } catch {
    // Model returned malformed JSON — surface it as a user-visible error
    const err = new Error('Could not parse AI response');
    err.status = 422;
    throw err;
  }
}
