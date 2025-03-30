import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind CSS de manera segura
 * @param inputs Clases a combinar
 * @returns Clases combinadas y optimizadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Tus funciones existentes para cookies
export function setCookie(name: string, value: string, days: number) {
  if (typeof window === 'undefined') return;
  
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

export function getCookie(name: string) {
  if (typeof window === 'undefined') return '';
  
  const cookieName = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return '';
}