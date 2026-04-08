import { fetchApi } from './api';

export interface TimeEntryCreate {
    project_id: string;
    task_id: string;
    date: string;
    hours: number;
    overtime_hours?: number;
    is_holiday?: boolean;
    vehicle_type?: string;
    meals?: boolean;
    distance_origin?: string;
    trip_type?: string;
    user_id?: string;
}

export interface TimeEntryResponse extends TimeEntryCreate {
    id: string;
    user_id: string;
}

export const timeEntryService = {
    createTimeEntry: async (entry: TimeEntryCreate): Promise<TimeEntryResponse> => {
        return fetchApi<TimeEntryResponse>('/time-entries/', {
            method: 'POST',
            body: JSON.stringify(entry),
        });
    },

    getMyEntries: async (): Promise<TimeEntryResponse[]> => {
        return fetchApi<TimeEntryResponse[]>('/time-entries/me');
    },

    getAllEntries: async (): Promise<TimeEntryResponse[]> => {
        return fetchApi<TimeEntryResponse[]>('/time-entries/');
    },

    deleteEntry: async (id: string): Promise<void> => {
        return fetchApi<void>(`/time-entries/${id}`, {
            method: 'DELETE',
        });
    },

    updateEntry: async (id: string, entry: TimeEntryCreate): Promise<TimeEntryResponse> => {
        return fetchApi<TimeEntryResponse>(`/time-entries/${id}`, {
            method: 'PUT',
            body: JSON.stringify(entry),
        });
    }
};
