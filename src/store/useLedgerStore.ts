import { create } from 'zustand';
import axios from 'axios';
import {  createLedgerPaymentUrl, deleteLedgerPaymentUrl, editLedgerPaymentUrl, getLedgerPaymentUrl } from './api';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export interface PaymentOverview {
    note: string;
    amount: number;
    payment_category_id: number;
    payment_category_name: string;
}
export interface ActiveYearTotal {
    start_date: string;
    expense: number;
    income: number;
    end_date: string;
}

export interface Ledger {
    id: number;
    program_id: number | null;
    total_amount: string;
    paid_amount: string;
    note: string | null;
    date: string;
    payment_overview: PaymentOverview[];
    payment_flow: "In" | "Out";
    status: string;
    reference_number: string;
    active_year_id: number;
    created_at: string;
    program_name?: string;
    program_wing?: string
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface FetchLedgerFilters {
    page?: number;
    limit?: number;
    id?: number;
    active_year_id?: number;
    search?: string | null;
    payment_flow?: string | null
    end_date?: string | null
    start_date?: string | null
}

export interface PaymentOverviewItem {
    amount: number;
    payment_category_id: number;
    note: string;
}

export interface CreateLedgerPayload {
    program_id?: number | null;
    total_amount: number;
    paid_amount: number;
    discount: number;
    note?: string | null;
    date: string;
    payment_flow: "In" | "Out";
    active_year_id: number;
    action_by: number | string;
    payment_overview: PaymentOverviewItem[];
}

export interface EditLedgerPayload {
    id: number;
    name?: string;
    note?: string | null;
    active_year_id: number;
    action_by: number | string;
}

export interface DeleteLedgerPayload {
    r_id: number;
    active_year_id: number;
    action_by: number | string;
}

interface LedgerState {
    ledgers: Ledger[];
    pagination: Pagination | null;
    isLoading: boolean;
    error: string | null;
    active_year_total: ActiveYearTotal | null

    // Actions
    fetchLedgers: (filters?: FetchLedgerFilters) => Promise<void>;
    createLedger: (data: CreateLedgerPayload) => Promise<boolean>;
    editLedger: (data: EditLedgerPayload) => Promise<boolean>;
    deleteLedger: (data: DeleteLedgerPayload) => Promise<boolean>;
    clearError: () => void;
}

// ----------------------------------------------------------------------
// Zustand Store
// -----------------------------------------
export const useLedgerStore = create<LedgerState>((set, _) => ({
    ledgers: [],
    active_year_total: null,
    pagination: null,
    isLoading: false,
    error: null,


    // Fetch Paginated Ledgers
    fetchLedgers: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(getLedgerPaymentUrl, {
                page: filters.page ?? 1,
                limit: filters.limit ?? 10,
                ...filters,
            });
            const { ledgers, pagination, active_year } = response.data;

            set({
                ledgers,
                pagination,
                isLoading: false,
                active_year_total: active_year
            });
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Failed to fetch ledgers.';
            set({ error: errorMessage, isLoading: false });
        }
    },

    // Create Ledger
    createLedger: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(createLedgerPaymentUrl, data);
            const newLedger = response.data.message;

            // Add new record to local list
            set((state) => ({
                ledgers: [newLedger, ...state.ledgers],
                isLoading: false,
            }));

            return true;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Failed to create ledger.';
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    // Edit Ledger
    editLedger: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(editLedgerPaymentUrl, data);
            const updatedLedger = response.data.message.data;

            // Update record in local state
            set((state) => ({
                ledgers: state.ledgers.map((item) =>
                    item.id === updatedLedger.id ? updatedLedger : item
                ),
                isLoading: false,
            }));

            return true;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Failed to update ledger.';
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    // Delete Ledger
    deleteLedger: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(deleteLedgerPaymentUrl, data);

            // Remove deleted record from local state
            set((state) => ({
                ledgers: state.ledgers.filter((item) => item.id !== data.r_id),
                isLoading: false,
            }));

            return true;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Failed to delete ledger.';
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    // Clear Error state
    clearError: () => set({ error: null }),
}));