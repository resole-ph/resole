import { 
  transaction,
  trackingEvent,  
  sale,
  swap,
  donation,
  redemption,
  swapItem,
  voucher,
  voucherRedeem 
} from '@/db/schema';
import { User } from '@/features/auth/types/types';
import { Charity } from '@/features/charity/types/types';
import { ShoeListing } from '@/features/shoe/types/types';

type InferTransaction = typeof transaction.$inferSelect;
export type Transaction = Omit<InferTransaction, 'listingId' | 'recipientId' > & { listing: ShoeListing, recipient: User };
export type CreateTransaction = typeof transaction.$inferInsert;
export type UpdateTransaction = Partial<InferTransaction>;

export type TrackingEvent = typeof trackingEvent.$inferSelect;
export type CreateTrackingEvent = typeof trackingEvent.$inferInsert;

type InferSale = typeof sale.$inferSelect;
export type Sale = Omit<InferSale, 'transactionId'> & { transaction: Transaction };
export type CreateSale = typeof sale.$inferInsert;
export type UpdateSale = Partial<InferSale>;

type InferSwap = typeof swap.$inferSelect;
export type Swap = Omit<InferSwap, 'transactionId'> & { transaction: Transaction };
export type CreateSwap = typeof swap.$inferInsert;
export type UpdateSwap = Partial<InferSwap>;

type InferDonation = typeof donation.$inferSelect;
export type Donation = Omit<InferDonation, 'transactionId' | 'charityId'> & { transaction: Transaction, charity: Charity };
export type CreateDonation = typeof donation.$inferInsert;
export type UpdateDonation = Partial<InferDonation>;

type InferRedemption = typeof redemption.$inferSelect;
export type Redemption = Omit<InferRedemption, 'saleId'> & { sale: Sale };
export type CreateRedemption = typeof redemption.$inferInsert;
export type UpdateRedemption = Partial<InferRedemption>;

type InferSwapItem = typeof swapItem.$inferSelect;
export type SwapItem = Omit<InferSwapItem, 'swapId' | 'itemId'> & { swap: Swap, item: ShoeListing };
export type CreateSwapItem = typeof swapItem.$inferInsert;
export type UpdateSwapItem = Partial<InferSwapItem>;

export type Voucher = typeof voucher.$inferSelect;
export type CreateVoucher = typeof voucher.$inferInsert;
export type UpdateVoucher = Partial<Voucher>;

type InferVoucherRedeem = typeof voucherRedeem.$inferSelect;
export type VoucherRedeem = Omit<InferVoucherRedeem, 'userId' > & { user: User };
export type CreateVoucherRedeem = typeof voucherRedeem.$inferInsert;
export type UpdateVoucherRedeem = Partial<InferVoucherRedeem>;