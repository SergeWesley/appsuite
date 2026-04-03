import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/AuthProvider";
import { Subscription, SubscriptionFormData } from "@/types/spender";

export function useSubscriptions() {
  const { user } = useAuthContext();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("billing_date", { ascending: true });

      if (err) throw err;
      setSubscriptions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const addSubscription = async (data: SubscriptionFormData) => {
    if (!user) return null;

    try {
      // Nettoyage de l'objet pour Supabase (on évite les undefinied explicites)
      const payload: any = {
        name: data.name,
        amount: data.amount,
        billing_date: data.billing_date,
        category: data.category,
        user_id: user.id,
      };
      
      if (data.app_link) payload.app_link = data.app_link;
      if (data.color) payload.color = data.color;

      const { data: newSubscription, error: err } = await supabase
        .from("subscriptions")
        .insert([payload])
        .select()
        .single();

      if (err) throw err;
      setSubscriptions((prev) =>
        [...prev, newSubscription].sort((a, b) => a.billing_date - b.billing_date)
      );
      return newSubscription;
    } catch (err: any) {
      console.error("Supabase Error:", err);
      alert(`Erreur d'ajout : ${err.message}`);
      setError(err.message);
      return null;
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", id);

      if (err) throw err;
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    subscriptions,
    loading,
    error,
    addSubscription,
    deleteSubscription,
    refresh: fetchSubscriptions,
  };
}
