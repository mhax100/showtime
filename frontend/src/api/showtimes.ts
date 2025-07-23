import client from './client';
import type { Showtime, ShowtimeFormData, ShowtimeResponse } from '../types/showtime';

export async function fetchShowtimesByID(id: string): Promise<ShowtimeResponse> {
    try {
        const response = await client.get<ShowtimeResponse>(`/showtimes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching Showtime with ID: ${id}:`, error);
        throw error;
    }
}

export async function createShowtimes(id: string, data: ShowtimeFormData): Promise<Showtime[]> {
    try {
        const response = await client.post<Showtime[]>(`/showtimes/create/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error creating Showtime:', error);
        throw error;
    }
}

