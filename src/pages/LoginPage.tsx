import { useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { BrandSelect } from '../components/ui/BrandSelect';
import { ModalDialog } from '../components/ui/Dialog';
import { useDashboard } from '../store/dashboardStore';
import type { TeamAccount } from '../types/dashboard';

interface LoginPageProps {
  mode?: 'login' | 'register';
}

const ROLE_OPTIONS: Array<{ value: TeamAccount['role']; label: string }> = [
  { value: 'Administrator', label: 'Administrator' },
  { value: 'Store Manager', label: 'Store Manager' },
  { value: 'Fulfillment Staff', label: 'Fulfillment Staff' },
  { value: 'Analyst', label: 'Analyst' },
];

function computePasswordStrength(password: string): {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  barColor: string;
  textColor: string;
} {
  if (!password) {
    return {
      level: 0,
      label: 'Input password',
      barColor: 'bg-[#E5E7EB]',
      textColor: 'text-[#555555]',
    };
  }
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1;

  if (score <= 1) {
    return { level: 1, label: 'Weak', barColor: 'bg-[#EF4444]', textColor: 'text-[#B91C1C]' };
  }
  if (score === 2) {
    return { level: 2, label: 'Fair', barColor: 'bg-[#F59E0B]', textColor: 'text-[#B45309]' };
  }
  if (score === 3) {
    return { level: 3, label: 'Good', barColor: 'bg-[#0057FF]', textColor: 'text-[#0057FF]' };
  }
  return { level: 4, label: 'Strong', barColor: 'bg-[#10B981]', textColor: 'text-[#047857]' };
}

export function LoginPage({ mode = 'login' }: LoginPageProps) {
  const { dispatch, navigate } = useDashboard();
  const isRegister = mode === 'register';

  // Login State
  const [identifier, setIdentifier] = useState('director@sohnne.com');
  const [password, setPassword] = useState('Sohnne2024');
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');

  // Register State
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<TeamAccount['role']>('Store Manager');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [regError, setRegError] = useState('');
  const [loginError, setLoginError] = useState('');

  const loginEmailRef = useRef<HTMLInputElement>(null);
  const regNameRef = useRef<HTMLInputElement>(null);
  const regEmailRef = useRef<HTMLInputElement>(null);
  const regPwdRef = useRef<HTMLInputElement>(null);
  const regConfirmRef = useRef<HTMLInputElement>(null);

  const strength = useMemo(() => computePasswordStrength(regPassword), [regPassword]);
  const hasStrongEnough =
    regPassword.length >= 8 && /[A-Z]/.test(regPassword) && /\d/.test(regPassword);
  const passwordsMatch = regPassword.length > 0 && regPassword === regConfirm;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setLoginError('Enter your email or username and password to continue.');
      loginEmailRef.current?.focus();
      return;
    }
    setLoginError('');
    dispatch({ type: 'LOGIN', email: identifier.trim() });
    toast.success('Welcome back to SOHNNE® Workspace');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setRegError('Enter your full name so teammates can identify your activity.');
      regNameRef.current?.focus();
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Enter a valid work email address (for example, name@sohnne.com).');
      regEmailRef.current?.focus();
      return;
    }
    if (!hasStrongEnough) {
      setRegError(
        'Use 8+ characters with an uppercase letter and at least one number.',
      );
      regPwdRef.current?.focus();
      return;
    }
    if (!passwordsMatch) {
      setRegError('Passwords do not match. Re-enter both fields identically.');
      regConfirmRef.current?.focus();
      return;
    }
    if (!termsAccepted) {
      setRegError('Accept the Terms of Service and Privacy Policy to create your account.');
      return;
    }

    setRegError('');
    dispatch({
      type: 'REGISTER',
      fullName: fullName.trim(),
      email: regEmail.trim(),
      role: regRole,
    });
    toast.success(`Account created for ${fullName.trim()} (${regRole})`);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    setForgotOpen(false);
    setRecoveryEmail('');
    toast.success(`Password reset link sent to ${recoveryEmail.trim()}`);
  };

  return (
    <div className="grid min-h-[100dvh] bg-white lg:h-[100dvh] lg:grid-cols-12 lg:overflow-hidden">
      {/* Persistent Left Royal Blue Hero + Exported FigCraft MacBook Pro PNG Mockup */}
      <section className="relative flex flex-col justify-between overflow-hidden bg-[#0057FF] px-6 py-6 text-white sm:px-10 sm:py-8 lg:col-span-6 lg:h-full lg:px-10 lg:py-7 xl:px-12 xl:py-9">
        {/* FigCraft-matched diffused background ellipses */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#3A8BFF]/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -left-24 h-96 w-96 rounded-full bg-[#003CC2]/65 blur-3xl"
        />

        <div className="relative z-10">
          <button
            type="button"
            onClick={() => navigate('dashboard')}
            aria-label="Go to SOHNNE Dashboard"
            className="btn-tactile inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#131313] font-serif-display text-lg font-bold text-white shadow-sm"
          >
            S
          </button>

          <h2 className="mt-6 max-w-lg text-2xl font-bold leading-snug tracking-tight sm:mt-8 sm:text-[30px] lg:mt-5 lg:text-[28px] lg:leading-[1.2] xl:mt-8 xl:text-[32px]">
            Personalized management solution
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/85 sm:text-[15px]">
            Designed to adapt to your specific needs and streamline your workflow.
          </p>
        </div>

        {/* Viewport-proportioned FigCraft MacBook Pro PNG Mockup (always fits 100dvh desktop + clean mobile aspect) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 my-auto py-4 lg:py-2"
        >
          <div className="mx-auto w-full max-w-[500px] lg:ml-auto lg:mr-0 lg:w-[min(108%,74dvh)] lg:max-w-none lg:translate-x-[10%] xl:translate-x-[12%]">
            <img
              src={`${import.meta.env.BASE_URL}images/auth-laptop-mockup.png`}
              width={2048}
              height={1247}
              alt="SOHNNE Dashboard workspace preview on MacBook Pro"
              className="block aspect-[2048/1247] h-auto w-full select-none object-contain drop-shadow-[0_24px_40px_rgba(0,22,74,0.35)]"
            />
          </div>
        </motion.div>

        <p className="relative z-10 text-xs text-white/75">
          © 2024 SOHNNE® Commerce Operations
        </p>
      </section>

      {/* Right White Panel (Subtle Watermark + Login / Register Switcher) */}
      <main className="relative flex flex-col items-center justify-center overflow-x-hidden bg-white px-6 py-8 sm:px-12 lg:col-span-6 lg:h-full lg:overflow-y-auto lg:py-6">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -bottom-8 select-none font-serif-display text-[220px] font-bold leading-none text-[#131313]/[0.03] xl:text-[240px]"
        >
          S
        </span>

        <div className="relative z-10 my-auto w-full max-w-[440px]">
          <AnimatePresence mode="wait" initial={false}>
            {!isRegister ? (
              <motion.div
                key="login-panel"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h1
                    id="page-heading"
                    tabIndex={-1}
                    className="text-3xl font-bold tracking-tight text-[#131313] focus:outline-none"
                  >
                    Welcome back!
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-[#555555]">
                    Your dashboard is ready, and so are we. Let&apos;s get back to work and push
                    further toward success.
                  </p>
                </div>

                {loginError && (
                  <p
                    role="alert"
                    className="rounded-xl border border-[#FECACA] bg-[#FEE2E2]/70 px-3.5 py-2.5 text-xs font-medium text-[#B91C1C]"
                  >
                    {loginError}
                  </p>
                )}

                <form method="post" onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-xs font-semibold text-[#131313]"
                    >
                      Email / Username
                    </label>
                    <div className="relative mt-1.5">
                      <Mail
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
                        aria-hidden="true"
                      />
                      <input
                        ref={loginEmailRef}
                        id="login-email"
                        name="username"
                        type="text"
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          if (loginError) setLoginError('');
                        }}
                        placeholder="director@sohnne.com"
                        autoComplete="username"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        enterKeyHint="next"
                        required
                        className="min-h-[44px] w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-10 pr-3.5 text-sm text-[#131313] transition-colors focus:border-[#0057FF] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-[#131313]"
                    >
                      Password
                    </label>
                    <div className="relative mt-1.5">
                      <Lock
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
                        aria-hidden="true"
                      />
                      <input
                        id="login-password"
                        name="password"
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (loginError) setLoginError('');
                        }}
                        placeholder="Enter password"
                        autoComplete="current-password"
                        enterKeyHint="done"
                        required
                        className="min-h-[44px] w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-10 pr-10 text-sm text-[#131313] transition-colors focus:border-[#0057FF] focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        aria-pressed={showPwd}
                        aria-label={showPwd ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#555555] hover:text-[#131313]"
                      >
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="login-remember"
                      className="inline-flex cursor-pointer items-center gap-2 font-medium text-[#4B5563]"
                    >
                      <input
                        id="login-remember"
                        name="remember"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#0057FF]"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="font-semibold text-[#0057FF] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="btn-tactile min-h-[46px] w-full rounded-xl bg-[#0057FF] py-3 text-sm font-semibold text-white hover:bg-[#0046D5]"
                  >
                    Login
                  </button>
                </form>

                <p className="text-center text-xs text-[#555555]">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('register')}
                    className="font-semibold text-[#0057FF] hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="register-panel"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-3.5"
              >
                <div className="text-center">
                  <h1
                    id="page-heading"
                    tabIndex={-1}
                    className="text-2xl font-bold tracking-tight text-[#131313] focus:outline-none sm:text-[28px]"
                  >
                    Create your account
                  </h1>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#555555]">
                    Set up your workspace in a minute and start managing the way you work.
                  </p>
                </div>

                {regError && (
                  <p
                    role="alert"
                    className="rounded-xl border border-[#FECACA] bg-[#FEE2E2]/70 px-3.5 py-2 text-xs font-medium text-[#B91C1C]"
                  >
                    {regError}
                  </p>
                )}

                <form method="post" onSubmit={handleRegisterSubmit} noValidate className="space-y-2.5">
                  <div>
                    <label
                      htmlFor="reg-name"
                      className="block text-xs font-semibold text-[#131313]"
                    >
                      Full name <span aria-hidden="true">*</span>
                    </label>
                    <div className="relative mt-1">
                      <User
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
                        aria-hidden="true"
                      />
                      <input
                        ref={regNameRef}
                        id="reg-name"
                        name="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (regError) setRegError('');
                        }}
                        placeholder="Alex Morgan"
                        autoComplete="name"
                        enterKeyHint="next"
                        required
                        aria-invalid={regError.includes('name') ? 'true' : undefined}
                        className="min-h-[44px] w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-10 pr-3.5 text-sm text-[#131313] transition-colors focus:border-[#0057FF] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-email"
                      className="block text-xs font-semibold text-[#131313]"
                    >
                      Email / Username <span aria-hidden="true">*</span>
                    </label>
                    <div className="relative mt-1">
                      <Mail
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
                        aria-hidden="true"
                      />
                      <input
                        ref={regEmailRef}
                        id="reg-email"
                        name="email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          if (regError) setRegError('');
                        }}
                        placeholder="alex.morgan@sohnne.com"
                        autoComplete="email"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        enterKeyHint="next"
                        required
                        aria-invalid={regError.includes('email') ? 'true' : undefined}
                        className="min-h-[44px] w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-10 pr-3.5 text-sm text-[#131313] transition-colors focus:border-[#0057FF] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-role"
                      className="mb-1 block text-xs font-semibold text-[#131313]"
                    >
                      Workspace Role
                    </label>
                    <BrandSelect
                      id="reg-role"
                      name="role"
                      ariaLabel="Workspace Role"
                      value={regRole}
                      options={ROLE_OPTIONS}
                      onChange={(val) => setRegRole(val as TeamAccount['role'])}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reg-password"
                      className="block text-xs font-semibold text-[#131313]"
                    >
                      Password <span aria-hidden="true">*</span>
                    </label>
                    <span id="reg-pwd-hint" className="mt-0.5 block text-[11px] text-[#555555]">
                      Use 8+ characters with an uppercase letter, a number, and a symbol.
                    </span>
                    <div className="relative mt-1">
                      <input
                        ref={regPwdRef}
                        id="reg-password"
                        name="password"
                        type={showRegPwd ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value);
                          if (regError) setRegError('');
                        }}
                        placeholder="Create password"
                        aria-describedby="reg-pwd-hint"
                        autoComplete="new-password"
                        enterKeyHint="next"
                        required
                        aria-invalid={regError.includes('uppercase') ? 'true' : undefined}
                        className="min-h-[44px] w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-3.5 pr-10 text-sm text-[#131313] transition-colors focus:border-[#0057FF] focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPwd((v) => !v)}
                        aria-pressed={showRegPwd}
                        aria-label={showRegPwd ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#555555] hover:text-[#131313]"
                      >
                        {showRegPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* 4-segment Password Strength Meter matching FigCraft design */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden="true">
                        {[1, 2, 3, 4].map((step) => (
                          <span
                            key={step}
                            className={`h-1.5 rounded-full transition-colors duration-200 ${
                              strength.level >= step ? strength.barColor : 'bg-[#E5E7EB]'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`whitespace-nowrap text-[11px] font-semibold ${strength.textColor}`}>
                        {strength.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-confirm"
                      className="block text-xs font-semibold text-[#131313]"
                    >
                      Confirm Password <span aria-hidden="true">*</span>
                    </label>
                    <input
                      ref={regConfirmRef}
                      id="reg-confirm"
                      name="confirmPassword"
                      type={showRegPwd ? 'text' : 'password'}
                      value={regConfirm}
                      onChange={(e) => {
                        setRegConfirm(e.target.value);
                        if (regError) setRegError('');
                      }}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      enterKeyHint="done"
                      required
                      aria-invalid={regError.includes('match') ? 'true' : undefined}
                      className="mt-1 min-h-[44px] w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2 text-sm text-[#131313] transition-colors focus:border-[#0057FF] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <label
                    htmlFor="reg-terms"
                    className="flex cursor-pointer items-start gap-2 pt-0.5 text-xs text-[#4B5563]"
                  >
                    <input
                      id="reg-terms"
                      name="termsAccepted"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        if (regError) setRegError('');
                      }}
                      className="mt-0.5 h-4 w-4 rounded accent-[#0057FF]"
                    />
                    <span>I agree to the Terms of Service and Privacy Policy</span>
                  </label>

                  <button
                    type="submit"
                    className="btn-tactile min-h-[46px] w-full rounded-xl bg-[#0057FF] py-3 text-sm font-semibold text-white hover:bg-[#0046D5]"
                  >
                    Create account
                  </button>
                </form>

                <p className="text-center text-xs text-[#555555]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('login')}
                    className="font-semibold text-[#0057FF] hover:underline"
                  >
                    Login
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <ModalDialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Reset password"
        description="Enter your SOHNNE® work email to receive a secure recovery link."
        maxWidthClass="w-full max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="recovery-email" className="block text-xs font-semibold text-[#131313]">
              Work Email
            </label>
            <input
              id="recovery-email"
              name="recoveryEmail"
              type="email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              placeholder="name@sohnne.com"
              autoComplete="email"
              required
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2 text-sm text-[#131313] focus:border-[#0057FF] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              className="btn-tactile rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile rounded-xl bg-[#0057FF] px-4 py-2 text-xs font-semibold text-white"
            >
              Send Reset Link
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}
