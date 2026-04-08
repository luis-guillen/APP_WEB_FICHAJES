import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as AuthContext from '../contexts/AuthContext';
import LogHours from '../pages/user/LogHours';

// Mock Services
vi.mock('../services/taskService', () => ({
    taskService: {
        getTasks: vi.fn().mockResolvedValue([
            { id: '1', code: '111', name: 'Standard Task', requires_extra_fields: false, allowed_roles: [] },
            { id: '2', code: '400', name: 'Complex Task', requires_extra_fields: true, allowed_roles: [] }
        ])
    }
}));

vi.mock('../services/projectService', () => ({
    projectService: {
        getMyProjects: vi.fn().mockResolvedValue([
            { id: '1', code: 'P-1', name: 'Project 1', is_active: true }
        ])
    }
}));

vi.mock('../contexts/AuthContext', async () => {
    const actual = await vi.importActual('../contexts/AuthContext');
    return {
        ...actual as any,
        useAuth: vi.fn().mockReturnValue({ user: { id: '1' }, isAdmin: false }),
    };
});

describe('LogHours validations', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient();
    });

    it('hides extra fields by default', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <LogHours />
            </QueryClientProvider>
        );

        // Initial render shouldn't show exact "Vehículo", "Dietas" fields
        // since task isn't selected or selected task is standard.
        // Wait for the components to load (Query finishes)
        await screen.findByText(/Fichaje Diario|Registrar/i);
        const vehicleInput = screen.queryByLabelText(/Vehículo/i) || screen.queryByText(/Tipo de Transporte/i);
        expect(vehicleInput).not.toBeInTheDocument();
    });
});
