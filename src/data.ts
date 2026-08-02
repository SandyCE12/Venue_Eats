import { Vendor, BusinessMetrics, ManagedEvent } from "./types";

export interface EventInfo {
  name: string;
  location: string;
  attendees: number;
  durationDays: number;
  month: string;
  description: string;
}

export interface Competitor {
  name: string;
  origin: string;
  strengths: string[];
  weaknesses: string[];
  feeStructure: string;
  suitabilityForOutdoor: string;
}

export const STOCKHOLM_EVENTS: EventInfo[] = [
  {
    name: "Namaste Stockholm Festival",
    location: "Kungsträdgården",
    attendees: 25000,
    durationDays: 1,
    month: "May",
    description: "The largest celebration of Indian culture and cuisine in Scandinavia. Tens of thousands pack Kungsträdgården for authentic street food, leading to massive 45-minute lines where guests are stuck in queues instead of enjoying live yoga, dance workshops, and music."
  },
  {
    name: "Smaka på Stockholm (Taste of Stockholm)",
    location: "Kungsträdgården",
    attendees: 350000, // Total over 5 days
    durationDays: 5,
    month: "June",
    description: "One of the world's largest food festivals. Massive queues at every food booth in the middle of Stockholm, which ruins the experience for thousands."
  },
  {
    name: "Lollapalooza Stockholm",
    location: "Gärdet",
    attendees: 70000, // Total over 3 days (approx 23k per day)
    durationDays: 3,
    month: "July",
    description: "Huge music festival in a massive grass field. Attendees wait up to 45 minutes for burgers or tacos, missing their favorite bands."
  },
  {
    name: "Stockholm Culture Festival (Kulturfestival)",
    location: "Stockholm City Center",
    attendees: 100000,
    durationDays: 5,
    month: "August",
    description: "An open cultural feast featuring music, food, and arts with dozens of international street food trucks spread across squares."
  }
];

export const MARKET_COMPETITORS: Competitor[] = [
  {
    name: "Pej (Local Swedish Leader)",
    origin: "Sweden",
    strengths: ["Excellent Swish integration", "Native understand of Skatteverket guidelines", "Hardware terminal partnerships"],
    weaknesses: ["High upfront SaaS setup cost", "Rigid QR structure", "Not optimized specifically for high-density festival peaks (slow load times under strain)"],
    feeStructure: "Approx. 1.9% - 2.5% transaction commission + fixed terminal rent.",
    suitabilityForOutdoor: "Good, but setup time is long and require heavy on-site network infrastructure."
  },
  {
    name: "Yoello (International Giant)",
    origin: "UK / Global",
    strengths: ["Frictionless web-app (no download needed)", "Supports multiple languages", "Award-winning dashboard architecture"],
    weaknesses: ["High transaction commission for non-UK cards", "Lacks deep Swish integration (primarily uses Stripe/Apple Pay)", "Support is remote and not on-site in Sweden"],
    feeStructure: "1.5% to 2.9% commission + flat monthly SaaS fee per stall.",
    suitabilityForOutdoor: "High capability, but lack of Swish is a friction point in Stockholm where 95% of youths prefer Swish."
  },
  {
    name: "Slerp / Preoday",
    origin: "UK",
    strengths: ["Highly customizable white-label app branding", "Supports advanced delivery, takeaway and table ordering layouts"],
    weaknesses: ["Requires downloading dedicated vendor apps or separate attendee skins", "Complex user interface", "Primarily built for permanent restaurants, not pop-up temporary tents"],
    feeStructure: "High setup fees (approx 5,000 SEK setup) + 2.0% transaction fee.",
    suitabilityForOutdoor: "Moderate. Overkill for a 3-day outdoor street food setup."
  },
  {
    name: "Karma (Swedish Restaurant Saver)",
    origin: "Sweden",
    strengths: ["Massive Swedish user base already on their phones", "Famous brand in Stockholm"],
    weaknesses: ["Built for food waste and discounted surplus, NOT for live real-time full-price ordering at hot events", "Cannot easily handle customized order notes or complex multi-addon menus"],
    feeStructure: "Up to 15-25% transaction commission (designed for surplus food recovery).",
    suitabilityForOutdoor: "Poor. Wrong business model."
  }
];

