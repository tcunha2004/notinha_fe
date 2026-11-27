import { ProfileMenu } from './ProfileMenu';
import { ThemeToggle } from './ThemeToggle';

/** Theme switch + avatar, on the top right of the tab screens. */
export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <ProfileMenu />
    </div>
  );
}
