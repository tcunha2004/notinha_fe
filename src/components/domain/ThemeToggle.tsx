import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { IconButton } from '../ui/IconButton';

/** Same key as the inline script in index.html, which applies the theme before the first paint. */
const STORAGE_KEY = 'notinha:tema';

const isDark = () => document.documentElement.dataset.tema === 'escuro';

/** Light/dark switch. Light is the default; the choice is remembered on this device. */
export function ThemeToggle() {
  const [dark, setDark] = useState(isDark);

  const toggle = () => {
    const next = !dark;
    const root = document.documentElement;
    if (next) root.dataset.tema = 'escuro';
    else delete root.dataset.tema;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', next ? '#000000' : '#FFFFFF');
    try {
      if (next) localStorage.setItem(STORAGE_KEY, 'escuro');
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage blocked (private mode): the theme still switches for this visit.
    }
    setDark(next);
  };

  return (
    <IconButton
      icon={dark ? Sun : Moon}
      label={dark ? 'Usar tema claro' : 'Usar tema escuro'}
      onClick={toggle}
    />
  );
}