export const DEFAULT_VENDORS: Vendor[] = [
  {
    id: "v1",
    isApproved: true,
    name: "Delhi Street Sensation",
    cuisine: "Delhi Chaat & Curry Rolls",
    logo: "🍛",
    rating: 4.9,
    location: "Kungsträdgården Fountain Square",
    stallNumber: "Stall #01",
    pin: "1111",
    email: "delhi@venueeat.se",
    swishNumber: "123 918 27 36",
    menu: [
      {
        id: "m1_1",
        name: "Classic Samosa Chaat",
        description: "Crispy vegetable samosas crushed and smothered with warm spiced chickpeas, sweet yogurt, tangy tamarind, and spicy mint chutney.",
        price: 95,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e1_1", name: "Extra Sweet Yogurt", price: 10 },
          { id: "e1_2", name: "Double Mint Chutney", price: 10 },
          { id: "e1_3", name: "Add Extra Samosa", price: 25 }
        ]
      },
      {
        id: "m1_2",
        name: "Butter Chicken Naan Roll",
        description: "Tender tandoori chicken pieces wrapped in a fresh handmade butter naan with coriander-mint chutney and pickled red onions.",
        price: 135,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e1_4", name: "Extra Butter Chicken Sauce", price: 15 },
          { id: "e1_5", name: "Add Grated Paneer", price: 20 }
        ]
      },
      {
        id: "m1_3",
        name: "Vibrant Mango Lassi",
        description: "Creamy traditional yogurt drink blended with sweet Alphonso mango pulp and a touch of green cardamom.",
        price: 45,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v2",
    isApproved: true,
    name: "Bombay Cutting & Grill",
    cuisine: "Mumbai Street Eats",
    logo: "🦁",
    rating: 4.8,
    location: "Teatern Stage North",
    stallNumber: "Stall #02",
    pin: "2222",
    email: "bombay@venueeat.se",
    swishNumber: "123 726 19 48",
    menu: [
      {
        id: "m2_1",
        name: "Pav Bhaji (Spiced Tawa Mash)",
        description: "Vibrant mashed mixed vegetable curry slow-cooked on a flat tawa with special Amul butter and pav bhaji spices. Served with two soft butter-toasted buns, lime, and red onions.",
        price: 110,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e2_1", name: "Extra Buttered Pav Bun", price: 15 },
          { id: "e2_2", name: "Extra Spoon of Amul Butter", price: 10 }
        ]
      },
      {
        id: "m2_2",
        name: "Vada Pav (The Bombay Burger)",
        description: "Spiced deep-fried golden potato dumpling nestled inside a soft pillowy bun, layered with garlic dry chutney and green chilies.",
        price: 65,
        category: "Snack",
        imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m2_3",
        name: "Masala Cutting Chai",
        description: "Freshly brewed robust black tea simmered with milk, fresh ginger, crushed green cardamom, cloves, and black pepper.",
        price: 35,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v3",
    isApproved: true,
    name: "Kerala Coastal Spice",
    cuisine: "South Indian Delights",
    logo: "🥥",
    rating: 4.7,
    location: "Karl XII Torg Area",
    stallNumber: "Stall #03",
    pin: "3333",
    email: "kerala@venueeat.se",
    swishNumber: "123 837 46 19",
    menu: [
      {
        id: "m3_1",
        name: "Classic Masala Dosa",
        description: "Crispy golden fermented rice-and-lentil crepe, stuffed with a mildly spiced mustard-tempered potato mash, served with warm sambar and fresh coconut chutney.",
        price: 125,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e3_1", name: "Extra Sambar Cup", price: 15 },
          { id: "e3_2", name: "Extra Coconut Chutney", price: 10 }
        ]
      },
      {
        id: "m3_2",
        name: "Malabar Chicken Biryani",
        description: "Fragrant premium rice layered with marinated spiced chicken, caramelized onions, cashews, and coriander, slow-cooked in traditional Dum style.",
        price: 145,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1562376502-6f769499c886?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e3_3", name: "Extra Cucumber Raita", price: 15 }
        ]
      },
      {
        id: "m3_3",
        name: "Sweet Coconut Payasam",
        description: "Warm traditional South Indian dessert made with broken wheat, jaggery, cardamom, and fresh thick coconut milk.",
        price: 55,
        category: "Dessert",
        imageUrl: "https://images.unsplash.com/photo-1608885898957-a599fb1c14b4?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v4",
    isApproved: true,
    name: "Jaipur Palace Sweets",
    cuisine: "Traditional Sweets & Drinks",
    logo: "🧁",
    rating: 4.8,
    location: "Molin's Fountain West",
    stallNumber: "Stall #04",
    pin: "4444",
    email: "jaipur@venueeat.se",
    swishNumber: "123 482 73 91",
    menu: [
      {
        id: "m4_1",
        name: "Hot Gulab Jamun with Ice Cream",
        description: "Soft, golden-brown dumplings made of milk solids, soaked in warm rosewater-infused cardamom syrup, paired with vanilla bean ice cream.",
        price: 65,
        category: "Dessert",
        imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m4_2",
        name: "Kesar Pista Kulfi",
        description: "Traditional rich, creamy, unchurned Indian ice cream slow-cooked with saffron (kesar), pistachios (pista), and green cardamom on a stick.",
        price: 55,
        category: "Dessert",
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m4_3",
        name: "Nimbu Masala Fizzy Soda",
        description: "Refreshing fizzy Indian lemonade with fresh lime juice, black salt (kala namak), roasted cumin powder, and fresh mint.",
        price: 40,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  }
];

export const DEFAULT_BUSINESS_METRICS: BusinessMetrics = {
  attendees: 25000,
  adoptionRate: 40, // 40% of users order via app
  avgOrderValue: 145, // 145 SEK average basket
  avgOrdersPerUser: 1.4, // each active app user orders 1.4 times across the event
  commissionPercent: 3.5, // 3.5% transaction commission
  vendorCount: 30,
  vendorSaaSPerEvent: 950, // 950 SEK vendor setup fee
  vipPassPrice: 39, // 39 SEK to skip line/get priority prep
  vipPassAdoptionRate: 8 // 8% of app users opt for priority prep
};

export const SWEDISH_REGULATORY_FAQ = [
  {
    question: "Skatteverket Compliance: How do we legally log sales?",
    answer: "Under Sweden's Kassaregisterlag, every commercial food vendor must log transactions via a certified Cash Register (Kassaregister) that communicates with a secure physical or cloud-based Control Unit (Kontrollenhet). Our digital solution complies by routing mobile checkout APIs through a certified cloud-POS terminal integration (e.g., Onslip or Esportal APIs). The system automatically records the transaction, logs the VAT (usually 12% for food, 25% for alcoholic drinks/beverages), registers the secure sequence number, and issues a standard digital receipt with Skatteverket-compliant cryptographic control codes directly into the user's app and email."
  },
  {
    question: "How do we legally handle VAT rates?",
    answer: "In Sweden, food and non-alcoholic drinks sold for takeaway or at outdoor festivals carry a 12% food VAT (Moms). Standard drinks/alcoholic beverages or services carry 25% VAT. The app database maintains strict catalog mapping, ensuring the checkout payload splits the tax amounts perfectly on the Swish transaction slip and digital receipt, satisfying local accounting audits."
  },
  {
    question: "Can we use Swish for high-volume transactions?",
    answer: "Yes! Swish Handel is Sweden's national real-time mobile payment standard, supporting immediate account-to-account settlement. The attendee triggers a deep-link in the web-app which launches their BankID and Swish app with the pre-filled amount and recipient ID. Once signed, Swish sends an immediate web-hook notification to our Node server, which triggers the 'Placed' status in the vendor dashboard in under 1 second."
  }
];

export const MANAGED_EVENTS: ManagedEvent[] = [
  {
    id: "evt-001",
    name: "Namaste Stockholm Festival 2026",
    code: "NSF2026",
    status: "Live",
    startDate: "2026-05-23",
    endDate: "2026-05-23",
    location: "Kungsträdgården, Stockholm",
    attendeesCount: 25000,
    activeVendorsCount: 4,
    totalGmvSEK: 284500,
    totalOrdersCount: 1980,
    platformFeeRevenueSEK: 13707, // 3.5% + SaaS fees
    organizerEmail: "sandy@creativeventsnordic.com",
    category: "Cultural & Food",
    description: "The premier Indian cultural & culinary gathering in Scandinavia. Features live stage dances, yoga sessions, and 4 major street food stalls.",
    swishMerchantId: "123 918 27 36",
    topVendorName: "Delhi Street Sensation",
    topDishes: ["Classic Samosa Chaat", "Butter Chicken Naan Roll", "Vibrant Mango Lassi"],
    averagePrepTimeMin: 6,
    satisfactionRating: 4.9,
    peakHour: "13:00 - 15:00",
    historyNotes: "Currently active with 100% cashless Swish split payments enabled.",
    year: 2026
  },
  {
    id: "evt-002",
    name: "Smaka på Stockholm (Taste of Stockholm) 2026",
    code: "TASTE2026",
    status: "Live",
    startDate: "2026-06-03",
    endDate: "2026-06-07",
    location: "Kungsträdgården, Stockholm",
    attendeesCount: 350000,
    activeVendorsCount: 28,
    totalGmvSEK: 1850000,
    totalOrdersCount: 12400,
    platformFeeRevenueSEK: 91350,
    organizerEmail: "admin@smakapastockholm.se",
    category: "Cultural & Food",
    description: "Scandinavia's massive 5-day gastronomy celebration bringing together top chefs and food trucks.",
    swishMerchantId: "123 884 92 10",
    topVendorName: "Nordic Grill & Smörrebröd",
    topDishes: ["Smoked Salmon Roll", "Truffle Fries", "Craft Cider"],
    averagePrepTimeMin: 8,
    satisfactionRating: 4.8,
    peakHour: "18:00 - 20:30",
    historyNotes: "Multi-day festival with 28 onboarded vendors and dynamic QR table scanning.",
    year: 2026
  },
  {
    id: "evt-003",
    name: "Lollapalooza Stockholm 2026",
    code: "LOLL2026",
    status: "Scheduled",
    startDate: "2026-07-02",
    endDate: "2026-07-04",
    location: "Gärdet Grass Field, Stockholm",
    attendeesCount: 70000,
    activeVendorsCount: 18,
    totalGmvSEK: 0,
    totalOrdersCount: 0,
    platformFeeRevenueSEK: 17100, // SaaS pre-booking
    organizerEmail: "vendors@lollastockholm.se",
    category: "Music Festival",
    description: "3-day international outdoor music festival featuring high-density mobile crowd bursts.",
    swishMerchantId: "123 449 01 22",
    topVendorName: "Pending Launch",
    topDishes: ["Gourmet Smash Burgers", "Street Tacos", "Cold Craft Beer"],
    averagePrepTimeMin: 5,
    satisfactionRating: 5.0,
    peakHour: "19:00 - 22:00",
    historyNotes: "Pre-event setup completed. Vendor menus and Swish Merchant accounts verified.",
    year: 2026
  },
  {
    id: "evt-004",
    name: "Namaste Stockholm Festival 2025",
    code: "NSF2025",
    status: "Completed",
    startDate: "2025-05-24",
    endDate: "2025-05-24",
    location: "Kungsträdgården, Stockholm",
    attendeesCount: 24200,
    activeVendorsCount: 16,
    totalGmvSEK: 312000,
    totalOrdersCount: 2250,
    platformFeeRevenueSEK: 26120,
    organizerEmail: "sandy@creativeventsnordic.com",
    category: "Cultural & Food",
    description: "Historical 2025 edition of Namaste Stockholm. Reduced customer line wait times by 65% using VenueEat mobile queueing.",
    swishMerchantId: "123 918 27 36",
    topVendorName: "Delhi Street Sensation",
    topDishes: ["Samosa Chaat", "Mango Lassi", "Chana Bhatura"],
    averagePrepTimeMin: 5,
    satisfactionRating: 4.9,
    peakHour: "13:30 - 15:00",
    historyNotes: "Successfully processed 2,250 Swish orders with zero server outages under heavy 5G load.",
    year: 2025
  },
  {
    id: "evt-005",
    name: "Smaka på Stockholm 2025",
    code: "TASTE2025",
    status: "Completed",
    startDate: "2025-06-04",
    endDate: "2025-06-08",
    location: "Kungsträdgården, Stockholm",
    attendeesCount: 320000,
    activeVendorsCount: 32,
    totalGmvSEK: 2150000,
    totalOrdersCount: 14800,
    platformFeeRevenueSEK: 105650,
    organizerEmail: "admin@smakapastockholm.se",
    category: "Cultural & Food",
    description: "5-day gastronomy festival with 32 food trucks and 14,800 mobile pickup orders.",
    swishMerchantId: "123 884 92 10",
    topVendorName: "Stockholm Smokehouse & Ribs",
    topDishes: ["Pulled Pork Slider", "Truffle Mayo Fries", "Craft IPA"],
    averagePrepTimeMin: 7,
    satisfactionRating: 4.8,
    peakHour: "18:00 - 20:00",
    historyNotes: "Highest grossing single event on the platform in 2025.",
    year: 2025
  },
  {
    id: "evt-006",
    name: "Stockholm Culture Festival (Kulturfestivalen) 2025",
    code: "KULT2025",
    status: "Completed",
    startDate: "2025-08-13",
    endDate: "2025-08-17",
    location: "Stockholm City Center Squares",
    attendeesCount: 110000,
    activeVendorsCount: 22,
    totalGmvSEK: 980000,
    totalOrdersCount: 7100,
    platformFeeRevenueSEK: 55200,
    organizerEmail: "info@kulturfestivalen.se",
    category: "Cultural & Food",
    description: "Citywide open-air cultural celebration spanning Gustav Adolfs Torg and Skeppsbron.",
    swishMerchantId: "123 551 09 88",
    topVendorName: "Baltic Seafood & Taco Truck",
    topDishes: ["Fried Herring Roll", "Chipotle Shrimp Tacos", "Lingonberry Lemonade"],
    averagePrepTimeMin: 6,
    satisfactionRating: 4.7,
    peakHour: "17:00 - 19:30",
    historyNotes: "Multi-square deployment with localized QR table zones.",
    year: 2025
  },
  {
    id: "evt-007",
    name: "Nordic Street Food Expo 2024",
    code: "NSFX2024",
    status: "Completed",
    startDate: "2024-09-14",
    endDate: "2024-09-15",
    location: "Slakthusområden, Stockholm",
    attendeesCount: 18500,
    activeVendorsCount: 14,
    totalGmvSEK: 420000,
    totalOrdersCount: 3100,
    platformFeeRevenueSEK: 28000,
    organizerEmail: "expo@streetfoodnordic.se",
    category: "Street Market",
    description: "Autumn street food championship with local artisan vendors.",
    swishMerchantId: "123 118 76 54",
    topVendorName: "Malmö Falafel Supreme",
    topDishes: ["Halloumi & Falafel Wrap", "Mint Tea", "Baklava"],
    averagePrepTimeMin: 4,
    satisfactionRating: 4.9,
    peakHour: "12:00 - 14:00",
    historyNotes: "First event to introduce automated SMS pickup notifications.",
    year: 2024
  }
];

