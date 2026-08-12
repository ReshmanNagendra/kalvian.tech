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

// GET /api/attendance/:userId
// Fetch attendance data for a specific user
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
        // No row found, return empty data
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
    // Upsert the data (insert if new, update if exists)
    const { data, error } = await supabase
      .from('attendance_data')
      .upsert({
        user_id: userId,
        subjects: syncData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (error) throw error;

    res.json({ success: true, message: "Attendance synced successfully", data });
  } catch (error) {
    console.error("Error syncing attendance:", error);
    res.status(500).json({ error: "Failed to sync attendance data" });
  }
});

module.exports = router;
