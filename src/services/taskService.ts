import { fetchApi } from './api';

export interface TaskResponse {
    id: string;
    code: string;
    name: string;
    category: string;
    requires_extra_fields: boolean;
    allowed_roles: string[];
}

export const taskService = {
    getTasks: async (): Promise<TaskResponse[]> => {
        return fetchApi<TaskResponse[]>('/tasks/');
    },
};
