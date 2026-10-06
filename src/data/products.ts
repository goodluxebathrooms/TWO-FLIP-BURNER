export type ProductCategory = 'Kitchen' | 'Bathroom' | 'Smart Home' | 'Home Essentials';

export interface ProductReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  visualType:
    | 'smart-sink'
    | 'piano-shower'
    | 'smart-lock'
    | 'modern-faucet'
    | 'led-mirror'
    | 'uv-sterilizer'
    | 'sensor-bin'
    | 'filtered-showerhead';
  images: string[];
  currentPrice: number;
  originalPrice: number;
  discount: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Pre-Order';
  stockCount: number;
  rating: number;
  reviewCount: number;
  isBestSeller: boolean;
  isFeatured: boolean;
  whyYouLoveIt: string[];
  productDetails: { label: string; value: string }[];
  whatsIncluded: string[];
  deliveryInfo: string;
  paymentInfo: string;
  reviews: ProductReview[];
}

export const WIDE_AD_IMAGE = '/src/assets/images/cooker_wide_ad_1790963447364.jpg';

export const UPLOADED_PRODUCT_IMAGES = [
  '/images/products/Hbe3f00ba76fa4641848c12908d0d7637q.jpg',
  '/src/assets/images/cooker_wide_ad_1790963447364.jpg',
  '/images/products/H3dea04852f6f4c86947bc7f3919842b95.jpg',
  '/images/products/H545e918a51a743ec84d9826c6a7387dfU.png',
  '/images/products/H2322db9fd53f4a01bd3216213a472dcfN.png',
  '/images/products/Hf86fe9d05ba94278b5abeb9daad2744dv.jpg',
];

export const NIGERIAN_STATES = [
  'Lagos',
  'FCT - Abuja',
  'Rivers (Port Harcourt)',
  'Oyo (Ibadan)',
  'Kano',
  'Delta (Asaba / Warri)',
  'Edo (Benin City)',
  'Enugu',
  'Anambra (Awka / Onitsha)',
  'Ogun (Abeokuta)',
  'Kaduna',
  'Akwa Ibom (Uyo)',
  'Imo (Owerri)',
  'Cross River (Calabar)',
  'Kwara (Ilorin)',
  'Osun (Osogbo)',
  'Ondo (Akure)',
  'Ekiti (Ado-Ekiti)',
  'Abia (Umuahia / Aba)',
  'Plateau (Jos)',
  'Benue (Makurdi)',
  'Kogi (Lokoja)',
  'Niger (Minna)',
  'Nasarawa (Lafia)',
  'Bayelsa (Yenagoa)',
  'Ebonyi (Abakaliki)',
  'Bauchi',
  'Borno (Maiduguri)',
  'Adamawa (Yola)',
  'Gombe',
  'Jigawa (Dutse)',
  'Katsina',
  'Kebbi (Birnin Kebbi)',
  'Sokoto',
  'Taraba (Jalingo)',
  'Yobe (Damaturu)',
  'Zamfara (Gusau)',
];

export const WHATSAPP_PHONE = '2349031585177';
export const FORMSPREE_FORM_ID = 'xbglvrry';
export const FORMSPREE_ENDPOINT = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;

export const PROGRESSIVE_DISCOUNT_STEP = 5000;

export const calculateProgressivePricing = (basePromoPrice: number, quantity: number) => {
  const qty = Math.max(1, quantity);
  // Base unit price = ₦160,000 (Save ₦10,000 off ₦170,000 normal price)
  // 2 units: ₦5,000 off each -> ₦155,000/unit (Total: ₦310,000, Save ₦10,000 off base)
  // 3+ units: ₦10,000 off each -> ₦150,000/unit (Total for 3: ₦450,000, Save ₦30,000 off base)
  const discountPerUnit = qty === 1 ? 0 : qty === 2 ? 5000 : 10000;
  const unitPrice = Math.max(0, basePromoPrice - discountPerUnit);
  const finalTotal = unitPrice * qty;
  const baseTotal = basePromoPrice * qty;
  const progressiveDiscount = qty === 1 ? 10000 : discountPerUnit * qty;
  const normalTotal = qty === 1 ? basePromoPrice + 10000 : baseTotal;
  const discountPercent = Math.max(1, Math.round((progressiveDiscount / normalTotal) * 100));

  return {
    unitPrice,
    discountPerUnit,
    finalTotal,
    normalTotal,
    progressiveDiscount,
    discountPercent,
  };
};

export const formatNaira = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG')}`;
};

