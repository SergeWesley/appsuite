import { createClient } from "@supabase/supabase-js";

/**
 * Vérifie si le token d'accès appartient à un utilisateur ayant un des rôles autorisés.
 *
 * @param accessToken Le token JWT fourni par le client.
 * @param allowedRoles Les rôles autorisés (ex: ["admin", "vip"]).
 * @returns Un objet contenant l'utilisateur, le client Supabase (configuré avec l'auth), ou une `Response` d'erreur 403.
 */
export async function checkUserRoles(accessToken: string | undefined, allowedRoles: string[]) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken || ""}` },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken || "");
  const role =
    (user?.app_metadata?.role as string | undefined) ||
    (user?.user_metadata?.role as string | undefined);

  if (!role || !allowedRoles.includes(role)) {
    const errorResponse = new Response(
      JSON.stringify({
        error: `Accès réservé. Les rôles requis sont : ${allowedRoles.join(", ")}.`,
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
    return { user: null, supabase, errorResponse };
  }

  return { user, supabase, errorResponse: null };
}
