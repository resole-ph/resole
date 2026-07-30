import { Transaction, TransactionFetch } from "../types/transaction.types";
import { RedeemOption, CoinTx } from "../types/transaction.types";
import { apiFetch } from "@/lib/api-client";

export const TransactionService = {
  getVoucherIcon(type: string): string {
    switch (type) {
      case 'percent_off': case 'price_off': case 'free_coins':
        return 'pricetag-outline';
      case 'donation':
        return 'heart-circle-outline';
      case 'boost':
        return 'arrow-up-outline';
      default:
        return 'ellipsis-horizontal-outline'
    }
  },

  getTransactionInfo(item: any): Omit<CoinTx, 'id' | 'amount' | 'date'> {
    switch (`${item.kind}_${item.type}`) {
      case 'earn_donate':
        return { label: `Donated ${item.listing.brand} ${item.listing.model}`, sub: 'Donation', icon: 'heart-outline' };
      case 'earn_sale': 
        return { label: `${item.isLister ? 'Sold' : 'Bought'} ${item.listing.brand} ${item.listing.model}`, sub: `${item.isLister ? 'Sale' : 'Purchase'}`, icon: 'star-outline' };
      case 'earn_swap':
        return { label: `Swap with ${item.listing.brand} ${item.listing.model}`, sub: `Swap`, icon: 'star-outline' };
      case 'spend_sale_redemption':
        return { label: `Redeemed coins to purchase ${item.listing.brand} ${item.listing.model}`, sub: 'Redemption - Sale', icon: 'gift-outline' };
      case 'spend_voucher_redemption':
        return { label: `Redeemed ${item.voucher.type} voucher ${item.voucher.name}`, sub: 'Redemption - Voucher', icon: 'gift-outline' };
      default:
        return { label: 'unknown', sub: 'unk', icon: 'ellipsis-horizontal-outline' };
    }
  },

  async getUserTransactions(): Promise<TransactionFetch[]> {
    const res = await apiFetch<any>(`api/users/me/transactions`, {
      method: 'GET'
    });

    return res.map((item: any) => {
      return {
        id: item.id,
        type: item.type,
        item: item.listing.shoe.brand + " " + item.listing.shoe.model,
        counterpart: item.details.donation.charity.name ?? item.relatedUser.name,
        date: (item.completedAt ?? item.createdAt).toDateString().slice(4),
        amount: item.amount ?? null,
        status: item.completedAt
          ? item.type === 'donate'
            ? 'donated'
            : 'completed'
          : 'pending'
      }
    })
  },

  async getUserCoinBalance(): Promise<any> {
    const res = await apiFetch<any>(`api/wallet`, {
      method: 'GET'
    });

    return res.wallet;
  },

  async getUserWalletTransactions(): Promise<CoinTx[]> {
    const res = await apiFetch<any>(`api/wallet/transactions`, {
      method: 'GET'
    });

    return res.transactions.map((item: any) => {
      return {
        id: item.id,
        amount: item.amount,
        date: new Date(item.createdAt).toDateString().slice(4),
        ...this.getTransactionInfo(item)
      }
    })
  },

  async submitRating(transactionId: number, rating: number, comment?: string): Promise<{ rating: any }> {
    return apiFetch<{ rating: any }>(`api/transactions/${transactionId}/rating`, {
      method: 'POST',
      body: { rating, comment: comment || undefined },
    });
  },

  async getVouchers(): Promise<RedeemOption[]> {
    const res = await apiFetch<any>(`api/rewards/redeem-options`, {
      method: 'GET'
    });

    return res.redeemOptions.map((item: any) => {
      return {
        id: item.id,
        title: item.name,
        description: item.description,
        cost: item.amount,
        icon: this.getVoucherIcon(item.voucherType)
      }
    })
  }
}