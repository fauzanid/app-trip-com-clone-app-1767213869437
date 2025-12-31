import { Router } from 'express';
import { db } from '../db.js';

export const apiRoutes = Router();

// Users
apiRoutes.get('/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

apiRoutes.post('/users', (req, res) => {
  const { email, name, phone } = req.body;
  try {
    const result = db.prepare('INSERT INTO users (email, name, phone) VALUES (?, ?, ?)').run(email, name, phone);
    res.status(201).json({ id: result.lastInsertRowid, email, name, phone });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Destinations
apiRoutes.get('/destinations', (req, res) => {
  const destinations = db.prepare('SELECT * FROM destinations ORDER BY rating DESC').all();
  res.json(destinations);
});

apiRoutes.get('/destinations/:id', (req, res) => {
  const destination = db.prepare('SELECT * FROM destinations WHERE id = ?').get(req.params.id);
  if (!destination) return res.status(404).json({ error: 'Destination not found' });
  res.json(destination);
});

// Hotels
apiRoutes.get('/hotels', (req, res) => {
  const { destination_id, min_price, max_price } = req.query;
  let query = `
    SELECT h.*, d.name as destination_name 
    FROM hotels h 
    LEFT JOIN destinations d ON h.destination_id = d.id 
    WHERE 1=1
  `;
  const params = [];
  
  if (destination_id) {
    query += ' AND h.destination_id = ?';
    params.push(destination_id);
  }
  if (min_price) {
    query += ' AND h.price_per_night >= ?';
    params.push(min_price);
  }
  if (max_price) {
    query += ' AND h.price_per_night <= ?';
    params.push(max_price);
  }
  
  query += ' ORDER BY h.rating DESC';
  const hotels = db.prepare(query).all(...params);
  res.json(hotels);
});

apiRoutes.get('/hotels/:id', (req, res) => {
  const hotel = db.prepare(`
    SELECT h.*, d.name as destination_name 
    FROM hotels h 
    LEFT JOIN destinations d ON h.destination_id = d.id 
    WHERE h.id = ?
  `).get(req.params.id);
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
  res.json(hotel);
});

// Flights
apiRoutes.get('/flights', (req, res) => {
  const { from_city, to_city, min_price, max_price } = req.query;
  let query = 'SELECT * FROM flights WHERE 1=1';
  const params = [];
  
  if (from_city) {
    query += ' AND LOWER(from_city) LIKE ?';
    params.push(`%${from_city.toLowerCase()}%`);
  }
  if (to_city) {
    query += ' AND LOWER(to_city) LIKE ?';
    params.push(`%${to_city.toLowerCase()}%`);
  }
  if (min_price) {
    query += ' AND price >= ?';
    params.push(min_price);
  }
  if (max_price) {
    query += ' AND price <= ?';
    params.push(max_price);
  }
  
  query += ' ORDER BY price ASC';
  const flights = db.prepare(query).all(...params);
  res.json(flights);
});

apiRoutes.get('/flights/:id', (req, res) => {
  const flight = db.prepare('SELECT * FROM flights WHERE id = ?').get(req.params.id);
  if (!flight) return res.status(404).json({ error: 'Flight not found' });
  res.json(flight);
});

// Bookings
apiRoutes.get('/bookings', (req, res) => {
  const { user_id } = req.query;
  let query = `
    SELECT b.*, 
      CASE 
        WHEN b.type = 'hotel' THEN h.name 
        WHEN b.type = 'flight' THEN f.airline || ' - ' || f.from_city || ' to ' || f.to_city
      END as item_name
    FROM bookings b
    LEFT JOIN hotels h ON b.type = 'hotel' AND b.item_id = h.id
    LEFT JOIN flights f ON b.type = 'flight' AND b.item_id = f.id
  `;
  
  if (user_id) {
    query += ' WHERE b.user_id = ?';
  }
  
  query += ' ORDER BY b.created_at DESC';
  
  const bookings = user_id 
    ? db.prepare(query).all(user_id)
    : db.prepare(query).all();
  res.json(bookings);
});

apiRoutes.post('/bookings', (req, res) => {
  const { user_id, type, item_id, check_in_date, check_out_date, guests, total_price } = req.body;
  
  try {
    // Verify the item exists
    if (type === 'hotel') {
      const hotel = db.prepare('SELECT * FROM hotels WHERE id = ?').get(item_id);
      if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    } else if (type === 'flight') {
      const flight = db.prepare('SELECT * FROM flights WHERE id = ?').get(item_id);
      if (!flight) return res.status(404).json({ error: 'Flight not found' });
    }
    
    const result = db.prepare(`
      INSERT INTO bookings (user_id, type, item_id, check_in_date, check_out_date, guests, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(user_id, type, item_id, check_in_date, check_out_date, guests, total_price);
    
    res.status(201).json({ 
      id: result.lastInsertRowid, 
      user_id, 
      type, 
      item_id, 
      check_in_date, 
      check_out_date, 
      guests, 
      total_price,
      status: 'confirmed'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

apiRoutes.delete('/bookings/:id', (req, res) => {
  db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
  res.status(204).send();
});