import { fetchApi } from './api';

export interface ProjectReport {
    project_id: string;
    project_name: string;
    total_hours: number;
    total_overtime: number;
}

export interface UserReport {
    user_id: string;
    employee_code: string;
    name: string;
    total_hours: number;
    total_overtime: number;
}

export interface TaskReport {
    task_code: string;
    task_name: string;
    total_hours: number;
}

export interface DailyReport {
    date: string;
    total_hours: number;
}

// Helper to convert object into query string
const buildQueryString = (filters?: Record<string, string | undefined>) => {
    if (!filters) return '';
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
};

export interface AnalyticsSummary {
    heatmap: any[];
    daily_categories: any[];
    user_totals: any[];
    task_totals: any[];
    daily_summary: any[];
    category_distribution: any[];
    logistics_km: any[];
    travel_hours: { name: string; travel_hours: number }[];
    dietas_summary: any[];
    user_skills: any[];
    treemap_data: any;
    total_overtime: number;
}

export const reportService = {
    getAnalyticsSummary: async (filters?: Record<string, string>): Promise<AnalyticsSummary> => {
        return fetchApi<AnalyticsSummary>(`/reports/summary${buildQueryString(filters)}`);
    },

    getProjectReport: async (filters?: Record<string, string>): Promise<ProjectReport[]> => {
        return fetchApi<ProjectReport[]>(`/reports/projects${buildQueryString(filters)}`);
    },

    getUserReport: async (filters?: Record<string, string>): Promise<UserReport[]> => {
        return fetchApi<UserReport[]>(`/reports/users${buildQueryString(filters)}`);
    },

    getTaskReport: async (filters?: Record<string, string>): Promise<TaskReport[]> => {
        return fetchApi<TaskReport[]>(`/reports/tasks${buildQueryString(filters)}`);
    },

    getDailyReport: async (filters?: Record<string, string>): Promise<DailyReport[]> => {
        return fetchApi<DailyReport[]>(`/reports/daily${buildQueryString(filters)}`);
    },

    exportXLSX: async (filters?: Record<string, string>): Promise<void> => {
        const blob = await fetchApi<Blob>(`/reports/export${buildQueryString(filters)}`);

        // Download Blob functionality
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timeflow_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
};
