export function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-GB', options).replace(/\//g, '-');
}

export function generateUniqueId(): string {
    return `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}