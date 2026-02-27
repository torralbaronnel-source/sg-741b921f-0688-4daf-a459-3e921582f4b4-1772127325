import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];

// Using the exact Insert type from Database to ensure compatibility with Supabase SDK
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];

export const productService = {
  // --- Products ---
  async getProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async upsertProduct(product: ProductInsert) {
    const { data, error } = await supabase
      .from("products")
      .upsert(product)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  // --- Image Management (Linked to Stable ID) ---
  async uploadProductImage(productId: string, file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${productId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    // 1. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    // 3. Update Product Record with new Image URL
    // We fetch the existing product first to satisfy the type requirement of id
    const { data: existingProduct } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (existingProduct) {
      await this.upsertProduct({ 
        ...existingProduct,
        image: publicUrl 
      });
    }

    return publicUrl;
  },

  // --- Categories ---
  async getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async upsertCategory(category: CategoryInsert) {
    const { data, error } = await supabase
      .from("categories")
      .upsert(category)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Real-time Subscriptions ---
  subscribeToProducts(callback: (payload: any) => void) {
    return supabase
      .channel("products-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        callback
      )
      .subscribe();
  },

  subscribeToCategories(callback: (payload: any) => void) {
    return supabase
      .channel("categories-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        callback
      )
      .subscribe();
  }
};