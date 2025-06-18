import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { userContext } from '../../context/UserContext';

const ShowEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useContext(userContext);
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/event`);
        setEvents(res.data.data);
        setFilteredEvents(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load events');
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleInterestToggle = async (eventId, isInterested) => {
    const endpoint = isInterested ? 'not-interested' : 'interested';
    try {
      await axios.post(`${baseUrl}/api/event/${endpoint}/${eventId}`, { userId: user._id });
      toast.success(isInterested ? 'Marked as not interested!' : 'Marked as interested!');
      
      setEvents((prevEvents) =>
        prevEvents.map((ev) =>
          ev._id === eventId
            ? {
                ...ev,
                interestedUser: isInterested
                  ? ev.interestedUser.filter((id) => id !== user._id)
                  : [...ev.interestedUser, user._id],
              }
            : ev
        )
      );
    } catch (err) {
      toast.error('Failed to update interest: ' + err.message);
    }
  };

useEffect(() => {
  const lowerSearch = search.toLowerCase();
  const filtered = events.filter((ev) =>
    (ev.name || '').toLowerCase().includes(lowerSearch) ||
    (ev.expoCenter?.name || '').toLowerCase().includes(lowerSearch)
  );
  setFilteredEvents(filtered);
}, [search, events]);


  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">Upcoming Events</h1>

      <div className="max-w-md mx-auto mb-10">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by event name or expo center..."
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <p className="text-center text-gray-500">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => {
            const img = event?.expoCenter?.images?.[0]
              ? `${baseUrl}${event.expoCenter.images[0]}`
              : null;
            const isInterested = event.interestedUser?.includes(user._id);

            return (
              <div
                key={event._id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col relative"
              >
                {img && (
                  <img
                    src={img}
                    alt="Event"
                    className="w-full h-48 object-cover"
                  />
                )}

                {/* Badge */}
                {isInterested && (
                  <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow-sm">
                    Interested
                  </span>
                )}

                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h2>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Dates:</strong> {new Date(event.dateFrom).toLocaleDateString()} - {new Date(event.dateTo).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Venue:</strong> {event.expoCenter?.name || 'Unknown Expo Center'}
                  </p>

                  <div className="mt-auto">
                    <button
                      onClick={() => handleInterestToggle(event._id, isInterested)}
                      className={`w-full py-2 rounded-lg text-white font-medium transition-all duration-300 ${
                        isInterested
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {isInterested ? 'Not Interested' : 'Interested'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShowEvents;
