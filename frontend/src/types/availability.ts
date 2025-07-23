export type UserAvailability = {
    event_id: string;
    user_id: string;
    availability: string[];
    role: 'guest' | 'owner';
}

export type Availability = {
    event_id: string;
    time_slot: string;
    availability_pct: number;
    available_user_ids: string[];
    updated_at: string;
}