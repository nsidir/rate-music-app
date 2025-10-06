export function parseAlbumId(raw: string | number) {
  const s = String(raw);
  if (s.startsWith('mb:rg:')) return { kind: 'mb' as const, rg: s.slice(6) };
  const n = Number(s);
  if (Number.isNaN(n)) throw new Error(`Invalid album id: ${raw}`);
  return { kind: 'db' as const, id: n };
}