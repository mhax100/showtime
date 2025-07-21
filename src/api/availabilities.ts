import client from './client';
import type { UserAvailability, Availability } from '../types/availability';


export async function fetchAvailabilitiesByID(event_id: string): Promise<UserAvailability[]> {
    try {
        const response = await client.get<UserAvailability[]>(`/availabilities/${event_id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching Availabilities with event ID: ${event_id}:`, error);
        throw error;
    }
}

export async function createAvailability(data: UserAvailability): Promise<UserAvailability> {
    try {
        const response = await client.post<UserAvailability>('/availabilities/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating Availability:', error);
        throw error;
    }
}

export async function fetchAvailabilitysummaryByID(event_id: string): Promise<Availability[]> {
    try {
        const response = await client.get<Availability[]>(`/analytics/${event_id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching Availability Summary for event ID: ${event_id}:`, error);
        throw error;
    }
}
