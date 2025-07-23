interface ApiResponse<T> {
    message: string;
    data: T;
}

export type User = {
    id: string;
    email: string | null;
    name: string;
}

export type UserFormData = {
    name: string;
}

export type CreateUserResponse = ApiResponse<User>;