export const SINGLE_PRODUCT: Product = {
  id: 'glx-smart-cooker-01',
  name: '2-BURNER SMART TIMER GAS COOKER',
  category: 'Kitchen',
  shortDescription:
    'Dual-burner tempered glass smart gas cooker with 99-minute digital timer, full battery level indicator, effortless single-wipe cleaning, and multi-ring blue turbo jet flame.',
  description:
    'Upgrade your kitchen with the 2-BURNER SMART TIMER GAS COOKER. Engineered for modern Nigerian homes, it pairs intense multi-ring direct blue jet flames with an intelligent digital control interface featuring a programmable timer display, full battery level readout, and an 8mm explosion-proof black glass surface that wipes spotless in a single pass.',
  visualType: 'smart-sink',
  images: [
    '/images/products/Hbe3f00ba76fa4641848c12908d0d7637q.jpg',
    '/src/assets/images/cooker_wide_ad_1790963447364.jpg',
    '/images/products/H3dea04852f6f4c86947bc7f3919842b95.jpg',
    '/images/products/H545e918a51a743ec84d9826c6a7387dfU.png',
    '/images/products/H2322db9fd53f4a01bd3216213a472dcfN.png',
    '/images/products/Hf86fe9d05ba94278b5abeb9daad2744dv.jpg',
  ],
  currentPrice: 160000,
  originalPrice: 170000,
  discount: 6,
  stockStatus: 'In Stock',
  stockCount: 14,
  rating: 4.9,
  reviewCount: 186,
  isBestSeller: true,
  isFeatured: true,
  whyYouLoveIt: [
    'Smart Control Interface with precise power levels, programmable digital timer (up to 99 minutes), and full battery indicator.',
    'Multi-Ring Blue Turbo Jet Flame delivers intense, even heat while saving up to 35% cooking gas (LPG).',
    'Effortless Cleaning Technology — triple-layer 8mm explosion-proof black tempered glass wipes spotless in a single wipe.',
    'Detachable windproof cast-iron burner pan supports and removable burner assembly for zero-hassle cleaning.',
    'Dual-installation flexibility: use built-in flush on your kitchen slab or freestanding tabletop with non-slip feet.',
    'Automatic flameout protection sensor immediately cuts off gas supply if soup or water spills over.',
  ],
  productDetails: [
    { label: 'Surface Material', value: '8mm Explosion-Proof Tempered Black Crystal Glass' },
    { label: 'Control Interface', value: 'Brushed Metallic Knobs + Digital Timer & Battery Display' },
    { label: 'Burner System', value: 'Dual Multi-Ring Direct Blue Turbo Jet Burners' },
    { label: 'Gas Compatibility', value: 'Standard Nigerian LPG Cooking Gas Cylinder' },
    { label: 'Installation Mode', value: 'Built-In Countertop or Freestanding Tabletop Dual-Use' },
    { label: 'Safety Protection', value: 'Thermocouple Flameout Auto Gas Cut-Off + Child Lock Knobs' },
    { label: 'Warranty', value: '12 Months Official GOODLUXE Nigeria Warranty' },
  ],
  whatsIncluded: [
    '1 × 2-BURNER SMART TIMER GAS COOKER',
    '2 × Heavy-Duty Windproof Cast-Iron Pan Supports',
    '2 × Detachable Multi-Ring Turbo Burner Assemblies',
    '4 × Non-Slip Tabletop Support Feet & Countertop Sponge Seal Strip',
    '1 × Brass LPG Hose Connector, Clamp & User Manual',
  ],
  deliveryInfo:
    'FREE Same-Day / Next-Day delivery in Lagos & Abuja. 2–4 working days nationwide delivery to Port Harcourt, Ibadan, Enugu, Benin, Kano, Warri, Uyo, Owerri, and all 36 states via insured express courier.',
  paymentInfo:
    '100% Pay on Delivery — You only pay upon receiving and inspecting your order at your doorstep (via POS or Instant Transfer to the delivery agent).',
  reviews: [],
};

export const INITIAL_PRODUCTS: Product[] = [SINGLE_PRODUCT];

export const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Chinedu Okafor',
    location: 'Lekki Phase 1, Lagos',
    role: 'Verified Buyer',
    rating: 5,
    productPurchased: 'GOODLUXE Smart Digital Gas Hob',
    quote:
      'Installed this in our Lekki duplex and my wife is thrilled. The blue turbo flame boils water in half the time, the digital timer is super accurate, and cleaning oil splashes off the black glass takes one wipe.',
  },
  {
    id: 't2',
    name: 'Hajia Amina Bello',
    location: 'Wuse II, Abuja',
    role: 'Verified Buyer',
    rating: 5,
    productPurchased: 'GOODLUXE Smart Digital Gas Hob',
    quote:
      'Delivered to Abuja the very next day with Pay on Delivery. I opened the box and inspected the tempered glass and heavy cast-iron stands before transferring payment. Looks 10x more luxurious in person!',
  },
  {
    id: 't3',
    name: 'Engr. Babatunde Adeyemi',
    location: 'GRA Phase 2, Port Harcourt',
    role: 'Verified Buyer',
    rating: 5,
    productPurchased: 'GOODLUXE Smart Digital Gas Hob (2 Units)',
    quote:
      'What impressed me most is the detachable burner structure and the battery indicator on the digital screen. No more guessing when ignition battery is low. Highly recommended.',
  },
  {
    id: 't4',
    name: 'Dr. Ngozi Eze',
    location: 'Independence Layout, Enugu',
    role: 'Verified Buyer',
    rating: 5,
    productPurchased: 'GOODLUXE Smart Digital Gas Hob',
    quote:
      'The brushed silver control knobs and digital display make my kitchen countertop look like a 5-star showroom. Plus it uses noticeably less cooking gas than our old burner.',
  },
];

