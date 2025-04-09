export interface Eatery {
  id: string;
  name: string;
  mall_id: string;
  formatted_address: string;
  floor: string;
  unit: string;
  cuisine_type: string;
  halal: boolean;
  open_now?: boolean;
  hours?: string[];
  phone?: string;
  website?: string;
  logo_url?: string;
  rating?: number;
  total_reviews?: number;
  location?: {
    lat: number;
    lng: number;
  };
  summary?: {
    one_liner: string;
    common_themes: string;
    most_mentioned: string;
    biggest_complaint: string;
  };
  image_gallery?: string[];
  opening_hours_details?: {
    periods: {
      open: { day: number; time: string };
      close: { day: number; time: string };
    }[];
  };
}

export interface Mall {
  id: string;
  name: string;
  location: string;
  coordinates?: {
    lat: number | null;
    lng: number | null;
  };
  logo_url?: string;
  stars?: number;
  total_reviews?: number;
  business_status?: string;
  google_maps_url?: string;
  eateries: Eatery[];
}