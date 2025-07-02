// src/app/(auth)/dashboard/raffles/[id]/page.tsx

import RaffleDetailPage from './RaffleDetailPageClient'

type Props = {
    params: Promise<{
        id: string
    }>
}

export default async function RaffleDetailPageWrapper({ params }: Props) {
    const { id } = await params
    return <RaffleDetailPage id={id} />
}