export const FAQS = [
  {
    question: 'Do you deliver nationwide across Nigeria?',
    answer:
      'Yes! We offer FREE nationwide delivery to all 36 states in Nigeria and FCT Abuja. Orders in Lagos and Abuja are delivered Same-Day or Next-Day. Deliveries to Port Harcourt, Ibadan, Benin, Enugu, Kano, Warri, Uyo, Owerri, and other states take 2 to 4 working days.',
  },
  {
    question: 'Is Pay on Delivery available?',
    answer:
      'Yes! Pay on Delivery (via Bank Transfer or POS upon arrival) is available in Lagos, FCT Abuja, Port Harcourt, Ibadan, Benin City, Enugu, Abeokuta, and major state capitals. You can inspect your gas hob upon arrival before paying.',
  },
  {
    question: 'Can this gas hob be used both on top of a table and built into a kitchen slab?',
    answer:
      'Yes, it features a dual-use design. It comes with 4 non-slip feet so you can place it directly on your kitchen counter like a tabletop stove, OR drop it flush into a cut-out granite/marble countertop.',
  },
  {
    question: 'Does the digital display require plugging into NEPA / electricity?',
    answer:
      'No! It works with a standard long-life battery compartment underneath (with a full battery level indicator right on the digital LED screen), so power outages never affect your ignition or digital timer.',
  },
  {
    question: 'Does it work with standard Nigerian cooking gas cylinders?',
    answer:
      'Yes, 100% compatible with all standard Nigerian LPG cooking gas cylinders and regulators (3kg, 6kg, 12.5kg, 25kg, and 50kg cylinders).',
  },
  {
    question: 'How easy is it to clean oil and food spills?',
    answer:
      'Thanks to the Effortless Cleaning Technology and detachable burner rings, you simply lift off the burner stand and wipe the flat tempered glass spotless in a single pass with a damp cloth.',
  },
  {
    question: 'What warranty is included?',
    answer:
      'Every GOODLUXE Smart Digital Gas Hob is backed by our 7-Day Easy Replacement Guarantee and a 12-Month Official Warranty covering the tempered glass, ignition module, and digital control interface.',
  },
  {
    question: 'How does Pay on Delivery work?',
    answer:
      'Fill in the Quick Order Form with your delivery address. Our logistics dispatch team delivers right to your doorstep anywhere in Nigeria. You inspect your package before making payment via cash or POS/bank transfer.',
  },
];

export const MAIN_PRODUCT = SINGLE_PRODUCT;
export const TWO_BURNER_PRODUCT = SINGLE_PRODUCT;
export const STORE_PHONE = WHATSAPP_PHONE;
export const calculateWholesalePrice = (quantity: number) => {
  return calculateProgressivePricing(SINGLE_PRODUCT.currentPrice, quantity);
};

export const SOCIAL_PROOF_ORDERS = [
  { name: 'Engr. Emeka K.', units: '2 Units (₦10,000 Saved)', location: 'Lekki Phase 1, Lagos', timeAgo: '3 mins ago' },
  { name: 'Mrs. Folashade A.', units: '1 Unit', location: 'Maitama, Abuja', timeAgo: '7 mins ago' },
  { name: 'Dr. Obinna O.', units: '3 Units (₦30,000 Saved)', location: 'GRA Phase 2, Port Harcourt', timeAgo: '14 mins ago' },
  { name: 'Alhaji Musa D.', units: '1 Unit', location: 'Nasarawa, Kano', timeAgo: '22 mins ago' },
];

export const DESCRIPTION_CARDS = [
  {
    title: 'Intense Blue Turbo Jet Flames',
    description: 'Direct multi-ring flame nozzles deliver maximum thermal efficiency without blackening pots or wasting cooking gas.',
  },
  {
    title: 'Smart Digital LED Timer',
    description: 'Set cooking timers up to 99 minutes with automatic alert and battery status display.',
  },
  {
    title: '8mm Explosion-Proof Tempered Glass',
    description: 'Heavy-duty heat-resistant safety glass rated for pots up to 60kg and thermal shock resistant.',
  },
  {
    title: 'Single-Wipe Effortless Cleaning',
    description: 'Detachable burner rings and smooth seamless black tempered glass wipe spotless in seconds.',
  },
  {
    title: 'Dual Countertop & Built-In Placement',
    description: 'Use instantly as a tabletop cooker with non-slip rubber feet, or drop into marble counter slab.',
  },
  {
    title: 'Instant Electronic Piezo Ignition',
    description: 'Fast, smooth 1-second pulse ignition powered by internal battery cell. No matches or lighters needed.',
  },
];
