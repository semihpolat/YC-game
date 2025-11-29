// DELETE - Entry sil (admin)
export async function onRequestDelete(context) {
  const { env, params, request } = context;
  const id = params.id;
  
  try {
    // URL'den password al
    const url = new URL(request.url);
    const password = url.searchParams.get("password");
    
    // Admin şifre kontrolü
    if (password !== "asdcxz321") {
      return new Response(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    await env.DB.prepare("DELETE FROM leaderboard WHERE id = ?").bind(id).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// PUT - Entry güncelle (admin)
export async function onRequestPut(context) {
  const { env, params, request } = context;
  const id = params.id;
  
  try {
    const body = await request.json();
    const { player_name, company_name, score, funding_raised, employees, password } = body;
    
    // Admin şifre kontrolü
    if (password !== "asdcxz321") {
      return new Response(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    await env.DB.prepare(
      "UPDATE leaderboard SET player_name = ?, company_name = ?, score = ?, funding_raised = ?, employees = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(player_name, company_name || null, score, funding_raised || null, employees || null, id).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

