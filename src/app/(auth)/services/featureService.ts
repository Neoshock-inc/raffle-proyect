import { createClient } from '@supabase/supabase-js'
import { Feature } from '../types/feature'

interface SupabaseUserRole {
  role: {
    role_features: {
      feature: Feature | null
    }[]
  } | null
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const featureService = {
  async getUserFeatures(userId: string): Promise<Feature[]> {
    const result = await supabase
      .from('user_roles')
      .select(`
        role:role_id (
          role_features (
            feature:feature_id (
              id, code, label, route, icon, parent_id, order
            )
          )
        )
      `)
      .eq('user_id', userId)

    if (result.error) throw result.error

    const data = result.data as unknown as SupabaseUserRole[]
    const features: Feature[] = []

    for (const userRole of data) {
      const role = userRole.role
      if (role?.role_features) {
        for (const rf of role.role_features) {
          if (rf?.feature) {
            features.push(rf.feature)
          }
        }
      }
    }

    // Elimina duplicados por código
    const uniqueFeatures = Array.from(new Map(features.map(f => [f.code, f])).values())

    // Ordena por `order` (de menor a mayor)
    return uniqueFeatures.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }
}
