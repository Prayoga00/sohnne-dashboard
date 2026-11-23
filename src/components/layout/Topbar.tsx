import { Bell, Menu, Pause, Play, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboard } from '../../store/dashboardStore';
import { getInitials } from '../../utils/format';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
}

export function Topbar({ onOpenMobileMenu, onOpenCommandPalette }: TopbarProps) {
  const { state, dispatch, navigate, computedKpis } = useDashboard();
  const isStreaming = state.settings.liveOrderStreamEnabled;

  const toggleLiveStream = () => {
    const next = !isStreaming;
    dispatch({ type: 'UPDATE_SETTINGS', patch: { liveOrderStreamEnabled: next } });
    toast.info(
      next
        ? 'Live order stream active — simulated checkouts will update KPIs every ~9s.'
        : 'Live order stream paused.',
    );
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white/95 px-4 backdrop-blur-xs lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="btn-tactile inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#131313] hover:bg-[#F5F6F8] lg:hidden"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Global Command Palette Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="btn-tactile flex h-9 items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] px-3 text-sm text-[#555555] hover:border-[#D1D5DB] hover:text-[#131313] sm:min-w-[250px] sm:justify-between"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-[#555555]" aria-hidden="true" />
            <span className="hidden sm:inline">Search orders, products, pages...</span>
            <span className="sm:hidden">Search...</span>
          </span>
          <kbd className="hidden rounded border border-[#D1D5DB] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#555555] sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Opt-in Pauseable Live Stream Control */}
        <button
          type="button"
          onClick={toggleLiveStream}
          aria-pressed={isStreaming}
          title="Toggle live simulated checkout intake"
          className={`btn-tactile hidden items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium sm:inline-flex ${
            isStreaming
              ? 'border-[#0057FF]/30 bg-[#EEF4FF] text-[#0057FF]'
              : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F5F6F8]'
          }`}
        >
          {isStreaming ? (
            <>
              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Pause Live Feed</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Simulate Live Orders</span>
            </>
          )}
        </button>

        {/* Notifications Shortcut */}
        <button
          type="button"
          onClick={() => navigate('notifications')}
          aria-label={`Notifications (${computedKpis.unreadNotifications} unread)`}
          className="btn-tactile relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F5F6F8] hover:text-[#131313]"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {computedKpis.unreadNotifications > 0 && (
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#0057FF]"
              aria-hidden="true"
            />
          )}
        </button>

        {/* Admin Profile */}
        <button
          type="button"
          onClick={() => navigate('account')}
          aria-label="Open account management"
          className="btn-tactile flex items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-white py-1 pl-1.5 pr-3 hover:bg-[#F5F6F8]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0057FF] text-xs font-semibold text-white">
            {getInitials(state.authenticatedUser.username)}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-semibold leading-tight text-[#131313]">
              {state.authenticatedUser.username}
            </span>
            <span className="block text-[11px] leading-tight text-[#555555]">
              {state.authenticatedUser.role}
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}
