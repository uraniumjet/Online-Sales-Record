import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Adjust if your port is different

export const getCustomers = async () => {
    const response = await axios.get(`${API_BASE_URL}/customers/`);
    return response.data;
};

// --- ADD THIS: Create a new customer ---
export const createCustomer = async (data: any) => {
    const response = await axios.post(`${API_BASE_URL}/customers/`, data);
    return response.data;
};

export const getTransactions = async () => {
    const response = await axios.get(`${API_BASE_URL}/transactions/`);
    return response.data;
};

export const createTransaction = async (data: any) => {
    const response = await axios.post(`${API_BASE_URL}/transactions/`, data);
    return response.data;
};

// --- ADD THIS: Delete a transaction ---
export const deleteTransaction = async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/transactions/${id}/`);
    return response.data;
};

// --- OPTIONAL: Update a transaction (For the "Edit" part of CRUD) ---
export const updateTransaction = async (id: number, data: any) => {
    const response = await axios.put(`${API_BASE_URL}/transactions/${id}/`, data);
    return response.data;
};
// --- Add these to your src/lib/api.ts ---

// Update a Customer
export const updateCustomer = async (id: number, data: any) => {
    const response = await axios.put(`${API_BASE_URL}/customers/${id}/`, data);
    return response.data;
};

// Delete a Customer
export const deleteCustomer = async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/customers/${id}/`);
    return response.data;
};