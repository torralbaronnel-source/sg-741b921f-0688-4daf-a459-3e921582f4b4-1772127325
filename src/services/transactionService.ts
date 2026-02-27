import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export const transactionService = {
  async getTransactions() {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async createTransaction(transaction: Omit<Transaction, "id" | "created_at"> & { order_no: string }) {
    const { data, error } = await supabase
      .from("transactions")
      .insert(transaction)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToTransactions(callback: (payload: any) => void) {
    return supabase
      .channel("public:transactions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        callback
      )
      .subscribe();
  }
};