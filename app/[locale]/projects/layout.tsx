import { AuthGate } from '@/components/auth/auth-gate';

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
