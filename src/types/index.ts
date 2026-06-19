export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type Department = 'IT' | 'HR' | 'Finance' | 'Admin';
export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type Role = 'employee' | 'agent' | 'admin';

export interface ActivityEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: Department;
  urgency: UrgencyLevel;
  status: TicketStatus;
  raisedBy: string;
  raisedAt: string;
  updatedAt: string;
  agentNotes?: string;
  aiDraftResponse?: string;
  similarTicketIds?: string[];
  aiCategorySuggestion?: Department;
  aiConfidence?: number;
  aiCategoryReason?: string;
  aiRouted?: boolean;
  activity: ActivityEntry[];
}
