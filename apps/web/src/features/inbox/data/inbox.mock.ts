export type ConversationTab = 'offers' | 'updates';

export type OfferData = {
  type: 'buy' | 'swap';
  item: string;
  size: string;
  price?: string;
  swapItem?: string;
  status: 'pending' | 'accepted' | 'declined';
  image?: string;
};

export type ChatMessage = {
  id: string;
  from: 'me' | 'them' | 'system';
  text?: string;
  time: string;
  seen?: boolean;
  offer?: OfferData;
};

export type Conversation = {
  id: string;
  tab: ConversationTab;
  sender: string;
  avatarInitial: string;
  avatarColor: string;
  icon?: string;
  isSystem: boolean;
  isOnline?: boolean;
  subtitle: string;
  preview: string;
  time: string;
  unread: number;
  messages: ChatMessage[];
};

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'm1',
    tab: 'offers',
    sender: '@jmendoza',
    avatarInitial: 'J',
    avatarColor: '#DBEAFE',
    isSystem: false,
    isOnline: true,
    subtitle: 'Online now',
    preview: 'Hey! Would you do ₱16,000 for the Jordan 1 Retro? I can pick up today.',
    time: '9:41 AM',
    unread: 2,
    messages: [
      { id: '1', from: 'them', text: 'Hey! Is the Jordan 1 Retro High still available?', time: '9:20 AM' },
      { id: '2', from: 'me', text: 'Yes it is! Which size are you looking for?', time: '9:22 AM' },
      {
        id: '3',
        from: 'them',
        text: "Size 10.5. It's listed at ₱18k — any chance you'd take ₱16,000? I can pick up in BGC today.",
        time: '9:24 AM',
      },
      {
        id: '4',
        from: 'them',
        time: '9:25 AM',
        offer: {
          type: 'buy',
          item: 'Jordan 1 Retro High OG',
          size: '10.5',
          price: '₱16,000',
          status: 'pending',
        },
      },
      { id: '5', from: 'them', text: 'I can also bring cash if that makes it easier 🙏', time: '9:41 AM' },
    ],
  },
  {
    id: 'm2',
    tab: 'updates',
    sender: 'Resole',
    avatarInitial: 'R',
    avatarColor: '#EFF6FF',
    icon: 'package_2',
    isSystem: true,
    subtitle: 'Order updates',
    preview: 'Your order ORD-001 (Nike Air Max 90) is now out for delivery. Expected by 3 PM.',
    time: '8:15 AM',
    unread: 1,
    messages: [
      { id: '1', from: 'system', text: 'Order ORD-001 confirmed.', time: 'May 29, 9:12 AM' },
      { id: '2', from: 'system', text: 'Your Nike Air Max 90 has been picked up by J&T Express.', time: 'May 30, 2:45 PM' },
      { id: '3', from: 'system', text: 'Package is in transit. Tracking: JT8273910284', time: 'May 31, 8:00 AM' },
      { id: '4', from: 'system', text: 'Your order is now out for delivery. Expected by 3 PM today.', time: '8:15 AM' },
    ],
  },
  {
    id: 'm3',
    tab: 'offers',
    sender: '@kevinr',
    avatarInitial: 'K',
    avatarColor: '#EDE9FE',
    isSystem: false,
    isOnline: false,
    subtitle: 'Last seen yesterday',
    preview: 'Swap proposal: my NB 550 (size 10) for your Panda Dunk. Both DS. Let me know!',
    time: 'Yesterday',
    unread: 0,
    messages: [
      { id: '1', from: 'me', text: 'Thanks for checking out the Panda Dunk!', time: '2:10 PM' },
      {
        id: '2',
        from: 'them',
        text: 'Love the listing. Really clean pair. I have a DS NB 550 in size 10 — great condition, would you consider a swap?',
        time: '2:15 PM',
      },
      {
        id: '3',
        from: 'them',
        time: '2:16 PM',
        offer: {
          type: 'swap',
          item: 'Nike Dunk Low Panda',
          size: '10',
          swapItem: 'New Balance 550',
          status: 'pending',
        },
      },
      { id: '4', from: 'them', text: 'Both DS, never worn. Let me know what you think!', time: '2:18 PM' },
    ],
  },
  {
    id: 'm4',
    tab: 'updates',
    sender: 'Resole',
    avatarInitial: 'R',
    avatarColor: '#EFF6FF',
    icon: 'bar_chart',
    isSystem: true,
    subtitle: 'Listing insights',
    preview: 'Your listing "Adidas Samba OG" has been viewed 48 times this week.',
    time: 'Yesterday',
    unread: 0,
    messages: [
      { id: '1', from: 'system', text: 'Your listing "Adidas Samba OG" is getting traction!', time: 'Yesterday, 8:00 AM' },
      { id: '2', from: 'system', text: '48 profile views this week — up 22% from last week.', time: 'Yesterday, 8:00 AM' },
      {
        id: '3',
        from: 'system',
        text: 'Tip: Listings with 5+ photos get 3× more offers. Add more photos to boost visibility.',
        time: 'Yesterday, 8:01 AM',
      },
    ],
  },
  {
    id: 'm5',
    tab: 'offers',
    sender: '@amirag',
    avatarInitial: 'A',
    avatarColor: '#D1FAE5',
    isSystem: false,
    isOnline: false,
    subtitle: 'Last seen Monday',
    preview: 'Is the Samba OG still available? I can do ₱7,500 cash on meet-up.',
    time: 'Mon',
    unread: 0,
    messages: [
      { id: '1', from: 'them', text: 'Hi! Is the Adidas Samba OG still available?', time: '11:00 AM' },
      { id: '2', from: 'me', text: 'Yes it is! Still looking for the right buyer.', time: '11:05 AM' },
      {
        id: '3',
        from: 'them',
        text: "Great condition from the photos! Would you do ₱7,500 cash? I'm near Quezon City.",
        time: '11:08 AM',
      },
      {
        id: '4',
        from: 'me',
        text: "I was hoping for closer to ₱7,800 since it's deadstock. But open to meeting halfway.",
        time: '11:10 AM',
      },
      { id: '5', from: 'them', text: 'Deal at ₱7,650? Meet-up on Friday works for me.', time: '11:12 AM' },
      {
        id: '6',
        from: 'me',
        text: "₱7,650 works. Let's lock in Friday afternoon — I'll DM you the spot.",
        time: '11:14 AM',
        seen: true,
      },
    ],
  },
  {
    id: 'm6',
    tab: 'updates',
    sender: 'Resole',
    avatarInitial: 'R',
    avatarColor: '#EFF6FF',
    icon: 'favorite',
    isSystem: true,
    subtitle: 'Donation & rewards',
    preview: 'Donation confirmed! Your Converse Chuck 70 earned you 80 Recycle Coins.',
    time: 'May 22',
    unread: 0,
    messages: [
      { id: '1', from: 'system', text: 'Pickup confirmed! Your Converse Chuck 70 has been collected.', time: 'May 22, 10:00 AM' },
      { id: '2', from: 'system', text: 'Drop-off verified at Gawad Kalinga partner site.', time: 'May 22, 3:15 PM' },
      {
        id: '3',
        from: 'system',
        text: 'Donation confirmed! You earned +80 Recycle Coins. Total balance: 1,240 coins 🌱',
        time: 'May 22, 4:00 PM',
      },
    ],
  },
  {
    id: 'm7',
    tab: 'offers',
    sender: '@lramos',
    avatarInitial: 'L',
    avatarColor: '#FCE7F3',
    isSystem: false,
    isOnline: false,
    subtitle: 'Last seen May 20',
    preview: 'Thanks for the swap! The Panda Dunk arrived in perfect condition.',
    time: 'May 20',
    unread: 0,
    messages: [
      { id: '1', from: 'me', text: 'Hey! Just wanted to let you know the NB 550 arrived safe.', time: '1:00 PM' },
      { id: '2', from: 'them', text: 'Awesome! Really glad to hear that. How does it look?', time: '1:30 PM' },
      { id: '3', from: 'me', text: 'Pristine condition, exactly as described. Really happy with the swap.', time: '1:32 PM' },
      {
        id: '4',
        from: 'them',
        text: 'The Panda Dunk just arrived too — absolutely clean. Thanks for the smooth transaction!',
        time: '2:00 PM',
      },
      { id: '5', from: 'me', text: 'Likewise! Would trade with you again anytime 🤝', time: '2:05 PM' },
      { id: '6', from: 'them', text: 'Same here! Take care 👟', time: '2:06 PM', seen: true },
    ],
  },
  {
    id: 'm8',
    tab: 'updates',
    sender: 'Resole Support',
    avatarInitial: 'S',
    avatarColor: '#FEF3C7',
    icon: 'verified_user',
    isSystem: true,
    subtitle: 'Support',
    preview: 'Your dispute for DON-002 has been resolved. Refund of ₱200 is on its way.',
    time: 'May 18',
    unread: 0,
    messages: [
      { id: '1', from: 'system', text: 'We received your dispute for order DON-002.', time: 'May 16, 2:00 PM' },
      {
        id: '2',
        from: 'system',
        text: 'Our team is reviewing the case. Expected resolution in 2 business days.',
        time: 'May 16, 2:01 PM',
      },
      {
        id: '3',
        from: 'system',
        text: 'Update: The seller has been notified and asked to respond within 24 hours.',
        time: 'May 17, 10:30 AM',
      },
      {
        id: '4',
        from: 'system',
        text: 'Dispute resolved in your favour. A refund of ₱200 will be credited to your wallet within 3–5 business days.',
        time: 'May 18, 9:00 AM',
      },
    ],
  },
];
