'use client'
export const calculateProgress = (sold: number, total: number) => {
  return Math.min((sold / total) * 100, 100)
}
