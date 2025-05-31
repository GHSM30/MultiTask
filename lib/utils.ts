export function cn(...inputs: (string | undefined | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}
/*
export function setCookie(name: string, value: string, days: number) {
  if (typeof window !== 'undefined') {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }
}
*/
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    const value = document.cookie.split('; ').find(row => row.startsWith('token='));
    return value ? decodeURIComponent(value.split('=')[1]) : null;
  }
  return null;
}

export const setCookie = (name: string, value: string, days: number) => {
  const date = new Date()
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`
}

export const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
}