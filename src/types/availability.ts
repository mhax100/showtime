export type Availability = {
    event_id: string;
    user_id: string;
    availability: string[];
    role: 'guest' | 'owner';
}