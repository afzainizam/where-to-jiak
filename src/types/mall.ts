export interface Location {
  lat: number;
  lng: number;
}

export interface Mall {
  id: string;
  name: string;
  location: string;
  coordinates: Location | null;  // Nullable because coordinates might be missing in some malls
  region: string;
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
  bestFoods?: string | string[];
  open_now?: boolean;
  hours?: string[];
  phone?: string;
  website?: string;
  "youtube url"?: string[];
  logo_url?: string;
  rating?: number;
  total_reviews?: number;
  location?: Location;  // This location is required for eateries
  summary?: {
    one_liner: string;
    common_themes: string;
    most_mentioned: string;
    biggest_complaint: string;
  };
}

