import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import type { Department, Ticket } from '../types';

interface CategorizationResult {
  department: Department;
  confidence: number;
  reason: string;
}

async function groqChat(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
    }),
  });
  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

export function useGroq() {
  const { groqApiKey } = useApp();

  const categorize = useCallback(async (title: string, description: string): Promise<CategorizationResult | null> => {
    if (!groqApiKey) return null;
    const system = `You are an internal helpdesk router for a nonprofit organization.
Given a ticket title and description, return a JSON object:
{"department":"IT"|"HR"|"Finance"|"Admin","confidence":0.0–1.0,"reason":"one sentence"}
Return only valid JSON. No preamble.`;
    const user = `Title: ${title}\nDescription: ${description}`;
    const raw = await groqChat(groqApiKey, system, user);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON from AI');
    return JSON.parse(jsonMatch[0]) as CategorizationResult;
  }, [groqApiKey]);

  const findSimilar = useCallback(async (
    title: string,
    description: string,
    resolvedTickets: Ticket[],
  ): Promise<string[]> => {
    if (!groqApiKey || resolvedTickets.length === 0) return [];
    const system = `Given a new ticket and a list of existing resolved tickets (as JSON), return the IDs of up to 3 most semantically similar ones.
Return only a JSON array of IDs. No preamble.`;
    const ticketList = resolvedTickets.slice(0, 50).map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
    }));
    const user = `New ticket:\nTitle: ${title}\nDescription: ${description}\n\nExisting tickets:\n${JSON.stringify(ticketList)}`;
    const raw = await groqChat(groqApiKey, system, user);
    const arrayMatch = raw.match(/\[[\s\S]*\]/);
    if (!arrayMatch) return [];
    return JSON.parse(arrayMatch[0]) as string[];
  }, [groqApiKey]);

  const draftResponse = useCallback(async (ticket: Ticket): Promise<string> => {
    if (!groqApiKey) throw new Error('No API key');
    const system = `You are a helpful internal support agent at a nonprofit.
Write a professional, empathetic first response to this support ticket.
Keep it under 100 words. Be specific to the issue described.
Don't use placeholders — write as if you will actually send this.`;
    const user = `Ticket title: ${ticket.title}\nDescription: ${ticket.description}\nRaised by: ${ticket.raisedBy}\nDepartment: ${ticket.category}\nUrgency: ${ticket.urgency}`;
    return groqChat(groqApiKey, system, user);
  }, [groqApiKey]);

  return { categorize, findSimilar, draftResponse, hasKey: !!groqApiKey };
}
