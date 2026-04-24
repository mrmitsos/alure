import PropertyDetail from '@/components/PropertyDetail'

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PropertyDetail id={id} />
}