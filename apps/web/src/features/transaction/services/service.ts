import { db } from '@/config/db';
import { eq } from 'drizzle-orm';
import { voucher } from '@/db/schema';
import { Voucher } from '@/features/transaction/types/types';

export async function getAllVoucher() {
  try {
    const rows = await db
      .select()
      .from(voucher);
    
    return rows as Voucher[] ?? null;
  } catch (error) {
    console.error("Error fetching vouchers.");
    return null;
  }
}

export async function getVoucherById(id: number) {
  try {
    const rows = await db
      .select()
      .from(voucher)
      .where(eq(voucher.id, id));
    
    return rows[0] as Voucher ?? null;
  } catch (error) {
    console.error("Error fetching voucher.");
    return null;
  }
}