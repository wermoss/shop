export interface ProductFeature {
  name: string;
  value: string;
  colorCode?: string; // Opcjonalny kod koloru dla cech typu kolor
}

export interface SliderData {
  title: string;
  subtitle: string;
  description: string;
  price: number;
  image: string;
  features: ProductFeature[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  orderLimit: number;
  features?: ProductFeature[]; // Opcjonalna tablica cech produktu
  slider?: SliderData; // Opcjonalne dane do wyświetlenia w sliderze
}

export interface CartItem {
  id: number;
  quantity: number;
}

export interface OrderProduct {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderMetadata {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  products: OrderProduct[];
  subtotal: number;
  vatAmount?: number;
  vatRate?: number;
  quantityDiscount?: number;
  couponDiscount?: number;
  cartDiscountPercent?: number;
  codeDiscountPercent?: number;
  appliedDiscountCode?: string | null;
  total: number;
}
