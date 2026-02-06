import { Role } from './role'

export interface UserRole {
    id: string
    user_id: string
    role_id: string
    created_at: string
    role: Role
}

export interface AppUser {
    id: string
    email: string
    user_roles: UserRole[]
}
