export type Showtime = {
    id: string;
    title: string;
    creator_id: string;
    location: string;
    created_at: string;
    potential_dates: string[];
  };
  
  export type ShowtimeFormData = {
    title: string;
    creator_id: string;
    location: string;
    potential_dates: string[];
  };