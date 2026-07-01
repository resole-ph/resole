export type AuthMode = 'login' | 'signup';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  intent: 'buy' | 'sell' | 'donate';
  contact_no: string;
  city: string;
};
