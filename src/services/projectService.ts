import { fetchApi } from './api';

export interface ProjectCreate {
    name: string;
    code: string;
    location?: string;
    distance_from_workshop: number;
    travel_time?: number; // minutos de ida (el backend lo multiplica x2)
    start_date: string;
    type: string;
    assigned_user_ids: string[];
}

export interface ProjectResponse {
    id: string;
    name: string;
    code: string;
    location?: string;
    distance_from_workshop: number;
    travel_time?: number; // tiempo total ida+vuelta
    start_date: string;
    type: string;
    is_active: boolean;
    assigned_user_ids: string[];
}

export const projectService = {
    getMyProjects: async (): Promise<ProjectResponse[]> => {
        return fetchApi<ProjectResponse[]>('/projects/me');
    },

    getAllProjects: async (): Promise<ProjectResponse[]> => {
        return fetchApi<ProjectResponse[]>('/projects/');
    },

    createProject: async (projectData: ProjectCreate): Promise<ProjectResponse> => {
        return fetchApi<ProjectResponse>('/projects/', {
            method: 'POST',
            body: JSON.stringify(projectData),
        });
    },

    deleteProject: async (id: string): Promise<void> => {
        return fetchApi<void>(`/projects/${id}`, {
            method: 'DELETE',
        });
    },
};
