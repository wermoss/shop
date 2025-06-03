export interface CartItem {
  id: number;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface OrderMetadata {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
}
