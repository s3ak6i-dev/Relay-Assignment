import type { Ticket } from '../types';

const now = Date.now();
const hr = 3600000;
const day = 86400000;

function ts(msAgo: number) {
  return new Date(now - msAgo).toISOString();
}

export const mockTickets: Ticket[] = [
  {
    id: 'TKT-0041',
    title: 'VPN not connecting from home network',
    description:
      "I'm unable to connect to the office VPN from my home network. It was working fine last week. I've tried restarting my router but no luck.",
    category: 'IT',
    urgency: 'Critical',
    status: 'Open',
    raisedBy: 'Priya Menon',
    raisedAt: ts(2 * hr),
    updatedAt: ts(2 * hr),
    aiRouted: true,
    aiCategorySuggestion: 'IT',
    aiConfidence: 0.96,
    aiCategoryReason: 'Sounds like a network/VPN connectivity issue',
    activity: [
      { id: 'a1', action: 'Ticket raised', actor: 'Priya Menon', timestamp: ts(2 * hr) },
      { id: 'a2', action: 'AI routed to IT', actor: 'AI', timestamp: ts(2 * hr - 1000) },
    ],
  },
  {
    id: 'TKT-0039',
    title: 'Laptop screen flickering',
    description:
      'My laptop screen has been flickering for the past two days. It gets worse when I open heavy applications like Chrome with multiple tabs.',
    category: 'IT',
    urgency: 'High',
    status: 'In Progress',
    raisedBy: 'Rahul Sharma',
    raisedAt: ts(5 * hr),
    updatedAt: ts(3 * hr),
    activity: [
      { id: 'b1', action: 'Ticket raised', actor: 'Rahul Sharma', timestamp: ts(5 * hr) },
      { id: 'b2', action: 'Status changed to In Progress', actor: 'IT Agent', timestamp: ts(3 * hr) },
    ],
  },
  {
    id: 'TKT-0037',
    title: 'Access to shared drive denied',
    description:
      'I cannot access the shared Marketing drive. I need it for the campaign assets folder. Getting a permissions error.',
    category: 'IT',
    urgency: 'Medium',
    status: 'Open',
    raisedBy: 'Ananya Krishnan',
    raisedAt: ts(1 * day),
    updatedAt: ts(1 * day),
    aiRouted: true,
    aiCategorySuggestion: 'IT',
    aiConfidence: 0.88,
    aiCategoryReason: 'Shared drive access is an IT permissions issue',
    activity: [
      { id: 'c1', action: 'Ticket raised', actor: 'Ananya Krishnan', timestamp: ts(1 * day) },
      { id: 'c2', action: 'AI routed to IT', actor: 'AI', timestamp: ts(1 * day - 1000) },
    ],
  },
  {
    id: 'TKT-0033',
    title: 'New keyboard request',
    description:
      'My keyboard has a few sticky keys, making it difficult to type efficiently. Requesting a replacement.',
    category: 'IT',
    urgency: 'Low',
    status: 'Open',
    raisedBy: 'Dev Trivedi',
    raisedAt: ts(3 * day),
    updatedAt: ts(3 * day),
    activity: [
      { id: 'd1', action: 'Ticket raised', actor: 'Dev Trivedi', timestamp: ts(3 * day) },
    ],
  },
  {
    id: 'TKT-0035',
    title: 'June salary not credited',
    description:
      'My June salary has not been credited as of today, the 5th of July. Usually it comes by the 1st. Please look into this urgently.',
    category: 'HR',
    urgency: 'Critical',
    status: 'Resolved',
    raisedBy: 'Meena Iyer',
    raisedAt: ts(2 * day),
    updatedAt: ts(1 * day),
    aiRouted: true,
    aiCategorySuggestion: 'HR',
    aiConfidence: 0.93,
    aiCategoryReason: 'Salary issue handled by HR/Finance',
    agentNotes:
      'Salary processed. Delay was due to a bank batch error. Should reflect within 24 hours.',
    activity: [
      { id: 'e1', action: 'Ticket raised', actor: 'Meena Iyer', timestamp: ts(2 * day) },
      { id: 'e2', action: 'AI routed to HR', actor: 'AI', timestamp: ts(2 * day - 1000) },
      { id: 'e3', action: 'Status changed to In Progress', actor: 'HR Agent', timestamp: ts(2 * day - hr) },
      { id: 'e4', action: 'Note added by agent', actor: 'HR Agent', timestamp: ts(1 * day + hr) },
      { id: 'e5', action: 'Status changed to Resolved', actor: 'HR Agent', timestamp: ts(1 * day) },
    ],
  },
  {
    id: 'TKT-0029',
    title: 'Office chair replacement needed',
    description:
      'The armrest on my office chair is broken. It keeps wobbling and is affecting my posture. Requesting a replacement.',
    category: 'Admin',
    urgency: 'Low',
    status: 'Closed',
    raisedBy: 'Priya Menon',
    raisedAt: ts(7 * day),
    updatedAt: ts(5 * day),
    agentNotes: 'New chair ordered. Expected delivery next week.',
    activity: [
      { id: 'f1', action: 'Ticket raised', actor: 'Priya Menon', timestamp: ts(7 * day) },
      { id: 'f2', action: 'Status changed to In Progress', actor: 'Admin Agent', timestamp: ts(6 * day) },
      { id: 'f3', action: 'Note added by agent', actor: 'Admin Agent', timestamp: ts(5 * day + hr) },
      { id: 'f4', action: 'Status changed to Closed', actor: 'Admin Agent', timestamp: ts(5 * day) },
    ],
  },
  {
    id: 'TKT-0021',
    title: 'Payslip discrepancy — March',
    description:
      'My March payslip shows incorrect HRA deduction. The amount deducted is higher than agreed in my offer letter.',
    category: 'HR',
    urgency: 'High',
    status: 'Resolved',
    raisedBy: 'Arjun Nair',
    raisedAt: ts(14 * day),
    updatedAt: ts(11 * day),
    agentNotes: 'Verified with payroll. Recalculated and corrected. Credit issued.',
    activity: [
      { id: 'g1', action: 'Ticket raised', actor: 'Arjun Nair', timestamp: ts(14 * day) },
      { id: 'g2', action: 'Status changed to In Progress', actor: 'HR Agent', timestamp: ts(13 * day) },
      { id: 'g3', action: 'Status changed to Resolved', actor: 'HR Agent', timestamp: ts(11 * day) },
    ],
  },
  {
    id: 'TKT-0018',
    title: 'June salary delay query',
    description:
      'Wanted to check if there is any delay in June salaries. The usual date was yesterday and it still has not reflected.',
    category: 'HR',
    urgency: 'Medium',
    status: 'Resolved',
    raisedBy: 'Sunita Rao',
    raisedAt: ts(18 * day),
    updatedAt: ts(16 * day),
    agentNotes: 'Communicated bank processing delay. Resolved next day.',
    activity: [
      { id: 'h1', action: 'Ticket raised', actor: 'Sunita Rao', timestamp: ts(18 * day) },
      { id: 'h2', action: 'Status changed to Resolved', actor: 'HR Agent', timestamp: ts(16 * day) },
    ],
  },
  {
    id: 'TKT-0015',
    title: 'Reimbursement claim not processed',
    description:
      'I submitted a travel reimbursement claim for the Pune trip on June 2nd. It is now 3 weeks and no update. Claim ID: RC-2024-0891.',
    category: 'Finance',
    urgency: 'High',
    status: 'In Progress',
    raisedBy: 'Kavitha Suresh',
    raisedAt: ts(21 * day),
    updatedAt: ts(19 * day),
    aiRouted: true,
    aiCategorySuggestion: 'Finance',
    aiConfidence: 0.91,
    aiCategoryReason: 'Reimbursement and expense claims are Finance',
    activity: [
      { id: 'i1', action: 'Ticket raised', actor: 'Kavitha Suresh', timestamp: ts(21 * day) },
      { id: 'i2', action: 'AI routed to Finance', actor: 'AI', timestamp: ts(21 * day - 1000) },
      { id: 'i3', action: 'Status changed to In Progress', actor: 'Finance Agent', timestamp: ts(19 * day) },
    ],
  },
  {
    id: 'TKT-0012',
    title: 'Invoice approval pending',
    description:
      'A vendor invoice for ₹45,000 has been pending approval for two weeks. The vendor is following up. Invoice #INV-0892.',
    category: 'Finance',
    urgency: 'Medium',
    status: 'Resolved',
    raisedBy: 'Rohan Verma',
    raisedAt: ts(25 * day),
    updatedAt: ts(22 * day),
    agentNotes: 'Invoice approved and payment initiated. Vendor notified.',
    activity: [
      { id: 'j1', action: 'Ticket raised', actor: 'Rohan Verma', timestamp: ts(25 * day) },
      { id: 'j2', action: 'Status changed to Resolved', actor: 'Finance Agent', timestamp: ts(22 * day) },
    ],
  },
  {
    id: 'TKT-0009',
    title: 'New joiner onboarding kit missing',
    description:
      'I joined two weeks ago but have not received my onboarding kit — laptop bag, stationery, and ID card holder. Wanted to follow up.',
    category: 'Admin',
    urgency: 'Medium',
    status: 'Resolved',
    raisedBy: 'Neha Patil',
    raisedAt: ts(28 * day),
    updatedAt: ts(26 * day),
    agentNotes: 'Kit dispatched and delivered.',
    activity: [
      { id: 'k1', action: 'Ticket raised', actor: 'Neha Patil', timestamp: ts(28 * day) },
      { id: 'k2', action: 'Status changed to Resolved', actor: 'Admin Agent', timestamp: ts(26 * day) },
    ],
  },
  {
    id: 'TKT-0006',
    title: 'Conference room booking conflict',
    description:
      'Conference Room B was double-booked for Tuesday 3–4 PM. Two teams have conflicting reservations.',
    category: 'Admin',
    urgency: 'Low',
    status: 'Closed',
    raisedBy: 'Suresh Kumar',
    raisedAt: ts(30 * day),
    updatedAt: ts(29 * day),
    agentNotes: 'Resolved by rebooking one team to Room A.',
    activity: [
      { id: 'l1', action: 'Ticket raised', actor: 'Suresh Kumar', timestamp: ts(30 * day) },
      { id: 'l2', action: 'Status changed to Closed', actor: 'Admin Agent', timestamp: ts(29 * day) },
    ],
  },
  {
    id: 'TKT-0055',
    title: 'Leave policy clarification',
    description:
      'I need clarity on whether carry-forward leaves from 2023 are applicable in 2024. HR portal shows 0 carry-forward but my manager said 5 days were approved.',
    category: 'HR',
    urgency: 'Medium',
    status: 'Open',
    raisedBy: 'Tanya Singh',
    raisedAt: ts(52 * hr),
    updatedAt: ts(52 * hr),
    aiRouted: true,
    aiCategorySuggestion: 'HR',
    aiConfidence: 0.89,
    aiCategoryReason: 'Leave policy is an HR matter',
    activity: [
      { id: 'm1', action: 'Ticket raised', actor: 'Tanya Singh', timestamp: ts(52 * hr) },
      { id: 'm2', action: 'AI routed to HR', actor: 'AI', timestamp: ts(52 * hr - 1000) },
    ],
  },
  {
    id: 'TKT-0052',
    title: 'Printer on 3rd floor not working',
    description:
      'The HP LaserJet printer on the 3rd floor near the pantry has been offline since Monday. It shows a paper jam error but there is no paper inside.',
    category: 'IT',
    urgency: 'Medium',
    status: 'In Progress',
    raisedBy: 'Vikram Joshi',
    raisedAt: ts(60 * hr),
    updatedAt: ts(48 * hr),
    activity: [
      { id: 'n1', action: 'Ticket raised', actor: 'Vikram Joshi', timestamp: ts(60 * hr) },
      { id: 'n2', action: 'Status changed to In Progress', actor: 'IT Agent', timestamp: ts(48 * hr) },
    ],
  },
  {
    id: 'TKT-0058',
    title: 'Production server down — all services unreachable',
    description:
      'The main production server has been completely unreachable since this morning. All internal services including email, CRM, and the HR portal are down. The entire organisation is affected and no work can proceed. This needs immediate escalation.',
    category: 'IT',
    urgency: 'Critical',
    status: 'Open',
    raisedBy: 'Rahul Varma',
    raisedAt: ts(56 * hr),
    updatedAt: ts(56 * hr),
    aiRouted: true,
    aiCategorySuggestion: 'IT',
    aiConfidence: 0.97,
    aiCategoryReason: 'Server and infrastructure outages are IT critical incidents',
    activity: [
      { id: 'p1', action: 'Ticket raised', actor: 'Rahul Varma', timestamp: ts(56 * hr) },
      { id: 'p2', action: 'AI routed to IT', actor: 'AI', timestamp: ts(56 * hr - 1000) },
    ],
  },
  {
    id: 'TKT-0048',
    title: 'Budget approval for team event',
    description:
      'Requesting approval for a team offsite budget of ₹80,000 for the Q3 team-building event. Manager has approved, need Finance sign-off.',
    category: 'Finance',
    urgency: 'Low',
    status: 'Open',
    raisedBy: 'Deepa Menon',
    raisedAt: ts(72 * hr),
    updatedAt: ts(72 * hr),
    activity: [
      { id: 'o1', action: 'Ticket raised', actor: 'Deepa Menon', timestamp: ts(72 * hr) },
    ],
  },
];
