import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const API_URL = 'http://localhost:3001/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [destinations, setDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [currentUser] = useState({ id: 1, name: 'John Doe' }); // Mock user

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/destinations`);
      const data = await res.json();
      setDestinations(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async (destinationId) => {
    setLoading(true);
    try {
      const url = destinationId 
        ? `${API_URL}/hotels?destination_id=${destinationId}`
        : `${API_URL}/hotels`;
      const res = await fetch(url);
      const data = await res.json();
      setHotels(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlights = async (searchParams = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      const res = await fetch(`${API_URL}/flights?${params}`);
      const data = await res.json();
      setFlights(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookings?user_id=${currentUser.id}`);
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (type, itemId, totalPrice) => {
    try {
      const booking = {
        user_id: currentUser.id,
        type,
        item_id: itemId,
        check_in_date: '2024-02-01',
        check_out_date: '2024-02-03',
        guests: 2,
        total_price: totalPrice
      };
      
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      
      if (res.ok) {
        alert('Booking confirmed!');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Booking failed');
    }
  };

  const renderDestination = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => {
      setSelectedDestination(item);
      setCurrentScreen('hotels');
      fetchHotels(item.id);
    }}>
      <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.country}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHotel = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.destination_name}</Text>
        <Text style={styles.price}>${item.price_per_night}/night</Text>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
        <Text style={styles.amenities}>{item.amenities}</Text>
        <TouchableOpacity 
          style={styles.bookBtn} 
          onPress={() => createBooking('hotel', item.id, item.price_per_night * 2)}
        >
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFlight = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.airline}</Text>
        <Text style={styles.flightRoute}>{item.from_city} → {item.to_city}</Text>
        <Text style={styles.flightTime}>{item.departure_time} - {item.arrival_time}</Text>
        <Text style={styles.flightDuration}>{item.duration}</Text>
        <Text style={styles.price}>${item.price}</Text>
        <TouchableOpacity 
          style={styles.bookBtn} 
          onPress={() => createBooking('flight', item.id, item.price)}
        >
          <Text style={styles.bookBtnText}>Book Flight</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBooking = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.item_name}</Text>
        <Text style={styles.cardSubtitle}>{item.type.toUpperCase()}</Text>
        <Text style={styles.bookingDates}>
          {item.check_in_date} - {item.check_out_date}
        </Text>
        <Text style={styles.price}>${item.total_price}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>
      </View>
    </View>
  );

  const renderHomeScreen = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Trip.com</Text>
      <Text style={styles.subHeader}>Your Travel Companion</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search destinations..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.sectionTitle}>Popular Destinations</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" />
      ) : (
        <FlatList
          data={destinations.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDestination}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>No destinations found</Text>}
        />
      )}
    </ScrollView>
  );

  const renderHotelsScreen = () => (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentScreen('home')}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Hotels in {selectedDestination?.name}</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" />
      ) : (
        <FlatList
          data={hotels}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHotel}
          ListEmptyComponent={<Text style={styles.empty}>No hotels found</Text>}
        />
      )}
    </ScrollView>
  );

  const renderFlightsScreen = () => {
    if (flights.length === 0) {
      fetchFlights();
    }
    
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Flights</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="From city..."
            placeholderTextColor="#666"
            onSubmitEditing={(e) => fetchFlights({ from_city: e.nativeEvent.text })}
          />
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#6366f1" />
        ) : (
          <FlatList
            data={flights}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderFlight}
            ListEmptyComponent={<Text style={styles.empty}>No flights found</Text>}
          />
        )}
      </ScrollView>
    );
  };

  const renderBookingsScreen = () => {
    if (bookings.length === 0 && !loading) {
      fetchBookings();
    }
    
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.header}>My Bookings</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#6366f1" />
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBooking}
            ListEmptyComponent={<Text style={styles.empty}>No bookings yet</Text>}
          />
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar style="light" />
      
      {currentScreen === 'home' && renderHomeScreen()}
      {currentScreen === 'hotels' && renderHotelsScreen()}
      {currentScreen === 'flights' && renderFlightsScreen()}
      {currentScreen === 'bookings' && renderBookingsScreen()}
      
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} onPress={() => setCurrentScreen('home')}>
          <Text style={currentScreen === 'home' ? styles.tabTextActive : styles.tabText}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => setCurrentScreen('flights')}>
          <Text style={currentScreen === 'flights' ? styles.tabTextActive : styles.tabText}>✈️ Flights</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => setCurrentScreen('bookings')}>
          <Text style={currentScreen === 'bookings' ? styles.tabTextActive : styles.tabText}>📋 Bookings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: '#0a0a0f' },
  container: { flex: 1, backgroundColor: '#0a0a0f', paddingTop: 60, paddingHorizontal: 20 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subHeader: { fontSize: 16, color: '#999', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#fff', marginVertical: 15 },
  searchContainer: { marginBottom: 20 },
  searchInput: { backgroundColor: '#1a1a24', borderRadius: 12, padding: 15, color: '#fff', fontSize: 16 },
  card: { backgroundColor: '#1a1a24', borderRadius: 12, marginBottom: 15, overflow: 'hidden', marginRight: 15, width: 280 },
  cardImage: { width: '100%', height: 150, backgroundColor: '#333' },
  cardContent: { padding: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  cardSubtitle: { fontSize: 14, color: '#999', marginBottom: 5 },
  cardDescription: { fontSize: 14, color: '#ccc', marginBottom: 10 },
  rating: { fontSize: 14, color: '#fbbf24', marginBottom: 5 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#10b981', marginBottom: 10 },
  amenities: { fontSize: 12, color: '#999', marginBottom: 10 },
  flightRoute: { fontSize: 16, fontWeight: '600', color: '#6366f1', marginBottom: 5 },
  flightTime: { fontSize: 14, color: '#ccc', marginBottom: 3 },
  flightDuration: { fontSize: 12, color: '#999', marginBottom: 10 },
  bookingDates: { fontSize: 14, color: '#ccc', marginBottom: 5 },
  status: { fontSize: 12, color: '#10b981', fontWeight: '600' },
  bookBtn: { backgroundColor: '#6366f1', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15 },
  bookBtnText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  backBtn: { marginBottom: 15 },
  backBtnText: { color: '#6366f1', fontSize: 16 },
  tabBar: { flexDirection: 'row', backgroundColor: '#1a1a24', paddingVertical: 10 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabText: { color: '#666', fontSize: 12 },
  tabTextActive: { color: '#6366f1', fontSize: 12, fontWeight: '600' },
  empty: { color: '#666', textAlign: 'center', marginTop: 40 }
});