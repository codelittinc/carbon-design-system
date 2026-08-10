import { ClassValue } from 'clsx';

declare function cn(...inputs: ClassValue[]): string;

declare function formatMoney(value: string | number | null | undefined): string;
declare function formatDate(iso: string | null | undefined): string;
declare function formatPeriodLabel(month: number, year: number): string;

export { cn, formatDate, formatMoney, formatPeriodLabel };
