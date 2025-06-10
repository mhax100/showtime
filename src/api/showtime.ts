import client from './client';
import type { Showtime, ShowtimeFormData } from '../types/showtime';

export async function fetchShowtimeByID(id: string): Promise<Showtime> {
    try {
        const response = await client.get<Showtime>(`/showtimes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching Showtime with ID: ${id}:`, error);
        throw error;
    }
}

export async function createShowtime(data: ShowtimeFormData): Promise<Showtime> {
    try {
        const response = await client.post<Showtime>('/showtimes/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating Showtime:', error);
        throw error;
    }
}

