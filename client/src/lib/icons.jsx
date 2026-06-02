import {
  Utensils, Car, ShoppingBag, Receipt, Film, HeartPulse, ShoppingCart, Tag,
  Home, Plane, Coffee, Gift, Smartphone, Book, Dumbbell, PawPrint, Fuel, Shirt,
  Wallet, CreditCard, Briefcase, GraduationCap, Wifi, Zap,
} from 'lucide-react';

// Maps the lucide icon names stored on categories to their components.
export const ICON_MAP = {
  utensils: Utensils,
  car: Car,
  'shopping-bag': ShoppingBag,
  receipt: Receipt,
  film: Film,
  'heart-pulse': HeartPulse,
  'shopping-cart': ShoppingCart,
  tag: Tag,
  home: Home,
  plane: Plane,
  coffee: Coffee,
  gift: Gift,
  smartphone: Smartphone,
  book: Book,
  dumbbell: Dumbbell,
  'paw-print': PawPrint,
  fuel: Fuel,
  shirt: Shirt,
  wallet: Wallet,
  'credit-card': CreditCard,
  briefcase: Briefcase,
  'graduation-cap': GraduationCap,
  wifi: Wifi,
  zap: Zap,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

export function CategoryIcon({ name, ...props }) {
  const Cmp = ICON_MAP[name] || Tag;
  return <Cmp {...props} />;
}
