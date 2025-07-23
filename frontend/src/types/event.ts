export type Event = {
    id: string;
    title: string;
    creator_id: string;
    location: string;
    chain?: string;
    created_at: string;
    potential_dates: string[];
  };
  
  export type EventFormData = {
    title: string;
    creator_id: string;
    location: string;
    chain?: string;
    potential_dates: string[];
  };