import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UsersPage from '../pages/admin/UsersPage';
import { userService } from '../services/userService';

// Mock the userService API calls
vi.mock('../services/userService', () => ({
    userService: {
        getUsers: vi.fn(),
        createUser: vi.fn(),
        deleteUser: vi.fn(),
    }
}));

describe('UsersPage', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient();
        // Default mock response to empty users list
        (userService.getUsers as any).mockResolvedValue([]);
    });

    it('renders standard table headers', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <UsersPage />
            </QueryClientProvider>
        );
        expect(screen.getByText('Usuarios')).toBeInTheDocument();
    });
});
