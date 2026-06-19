import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { Ticket, Role, Department, TicketStatus } from '../types';
import { loadTickets, saveTickets, loadUser, saveUser, loadGroqKey, saveGroqKey, removeGroqKey } from '../utils/storage';
import { mockTickets } from '../utils/mockData';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface AppState {
  tickets: Ticket[];
  currentRole: Role;
  currentUser: string;
  groqApiKey: string;
  agentDepartment: Department;
  toasts: Toast[];
}

type Action =
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'SET_USER'; name: string }
  | { type: 'SET_GROQ_KEY'; key: string }
  | { type: 'REMOVE_GROQ_KEY' }
  | { type: 'SET_AGENT_DEPT'; dept: Department }
  | { type: 'ADD_TICKET'; ticket: Ticket }
  | { type: 'UPDATE_TICKET'; ticket: Ticket }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, currentRole: action.role };
    case 'SET_USER':
      return { ...state, currentUser: action.name };
    case 'SET_GROQ_KEY':
      return { ...state, groqApiKey: action.key };
    case 'REMOVE_GROQ_KEY':
      return { ...state, groqApiKey: '' };
    case 'SET_AGENT_DEPT':
      return { ...state, agentDepartment: action.dept };
    case 'ADD_TICKET':
      return { ...state, tickets: [action.ticket, ...state.tickets] };
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(t => t.id === action.ticket.id ? action.ticket : t),
      };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  setRole: (role: Role) => void;
  setUser: (name: string) => void;
  setGroqKey: (key: string) => void;
  clearGroqKey: () => void;
  setAgentDept: (dept: Department) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (ticket: Ticket) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus, actor: string) => void;
  saveAgentNote: (ticketId: string, note: string, actor: string) => void;
  showToast: (message: string, type?: Toast['type']) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const stored = loadTickets();
  const initial: AppState = {
    tickets: stored.length > 0 ? stored : mockTickets,
    currentRole: 'employee',
    currentUser: loadUser(),
    groqApiKey: loadGroqKey(),
    agentDepartment: 'IT',
    toasts: [],
  };

  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    saveTickets(state.tickets);
  }, [state.tickets]);

  useEffect(() => {
    saveUser(state.currentUser);
  }, [state.currentUser]);

  const setRole = useCallback((role: Role) => dispatch({ type: 'SET_ROLE', role }), []);
  const setUser = useCallback((name: string) => dispatch({ type: 'SET_USER', name }), []);
  const setGroqKey = useCallback((key: string) => { saveGroqKey(key); dispatch({ type: 'SET_GROQ_KEY', key }); }, []);
  const clearGroqKey = useCallback(() => { removeGroqKey(); dispatch({ type: 'REMOVE_GROQ_KEY' }); }, []);
  const setAgentDept = useCallback((dept: Department) => dispatch({ type: 'SET_AGENT_DEPT', dept }), []);
  const addTicket = useCallback((ticket: Ticket) => dispatch({ type: 'ADD_TICKET', ticket }), []);
  const updateTicket = useCallback((ticket: Ticket) => dispatch({ type: 'UPDATE_TICKET', ticket }), []);

  const updateTicketStatus = useCallback((ticketId: string, status: TicketStatus, actor: string) => {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const updated: Ticket = {
      ...ticket,
      status,
      updatedAt: new Date().toISOString(),
      activity: [
        ...ticket.activity,
        { id: crypto.randomUUID(), action: `Status changed to ${status}`, actor, timestamp: new Date().toISOString() },
      ],
    };
    dispatch({ type: 'UPDATE_TICKET', ticket: updated });
  }, [state.tickets]);

  const saveAgentNote = useCallback((ticketId: string, note: string, actor: string) => {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const updated: Ticket = {
      ...ticket,
      agentNotes: note,
      updatedAt: new Date().toISOString(),
      activity: [
        ...ticket.activity,
        { id: crypto.randomUUID(), action: 'Note added by agent', actor, timestamp: new Date().toISOString() },
      ],
    };
    dispatch({ type: 'UPDATE_TICKET', ticket: updated });
  }, [state.tickets]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD_TOAST', toast: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 3000);
  }, []);

  return (
    <AppContext.Provider value={{
      ...state,
      setRole, setUser, setGroqKey, clearGroqKey, setAgentDept,
      addTicket, updateTicket, updateTicketStatus, saveAgentNote, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
