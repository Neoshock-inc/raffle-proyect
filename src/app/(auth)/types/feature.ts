// src/types/feature.ts

export interface Feature {
  id: string
  code: string
  label: string
  route: string
  icon: string
  parent_id?: string | null
  order?: number
}

export interface NavigationItem {
  name: string
  href: string
  icon: any // luego puedes tipar con un icon union si quieres
}
