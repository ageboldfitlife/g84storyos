import type { StoryProjectState } from '@/types';

export function exportProjectAsJSON(state: StoryProjectState): void {
  // Backend integration point: POST /api/projects/:id/export
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${state.project_meta.title.replace(/\s+/g, '_')}_v${state.project_meta.version}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day}/${year} ${hours}:${minutes}`;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    seed: 'SEED',
    developing: 'DEVELOPING',
    structured: 'STRUCTURED',
    draft: 'DRAFT',
    locked: 'LOCKED',
  };
  return map[status] ?? status.toUpperCase();
}

export function calculatePremiseWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getConceptStrengthColor(value: number): string {
  if (value >= 80) return '#82C882';
  if (value >= 60) return '#D4A853';
  if (value >= 40) return '#E8A87C';
  return '#C86464';
}