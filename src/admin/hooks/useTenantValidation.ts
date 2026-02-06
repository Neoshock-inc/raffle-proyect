
// hooks/useTenantValidation.ts
import { useState, useCallback } from 'react'
import { tenantService } from '../services/tenantService'

export const useTenantValidation = () => {
    const [validatingSlug, setValidatingSlug] = useState(false)
    const [validatingDomain, setValidatingDomain] = useState(false)

    const validateSlug = useCallback(async (slug: string): Promise<boolean> => {
        if (!slug) return false

        setValidatingSlug(true)
        try {
            const isAvailable = await tenantService.validateSlug(slug)
            return isAvailable
        } catch (error) {
            console.error('Error validating slug:', error)
            return false
        } finally {
            setValidatingSlug(false)
        }
    }, [])

    const validateDomain = useCallback(async (domain: string): Promise<boolean> => {
        if (!domain) return false

        setValidatingDomain(true)
        try {
            const isAvailable = await tenantService.validateDomain(domain)
            return isAvailable
        } catch (error) {
            console.error('Error validating domain:', error)
            return false
        } finally {
            setValidatingDomain(false)
        }
    }, [])

    const generateSlugFromName = useCallback((name: string): string => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 50)
    }, [])

    return {
        validateSlug,
        validateDomain,
        generateSlugFromName,
        validatingSlug,
        validatingDomain
    }
}