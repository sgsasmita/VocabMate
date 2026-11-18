export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${s}s`;
}

export function pickRandom<T>(arr: T[], n: number, exclude: Set<string> = new Set(), key?: (item: T) => string): T[] {
  const pool = key ? arr.filter((x) => !exclude.has(key(x))) : [...arr];
  const out: T[] = [];
  const copy = [...pool];
  while (out.length < n && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}
