export interface Location {
  lat: number;
  lng: number;
}

export interface Mall {
  id: string;
  name: string;
  location: string;
  coordinates: Location | null;  // Nullable because coordinates might be missing in some malls
  eateries: Eatery[];  // List of eateries
}

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
  region: string;
  location?: Location;  // This location is required for eateries
  summary?: {
    one_liner: string;
    common_themes: string;
    most_mentioned: string;
    biggest_complaint: string;
  };
}

