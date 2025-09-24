export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(" ")
}

export type ClassValue = string | undefined | null | boolean
