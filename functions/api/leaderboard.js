// GET - Leaderboard listesini getir
// POST - Yeni entry ekle (admin)
export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM leaderboard ORDER BY score DESC"
    ).all();
    
    return new Response(JSON.stringify(results), {
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

export async function onRequestPost(context) {
  const { env, request } = context;
  
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
    
    const result = await env.DB.prepare(
      "INSERT INTO leaderboard (player_name, company_name, score, funding_raised, employees) VALUES (?, ?, ?, ?, ?)"
    ).bind(player_name, company_name || null, score, funding_raised || null, employees || null).run();
    
    return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
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
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

