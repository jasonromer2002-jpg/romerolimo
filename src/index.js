
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle the API endpoint
    if (url.pathname === '/api/create-payment') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      
      let body;
      try { body = await request.json(); } 
      catch (e) { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 }); }
      
      const { bookingDetails: d } = body;
      const RESEND_KEY = env.RESEND_API_KEY;
      
      if (RESEND_KEY && d) {
        const fare = d.price || d.total || 'N/A';
        const emailHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#0D3B2E;padding:24px;text-align:center"><h1 style="color:#C9A84C;margin:0;font-size:22px">🚘 New Booking Request</h1><p style="color:rgba(255,255,255,.7);margin:6px 0 0">Romero's Limousine</p></div><div style="padding:24px;background:#f9f9f9"><table style="width:100%;border-collapse:collapse"><tr><td style="padding:10px;font-weight:bold;color:#0D3B2E;width:140px">Customer</td><td style="padding:10px;font-size:15px"><strong>${d.name}</strong></td></tr><tr style="background:#fff"><td style="padding:10px;font-weight:bold;color:#0D3B2E">Phone</td><td style="padding:10px;font-size:15px"><a href="tel:${d.phone}" style="color:#0D3B2E;font-weight:bold">${d.phone}</a></td></tr><tr><td style="padding:10px;font-weight:bold;color:#0D3B2E">Email</td><td style="padding:10px">${d.email||'Not provided'}</td></tr><tr style="background:#fff"><td style="padding:10px;font-weight:bold;color:#0D3B2E">Date & Time</td><td style="padding:10px">${d.datetime}</td></tr><tr><td style="padding:10px;font-weight:bold;color:#0D3B2E">Pickup</td><td style="padding:10px">${d.pickup}</td></tr><tr style="background:#fff"><td style="padding:10px;font-weight:bold;color:#0D3B2E">Dropoff</td><td style="padding:10px">${d.dropoff}</td></tr><tr><td style="padding:10px;font-weight:bold;color:#0D3B2E">Vehicle</td><td style="padding:10px">${d.vehicle}</td></tr><tr style="background:#fff"><td style="padding:10px;font-weight:bold;color:#0D3B2E">Passengers</td><td style="padding:10px">${d.passengers}</td></tr><tr><td style="padding:10px;font-weight:bold;color:#0D3B2E">Distance</td><td style="padding:10px">${d.distance}</td></tr>${d.notes?'<tr style="background:#fff"><td style="padding:10px;font-weight:bold;color:#0D3B2E">Notes</td><td style="padding:10px">'+d.notes+'</td></tr>':''}</table><div style="background:#0D3B2E;border-radius:10px;padding:16px 20px;margin-top:20px;display:flex;justify-content:space-between;align-items:center"><div><div style="color:rgba(255,255,255,.6);font-size:12px">Estimated Fare</div><div style="color:#C9A84C;font-size:28px;font-weight:bold">${fare}</div></div><a href="tel:${d.phone}" style="background:#C9A84C;color:#0D3B2E;padding:14px 22px;border-radius:8px;text-decoration:none;font-weight:bold">📞 Call Now</a></div></div><div style="padding:16px;text-align:center;color:#999;font-size:12px">Romero's Limousine · 201-655-1770</div></div>`;
        
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'onboarding@resend.dev',
              to: [env.NOTIFY_EMAIL || 'jasonromer2002@gmail.com', '2016551770@vtext.com'],
              subject: '🚘 New Booking: ' + d.name + ' — ' + d.datetime + ' — ' + fare,
              html: emailHtml
            })
          });
        } catch(e) { console.error('Email error:', e.message); }
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Serve static assets for everything else
    return env.ASSETS.fetch(request);
  }
};
