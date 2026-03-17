import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';
import * as AuthContext from '../contexts/AuthContext';

// We mock the Provider entirely or mock the hook.
// It's easier to mock the hook to control state.
vi.mock('../contexts/AuthContext', async () => {
    const actual = await vi.importActual('../contexts/AuthContext');
    return {
        ...actual as any,
        useAuth: vi.fn(),
    };
});

describe('AppRoutes (Auth Guards)', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient();
    });

    const renderApp = (initialRoute = '/') => {
        window.history.pushState({}, 'Test page', initialRoute);
        return render(
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        );
    };

    it('renders LoginPage if user is not authenticated', () => {
        (AuthContext.useAuth as any).mockReturnValue({ user: null, isAdmin: false });
        renderApp();
        const loginElements = screen.getAllByText(/Identificación requerida|Inicia sesión/i);
        expect(loginElements.length).toBeGreaterThan(0);
    });

    it('renders User dashboard (LogHours) for standard users on root', () => {
        (AuthContext.useAuth as any).mockReturnValue({
            user: { id: '1', role: 'Mechanical Engineers' },
            isAdmin: false
        });
        // Let's spy on AppLayout so we know it rendered
        renderApp('/');
        const userElements = screen.getAllByText(/Registrar|Fichaje/i);
        expect(userElements.length).toBeGreaterThan(0);
    });

    it('renders Admin dashboard for admin users on root', () => {
        (AuthContext.useAuth as any).mockReturnValue({
            user: { id: '2', role: 'Mechanical Engineers' },
            isAdmin: true
        });
        renderApp('/');
        const adminElements = screen.getAllByText(/Admin|Panel/i);
        expect(adminElements.length).toBeGreaterThan(0);
    });
});
