import client from './client';
import type { CreateUserResponse, User, UserFormData } from '../types/user';


export async function fetchUserByID(id: string): Promise<User> {
    try {
        const response = await client.get<User>(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching User with ID: ${id}:`, error);
        throw error;
    }
}

export async function createUser(data: UserFormData): Promise<CreateUserResponse> {
    try {
        const response = await client.post<CreateUserResponse>('/users/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating User:', error);
        throw error;
    }
}

