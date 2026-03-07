export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  let body;
  try { body = await request.json(); } catch (e) { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 }); }
  const { bookingDetails: d } = body;
  const RESEND_KEY = env.RESEND_API_KEY;
  if (RESEND_KEY && d) {
    const fare = d.price || d.total || 'N/A';
    const html = '<div style="font-family:Arial,sans-serif"><h2>New Booking - Romero Limo</h2><p><b>Customer:</b> ' + d.name + '</p><p><b>Phone:</b> ' + d.phone + '</p><p><b>Email:</b> ' + (d.email||'N/A') + '</p><p><b>Date/Time:</b> ' + d.datetime + '</p><p><b>Pickup:</b> ' + d.pickup + '</p><p><b>Dropoff:</b> ' + d.dropoff + '</p><p><b>Vehicle:</b> ' + d.vehicle + '</p><p><b>Passengers:</b> ' + d.passengers + '</p><p><b>Distance:</b> ' + d.distance + '</p><p><b>Fare:</b> ' + fare + '</p>' + (d.notes ? '<p><b>Notes:</b> ' + d.notes + '</p>' : '') + '</div>';
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'onboarding@resend.dev', to: [env.NOTIFY_EMAIL || 'jasonromer2002@gmail.com', '2016551770@vtext.com'], subject: 'New Booking: ' + d.name + ' - ' + fare, html })
      });
    } catch(e) {}
  }
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
}
