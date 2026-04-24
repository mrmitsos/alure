import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getErrorMessage = (err: unknown): string => {
  const error = err as { response?: { data?: { message?: string } } }
  return error?.response?.data?.message || 'Something went wrong'
}