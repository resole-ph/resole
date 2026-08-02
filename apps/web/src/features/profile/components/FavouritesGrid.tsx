'use client';

import { useState } from 'react';

type FavItem = {
  id: string;
  name: string;
  brand: string;
  size: string;
  price: string;
  saved: boolean;
};

const INITIAL_FAVOURITES: FavItem[] = [
  { id: '1', name: 'Jordan 4 Retro', brand: 'Nike', size: 'US 10', price: '₱24,000', saved: true },
  { id: '2', name: 'Yeezy Boost 350', brand: 'Adidas', size: 'US 9', price: '₱15,500', saved: true },
  { id: '3', name: 'Air Force 1 Low', brand: 'Nike', size: 'US 10.5', price: '₱5,200', saved: true },
  { id: '4', name: 'Samba OG', brand: 'Adidas', size: 'US 9.5', price: '₱7,800', saved: true },
  { id: '5', name: 'Panda Dunk Low', brand: 'Nike', size: 'US 9', price: '₱12,000', saved: true },
  { id: '6', name: 'New Balance 327', brand: 'New Balance', size: 'US 10', price: '₱4,500', saved: true },
  { id: '7', name: 'Converse Run Star', brand: 'Converse', size: 'US 8', price: '₱3,200', saved: true },
  { id: '8', name: 'Gel-Kayano 14', brand: 'Asics', size: 'US 9.5', price: '₱8,500', saved: true },
];

function FavCard({ item, onToggle }: { item: FavItem; onToggle: (id: string) => void }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-3 relative">
      <div className="w-full h-24 rounded-lg bg-surface-container flex items-center justify-center text-outline mb-2">
        <span className="material-symbols-outlined text-[28px]">footprint</span>
      </div>

      <button
        onClick={() => onToggle(item.id)}
        className="absolute top-5 right-5 w-7 h-7 rounded-full bg-white shadow-[0px_2px_6px_rgba(0,0,0,0.12)] flex items-center justify-center"
        aria-label={`Remove ${item.name} from favourites`}
      >
        <span
          className="material-symbols-outlined text-error text-[16px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          favorite
        </span>
      </button>

      <p className="text-on-surface-variant text-[12px]">{item.brand}</p>
      <p className="text-on-surface font-semibold text-[14px] mt-0.5 truncate">{item.name}</p>
      <p className="text-on-surface-variant text-[12px]">US {item.size}</p>
      <p className="text-primary font-bold text-[14px] mt-1">{item.price}</p>
    </div>
  );
}

export default function FavouritesGrid() {
  const [items, setItems] = useState<FavItem[]>(INITIAL_FAVOURITES);
  const saved = items.filter((i) => i.saved);

  const handleToggle = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, saved: !i.saved } : i)));
  };

  return (
    <div>
      <p className="text-on-surface-variant text-[13px] mb-4">
        {saved.length} sneaker{saved.length !== 1 ? 's' : ''} saved
      </p>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <span className="material-symbols-outlined text-[40px] text-outline-variant">favorite</span>
          <p className="text-on-surface-variant text-[14px] mt-3">No saved items yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {saved.map((item) => (
            <FavCard key={item.id} item={item} onToggle={handleToggle} />
          ))}
        </div>
      )}
    </div>
  );
}
