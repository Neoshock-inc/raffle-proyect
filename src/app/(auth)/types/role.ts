export interface Role {
    id: string
    name: string
    description?: string
}

export interface RoleFeature {
    id: string
    role_id: string
    feature_id: string
    is_enabled: boolean
}
