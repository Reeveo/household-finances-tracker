// Color palettes for charts based on the shadcn theme

// Primary color palette
export const PRIMARY_COLORS = [
  '#0f172a', // primary
  '#0d9488', // secondary
  '#6366f1', // accent
  '#64748b', // muted
];

// Extended color palette for category-based charts
export const CATEGORY_COLORS = [
  '#0088FE', // blue
  '#00C49F', // teal
  '#FFBB28', // yellow
  '#FF8042', // orange
  '#8884d8', // purple
  '#82ca9d', // green
];

// Semantic color palette
export const SEMANTIC_COLORS = {
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

// Spending categories color map
export const SPENDING_CATEGORY_COLORS = {
  Essentials: '#3b82f6', // blue
  Lifestyle: '#22c55e', // green
  Savings: '#8b5cf6', // purple
  Income: '#22c55e', // green
};

// Badge color styles for different categories
export const BADGE_STYLES = {
  Essentials: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Income: { bg: 'bg-green-100', text: 'text-green-800' },
  Lifestyle: { bg: 'bg-green-100', text: 'text-green-800' },
  Savings: { bg: 'bg-purple-100', text: 'text-purple-800' },
};

// Progress bar colors
export const PROGRESS_BAR_COLORS = {
  good: 'bg-green-600',
  warning: 'bg-orange-500',
  danger: 'bg-red-600',
};

// Transparency variations
export const transparency = {
  light: '10',
  medium: '30',
  strong: '70',
};

// Generate a gradient for a chart
export const generateGradient = (ctx: CanvasRenderingContext2D, color: string) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, `${color}${transparency.strong}`);
  gradient.addColorStop(1, `${color}${transparency.light}`);
  return gradient;
};

// Get a color from the palette based on index
export function getCategoryColor(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

// Get a color for a specific category
export function getColorForCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    Essentials: SPENDING_CATEGORY_COLORS.Essentials,
    Lifestyle: SPENDING_CATEGORY_COLORS.Lifestyle,
    Savings: SPENDING_CATEGORY_COLORS.Savings,
    Income: SPENDING_CATEGORY_COLORS.Income,
    // Add more categories as needed
  };
  
  return categoryMap[category] || PRIMARY_COLORS[0];
}
