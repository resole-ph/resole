import { voucher, voucherRedeem } from '@/db/schema';
import { User } from '@/features/auth/types/types';

export type Voucher = typeof voucher.$inferSelect;
export type CreateVoucher = typeof voucher.$inferInsert;
export type UpdateVoucher = Partial<Voucher>;

type InferVoucherRedeem = typeof voucherRedeem.$inferSelect;
export type UserTask = Omit<InferVoucherRedeem, 'userId' > & { user: User };
export type CreateVoucherRedeem = typeof voucherRedeem.$inferInsert;
export type UpdateVoucherRedeem = Partial<InferVoucherRedeem>;