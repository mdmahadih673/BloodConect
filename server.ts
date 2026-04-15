import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { supabase } from './server/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Ensure Admin User Exists ---
  const ensureAdmin = async () => {
    // First, check if settings table is usable by trying to select
    const { error: settingsError } = await supabase.from('settings').select('key').limit(1);
    
    // If table doesn't exist or error, we might need to inform user to run SQL
    if (settingsError) {
      console.error('Settings table error. Please ensure you have run the SQL script in Supabase SQL Editor:', settingsError.message);
    }

    const adminEmail = 'mdmahadih673@gmail.com';
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .single();

    if (!existingAdmin) {
      console.log('Seeding admin user...');
      const hashedPassword = await bcrypt.hash('admin1234', 10);
      await supabase.from('users').insert([{
        name: 'Mahadi',
        email: adminEmail,
        password: hashedPassword,
        phone: '01700000000',
        blood_group: 'O+',
        area: 'Dhaka',
        role: 'admin',
        location: 'POINT(90.4125 23.8103)'
      }]);
    }
  };
  ensureAdmin();

  // --- API Routes ---

  // Analytics: Get
  app.get('/api/settings/analytics', async (req, res) => {
    const { data, error } = await supabase.from('settings').select('*');
    const analytics = data?.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    res.json(analytics || { total_users: 0, lives_saved: 0, total_donors: 0 });
  });

  // Analytics: Update (Admin only)
  app.post('/api/settings/analytics', async (req, res) => {
    const { total_users, lives_saved, total_donors } = req.body;
    
    try {
      // Perform individual upserts to be safer
      const keys = ['total_users', 'lives_saved', 'total_donors'];
      const values = [total_users, lives_saved, total_donors];
      
      for (let i = 0; i < keys.length; i++) {
        const { error } = await supabase
          .from('settings')
          .upsert({ key: keys[i], value: values[i] }, { onConflict: 'key' });
        
        if (error) throw error;
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Supabase Analytics Update Error:', error);
      res.status(400).json({ error: error.message || 'Failed to update analytics' });
    }
  });

  // All User Locations for Home Map
  app.get('/api/users/locations', async (req, res) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, blood_group, location, area')
      .eq('is_banned', false);
    
    // Extract lat/lng from PostGIS location
    const formattedData = data?.map(u => {
      // PostGIS point format is usually 'POINT(lng lat)'
      // But supabase-js might return it as a string or object depending on setup
      // For simplicity, we'll assume we need to parse it if it's a string
      return {
        id: u.id,
        name: u.name,
        bloodGroup: u.blood_group,
        area: u.area
      };
    });
    res.json(data); // Sending raw for now, frontend will handle if needed
  });

  // Auth: Register
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, phone, bloodGroup, area, lat, lng } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const { data, error } = await supabase
        .from('users')
        .insert([{
          name,
          email,
          password: hashedPassword,
          phone,
          blood_group: bloodGroup,
          area,
          location: `POINT(${lng} ${lat})`
        }])
        .select();

      if (error) return res.status(400).json({ error: error.message });
      
      const token = jwt.sign({ id: data[0].id, role: data[0].role }, process.env.JWT_SECRET!);
      res.json({ user: data[0], token });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) return res.status(400).json({ error: 'User not found' });
      if (user.is_banned) return res.status(403).json({ error: 'Account banned' });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(400).json({ error: 'Invalid password' });

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!);
      res.json({ user, token });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Donor Search (Geospatial)
  app.get('/api/donors/search', async (req, res) => {
    const { bloodGroup, area, lat, lng, radius = 50000 } = req.query;
    try {
      let query = supabase
        .from('users')
        .select('id, name, blood_group, area, availability, last_donation_date, role')
        .eq('role', 'donor')
        .eq('is_banned', false);

      if (bloodGroup) query = query.eq('blood_group', bloodGroup);
      if (area) query = query.ilike('area', `%${area}%`);

      // Using PostGIS for distance sorting
      // We use rpc call or raw query if possible, but for simplicity we'll filter by distance in SQL if we had a function
      // Since we can't easily do raw SQL via supabase-js without an RPC, let's assume an RPC 'search_donors' exists
      // OR we can use the location field with a filter.
      
      const { data, error } = await supabase.rpc('search_donors', {
        p_blood_group: bloodGroup || null,
        p_lat: parseFloat(lat as string),
        p_lng: parseFloat(lng as string),
        p_radius: parseFloat(radius as string)
      });

      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Request Workflow
  app.post('/api/requests', async (req, res) => {
    const { requesterId, donorId, message } = req.body;
    const { data, error } = await supabase
      .from('requests')
      .insert([{ requester_id: requesterId, donor_id: donorId, message }])
      .select();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
  });

  app.get('/api/requests/incoming/:userId', async (req, res) => {
    const { data, error } = await supabase
      .from('requests')
      .select('*, requester:requester_id(id, name, email, phone)')
      .eq('donor_id', req.params.userId);
    res.json(data);
  });

  app.patch('/api/requests/:id', async (req, res) => {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', req.params.id)
      .select();
    res.json(data[0]);
  });

  // Admin Routes
  app.get('/api/admin/users', async (req, res) => {
    const { data, error } = await supabase.from('users').select('*');
    res.json(data);
  });

  app.patch('/api/admin/users/:id/ban', async (req, res) => {
    const { isBanned } = req.body;
    const { data, error } = await supabase.from('users').update({ is_banned: isBanned }).eq('id', req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
