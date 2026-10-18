'use client';

import clsx from 'clsx';
import {
  CalendarDays, ChevronsLeft, ChevronsRight, FileText, LayoutDashboard, ListChecks, Menu, Settings, StickyNote,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, type ReactNode } from 'react';
import { PageLoading } from '@/components/ui/empty';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useData } from '@/lib/data/store';
import { getTheme, setTheme } from '@/lib/utils/theme';
import { GlobalSearch } from './global-search';
import { LanguageSwitcher } from './language-switcher';
import { NotificationsMenu } from './notifications-menu';
import { UserMenu } from './user-menu';

export function Shell({ projectId, children }: { projectId: string; children: ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { project, projects, projectFound, ready } = useData();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const base = `/projects/${projectId}`;

  useEffect(() => { setTheme(getTheme()); }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const nav = [
    { href: base, key: 'overview', icon: LayoutDashboard },
    { href: `${base}/introduction`, key: 'introduction', icon: FileText },
    { href: `${base}/tasks`, key: 'tasks', icon: ListChecks },
    { href: `${base}/calendar`, key: 'calendar', icon: CalendarDays },
    { href: `${base}/notes`, key: 'notes', icon: StickyNote },
    { href: `${base}/settings`, key: 'settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen">
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden />}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col gap-1 border-r border-line bg-side p-3 transition-transform',
          'md:sticky md:top-0 md:h-screen md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed && 'md:w-[72px]',
        )}
      >
        <Link href="/projects" className="mb-4 flex items-center gap-2 px-2 py-1 font-semibold" title={t('projects.all')}>
          <span className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-pri to-sec" aria-hidden />
          <span className={clsx(collapsed && 'md:hidden')}>Neemo</span>
        </Link>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {nav.map(({ href, key, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={key} href={href} title={t(`nav.${key}`)} aria-current={active ? 'page' : undefined}
                className={clsx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  active ? 'nav-active text-fg' : 'text-mute hover:bg-elev hover:text-fg',
                )}
              >
                <Icon size={18} className="shrink-0" />
                <span className={clsx(collapsed && 'md:hidden')}>{t(`nav.${key}`)}</span>
              </Link>
            );
          })}
        </nav>
        <button
          type="button" onClick={() => setCollapsed((v) => !v)} aria-label={t('common.collapse')}
          className="mt-auto hidden items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-mute hover:bg-elev md:flex"
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="topbar sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 md:px-6">
          <button
            type="button" className="rounded-xl border border-line bg-elev p-2 md:hidden"
            aria-label={t('common.openNav')} onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>
          <select
            aria-label={t('common.project')} className="input w-auto max-w-56" value={projectFound ? project.id : ''}
            onChange={(e) => router.push(e.target.value === '__all' ? '/projects' : `/projects/${e.target.value}`)}
          >
            {!projectFound && <option value="">{ready ? '—' : '…'}</option>}
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            <option value="__all">{t('projects.all')}</option>
          </select>
          <div className="order-last w-full md:order-none md:w-auto md:flex-1"><GlobalSearch projectId={projectId} /></div>
          <span className="hidden flex-1 md:block" />
          <LanguageSwitcher />
          <NotificationsMenu />
          <UserMenu />
        </header>
        <main className="mx-auto max-w-[1500px] p-4 md:p-6">
          {!ready ? <PageLoading /> : !projectFound ? (
            <div className="card mx-auto max-w-md text-center">
              <p className="mb-3">{t('projects.notFound')}</p>
              <Link href="/projects" className="text-sec hover:underline">{t('projects.all')}</Link>
            </div>
          ) : children}
        </main>
      </div>
    </div>
  );
}
