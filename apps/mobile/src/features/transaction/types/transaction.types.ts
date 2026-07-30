export type TxTab = 'sales' | 'swaps' | 'donations';

export type Transaction = {
  id: string;
  type: 'sale' | 'swap' | 'donate',
  item: string;
  counterpart: string;
  date: string;
  amount?: string;
  status: 'completed' | 'pending' | 'donated';
  color: string;
};

export type TransactionFetch = Omit<Transaction, 'color'>;

export type RedeemOption = {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: 'pricetag-outline' | 'heart-circle-outline' | 'arrow-up-outline' | 'ellipsis-horizontal-outline';
  highlight?: boolean;
};

export type CoinTx = {
  id: string;
  label: string;
  sub: string;
  amount: number;
  date: string;
  icon: 'heart-outline' | 'star-outline' | 'gift-outline' | 'ellipsis-horizontal-outline'; // donate, achievement/sale/swap, spend
};