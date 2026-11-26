import { LogOut } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Form, useRouteLoaderData } from 'react-router';
import type { requireUser } from '../../app/loaders';
import { cn } from '../../lib/cn';
import { getInitials } from '../../lib/purchase';
import { Button } from '../ui/Button';

/** Google photo, falling back to initials when there is none or it fails to load. */
function UserPhoto({
  name,
  picture,
  className,
}: {
  name: string;
  picture: string;
  className: string;
}) {
  const [broken, setBroken] = useState(false);
  const base = cn('shrink-0 rounded-full', className);
  if (!picture || broken) {
    return (
      <span
        aria-hidden
        className={cn(base, 'grid place-items-center bg-superficie font-bold [font-stretch:112%]')}
      >
        {getInitials(name)}
      </span>
    );
  }
  return (
    <img
      src={picture}
      alt=""
      // Google photo URLs may refuse requests that carry our Referer.
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className={cn(base, 'object-cover')}
    />
  );
}

/** Avatar button with the user's data: opens on hover (mouse) or click/tap/keyboard. */
export function ProfileMenu() {
  const user = useRouteLoaderData<typeof requireUser>('auth');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // With a mouse, hover already opens/closes it; a click must not toggle it shut again.
  const lastPointer = useRef('');
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  if (!user) return null;

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={(event) => event.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label="Seu perfil"
        aria-expanded={open}
        aria-controls={panelId}
        onPointerDown={(event) => (lastPointer.current = event.pointerType)}
        onClick={() => {
          if (lastPointer.current === 'mouse') setOpen(true);
          else setOpen(!open);
          lastPointer.current = '';
        }}
        className="pressable grid size-11 place-items-center rounded-full"
      >
        <UserPhoto name={user.name} picture={user.picture} className="size-11 text-base" />
      </button>

      {open && (
        // pt-2 instead of a margin: no gap, so the pointer can travel to the panel without closing it.
        <div id={panelId} className="absolute top-full right-0 z-30 pt-2 animate-surgir">
          <div className="w-72 rounded-lg border border-linha bg-superficie-elevada p-4">
            <div className="flex items-center gap-3">
              <UserPhoto name={user.name} picture={user.picture} className="size-14 text-[20px]" />
              <div className="min-w-0">
                <p className="truncate texto-corpo-forte">{user.name}</p>
                <p className="truncate texto-legenda text-texto-secundario">{user.email}</p>
              </div>
            </div>
            <Form method="post" action="/logout" className="mt-4">
              <Button type="submit" variant="secundario" className="w-full">
                <LogOut aria-hidden size={20} />
                Sair
              </Button>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
