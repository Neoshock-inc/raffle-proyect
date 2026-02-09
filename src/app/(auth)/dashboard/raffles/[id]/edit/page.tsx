import RaffleWizardPage from '@/admin/components/raffle/wizard/RaffleWizardPage'

type Props = {
    params: Promise<{
        id: string
    }>
}

export default async function EditRafflePage({ params }: Props) {
    const { id } = await params
    return <RaffleWizardPage mode="edit" raffleId={id} />
}
