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
  },
  {
    id: "v5",
    isApproved: true,
    name: "Nordic Smokehouse & Smash",
    cuisine: "Swedish BBQ & Smash Burgers",
    logo: "🍔",
    rating: 4.9,
    location: "Strömgatan Promenade",
    stallNumber: "Stall #05",
    pin: "5555",
    email: "nordicsmoke@venueeat.se",
    swishNumber: "123 551 88 22",
    menu: [
      {
        id: "m5_1",
        name: "Stockholm Truffle Smash Burger",
        description: "Double smashed Swedish beef patty, melted aged Västerbottensost, caramelized onions, and black truffle aioli in a butter-toasted brioche bun.",
        price: 139,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e5_1", name: "Extra Crispy Bacon", price: 20 },
          { id: "e5_2", name: "Double Truffle Mayo Dip", price: 15 },
          { id: "e5_3", name: "Gluten-Free Bun", price: 10 }
        ]
      },
      {
        id: "m5_2",
        name: "Crispy Parmesan Loaded Fries",
        description: "Skin-on rustic fries topped with grated parmesan, chopped chives, and smoky paprika seasoning.",
        price: 59,
        category: "Snack",
        imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m5_3",
        name: "Artisan Lingonberry Craft Soda",
        description: "Handcrafted sparkling soda infused with wild Swedish lingonberries and a touch of rosemary.",
        price: 42,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v6",
    isApproved: true,
    name: "Tokyo Izakaya & Yakitori",
    cuisine: "Japanese Charcoal & Ramen",
    logo: "🍜",
    rating: 4.9,
    location: "Hamngatan North Pavilion",
    stallNumber: "Stall #06",
    pin: "6666",
    email: "tokyo@venueeat.se",
    swishNumber: "123 662 99 33",
    menu: [
      {
        id: "m6_1",
        name: "Tare Glazed Chicken Yakitori (3 pcs)",
        description: "Tender chicken thigh and scallion skewers grilled over hot charcoal with house-made sweet soy tare glaze.",
        price: 98,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e6_1", name: "Add Onsen Tamago Egg", price: 15 },
          { id: "e6_2", name: "Spicy Shichimi Togarashi", price: 8 }
        ]
      },
      {
        id: "m6_2",
        name: "Rich Tonkotsu Festival Ramen Cup",
        description: "Slow-simmered rich pork broth, fresh wheat noodles, chashu pork belly slice, menma bamboo, and nori seaweed.",
        price: 135,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m6_3",
        name: "Iced Uji Matcha Latte",
        description: "Premium ceremonial Japanese matcha whisked with oat milk and lightly sweetened with organic cane syrup.",
        price: 49,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v7",
    isApproved: true,
    name: "Taquería El Barrio Stockholm",
    cuisine: "Oaxacan Street Tacos",
    logo: "🌮",
    rating: 4.8,
    location: "Jacobsgatan South Corner",
    stallNumber: "Stall #07",
    pin: "7777",
    email: "elbarrio@venueeat.se",
    swishNumber: "123 773 11 44",
    menu: [
      {
        id: "m7_1",
        name: "Birria Beef Tacos with Consomé (3 pcs)",
        description: "Crispy griddled corn tortillas filled with slow-braised spiced beef, melted Oaxaca cheese, cilantro, and onions with rich dipping broth.",
        price: 139,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e7_1", name: "Extra Dipping Consomé Cup", price: 20 },
          { id: "e7_2", name: "Fresh Guacamole Scoop", price: 25 }
        ]
      },
      {
        id: "m7_2",
        name: "Totopos & Fresh Molcajete Salsa",
        description: "Freshly fried crispy corn tortilla chips served with roasted tomato salsa and tangy lime crema.",
        price: 55,
        category: "Snack",
        imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m7_3",
        name: "Authentic Cinnamon Horchata",
        description: "Sweet and creamy traditional rice milk drink flavored with Mexican cinnamon and vanilla bean.",
        price: 45,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v8",
    isApproved: true,
    name: "Napoli Woodfire Crusts",
    cuisine: "Neapolitan Slices & Panuozzo",
    logo: "🍕",
    rating: 4.9,
    location: "Garden Courtyard East",
    stallNumber: "Stall #08",
    pin: "8888",
    email: "napoli@venueeat.se",
    swishNumber: "123 884 22 55",
    menu: [
      {
        id: "m8_1",
        name: "Margherita D.O.P Folded Pizza",
        description: "San Marzano D.O.P tomato sauce, creamy fior di latte mozzarella, fresh fragrant basil, and extra virgin olive oil.",
        price: 119,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e8_1", name: "Add Creamy Burrata Center", price: 35 },
          { id: "e8_2", name: "Hot Calabrian Chili Oil", price: 10 }
        ]
      },
      {
        id: "m8_2",
        name: "Prosciutto & Truffle Panuozzo",
        description: "Woodfired pizza-dough sandwich stuffed with 24-month Parma ham, wild rocket, sliced mozzarella, and white truffle cream.",
        price: 135,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m8_3",
        name: "San Pellegrino Blood Orange",
        description: "Sparkling Italian citrus beverage crafted with sun-ripened Mediterranean blood oranges.",
        price: 38,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v9",
    isApproved: true,
    name: "Beirut Mezze & Shawarma",
    cuisine: "Lebanese Charcoal Grill",
    logo: "🥙",
    rating: 4.8,
    location: "Kungsträdgården Central Lawn",
    stallNumber: "Stall #09",
    pin: "9999",
    email: "beirut@venueeat.se",
    swishNumber: "123 995 33 66",
    menu: [
      {
        id: "m9_1",
        name: "Spiced Chicken Shawarma Wrap",
        description: "Rotisserie chicken seasoned with Lebanese seven spices, toum garlic cream, pickled wild cucumbers, and crispy fries wrapped in thin saj bread.",
        price: 125,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e9_1", name: "Extra Toum Garlic Sauce", price: 15 },
          { id: "e9_2", name: "Add Spicy Harissa", price: 10 }
        ]
      },
      {
        id: "m9_2",
        name: "Creamy Hummus & Warm Pita",
        description: "Silky smooth chickpea dip with tahini, sumac, pomegranate seeds, extra virgin olive oil, and warm baked pita bread.",
        price: 69,
        category: "Snack",
        imageUrl: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m9_3",
        name: "Fresh Mint Beirut Lemonade",
        description: "Crushed fresh mint leaves, squeezed lemons, orange blossom water, and cane sugar over crushed ice.",
        price: 45,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v10",
    isApproved: true,
    name: "Seoul Crispy BBQ & Bao",
    cuisine: "Korean Street BBQ",
    logo: "🍗",
    rating: 4.9,
    location: "Waterfront Boulevard West",
    stallNumber: "Stall #10",
    pin: "1010",
    email: "seoulbbq@venueeat.se",
    swishNumber: "123 106 44 77",
    menu: [
      {
        id: "m10_1",
        name: "Gochujang Honey Fried Chicken Wings",
        description: "Double-fried ultra crispy chicken wings coated in a sticky sweet gochujang chili glaze, crushed roasted peanuts, and scallions.",
        price: 129,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e10_1", name: "Pickled Daikon Radish Cup", price: 15 },
          { id: "e10_2", name: "Spicy Korean Ranch Dip", price: 12 }
        ]
      },
      {
        id: "m10_2",
        name: "Bulgogi Beef Steamed Bao (2 pcs)",
        description: "Fluffy lotus leaf buns filled with marinated soy-pear ribeye beef, quick-pickled cucumber, and gochumayo.",
        price: 95,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m10_3",
        name: "Sparkling Yuzu Citrus Soda",
        description: "Zesty Japanese & Korean yuzu fruit puree with sparkling water and fresh mint.",
        price: 45,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v11",
    isApproved: true,
    name: "Bangkok Night Market Wok",
    cuisine: "Thai Street Wok & Noodles",
    logo: "🍲",
    rating: 4.8,
    location: "Main Avenue North",
    stallNumber: "Stall #11",
    pin: "1112",
    email: "bangkok@venueeat.se",
    swishNumber: "123 117 55 88",
    menu: [
      {
        id: "m11_1",
        name: "Classic Pad Thai Tiger Prawn",
        description: "Wok-tossed rice noodles with succulent tiger prawns, firm tofu, egg, bean sprouts, crushed peanuts, and tangy tamarind lime sauce.",
        price: 139,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e11_1", name: "Extra Crushed Peanuts & Lime", price: 10 },
          { id: "e11_2", name: "Extra Prawns (3 pcs)", price: 30 }
        ]
      },
      {
        id: "m11_2",
        name: "Crispy Veggie Spring Rolls (4 pcs)",
        description: "Golden fried spring rolls stuffed with glass noodles and shredded vegetables, served with sweet chili sauce.",
        price: 65,
        category: "Snack",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m11_3",
        name: "Thai Sweet Iced Tea",
        description: "Traditional brewed Ceylon spiced black tea layered with sweet condensed milk over crushed ice.",
        price: 45,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1558857563-b37cf0c897f1?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v12",
    isApproved: true,
    name: "Malmö Falafel & Halloumi Hub",
    cuisine: "Organic Falafel & Mediterranean",
    logo: "🧆",
    rating: 4.9,
    location: "Green Corner West",
    stallNumber: "Stall #12",
    pin: "1212",
    email: "malmofalafel@venueeat.se",
    swishNumber: "123 128 66 99",
    menu: [
      {
        id: "m12_1",
        name: "Award-Winning Malmö Falafel Roll",
        description: "Crispy freshly fried herb falafel balls, creamy tahini, pickled turnip, mint, parsley, and roasted garlic yogurt in warm flatbread.",
        price: 89,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e12_1", name: "Add Grilled Halloumi Slice", price: 20 },
          { id: "e12_2", name: "Spicy Amba Mango Chutney", price: 10 }
        ]
      },
      {
        id: "m12_2",
        name: "Grilled Halloumi Fries & Pomegranate",
        description: "Golden fried Cypriot halloumi sticks drizzled with sticky pomegranate molasses, fresh mint, and za'atar.",
        price: 69,
        category: "Snack",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m12_3",
        name: "Pomegranate Mint Cooler",
        description: "Pressed pomegranate juice with sparkling water, fresh lime, and bruised garden mint.",
        price: 45,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v13",
    isApproved: true,
    name: "Baltic Skagen & Nordic Seafood",
    cuisine: "Swedish Toast Skagen & Seafood",
    logo: "🐟",
    rating: 4.8,
    location: "Harbor View Terrace",
    stallNumber: "Stall #13",
    pin: "1313",
    email: "balticseafood@venueeat.se",
    swishNumber: "123 139 77 00",
    menu: [
      {
        id: "m13_1",
        name: "Classic Toast Skagen Supreme",
        description: "Hand-peeled North Sea prawns in dill mayonnaise, topped with red lumpfish roe, fresh lemon, on butter-fried sourdough toast.",
        price: 145,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e13_1", name: "Double Roe Topping", price: 25 },
          { id: "e13_2", name: "Extra Brioche Slice", price: 15 }
        ]
      },
      {
        id: "m13_2",
        name: "Crispy Baltic Herring & Potato Mash",
        description: "Pan-fried Baltic herring fillets with creamy buttered potato mash, pickled red onions, and stirred lingonberries.",
        price: 129,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m13_3",
        name: "Sparkling Swedish Elderflower Lemonade",
        description: "Natural pressed elderflower cordial with carbonated water and fresh cucumber ribbons.",
        price: 42,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v14",
    isApproved: true,
    name: "Athena Greek Souvlaki & Gyros",
    cuisine: "Greek Street Food",
    logo: "🇬🇷",
    rating: 4.7,
    location: "Karl XII Torg South",
    stallNumber: "Stall #14",
    pin: "1414",
    email: "athena@venueeat.se",
    swishNumber: "123 140 88 11",
    menu: [
      {
        id: "m14_1",
        name: "Classic Pork Gyros Pita",
        description: "Carved marinated pork neck, thick Greek tzatziki, ripe tomatoes, red onions, and hot fries stuffed inside a fluffy grilled pita.",
        price: 119,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e14_1", name: "Extra Garlic Tzatziki", price: 12 },
          { id: "e14_2", name: "Add Crumbled Feta", price: 18 }
        ]
      },
      {
        id: "m14_2",
        name: "Crispy Feta & Oregano Fries",
        description: "Hot crispy fries tossed with Greek sea salt, dried wild oregano, and topped with crumbled barrel-aged feta cheese.",
        price: 59,
        category: "Snack",
        imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m14_3",
        name: "Iced Greek Frappé Coffee",
        description: "Classic foamy whipped iced coffee served over ice with condensed milk.",
        price: 45,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v15",
    isApproved: true,
    name: "Formosa Bao & Dumpling House",
    cuisine: "Taiwanese Steamed Bao & Dumplings",
    logo: "🥟",
    rating: 4.9,
    location: "Teatern Promenade East",
    stallNumber: "Stall #15",
    pin: "1515",
    email: "formosabao@venueeat.se",
    swishNumber: "123 151 99 22",
    menu: [
      {
        id: "m15_1",
        name: "Classic Braised Pork Belly Gua Bao (2 pcs)",
        description: "Tender 12-hour braised pork belly, pickled mustard greens, crushed sweetened peanuts, and fresh cilantro inside pillowy steamed buns.",
        price: 110,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e15_1", name: "Add Extra Bao Bun", price: 25 },
          { id: "e15_2", name: "Spicy Chili Oil Crisps", price: 10 }
        ]
      },
      {
        id: "m15_2",
        name: "Pan-Fried Pork & Chive Dumplings (6 pcs)",
        description: "Handmade dumplings with a golden crispy bottom crust, served with aged ginger black vinegar sauce.",
        price: 95,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m15_3",
        name: "Taiwanese Brown Sugar Milk",
        description: "Fresh cold milk swirled with warm caramelized brown sugar syrup and tapioca pearls.",
        price: 55,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1558857563-b37cf0c897f1?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v16",
    isApproved: true,
    name: "Churros & Gelato Fiesta",
    cuisine: "Artisan Churros & Italian Gelato",
    logo: "🍦",
    rating: 4.9,
    location: "Fountain Plaza Center",
    stallNumber: "Stall #16",
    pin: "1616",
    email: "churros@venueeat.se",
    swishNumber: "123 162 00 33",
    menu: [
      {
        id: "m16_1",
        name: "Spanish Cinnamon Churros & Warm Nutella",
        description: "Freshly extruded crispy Spanish churros rolled in cinnamon sugar, served with a cup of warm Belgian chocolate dip.",
        price: 75,
        category: "Dessert",
        imageUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e16_1", name: "Extra Warm Dulce de Leche", price: 15 },
          { id: "e16_2", name: "Add Gelato Scoop", price: 25 }
        ]
      },
      {
        id: "m16_2",
        name: "Bronte Pistachio Artisanal Gelato",
        description: "Authentic Sicilian pistachio gelato crafted with pure roasted pistachio paste and whole roasted nuts.",
        price: 55,
        category: "Dessert",
        imageUrl: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m16_3",
        name: "Iced Salted Caramel Cold Brew",
        description: "Single-origin slow cold brew coffee topped with salted caramel cold foam.",
        price: 49,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v17",
    isApproved: true,
    name: "Bayou Cajun & Creole Shack",
    cuisine: "New Orleans Creole & Jambalaya",
    logo: "🦐",
    rating: 4.8,
    location: "South Park Garden",
    stallNumber: "Stall #17",
    pin: "1717",
    email: "bayou@venueeat.se",
    swishNumber: "123 173 11 44",
    menu: [
      {
        id: "m17_1",
        name: "Louisiana Crispy Shrimp Po' Boy",
        description: "Cornmeal-crusted fried gulf shrimp, shredded lettuce, sliced tomatoes, pickles, and spicy remoulade on a toasted French roll.",
        price: 135,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e17_1", name: "Extra Remoulade Sauce", price: 12 },
          { id: "e17_2", name: "Louisiana Hot Sauce Shot", price: 8 }
        ]
      },
      {
        id: "m17_2",
        name: "Smoked Andouille & Chicken Jambalaya",
        description: "Slow-simmered long-grain rice with spicy smoked andouille sausage, pulled chicken, holy trinity veggies, and Creole spices.",
        price: 125,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1562376502-6f769499c886?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m17_3",
        name: "Sweet Southern Peach Iced Tea",
        description: "Refreshing cold brewed black tea infused with ripe Georgia peach syrup and fresh lemon.",
        price: 42,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v18",
    isApproved: true,
    name: "Saigon Lotus Bánh Mì & Pho",
    cuisine: "Vietnamese Street Food",
    logo: "🥖",
    rating: 4.8,
    location: "North Garden Alley",
    stallNumber: "Stall #18",
    pin: "1818",
    email: "saigonlotus@venueeat.se",
    swishNumber: "123 184 22 55",
    menu: [
      {
        id: "m18_1",
        name: "Crispy Lemongrass Pork Bánh Mì",
        description: "Warm crusty baguette with grilled lemongrass pork, liver pâté, pickled daikon & carrots, cucumber, fresh cilantro, and spicy chili mayo.",
        price: 115,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e18_1", name: "Add Fried Egg", price: 15 },
          { id: "e18_2", name: "Extra Fresh Jalapeños", price: 8 }
        ]
      },
      {
        id: "m18_2",
        name: "Fresh Prawn Summer Rolls (2 pcs)",
        description: "Rice paper rolls packed with cooked tiger prawns, rice vermicelli, mint, and crisp lettuce, served with rich peanut hoisin dip.",
        price: 75,
        category: "Snack",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m18_3",
        name: "Cà Phê Sữa Đá (Vietnamese Iced Coffee)",
        description: "Intense dark drip coffee with sweetened condensed milk poured over crushed ice.",
        price: 49,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v19",
    isApproved: true,
    name: "La Pampa Argentine Asado",
    cuisine: "Argentine Woodfire Steaks & Empanadas",
    logo: "🥩",
    rating: 4.9,
    location: "Strömgatan Grill Zone",
    stallNumber: "Stall #19",
    pin: "1919",
    email: "lapampa@venueeat.se",
    swishNumber: "123 195 33 66",
    menu: [
      {
        id: "m19_1",
        name: "Charcoal Grilled Flank Steak Baguette",
        description: "Sliced grilled tender flank steak, fresh chimichurri herb sauce, caramelized red onions, and roasted garlic aioli on crusty artisan bread.",
        price: 149,
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e19_1", name: "Extra Chimichurri Jar", price: 15 },
          { id: "e19_2", name: "Add Melted Provolone", price: 20 }
        ]
      },
      {
        id: "m19_2",
        name: "Handmade Beef Empanadas (2 pcs)",
        description: "Flaky baked Argentine pastries stuffed with spiced ground beef, green olives, boiled egg, and cumin, with salsa criolla.",
        price: 85,
        category: "Snack",
        imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m19_3",
        name: "Yerba Mate Sparkling Spritz",
        description: "Naturally energizing Argentine Yerba Mate cold infusion with sparkling water and citrus zest.",
        price: 45,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60",
        stock: true
      }
    ]
  },
  {
    id: "v20",
    isApproved: true,
    name: "Stockholm Craft Boba & Mochi",
    cuisine: "Artisan Bubble Tea & Mochi Waffles",
    logo: "🧋",
    rating: 4.9,
    location: "Entrance Promenade South",
    stallNumber: "Stall #20",
    pin: "2020",
    email: "boba@venueeat.se",
    swishNumber: "123 206 44 77",
    menu: [
      {
        id: "m20_1",
        name: "Brown Sugar Tiger Milk Tea",
        description: "Fresh organic milk with slow-cooked warm brown sugar boba pearls and house crème brûlée topping.",
        price: 65,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1558857563-b37cf0c897f1?w=500&auto=format&fit=crop&q=60",
        stock: true,
        extras: [
          { id: "e20_1", name: "Add Egg Pudding", price: 10 },
          { id: "e20_2", name: "Add Grass Jelly", price: 10 },
          { id: "e20_3", name: "Less Sweet (50%)", price: 0 }
        ]
      },
      {
        id: "m20_2",
        name: "Crispy Strawberry Mochi Waffle",
        description: "Chewy glutinous rice waffle baked crisp, topped with fresh sliced Swedish strawberries, powdered sugar, and condensed milk.",
        price: 79,
        category: "Dessert",
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60",
        stock: true
      },
      {
        id: "m20_3",
        name: "Lychee Jasmine Fruit Tea",
        description: "Fragrant cold-brewed jasmine green tea infused with whole lychee fruit and aloe vera pieces.",
        price: 55,
        category: "Drink",
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60",
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

