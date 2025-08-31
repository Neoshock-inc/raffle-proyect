// src/app/[tenant]/loading.tsx - Loading page específico para tenant
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-500 mb-8"></div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Cargando...</h2>
        <p className="text-gray-500">Preparando tu experiencia de rifa</p>
      </div>
    </div>
  );
}