import Dexie, { type Table } from 'dexie';

export interface Sale {
  id?: number;
  amount: number;
  item: string;
  createdAt: Date;
  paymentMethod: string; // 'Cash' | 'QRIS' / etc
  firestoreId?: string;
}

export interface Preset {
  id?: number;
  label: string;
  item: string;
  amount: number;
}

export class BiruDatabase extends Dexie {
  sales!: Table<Sale>;
  presets!: Table<Preset>;

  constructor() {
    super('BiruDatabase');
    this.version(1).stores({
      sales: '++id, amount, item, createdAt, paymentMethod, firestoreId',
      presets: '++id, label, item, amount',
    });
  }
}

export const db = new BiruDatabase();

// Populate default presets if database is empty
db.on('ready', async () => {
  const count = await db.presets.count();
  if (count === 0) {
    await db.presets.bulkAdd([
      { label: 'Refill Biasa Rp 5k', item: 'Refill', amount: 5000 },
      { label: 'Refill Jumbo Rp 10k', item: 'Refill', amount: 10000 },
      { label: 'Galon Baru Rp 50k', item: 'Galon Baru', amount: 50000 },
      { label: 'Air Botol Rp 3k', item: 'Air Botol', amount: 3000 },
    ]);
  }
});

export function formatRupiah(amount: number) {
  return amount.toLocaleString('id-ID');
}
