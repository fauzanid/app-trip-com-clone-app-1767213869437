import Database from 'better-sqlite3';

const db = new Database('data.db');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      image_url TEXT,
      description TEXT,
      rating REAL DEFAULT 4.5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS hotels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      destination_id INTEGER REFERENCES destinations(id),
      price_per_night REAL NOT NULL,
      rating REAL DEFAULT 4.0,
      image_url TEXT,
      amenities TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS flights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      airline TEXT NOT NULL,
      from_city TEXT NOT NULL,
      to_city TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      price REAL NOT NULL,
      duration TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      type TEXT NOT NULL, -- 'hotel' or 'flight'
      item_id INTEGER NOT NULL, -- hotel_id or flight_id
      check_in_date TEXT,
      check_out_date TEXT,
      guests INTEGER DEFAULT 1,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Insert sample data
  const destinations = [
    { name: 'Paris', country: 'France', image_url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=300', description: 'City of Light and Love', rating: 4.8 },
    { name: 'Tokyo', country: 'Japan', image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300', description: 'Modern metropolis with ancient traditions', rating: 4.7 },
    { name: 'New York', country: 'USA', image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300', description: 'The city that never sleeps', rating: 4.6 },
    { name: 'London', country: 'UK', image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300', description: 'Historic capital with royal charm', rating: 4.5 }
  ];
  
  const hotels = [
    { name: 'Hotel Le Marais', destination_id: 1, price_per_night: 120, rating: 4.3, image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300', amenities: 'WiFi, Breakfast, Gym' },
    { name: 'Tokyo Grand Hotel', destination_id: 2, price_per_night: 180, rating: 4.5, image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300', amenities: 'WiFi, Spa, Restaurant' },
    { name: 'Manhattan Plaza', destination_id: 3, price_per_night: 250, rating: 4.2, image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300', amenities: 'WiFi, Pool, Concierge' },
    { name: 'London Bridge Hotel', destination_id: 4, price_per_night: 160, rating: 4.4, image_url: 'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=300', amenities: 'WiFi, Bar, Room Service' }
  ];
  
  const flights = [
    { airline: 'Air France', from_city: 'New York', to_city: 'Paris', departure_time: '14:30', arrival_time: '08:45+1', price: 650, duration: '7h 15m' },
    { airline: 'JAL', from_city: 'Los Angeles', to_city: 'Tokyo', departure_time: '11:00', arrival_time: '15:30+1', price: 850, duration: '11h 30m' },
    { airline: 'Delta', from_city: 'Miami', to_city: 'New York', departure_time: '09:15', arrival_time: '12:30', price: 280, duration: '3h 15m' },
    { airline: 'British Airways', from_city: 'Boston', to_city: 'London', departure_time: '20:00', arrival_time: '07:30+1', price: 720, duration: '6h 30m' }
  ];
  
  // Insert sample data if tables are empty
  const destCount = db.prepare('SELECT COUNT(*) as count FROM destinations').get().count;
  if (destCount === 0) {
    const insertDest = db.prepare('INSERT INTO destinations (name, country, image_url, description, rating) VALUES (?, ?, ?, ?, ?)');
    destinations.forEach(dest => insertDest.run(dest.name, dest.country, dest.image_url, dest.description, dest.rating));
    
    const insertHotel = db.prepare('INSERT INTO hotels (name, destination_id, price_per_night, rating, image_url, amenities) VALUES (?, ?, ?, ?, ?, ?)');
    hotels.forEach(hotel => insertHotel.run(hotel.name, hotel.destination_id, hotel.price_per_night, hotel.rating, hotel.image_url, hotel.amenities));
    
    const insertFlight = db.prepare('INSERT INTO flights (airline, from_city, to_city, departure_time, arrival_time, price, duration) VALUES (?, ?, ?, ?, ?, ?, ?)');
    flights.forEach(flight => insertFlight.run(flight.airline, flight.from_city, flight.to_city, flight.departure_time, flight.arrival_time, flight.price, flight.duration));
  }
  
  console.log('Database initialized');
}

export { db };