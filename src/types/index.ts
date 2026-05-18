// Mirrored from POS lib/types.ts — subset used by the website

export type ProductCategory = 'food' | 'drinks' | 'dessert' | 'desks' | 'rooms' | 'equipment-rental';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  description: string;
  stock: number | null;
  image?: string | null;
  glyph?: string | null;
  archived?: boolean;
}

export type CoworkRatePeriod = 'hourly' | 'daily' | 'weekly' | '2-weeks' | 'monthly' | '3-months' | '6-months' | 'yearly';
export type CoworkSpaceType = 'desk' | 'private-office';

export interface EquipmentTier {
  price: number;
}

export interface CoworkSpaceRate {
  period: CoworkRatePeriod;
  price: number;
  enabled: boolean;
  tiers?: EquipmentTier[];
}

export interface CoworkSpace {
  id: string;
  name: string;
  type: CoworkSpaceType;
  description?: string;
  rates: CoworkSpaceRate[];
  dedicatedRates?: CoworkSpaceRate[];
  capacity?: number;
  archived?: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  description?: string;
  tiers: EquipmentTier[];
  archived?: boolean;
}

// Room stays (mirrored from POS lib/types.ts — read from Firestore slices/stays)
export type StayStatus = 'active' | 'checked-out';
export interface Stay {
  id: string;
  roomId: string;
  status: StayStatus;
  checkInAt: string | Date;
  checkOutAt?: string | Date;
  nights: number;
}

// Venue settings (mirrored from POS lib/types.ts — read from Firestore slices/settings)
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DayHours {
  open: string;   // 'HH:MM'
  close: string;  // 'HH:MM'
  closed: boolean;
}

export interface SiteSettings {
  venue: {
    name?: string;
    address?: string;
    phone?: string;
    abn?: string;
    timezone?: string;
    openingHours?: Record<DayOfWeek, DayHours>;
  };
}

// Website-specific order type (written to Firestore website-orders collection)
export type WebOrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'done' | 'cancelled';
export type WebOrderType = 'cafe' | 'coworking' | 'room-enquiry';

export interface WebOrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
}

export interface WebOrder {
  id: string;
  type: WebOrderType;
  items: WebOrderItem[];
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  status: WebOrderStatus;
  notes?: string;
  tableOrSpace?: string;
  bookingDate?: string;   // 'YYYY-MM-DD'
  bookingTime?: string;   // 'HH:MM', set for hourly bookings
  createdAt: Date;
  updatedAt?: Date;
}
