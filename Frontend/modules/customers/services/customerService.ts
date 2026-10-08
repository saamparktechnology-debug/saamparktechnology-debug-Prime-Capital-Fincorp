// modules/customers/services/customerService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Customer, CreateCustomerPayload } from "../types";

export const customerService = {
  async list(): Promise<Customer[]> {
    console.log("[customerService.list] invoked");
    const res = await api.get(ENDPOINTS.CUSTOMERS.LIST);
    console.log("[customerService.list] got response", res.status);
    return unwrap<Customer[]>(res);
  },

  async detail(id: number | string): Promise<Customer> {
    const res = await api.get(ENDPOINTS.CUSTOMERS.DETAIL(id));
    return unwrap<Customer>(res);
  },

  async create(payload: CreateCustomerPayload): Promise<{
    customer_id: number;
    agent_id: number;
  }> {
    const res = await api.post(ENDPOINTS.CUSTOMERS.CREATE, payload);
    return unwrap(res);
  },
};
