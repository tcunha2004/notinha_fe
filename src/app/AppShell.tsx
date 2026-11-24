import { Outlet, useLocation } from 'react-router';
import { Sidebar } from '../components/domain/Sidebar';
import { TabBar } from '../components/domain/TabBar';
import { cn } from '../lib/cn';

const TAB_ROUTES = ['/', '/purchases'];

/** Navigation shell: floating tab bar below 1024px, glass sidebar from 1024px (pure CSS switch). */
export function AppShell() {
  const { pathname } = useLocation();
  const showTabBar = TAB_ROUTES.includes(pathname);
  return (
    <div className="min-h-dvh lg:pl-70">
      <Sidebar className="hidden lg:flex" />
      {/* Keep the last row clear of the floating tab bar. */}
      <div className={cn(showTabBar && 'pb-[calc(112px+env(safe-area-inset-bottom))] lg:pb-10')}>
        <Outlet />
      </div>
      {showTabBar && <TabBar className="lg:hidden" />}
    </div>
  );
}
