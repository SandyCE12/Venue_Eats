export interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // in SEK
  category: "Food" | "Drink" | "Snack" | "Dessert";
  imageUrl?: string;
  stock: boolean;
  extras?: ExtraOption[];
}

export interface Vendor {
  id: string;
  name: string;
  cuisine: string;
  logo: string;
  rating: number;
  menu: MenuItem[];
  location?: string;
  stallNumber?: string;
  pin?: string;
  email?: string;
  phone?: string;
  isApproved?: boolean | "rejected" | string;
  swishNumber?: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  selectedExtras?: ExtraOption[];
}

export type OrderStatus = "Placed" | "Preparing" | "Ready" | "Completed";

export interface Order {
  id: string;
  vendorId: string;
  vendorName: string;
  items: OrderItem[];
  status: OrderStatus;
  timestamp: string;
  paymentMethod?: "Swish" | "Card" | string;
  totalAmount: number;
  queueNumber: number;
  customerName: string;
  estimatedPrepTime?: number; // in minutes
  estimatedPrepTimeMinutes?: number;
  createdAt?: number;
  vendorSwishShareSEK?: number;
  platformFeeSEK?: number;
  vendorSwishPaid?: number;
  platformSwishPaid?: number;
}

export type EventStatus = "Live" | "Scheduled" | "Completed";

export interface ManagedEvent {
  id: string;
  name: string;
  code: string;
  status: EventStatus;
  startDate: string;
  endDate: string;
  location: string;
  mapImageUrl?: string;
  attendeesCount: number;
  activeVendorsCount: number;
  totalGmvSEK: number;
  totalOrdersCount: number;
  platformFeeRevenueSEK: number;
  organizerEmail: string;
  category: "Cultural & Food" | "Music Festival" | "Street Market" | "Exhibition" | "Sports & Fair";
  description: string;
  swishMerchantId: string;
  topVendorName?: string;
  topDishes?: string[];
  averagePrepTimeMin?: number;
  satisfactionRating?: number;
  peakHour?: string;
  historyNotes?: string;
  year?: number;
}

export interface BusinessMetrics {
  attendees: number;
  adoptionRate: number; // as percentage (e.g., 40 for 40%)
  avgOrderValue: number; // in SEK (average customer spending)
  avgOrdersPerUser: number; // e.g., 1.5 orders per event
  commissionPercent: number; // transaction commission rate (e.g. 4 for 4%)
  vendorCount: number;
  vendorSaaSPerEvent: number; // SaaS flat fee per vendor
  vipPassPrice: number; // skip-the-line pass in SEK
  vipPassAdoptionRate: number; // % of users buying VIP (e.g. 5%)
}
