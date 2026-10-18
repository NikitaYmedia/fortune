import { Shell } from '@/components/layout/shell';

export default async function ProjectLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <Shell projectId={projectId}>{children}</Shell>;
}
