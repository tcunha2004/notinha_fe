import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import type { Purchase } from '../../types';
import { Card, CardList } from '../ui/Card';
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
        trailing={count > 0 && <span>Toque para corrigir</span>}
      />
      <Card>
        <CardList>
          {purchase.items.map((item) => (
            <ItemRow key={item.id} item={item} to={`items/${item.id}`} />
          ))}
          <li>
            <Link
              to="items/new"
              preventScrollReset
              className="flex min-h-13 items-center gap-3 px-4 py-3 text-body text-brand-green-dark transition-colors hover:bg-fill-tertiary focus-visible:-outline-offset-2 active:bg-fill-tertiary"
            >
              <Plus aria-hidden size={20} strokeWidth={2.5} />
              {count ? 'Adicionar item que faltou' : 'Adicionar item'}
            </Link>
          </li>
        </CardList>
      </Card>
    </section>
  );
}
