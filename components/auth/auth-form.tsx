'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, type FormEvent } from 'react';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/auth-provider';
import { credentialsSchema, fieldErrors } from '@/lib/validations/schemas';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const t = useTranslations();
  const { configured, loading, user, signIn, signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';

  useEffect(() => {
    if (!loading && user) router.replace('/projects');
  }, [loading, user, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setServerError('');
    const r = credentialsSchema.safeParse({ email, password });
    if (!r.success) { setErrors(fieldErrors(r.error)); return; }
    setErrors({});
    setBusy(true);
    if (isLogin) {
      const err = await signIn(r.data.email, r.data.password);
      if (err) setServerError(err); else router.replace('/projects');
    } else {
      const res = await signUp(r.data.email, r.data.password);
      if (res.error) setServerError(res.error);
      else if (res.needsConfirm) setNotice(t('auth.checkEmail'));
      else router.replace('/projects');
    }
    setBusy(false);
  }

  const err = (k: string) => (errors[k] ? t(`validation.${errors[k]}`) : undefined);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute right-4 top-4"><LanguageSwitcher /></div>
      <div className="card w-full max-w-sm">
        <div className="mb-4 flex items-center gap-2 font-semibold">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-pri to-sec" aria-hidden />
          {t('app.name')}
        </div>
        <h1 className="text-xl font-medium">{t(isLogin ? 'auth.login' : 'auth.register')}</h1>

        {!configured ? (
          <div className="mt-4 space-y-3 text-sm">
            <p className="text-mute">{t('auth.notConfigured')}</p>
            <Link href="/projects" className="inline-block rounded-xl bg-gradient-to-br from-pri to-indigo-600 px-3 py-1.5 text-white">{t('auth.openApp')}</Link>
          </div>
        ) : notice ? (
          <div className="mt-4 space-y-3 text-sm">
            <p role="status">{notice}</p>
            <Link href="/login" className="text-sec hover:underline">{t('auth.login')}</Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <Field id="a-email" label={t('auth.email')} error={err('email')}>
              <input id="a-email" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </Field>
            <Field id="a-pass" label={t('auth.password')} error={err('password')}>
              <input id="a-pass" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            {!isLogin && <p className="mt-1 text-xs text-mute">{t('auth.passwordHint')}</p>}
            {serverError && <p role="alert" className="mt-3 text-sm text-red-400">{t('auth.error')}: {serverError}</p>}
            <Button type="submit" variant="primary" className="mt-5 w-full" disabled={busy}>{t(isLogin ? 'auth.login' : 'auth.register')}</Button>
            <p className="mt-4 text-center text-sm text-mute">
              {t(isLogin ? 'auth.noAccount' : 'auth.haveAccount')}{' '}
              <Link href={isLogin ? '/register' : '/login'} className="text-sec hover:underline">{t(isLogin ? 'auth.register' : 'auth.login')}</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
