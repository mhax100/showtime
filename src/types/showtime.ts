export type Showtime = {
    id: string;
    theater_name: string;
    theater_address: string;
    distance: string;
    start_time: string;
    showing_type: string;
    available_users: string[];
    availability_percentage: number;
    required_time_slots: string[];
  };
  
  export type ShowtimeFormData = {
    location: string;
    movie: string;
    duration: number;
  };

export type ShowtimeResponse = {
  event_id: string;
  showtimes: Showtime[];
}