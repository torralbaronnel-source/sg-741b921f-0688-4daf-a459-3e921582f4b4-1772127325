import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];

export const productService = {
  // --- Categories ---
  async getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data;
  },

  async upsertCategory(category: Partial<Category> & { id: string; name: string }) {
    const { data, error } = await supabase
      .from("categories")
      .upsert(category)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  },

  // --- Products ---
  async getProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data;
  },

  async upsertProduct(product: Partial<Product> & { id: string; name: string }) {
    const { data, error } = await supabase
      .from("products")
      .upsert(product)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },

  // --- Real-time Subscriptions ---
  subscribeToProducts(callback: (payload: any) => void) {
    return supabase
      .channel("public:products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        callback
      )
      .subscribe();
  },

  subscribeToCategories(callback: (payload: any) => void) {
    return supabase
      .channel("public:categories")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        callback
      )
      .subscribe();
  }
};