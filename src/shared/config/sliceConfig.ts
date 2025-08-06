// Configuration for enabling/disabling slices in AI generation
export const SLICE_CONFIG = {
  // Core slices (always enabled)
  typography: true,
  image: true,
  divider: true,
  blog_link: true,

  // Interactive slices
  notification: true,
  accordion: true,
  pros_cons: true,

  // Advanced slices (can be toggled)
  //   checklist: process.env.ENABLE_CHECKLIST_SLICE ?? false,
  //   tips: process.env.ENABLE_TIPS_SLICE ?? false,
  //   table: process.env.ENABLE_TABLE_SLICE ?? false,
  //   dos_donts: process.env.ENABLE_DOS_DONTS_SLICE ?? false,
  //   quote: process.env.ENABLE_QUOTE_SLICE ?? false,
  //   call_to_action: process.env.ENABLE_CTA_SLICE ?? false,
  checklist: false,
  tips: false,
  table: false,
  dos_donts: false,
  quote: false,
  call_to_action: false,
} as const;

// Helper function to get enabled slices
export function getEnabledSlices() {
  return Object.entries(SLICE_CONFIG)
    .filter(([_, enabled]) => enabled)
    .map(([slice, _]) => slice);
}

// Helper to check if a slice is enabled
export function isSliceEnabled(sliceType: string): boolean {
  return SLICE_CONFIG[sliceType as keyof typeof SLICE_CONFIG] ?? false;
}

// Get enabled slices as formatted string for AI prompts
export function getEnabledSlicesForPrompt(): string {
  const enabled = getEnabledSlices();
  return enabled.map(slice => `- ${slice}`).join('\n');
}
