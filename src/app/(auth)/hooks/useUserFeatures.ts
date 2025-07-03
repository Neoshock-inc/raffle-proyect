import { useEffect, useState } from 'react'
import { featureService } from '../services/featureService'
import { Feature } from '../types/feature'
import { authService } from '../services/authService'

interface MenuGroup {
    parent: Feature
    children: Feature[]
}

export const useUserFeatures = () => {
    const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFeatures = async () => {
            const user = await authService.getUser()
            if (!user) return

            const features = await featureService.getUserFeatures(user.id)

            // Separar padres y submenús
            const parents = features
                .filter(f => !f.parent_id)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

            const children = features
                .filter(f => f.parent_id)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

            const grouped: MenuGroup[] = parents.map(parent => ({
                parent,
                children: children.filter(child => child.parent_id === parent.id)
            }))

            setMenuGroups(grouped)
            setLoading(false)
        }

        fetchFeatures()
    }, [])

    return { menuGroups, loading }
}
