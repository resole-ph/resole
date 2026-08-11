export interface SneakerItem {
  id: string;
  brand: string;
  name: string;
  size: string;
  condition: string;
  price: number;
  was: number | null; // For Flash Deals
  score: string;       // AI Authentication score
  image: string;
  isFlashSale: boolean;
  isSwapBoard: boolean;
  swapOwner?: {
    name: string;
    avatarColor: string;
    time: string;
    lookingFor: string;
    note: string;
  };
}

export const ALL_SNEAKERS: SneakerItem[] = [
  // --- FLASH SALES ---
  {
    id: "101",
    brand: "Nike",
    name: "Dunk Low 'Tiffany'",
    size: "US 9.5 Men",
    condition: "9/10",
    price: 14500,
    was: 18200,
    score: "92%",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=500&auto=format&fit=crop",
    isFlashSale: true,
    isSwapBoard: false
  },
  {
    id: "102",
    brand: "Adidas",
    name: "Yeezy Boost 350 'Cream'",
    size: "US 10.0 Men",
    condition: "Like New",
    price: 12200,
    was: 16000,
    score: "99%",
    image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?q=80&w=500&auto=format&fit=crop",
    isFlashSale: true,
    isSwapBoard: false
  },
  {
    id: "103",
    brand: "Jordan Brand",
    name: "Jordan 1 Retro High Mocha",
    size: "US 10.5 Men",
    condition: "Good",
    price: 28000,
    was: 32000,
    score: "94%",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=500&auto=format&fit=crop",
    isFlashSale: true,
    isSwapBoard: false
  },
  {
    id: "104",
    brand: "New Balance",
    name: "2002R 'Protection Pack'",
    size: "US 9.0 Men",
    condition: "Like New",
    price: 9800,
    was: 12500,
    score: "100%",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=500&auto=format&fit=crop",
    isFlashSale: true,
    isSwapBoard: false
  },

  // --- SWAP BOARD ENTRIES ---
  {
    id: "105",
    brand: "Jordan Brand",
    name: "Jordan 4 'Midnight Navy'",
    size: "US 10.0 Men",
    condition: "9.0/10",
    price: 16500,
    was: null,
    score: "91%",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=500&auto=format&fit=crop",
    isFlashSale: false,
    isSwapBoard: true,
    swapOwner: {
      name: "John D.",
      avatarColor: "#2563EB",
      time: "2 mins ago",
      lookingFor: "Any Yeezy 700 V3",
      note: "Condition 8.5+ only"
    }
  },
  {
    id: "106",
    brand: "Nike",
    name: "Air Force 1 'Valentine's'",
    size: "US 7.0 Women",
    condition: "Like New",
    price: 7200,
    was: null,
    score: "100%",
    image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=500&auto=format&fit=crop",
    isFlashSale: false,
    isSwapBoard: true,
    swapOwner: {
      name: "Maya S.",
      avatarColor: "#10B981",
      time: "15 mins ago",
      lookingFor: "Dunk Low 'Panda'",
      note: "Size 7W / Brand New preferred"
    }
  },
  {
    id: "107",
    brand: "Salomon",
    name: "XT-6 Phantom Black",
    size: "US 11.0 Men",
    condition: "VNDS (Passes as New)",
    price: 11000,
    was: null,
    score: "96%",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=500&auto=format&fit=crop",
    isFlashSale: false,
    isSwapBoard: true,
    swapOwner: {
      name: "Kevin C.",
      avatarColor: "#F59E0B",
      time: "1 hour ago",
      lookingFor: "Hoka Clifton 9",
      note: "Open to other trail runners"
    }
  },

  // --- GENERAL MARKETPLACE LSTINGS ---
  {
    id: "108",
    brand: "Jordan Brand",
    name: "Jordan 1 High 'Lost & Found'",
    size: "US 10.5 Men",
    condition: "Good",
    price: 24500,
    was: null,
    score: "97%",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=500&auto=format&fit=crop",
    isFlashSale: false,
    isSwapBoard: false
  },
  {
    id: "109",
    brand: "Adidas",
    name: "Yeezy 700 'Wave Runner'",
    size: "US 9.5 Men",
    condition: "Good Condition",
    price: 18200,
    was: null,
    score: "89%",
    image: "https://images.unsplash.com/photo-1608379743498-3c98d4c5aa1a?q=80&w=500&auto=format&fit=crop",
    isFlashSale: false,
    isSwapBoard: false
  },
  {
    id: "110",
    brand: "Nike",
    name: "Dunk Low 'Panda'",
    size: "US 10.0 Men",
    condition: "Like New",
    price: 6500,
    was: null,
    score: "100%",
    image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=500&auto=format&fit=crop",
    isFlashSale: false,
    isSwapBoard: false
  },
  {
    id: "111",
    brand: "Travis Scott x Jordan",
    name: "Reverse Mocha Low",
    size: "US 11.0 Men",
    condition: "Like New",
    price: 65000,
    was: null,
    score: "100%",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=500&auto=format&fit=crop",
    isFlashSale: false,
    isSwapBoard: false
  },
  {
    id: "112",
    brand: "New Balance",
    name: "990v5 'Grey Day'",
    size: "US 10.0 Men",
    condition: "Good",
    price: 8900,
    was: null,
    score: "93%",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=500&auto=format&fit=crop",
    isFlashSale: false,
    isSwapBoard: false
  },
  {
    id: "113",
    brand: "Nike",
    name: "Air Max 97 'Silver Bullet'",
    size: "US 9.0 Men",
    condition: "Good Condition",
    price: 11300,
    was: null,
    score: "85%",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=500&auto=format&fit=crop",
    isFlashSale: false,
    isSwapBoard: false
  },
  {
    id: "114",
    brand: "Adidas",
    name: "Samba OG 'Cloud White'",
    size: "US 8.5 Men",
    condition: "Good",
    price: 5200,
    was: null,
    score: "96%",
    image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=500&auto=format&fit=crop",
    isFlashSale: false,
    isSwapBoard: false
  },
  {
    id: "115",
    brand: "Jordan Brand",
    name: "Jordan 4 'Bred Reimagined'",
    size: "US 11.0 Men",
    condition: "VNDS",
    price: 22800,
    was: null,
    score: "91%",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=500&auto=format&fit=crop",
    isFlashSale: false,
    isSwapBoard: false
  },
  {
    id: "116",
    brand: "Asics",
    name: "GEL-Kayano 14 'Cream Black'",
    size: "US 10.5 Men",
    condition: "Like New",
    price: 13400,
    was: null,
    score: "98%",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=500&auto=format&fit=crop",
    isFlashSale: false,
    isSwapBoard: false
  }
];