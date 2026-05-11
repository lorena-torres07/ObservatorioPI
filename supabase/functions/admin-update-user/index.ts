import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { userId, email, password, full_name, role, is_active } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Update auth user
    const updateBody: Record<string, unknown> = {};
    if (email) updateBody.email = email;
    if (password) updateBody.password = password;
    if (full_name || role) {
      updateBody.user_metadata = {
        ...(full_name ? { full_name } : {}),
        ...(role ? { role } : {}),
      };
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify(updateBody),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data?.msg || data?.message || "Erro ao atualizar usuário";
      return new Response(
        JSON.stringify({ error: msg }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sync profile table
    const profileUpdate: Record<string, unknown> = {};
    if (full_name) profileUpdate.full_name = full_name;
    if (role) profileUpdate.role = role;
    if (email) profileUpdate.email = email;
    if (typeof is_active === "boolean") profileUpdate.is_active = is_active;
    profileUpdate.updated_at = new Date().toISOString();

    if (Object.keys(profileUpdate).length > 1) {
      const supabaseDbUrl = `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`;
      await fetch(supabaseDbUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(profileUpdate),
      });
    }

    return new Response(
      JSON.stringify({ user: { id: data.id, email: data.email } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno do servidor";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
