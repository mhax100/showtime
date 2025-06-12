import client from './client';
import type { Availability } from '../types/availability';


export async function fetchAvailabilitiesByID(event_id: string): Promise<Availability[]> {
    try {
        const response = await client.get<Availability[]>(`/availabilities/${event_id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching Availabilities with event ID: ${event_id}:`, error);
        throw error;
    }
}

export async function createAvailability(data: Availability): Promise<Availability> {
    try {
        const response = await client.post<Availability>('/availabilities/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating Availability:', error);
        throw error;
    }
}

