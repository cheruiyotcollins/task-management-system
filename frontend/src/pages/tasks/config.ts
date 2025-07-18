export const sortOptions = [
  { label: "Priority: High to Low", name: "priority,desc", current: false },
  { label: "Priority: Low to High", name: "priority,asc", current: false },
  { label: "Due Date: Soonest First", name: "dueDate,asc", current: false },
  { label: "Due Date: Latest First", name: "dueDate,desc", current: false },
  { label: "Created: Newest First", name: "createdAt,desc", current: false },
  { label: "Created: Oldest First", name: "createdAt,asc", current: false },
  { label: "Status", name: "status", current: false }, // Optional: customize logic
];
