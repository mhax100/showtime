import client from './client';
import type { Event, EventFormData } from '../types/event';

export async function fetchEventByID(id: string): Promise<Event> {
    try {
        const response = await client.get<Event>(`/events/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching Event with ID: ${id}:`, error);
        throw error;
    }
}

export async function createEvent(data: EventFormData): Promise<Event> {
    try {
        const response = await client.post<Event>('/events/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating Event:', error);
        throw error;
    }
}

