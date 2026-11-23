import { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { BrandSelect } from '../components/ui/BrandSelect';
import { useDashboard } from '../store/dashboardStore';
import type { TeamAccount } from '../types/dashboard';
import { getInitials } from '../utils/format';

const ROLE_OPTIONS = [
  { value: 'Administrator', label: 'Administrator' },
  { value: 'Store Manager', label: 'Store Manager' },
  { value: 'Fulfillment Staff', label: 'Fulfillment Staff' },
  { value: 'Analyst', label: 'Analyst' },
];

export function AccountPage() {
  const { state, dispatch } = useDashboard();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState<TeamAccount['role']>('Administrator');

  const hasLength = password.length >= 8;
  const digitCount = (password.match(/\d/g) ?? []).length;
  const hasTwoNumbers = digitCount >= 2;
  const isPasswordValid = hasLength && hasTwoNumbers;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      toast.error('Please enter both username and email.');
      return;
    }
    if (!isPasswordValid) {
      toast.error('Password must include at least 8 characters and 2 numbers.');
      return;
    }
    dispatch({
      type: 'CREATE_ACCOUNT',
      account: {
        id: `acc-${Date.now()}`,
        username: username.trim(),
        email: email.trim(),
        role,
        createdAt: 'Just now',
        status: 'Active',
      },
    });
    toast.success(`Account created for ${username.trim()} (${role})`);
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1
          id="page-heading"
          tabIndex={-1}
          className="font-serif-display text-3xl font-bold text-[#131313] focus:outline-none"
        >
          Create Account
        </h1>
        <p className="mt-1 text-sm text-[#555555]">
          Provision team credentials and manage role-based store permissions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 lg:col-span-6"
        >
          <div>
            <label htmlFor="acc-username" className="block text-xs font-semibold text-[#131313]">
              Username
            </label>
            <input
              id="acc-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex.morgan"
              autoComplete="username"
              required
              className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#131313] placeholder:text-[#6B7280] focus:border-[#0057FF] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="acc-email" className="block text-xs font-semibold text-[#131313]">
              Work Email
            </label>
            <input
              id="acc-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex.morgan@sohnne.com"
              autoComplete="email"
              required
              className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#131313] placeholder:text-[#6B7280] focus:border-[#0057FF] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="acc-password" className="block text-xs font-semibold text-[#131313]">
              Password
            </label>
            <span id="acc-password-hint" className="mt-1 block text-xs text-[#555555]">
              At least 8 characters, including 2 numbers.
            </span>
            <div className="relative mt-1.5">
              <input
                id="acc-password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="acc-password-hint"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-[#E5E7EB] py-2.5 pl-3.5 pr-10 text-sm text-[#131313] focus:border-[#0057FF] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#555555] hover:text-[#131313]"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-3 text-xs">
              <span className={`inline-flex items-center gap-1 ${hasLength ? 'text-[#047857]' : 'text-[#555555]'}`}>
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                8+ characters
              </span>
              <span className={`inline-flex items-center gap-1 ${hasTwoNumbers ? 'text-[#047857]' : 'text-[#555555]'}`}>
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                At least 2 numbers
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="acc-role" className="mb-1.5 block text-xs font-semibold text-[#131313]">
              Role
            </label>
            <BrandSelect
              id="acc-role"
              name="role"
              ariaLabel="Account Role"
              value={role}
              options={ROLE_OPTIONS}
              onChange={(val) => setRole(val as TeamAccount['role'])}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            className="btn-tactile w-full rounded-xl bg-[#0057FF] py-2.5 text-sm font-semibold text-white hover:bg-[#0046D5]"
          >
            Create Account
          </button>
        </form>

        {/* Active Team Directory */}
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 lg:col-span-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[#131313]">
              <ShieldCheck className="h-4 w-4 text-[#0057FF]" aria-hidden="true" />
              <span>Team Directory ({state.accounts.length})</span>
            </h2>
          </div>

          <div className="mt-4 divide-y divide-[#E5E7EB]">
            {state.accounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between gap-3 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF4FF] text-xs font-bold text-[#0057FF]">
                    {getInitials(acc.username)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#131313]">{acc.username}</p>
                    <p className="text-xs text-[#555555]">{acc.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-semibold text-[#131313]">
                    {acc.role}
                  </span>
                  <p className="mt-0.5 text-[11px] text-[#555555]">{acc.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
