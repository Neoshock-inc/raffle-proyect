// components/templates/DefaultTemplate/index.tsx

type TicketOption = {
  id: string | number;
  amount: number;
  price: number;
  buttonText: string;
};

type RaffleData = {
  title: string;
  description: string;
  price: number;
  soldTickets: number;
  total_numbers: number;
};

type TenantConfig = {
  name: string;
};

interface DefaultTemplateProps {
  raffleData: RaffleData;
  ticketOptions: TicketOption[];
  tenantConfig: TenantConfig;
}

export function DefaultTemplate({ raffleData, ticketOptions, tenantConfig }: DefaultTemplateProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {tenantConfig.name}
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">{raffleData.title}</h2>
          <p className="text-gray-600 mb-4">{raffleData.description}</p>
          <p className="text-lg">
            Precio por ticket: <span className="font-bold">${raffleData.price}</span>
          </p>
          <p className="text-sm text-gray-500">
            Tickets vendidos: {raffleData.soldTickets} / {raffleData.total_numbers}
          </p>
        </div>
        
        <div className="grid gap-4">
          <h3 className="text-xl font-bold">Paquetes de Tickets</h3>
          {ticketOptions.map((option) => (
            <div key={option.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold">{option.amount} Tickets</h4>
                  <p className="text-gray-600">Precio: ${option.price}</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  {option.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}