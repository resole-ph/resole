export interface UserStat {
  value: string;
  label: string;
}

export interface UserInfoCardProps {
  name: string;
  initials: string;
  rating: number;
  reviewCount: number;
  location: string;
  joinYear: number;
  stats: UserStat[];
}

export const USERINFOCARDDUMMY: UserInfoCardProps = {
  name: '',
  initials: '',
  rating: 0,
  reviewCount: 0,
  location: '',
  joinYear: 0,
  stats: [],
}

export interface ListingSummary {
  total: number;
  active: number;
  unavailable: number;
}

export interface FavouritesSummary {
  totalCount: number;
}

export interface UserReview {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  rater: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface UserMetric { 
  label: string, 
  value: number, 
  delta: string, 
  up: boolean 
}