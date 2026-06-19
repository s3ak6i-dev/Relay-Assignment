import type { Ticket } from '../types';

const TICKETS_KEY = 'relay_tickets';
const USER_KEY = 'relay_user';
const GROQ_KEY = 'relay_groq_key';

export function loadTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTickets(tickets: Ticket[]): void {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

export function loadUser(): string {
  return localStorage.getItem(USER_KEY) ?? '';
}

export function saveUser(name: string): void {
  localStorage.setItem(USER_KEY, name);
}

export function loadGroqKey(): string {
  return localStorage.getItem(GROQ_KEY) ?? '';
}

export function saveGroqKey(key: string): void {
  localStorage.setItem(GROQ_KEY, key);
}

export function removeGroqKey(): void {
  localStorage.removeItem(GROQ_KEY);
}

const NOTIF_READ_KEY = 'relay_notif_read';

export function loadNotifRead(): string {
  return localStorage.getItem(NOTIF_READ_KEY) ?? new Date(0).toISOString();
}

export function saveNotifRead(ts: string): void {
  localStorage.setItem(NOTIF_READ_KEY, ts);
}
