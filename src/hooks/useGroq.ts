import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import type { Department, Ticket } from '../types';

interface CategorizationResult {
  department: Department;
  confidence: number;
  reason: string;
}

// Mock responses for local dev / when API is unavailable
function mockCategorize(title: string, description: string): CategorizationResult {
  const text = `${title} ${description}`.toLowerCase();
  if (/vpn|laptop|software|printer|access|drive|password|network|wifi|computer|screen/.test(text))
    return { department: 'IT', confidence: 0.91, reason: 'Sounds like a technical/IT infrastructure issue.' };
  if (/salary|payslip|leave|hr|payroll|onboarding|offer|contract|policy|reimburs/.test(text))
    return { department: 'HR', confidence: 0.88, reason: 'Sounds like a payroll or HR policy matter.' };
  if (/invoice|budget|expense|finance|payment|vendor|purchase|approval/.test(text))
    return { department: 'Finance', confidence: 0.85, reason: 'Sounds like a finance or expense matter.' };
  return { department: 'Admin', confidence: 0.78, reason: 'Sounds like a general admin or facilities request.' };
}

function mockSimilar(resolvedTickets: Ticket[]): string[] {
  return resolvedTickets.slice(0, 2).map(t => t.id);
}

function mockDraft(ticket: Ticket): string {
  return `Hi ${ticket.raisedBy.split(' ')[0]}, thanks for reaching out. I've picked up your ticket regarding "${ticket.title}" and will look into it right away. Given the ${ticket.urgency.toLowerCase()} urgency, I'll prioritise this and update you shortly. Please let me know if anything changes in the meantime.`;
}

// Calls /api/groq (Vercel serverless) which holds the key server-side.
// Falls back to a user-supplied key in localStorage if present (local dev).
async function groqChat(
  systemPrompt: string,
  userMessage: string,
  localKey?: string,
): Promise<string> {
  const isLocalDev = import.meta.env.DEV && !import.meta.env.VITE_USE_PROXY;

  const url = isLocalDev && localKey
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : '/api/groq';

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (isLocalDev && localKey) headers['Authorization'] = `Bearer ${localKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
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

  // In production: always available (key is server-side).
  // In local dev: available if user pasted a key in Settings.
  const isProduction = !import.meta.env.DEV;
  const hasKey = isProduction || !!groqApiKey;

  const categorize = useCallback(async (
    title: string,
    description: string,
  ): Promise<CategorizationResult | null> => {
    if (!hasKey) return null;

    try {
      const system = `You are an internal helpdesk router for a nonprofit organization.
Given a ticket title and description, return a JSON object:
{"department":"IT"|"HR"|"Finance"|"Admin","confidence":0.0–1.0,"reason":"one sentence"}
Return only valid JSON. No preamble.`;
      const raw = await groqChat(system, `Title: ${title}\nDescription: ${description}`, groqApiKey);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Invalid JSON');
      return JSON.parse(match[0]) as CategorizationResult;
    } catch {
      // Graceful fallback to mock
      return mockCategorize(title, description);
    }
  }, [hasKey, groqApiKey]);

  const findSimilar = useCallback(async (
    title: string,
    description: string,
    resolvedTickets: Ticket[],
  ): Promise<string[]> => {
    if (!hasKey || resolvedTickets.length === 0) return [];

    try {
      const system = `Given a new ticket and a list of existing resolved tickets (as JSON), return the IDs of up to 3 most semantically similar ones.
Return only a JSON array of IDs. No preamble.`;
      const ticketList = resolvedTickets.slice(0, 50).map(t => ({
        id: t.id, title: t.title, description: t.description,
      }));
      const user = `New ticket:\nTitle: ${title}\nDescription: ${description}\n\nExisting tickets:\n${JSON.stringify(ticketList)}`;
      const raw = await groqChat(system, user, groqApiKey);
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) return [];
      return JSON.parse(match[0]) as string[];
    } catch {
      return mockSimilar(resolvedTickets);
    }
  }, [hasKey, groqApiKey]);

  const draftResponse = useCallback(async (ticket: Ticket): Promise<string> => {
    if (!hasKey) throw new Error('AI unavailable');

    try {
      const system = `You are a helpful internal support agent at a nonprofit.
Write a professional, empathetic first response to this support ticket.
Keep it under 100 words. Be specific to the issue described.
Don't use placeholders — write as if you will actually send this.`;
      const user = `Ticket title: ${ticket.title}\nDescription: ${ticket.description}\nRaised by: ${ticket.raisedBy}\nDepartment: ${ticket.category}\nUrgency: ${ticket.urgency}`;
      return await groqChat(system, user, groqApiKey);
    } catch {
      return mockDraft(ticket);
    }
  }, [hasKey, groqApiKey]);

  return { categorize, findSimilar, draftResponse, hasKey };
}
