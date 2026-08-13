const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("⚠️ Supabase credentials missing. Attendance API won't work properly.");
}

// Helper function to get or create numeric UID
async function getNumericUid(firebaseUid) {
  if (!supabase) throw new Error("Supabase not configured");

  // Try to find existing mapping
  const { data: existing, error: findError } = await supabase
    .from('users_mapping')
    .select('id')
    .eq('firebase_uid', firebaseUid)
    .single();

  if (existing) return existing.id;
  
  if (findError && findError.code !== 'PGRST116') {
    throw findError; 
  }

  // If not found, create new mapping
  const { data: newMapping, error: insertError } = await supabase
    .from('users_mapping')
    .insert([{ firebase_uid: firebaseUid }])
    .select('id')
    .single();

  if (insertError) {
     if (insertError.code === '23505') { // unique violation
       const { data: retry } = await supabase.from('users_mapping').select('id').eq('firebase_uid', firebaseUid).single();
       if (retry) return retry.id;
     }
     throw insertError;
  }
  return newMapping.id;
}

// GET /api/attendance/:userId/numeric-id
router.get('/:userId/numeric-id', async (req, res) => {
  const { userId } = req.params;
  try {
    const numericUid = await getNumericUid(userId);
    res.json({ numericId: numericUid });
  } catch (error) {
    console.error("Error fetching numeric ID:", error);
    res.status(500).json({ error: "Failed to fetch numeric ID" });
  }
});

// GET /api/attendance/:userId/history
router.get('/:userId/history', async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const numericUid = await getNumericUid(userId);
    
    let query = supabase
      .from('attendance_history')
      .select('date, subjects')
      .eq('numeric_uid', numericUid)
      .order('date', { ascending: true });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    res.status(500).json({ error: "Failed to fetch attendance history" });
  }
});

// GET /api/attendance/:userId
// Fetch attendance data for a specific user (latest snapshot)
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

  try {
    const { data, error } = await supabase
      .from('attendance_data')
      .select('subjects, updated_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.json({ data: null, updated_at: null });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance data" });
  }
});

// POST /api/attendance/sync
// Save or update attendance data for a user
router.post('/sync', async (req, res) => {
  console.log("Received sync request body:", req.body);
  const { userId, data: syncData } = req.body;

  if (!userId || !syncData) {
    return res.status(400).json({ error: "userId and data are required" });
  }

  if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

  try {
    // 1. Upsert latest data to attendance_data for backward compatibility
    await supabase
      .from('attendance_data')
      .upsert({
        user_id: userId,
        subjects: syncData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    // 2. Map Firebase UID to Numeric UID
    const numericUid = await getNumericUid(userId);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 3. Upsert to attendance_history
    const { data, error } = await supabase
      .from('attendance_history')
      .upsert({
        numeric_uid: numericUid,
        date: today,
        subjects: syncData,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'numeric_uid, date'
      })
      .select();

    if (error) throw error;

    res.json({ success: true, message: "Attendance synced and history updated", data });
  } catch (error) {
    console.error("Error syncing attendance:", error);
    res.status(500).json({ error: "Failed to sync attendance data" });
  }
});

module.exports = router;
