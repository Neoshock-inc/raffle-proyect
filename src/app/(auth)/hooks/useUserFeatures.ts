// src/hooks/useUserFeatures.ts

'use client'

import { useEffect, useState } from 'react'
import { featureService } from '../services/featureService'
import { Feature } from '../types/feature'
import { authService } from '../services/authService'

export const useUserFeatures = () => {
    const [features, setFeatures] = useState<Feature[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<any>(null)

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const user = await authService.getUser()
                if (!user) return
                const data = await featureService.getUserFeatures(user.id)
                setFeatures(data)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchFeatures()
    }, [])

    return { features, loading, error }
}
