import { useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Toaster } from 'sonner';
import { CommandPalette } from './components/layout/CommandPalette';
import { SidebarContent } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ModalDialog } from './components/ui/Dialog';
import { AccountPage } from './pages/AccountPage';
import { CouponCreatePage } from './pages/CouponCreatePage';
import { CouponListPage } from './pages/CouponListPage';
import { CustomersPage } from './pages/CustomersPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductsPage } from './pages/ProductsPage';
import {
  AnalyticsPage,
  InsightPage,
  NotificationsPage,
  SettingsPage,
} from './pages/SecondaryPages';
import { TaxShippingPage } from './pages/TaxShippingPage';
import { DashboardProvider, useDashboard } from './store/dashboardStore';

function AppShell() {
  const { state } = useDashboard();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  // Global ⌘K / Ctrl+K keyboard shortcut (opens immediately per animate skill)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (state.route === 'login' || state.route === 'register') {
    return (
      <MotionConfig reducedMotion={state.settings.reduceVisualMotion ? 'always' : 'user'}>
        <LoginPage mode={state.route} />
      </MotionConfig>
    );
  }

  const renderPage = () => {
    switch (state.route) {
      case 'dashboard':
        return <DashboardPage />;
      case 'orders':
        return <OrdersPage />;
      case 'order-details':
        return <OrderDetailsPage />;
      case 'products':
        return <ProductsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'coupons':
        return <CouponListPage />;
      case 'coupon-create':
        return <CouponCreatePage />;
      case 'tax':
      case 'shipping':
        return <TaxShippingPage />;
      case 'account':
        return <AccountPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'insight':
        return <InsightPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <MotionConfig reducedMotion={state.settings.reduceVisualMotion ? 'always' : 'user'}>
      <div className="flex min-h-screen bg-[#FFFFFF] text-[#131313]">
        {/* Persistent Desktop Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[#E5E7EB] bg-white lg:block">
          <SidebarContent layoutGroupId="desktop-sidebar" />
        </aside>

        {/* Responsive Mobile Drawer Navigation */}
        <ModalDialog
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          title="Navigation"
          variant="drawer-left"
        >
          <div className="-mx-6 -my-5 h-[calc(100vh-70px)]">
            <SidebarContent
              layoutGroupId="mobile-sidebar"
              onAfterNavigate={() => setMobileNavOpen(false)}
            />
          </div>
        </ModalDialog>

        {/* Main Workspace */}
        <div className="flex min-w-0 flex-1 flex-col overflow-x-clip">
          <Topbar
            onOpenMobileMenu={() => setMobileNavOpen(true)}
            onOpenCommandPalette={() => setCommandOpen(true)}
          />
          <main className="mx-auto w-full min-w-0 max-w-[1440px] flex-1 px-4 pt-6 pb-12 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
            {renderPage()}
          </main>
        </div>

        <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <AppShell />
      <Toaster position="bottom-right" richColors closeButton />
    </DashboardProvider>
  );
}
