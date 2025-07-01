// src/app/(auth)/dashboard/raffles/[id]/page.tsx

import RaffleDetailPage from './RaffleDetailPageClient'

export default function RaffleDetailPageWrapper({ params }: { params: { id: string } }) {
    const { id } = params
    return <RaffleDetailPage id={id} />
}
