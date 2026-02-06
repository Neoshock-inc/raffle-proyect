// 📁 components/tenant-details/tabs/UsersTab.tsx
import { TenantDetails } from '@/admin/types/tenant'
import { Users, MoreHorizontal } from 'lucide-react'

interface UsersTabProps {
  tenant: TenantDetails
  onInviteUser: () => void
}

export function UsersTab({ tenant, onInviteUser }: UsersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Usuarios del Tenant
        </h3>
        <button
          type="button"
          onClick={onInviteUser}
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <Users className="-ml-0.5 mr-1.5 h-5 w-5" />
          Invitar Usuario
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        {tenant.user_roles && tenant.user_roles.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {tenant.user_roles.map((userRole) => (
              <div key={userRole.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Usuario ID: {userRole.user_id.substring(0, 8)}...
                      </p>
                      <p className="text-sm text-gray-500">
                        {userRole.roles.name} - {userRole.roles.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {userRole.roles.name}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No hay usuarios asignados
            </h4>
            <p className="text-gray-500 mb-4">
              Invita usuarios para que puedan acceder y gestionar este tenant.
            </p>
            <button
              type="button"
              onClick={onInviteUser}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <Users className="-ml-0.5 mr-1.5 h-5 w-5" />
              Invitar Primer Usuario
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
