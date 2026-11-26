import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import type { Purchase } from '../../types';
import { SectionHeader } from '../ui/SectionHeader';
import { ItemRow } from './ItemRow';

/** The purchase's items; each row opens the edit sheet, the last one adds a missing item. */
export function ItemsSection({ purchase }: { purchase: Purchase }) {
  const count = purchase.items.length;
  return (
    <section aria-labelledby="items-title">
      <SectionHeader
        id="items-title"
        title={`${count} ${count === 1 ? 'item' : 'itens'}`}
        trailing={count > 0 && 'Toque para corrigir'}
      />
      <ul>
        {purchase.items.map((item) => (
          <ItemRow key={item.id} item={item} to={`items/${item.id}`} />
        ))}
        <li>
          <Link
            to="items/new"
            preventScrollReset
            className="flex min-h-14 items-center gap-3 px-5 texto-corpo-forte text-marca-texto transition-colors hover:bg-superficie focus-visible:-outline-offset-2 active:bg-superficie"
          >
            <Plus aria-hidden size={20} strokeWidth={2.25} />
            {count ? 'Adicionar item que faltou' : 'Adicionar item'}
          </Link>
        </li>
      </ul>
    </section>
  );
}
