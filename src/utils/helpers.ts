
export const fmtMoney = (value: number | undefined | null): string => {
  const num = Number(value) || 0;
  return `S/ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const parseDateDDMMYYYY = (s: string): Date | null => {
  if (!s) return null;
  const p = s.split('/');
  if (p.length !== 3) return null;
  const d = parseInt(p[0], 10);
  const m = parseInt(p[1], 10) - 1;
  const y = parseInt(p[2], 10);
  const dt = new Date(y, m, d);
  return isNaN(dt.getTime()) ? null : dt;
};

export const dateToDDMMYYYY = (d: Date): string => {
  if (!d) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};
