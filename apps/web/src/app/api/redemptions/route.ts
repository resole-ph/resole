import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import {
  getWalletByUserId,
  redeemSaleCoins,
  redeemVoucher,
} from '@/features/transaction/services/service';
import { parsePositiveInt } from '@/lib/id';

function getStatusForRedemptionError(message: string) {
  switch (message) {
    case 'Forbidden':
      return 403;
    case 'Redeem option not found':
      return 404;
    case 'Voucher already redeemed':
      return 409;
    case 'Insufficient coin balance':
    case 'Coins redeemed must be a positive number':
    case 'Redeem option does not have a coin cost':
    default:
      return 400;
  }
}

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const saleId = parsePositiveInt(body.saleId);
  const voucherId = parsePositiveInt(body.voucherId ?? body.rewardId ?? body.redeemOptionId);
  const coinsRedeemed = parsePositiveInt(body.coinsRedeemed ?? body.coinCost ?? body.cost);

  if (saleId && voucherId) {
    return NextResponse.json({ error: 'Provide either saleId or voucherId, not both' }, { status: 400 });
  }

  if (!saleId && !voucherId) {
    return NextResponse.json({ error: 'saleId or voucherId is required' }, { status: 400 });
  }

  if (saleId && !coinsRedeemed) {
    return NextResponse.json({ error: 'coinsRedeemed is required' }, { status: 400 });
  }

  try {
    const redemptionResult = saleId
      ? await redeemSaleCoins(currentUser.user.id, saleId, coinsRedeemed as number)
      : await redeemVoucher(currentUser.user.id, voucherId as number);

    const wallet = await getWalletByUserId(currentUser.user.id);

    return NextResponse.json({
      redemption: redemptionResult.redemption,
      wallet,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to redeem reward';
    return NextResponse.json({ error: message }, { status: getStatusForRedemptionError(message) });
  }
}
