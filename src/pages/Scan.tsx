import { Image, ScanLine, TriangleAlert, Upload, X, Zap } from 'lucide-react';
import { useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router';
import { MockReceipt } from '../components/domain/MockReceipt';
import { IconButton } from '../components/ui/IconButton';
import { TopBar } from '../components/ui/TopBar';
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

const corner = 'absolute size-11 border-marca';

/** Green corner brackets framing the receipt. */
function Viewfinder() {
  return (
    <div className="relative mx-7 mt-5 mb-4 flex flex-1 items-center justify-center py-6 lg:hidden">
      <span
        aria-hidden
        className={cn(corner, 'top-0 left-0 rounded-tl-[18px] border-t-4 border-l-4')}
      />
      <span
        aria-hidden
        className={cn(corner, 'top-0 right-0 rounded-tr-[18px] border-t-4 border-r-4')}
      />
      <span
        aria-hidden
        className={cn(corner, 'bottom-0 left-0 rounded-bl-[18px] border-b-4 border-l-4')}
      />
      <span
        aria-hidden
        className={cn(corner, 'right-0 bottom-0 rounded-br-[18px] border-r-4 border-b-4')}
      />
      <MockReceipt className="w-58 -rotate-2" />
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
        'mx-5 my-8 hidden flex-1 cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-marca/60 p-10 text-center transition-colors hover:border-marca has-focus-visible:outline-2 has-focus-visible:outline-branco lg:flex',
        dragging ? 'border-marca bg-cinza-800' : 'bg-tinta',
      )}
    >
      <span className="grid size-16 place-items-center rounded-full bg-cinza-800 text-marca">
        <Upload aria-hidden size={28} />
      </span>
      <span className="texto-titulo-2">Arraste a foto da nota ou clique para escolher</span>
      <span className="texto-legenda text-cinza-400">
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
  const hint =
    'mx-auto mt-3 flex h-9 items-center gap-2 rounded-full bg-cinza-800 px-4 text-sm leading-[18px] font-medium';

  return (
    <main className="flex min-h-dvh flex-col bg-[#000] text-branco animate-tela">
      <div className="page-container flex flex-1 flex-col pt-[max(12px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
        <header>
          <TopBar
            leading={<IconButton to="/" icon={X} label="Fechar" tone="camera" />}
            title={<h1>Enviar nota</h1>}
            trailing={
              <IconButton
                icon={Zap}
                label={flash ? 'Desligar flash' : 'Ligar flash'}
                tone="camera"
                aria-pressed={flash}
                onClick={() => setFlash(!flash)}
                className={cn(flash && 'text-atencao-500')}
              />
            }
          />
        </header>

        {error ? (
          <p role="alert" className={hint}>
            <TriangleAlert aria-hidden size={18} className="shrink-0 text-atencao-500" />
            {error}
          </p>
        ) : (
          <p className={hint}>
            <ScanLine aria-hidden size={18} className="shrink-0 text-marca" />
            Enquadre a nota inteira, com o QR Code
          </p>
        )}

        <Viewfinder />
        <DropZone onPick={pick} />

        <div className="grid grid-cols-3 items-center px-8 lg:hidden">
          <label className="flex cursor-pointer flex-col items-center gap-1.5 has-focus-visible:[&>span:first-of-type]:outline-2 has-focus-visible:[&>span:first-of-type]:outline-branco">
            <PickInput onPick={pick} />
            <span className="pressable grid size-13 place-items-center rounded-full bg-cinza-800">
              <Image aria-hidden size={22} />
            </span>
            <span className="texto-micro font-normal text-cinza-400">Galeria</span>
          </label>
          <label className="pressable mx-auto grid size-20 cursor-pointer place-items-center rounded-full border-4 border-branco has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-branco">
            <PickInput onPick={pick} capture label="Tirar foto" />
            <span className="size-15.5 rounded-full bg-branco" />
          </label>
        </div>
      </div>
    </main>
  );
}
