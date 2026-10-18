import { Overview } from '@/components/dashboard/overview';

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <Overview projectId={projectId} />;
}
