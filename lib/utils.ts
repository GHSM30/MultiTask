export function cn(...inputs: (string | undefined | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function setCookie(name: string, value: string, days: number) {
  if (typeof window !== 'undefined') {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    const value = document.cookie.split('; ').find(row => row.startsWith('token='));
    return value ? decodeURIComponent(value.split('=')[1]) : null;
  }
  return null;
}