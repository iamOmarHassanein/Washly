// Washly — secure proxy to Base44's createExternalOrder.
// Runs as a Vercel Serverless Function at POST /api/create-order.
// Keeps the x-api-key server-side (never exposed in the browser), maps the
// booking fields to Base44's schema, computes a next-day dropoff, and
// optionally pings the owner on Telegram. Base44 handles Stripe + the order.
//
// Vercel env vars:
//   BASE44_FUNCTION_URL  = https://washly-a922fe9f.base44.app/functions/createExternalOrder
//   EXTERNAL_API_KEY     = the shared secret Base44 stores
//   TELEGRAM_BOT_TOKEN   = (optional) owner alert
//   TELEGRAM_CHAT_ID     = (optional) owner alert

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  try {
    const b = typeof req.body === "object" && req.body ? req.body : JSON.parse(req.body || "{}");
    const {
      customer_name, customer_email, customer_phone,
      pickup_address, apartment_unit, pickup_date, pickup_time_range,
      bag_size, pickup_instructions, items_description,
    } = b;

    if (!customer_name || !customer_email || !customer_phone ||
        !pickup_address || !pickup_date || !pickup_time_range || !bag_size) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // 24h service: dropoff is next day, same time window
    const d = new Date(pickup_date + "T00:00:00");
    d.setDate(d.getDate() + 1);
    const dropoff_date = d.toISOString().split("T")[0];
    const origin = req.headers.origin || `https://${req.headers.host}`;

    const payload = {
      customer_name, customer_email, customer_phone,
      pickup_address, apartment_unit: apartment_unit || "",
      pickup_date, pickup_time_range,
      dropoff_date, dropoff_time_range: pickup_time_range,
      bag_size,
      pickup_instructions: pickup_instructions || "",
      items_description: items_description || "",
      success_url: `${origin}/?paid=1`,
      cancel_url: `${origin}/?canceled=1#book`,
    };

    const r = await fetch(process.env.BASE44_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.EXTERNAL_API_KEY },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!data.checkout_url) {
      res.status(502).json({ error: data.error || "Order setup failed" });
      return;
    }

    // Optional: ping the owner on Telegram with the pickup location.
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      try {
        const map = `https://maps.google.com/?q=${encodeURIComponent(pickup_address)}`;
        const text =
          `🧺 *New Washly web order*\n` +
          `👤 ${customer_name}\n` +
          `📞 ${customer_phone}\n` +
          `✉️ ${customer_email}\n` +
          `📦 ${bag_size} bag\n` +
          `📍 ${pickup_address}${apartment_unit ? " #" + apartment_unit : ""}\n🗺 ${map}\n` +
          `🗓 ${pickup_date} · ${pickup_time_range}\n💳 heading to payment`;
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, parse_mode: "Markdown" }),
        });
      } catch (_) { /* ignore */ }
    }

    res.status(200).json({ url: data.checkout_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
