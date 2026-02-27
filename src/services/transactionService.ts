import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/types/pos";

export const transactionService = {
  async checkout(items: CartItem[], total: number, paymentMethod: string, shopId: string) {
    // Prepare items for the PG function
    const formattedItems = items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    // Call our custom RPC function for atomic transaction + stock deduction
    const { data, error } = await supabase.rpc('handle_checkout_with_stock', {
      p_items: formattedItems,
      p_total: total,
      p_payment_method: paymentMethod,
      p_shop_id: shopId
    });

    if (error) {
      console.error("Checkout error:", error);
      throw error;
    }

    return data;
  },

  async getTransactions() {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getTransactionById(id: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        transaction_items (
          *,
          products (name)
        )
      `)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }
};