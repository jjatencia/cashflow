import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Supabase client for auth operations
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);

// Health check endpoint
app.get("/make-server-fac344bb/health", (c) => {
  return c.json({ status: "ok" });
});

// Authentication Routes

// Sign up new user
app.post("/make-server-fac344bb/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name
      }
    });
  } catch (error) {
    console.log("Error in signup:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Cash Flow API Routes

// Get daily record
app.get("/make-server-fac344bb/daily-record/:location/:date", async (c) => {
  try {
    const location = c.req.param("location");
    const date = c.req.param("date");
    const key = `daily_record_${location}_${date}`;
    
    const record = await kv.get(key);
    return c.json({ record: record || null });
  } catch (error) {
    console.log("Error getting daily record:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Save daily record
app.post("/make-server-fac344bb/daily-record", async (c) => {
  try {
    const record = await c.req.json();
    const key = `daily_record_${record.location}_${record.date}`;
    
    await kv.set(key, record);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving daily record:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Get movements for a specific location and date
app.get("/make-server-fac344bb/movements/:location/:date", async (c) => {
  try {
    const location = c.req.param("location");
    const date = c.req.param("date");
    const key = `movements_${location}_${date}`;
    
    const movements = await kv.get(key);
    return c.json({ movements: movements || [] });
  } catch (error) {
    console.log("Error getting movements:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Save movements
app.post("/make-server-fac344bb/movements", async (c) => {
  try {
    const { location, date, movements } = await c.req.json();
    const key = `movements_${location}_${date}`;
    
    await kv.set(key, movements);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving movements:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Get records history for a location
app.get("/make-server-fac344bb/records/:location", async (c) => {
  try {
    const location = c.req.param("location");
    const prefix = `daily_record_${location}_`;
    
    const records = await kv.getByPrefix(prefix);
    return c.json({ records: records || [] });
  } catch (error) {
    console.log("Error getting records history:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete daily record
app.delete("/make-server-fac344bb/daily-record/:location/:date", async (c) => {
  try {
    const location = c.req.param("location");
    const date = c.req.param("date");
    const recordKey = `daily_record_${location}_${date}`;
    const movementsKey = `movements_${location}_${date}`;
    
    await kv.del(recordKey);
    await kv.del(movementsKey);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting daily record:", error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);