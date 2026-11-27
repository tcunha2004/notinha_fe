import { Outlet, useLocation } from 'react-router';
import { Sidebar } from '../components/domain/Sidebar';
import { TabBar } from '../components/domain/TabBar';
import { cn } from '../lib/cn';

const TAB_ROUTES = ['/', '/purchases', '/products'];

/** Navigation shell: tab bar below 1024px, sidebar from 1024px (pure CSS switch). */
export function AppShell() {
  const { pathname } = useLocation();
  // The product sheet opens over its grid: keep the grid's tab bar under it.
  const showTabBar = TAB_ROUTES.includes(pathname) || pathname.startsWith('/products/');
  return (
    <div className="min-h-dvh lg:pl-70">
      <Sidebar className="hidden lg:flex" />
      {/* Keep the last row clear of the tab bar. */}
      <div className={cn(showTabBar && 'pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-10')}>
        <Outlet />
      </div>
      {showTabBar && <TabBar className="lg:hidden" />}
    </div>
  );
}
