import { Image, Sparkles, TriangleAlert, Upload, X, Zap } from 'lucide-react';
import { useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router';
import { MockReceipt } from '../components/domain/MockReceipt';
import { GlassButton } from '../components/ui/GlassButton';
import { cn } from '../lib/cn';

const PROCESSING = '/scan/processing';
// Same limits as the API: checking here saves a slow upload that would be refused.
const ACCEPT = 'image/jpeg,image/png';
const MAX_SIZE = 10 * 1024 * 1024;

/** Why this file can't be sent, or null when it's fine. */
function checkImage(file: File): string | null {
  if (!ACCEPT.split(',').includes(file.type)) return 'Use uma foto JPG ou PNG.';
  if (file.size > MAX_SIZE) return 'A foto passa de 10 MB. Escolha uma menor.';
  return null;
}

type OnPick = (file: File) => void;

/** Hidden file input; the surrounding <label> is the visible button. */
function PickInput({
  onPick,
  capture,
  label,
}: {
  onPick: OnPick;
  capture?: boolean;
  label?: string;
}) {
  return (
    <input
      type="file"
      accept={ACCEPT}
      capture={capture ? 'environment' : undefined}
      aria-label={label}
      className="sr-only"
      onChange={(event) => {
        const file = event.target.files?.[0];
        event.target.value = ''; // picking the same file again must fire onChange
        if (file) onPick(file);
      }}
    />
  );
}
const corner = 'absolute size-13 border-brand-green';

/** Green corner brackets framing the receipt. */
function Viewfinder() {
  return (
    <div className="relative mx-auto my-4 flex w-[min(300px,78vw)] flex-1 items-center justify-center py-6 lg:hidden">
      <span
        aria-hidden
        className={cn(corner, 'top-0 left-0 rounded-tl-[22px] border-t-4 border-l-4')}
      />
      <span
        aria-hidden
        className={cn(corner, 'top-0 right-0 rounded-tr-[22px] border-t-4 border-r-4')}
      />
      <span
        aria-hidden
        className={cn(corner, 'bottom-0 left-0 rounded-bl-[22px] border-b-4 border-l-4')}
      />
      <span
        aria-hidden
        className={cn(corner, 'right-0 bottom-0 rounded-br-[22px] border-r-4 border-b-4')}
      />
      <MockReceipt className="w-[80%] rotate-2" />
    </div>
  );
}

/** Desktop replacement for the viewfinder. */
function DropZone({ onPick }: { onPick: OnPick }) {
  const [dragging, setDragging] = useState(false);
  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) onPick(file);
  };
  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        'glass-dark mx-auto my-8 hidden w-full max-w-[560px] flex-1 cursor-pointer flex-col items-center justify-center gap-4 rounded-card border-2 border-dashed border-brand-green/60 p-10 text-center transition-colors hover:border-brand-green has-focus-visible:outline-2 has-focus-visible:outline-accent-blue lg:flex',
        dragging && 'border-brand-green bg-brand-green/10',
      )}
    >
      <span className="grid size-16 place-items-center rounded-full bg-brand-green/15 text-brand-green">
        <Upload aria-hidden size={28} />
      </span>
      <span className="text-title-3">Arraste a foto da nota ou clique para escolher</span>
      <span className="text-subheadline text-label-on-accent/60">
        JPG ou PNG até 10 MB, com o QR Code visível
      </span>
      <PickInput onPick={onPick} />
    </label>
  );
}

export function Scan() {
  const navigate = useNavigate();
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = (file: File) => {
    const problem = checkImage(file);
    setError(problem);
    if (!problem) navigate(PROCESSING, { state: { file } });
  };
  return (
    <main className="flex min-h-dvh flex-col bg-camera text-label-on-accent animate-push">
      <div className="page-container flex flex-1 flex-col pt-[max(12px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
        <header className="grid grid-cols-[44px_1fr_44px] items-center gap-2">
          <GlassButton to="/" icon={X} label="Fechar" tone="dark" />
          <h1 className="text-center text-title-3">Enviar nota</h1>
          <GlassButton
            icon={Zap}
            label="Flash"
            tone="dark"
            aria-pressed={flash}
            onClick={() => setFlash(!flash)}
            className={cn(flash && 'text-accent-orange')}
          />
        </header>

        {error ? (
          <p
            role="alert"
            className="glass-dark mx-auto mt-4 flex items-center gap-2 rounded-full px-4 py-2 text-subheadline font-semibold"
          >
            <TriangleAlert aria-hidden size={16} className="shrink-0 text-accent-orange" />
            {error}
          </p>
        ) : (
          <p className="glass-dark mx-auto mt-4 flex items-center gap-2 rounded-full px-4 py-2 text-subheadline font-semibold">
            <Sparkles aria-hidden size={16} className="shrink-0 text-brand-green" />
            Enquadre a nota inteira, com o QR Code
          </p>
        )}

        <Viewfinder />
        <DropZone onPick={pick} />

        <div className="mx-auto grid w-[min(300px,78vw)] grid-cols-[1fr_auto_1fr] items-center lg:hidden">
          <label className="flex cursor-pointer flex-col items-center gap-1.5 justify-self-start has-focus-visible:[&>span:first-of-type]:outline-2 has-focus-visible:[&>span:first-of-type]:outline-accent-blue">
            <PickInput onPick={pick} />
            <span className="glass-dark pressable grid size-13 place-items-center rounded-2xl">
              <Image aria-hidden size={22} />
            </span>
            <span className="text-subheadline">Galeria</span>
          </label>
          <label className="pressable grid size-20 cursor-pointer place-items-center rounded-full border-4 border-label-on-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-blue">
            <PickInput onPick={pick} capture label="Tirar foto" />
            <span className="size-16 rounded-full bg-label-on-accent" />
          </label>
        </div>
      </div>
    </main>
  );
}
