import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { userContext } from '../../context/UserContext';

const ShowSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [search, setSearch] = useState('');
  const { user } = useContext(userContext);
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/schedule`);
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      toast.error("Failed to fetch sessions");
    }
  };

  const handleToggleJoin = async (sessionId, isJoined) => {
    if (!user) return;
    setLoadingId(sessionId);

    try {
      const endpoint = isJoined ? 'leave' : 'join';
      await axios.post(`${baseUrl}/api/schedule/${endpoint}/${sessionId}`, { userId: user._id });

      toast.success(isJoined ? 'You left the session' : 'You joined the session');

      setSessions(prev => prev.map(session =>
        session._id === sessionId
          ? {
              ...session,
              attendees: isJoined
                ? session.attendees.filter(id => id !== user._id)
                : [...session.attendees, user._id]
            }
          : session
      ));
    } catch (err) {
      console.error('Failed to update session:', err);
      toast.error('Update failed');
    } finally {
      setLoadingId(null);
    }
  };

  const isUserInSession = (session) => {
    if (!user?._id || !session.attendees) return false;

    return session.attendees.some(att =>
      typeof att === 'string'
        ? att === user._id
        : att._id === user._id || att._id?.toString() === user._id
    );
  };

  const filteredSessions = sessions.filter(session =>
    session.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">All Sessions</h2>

      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sessions by title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {filteredSessions.length === 0 ? (
        <div className="text-center text-gray-500">No sessions found.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSessions.map((session) => {
            const isJoined = isUserInSession(session);
            return (
              <div
                key={session._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold">{session.title}</h3>
                  {isJoined && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Registered</span>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Date:</strong> {new Date(session.scheduledate).toLocaleDateString()}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Time:</strong> {session.StartTime} - {session.EndTime}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Booth:</strong>{' '}
                  {session.booth.length > 0
                    ? session.booth.map((b, i) => (
                        <span key={b._id}>
                          {b.name}
                          {i < session.booth.length - 1 && ', '}
                        </span>
                      ))
                    : 'N/A'}
                </p>

                <button
                  onClick={() => handleToggleJoin(session._id, isJoined)}
                  disabled={loadingId === session._id}
                  className={`mt-4 w-full py-2 px-4 rounded-lg font-medium text-white transition ${
                    loadingId === session._id ? 'bg-gray-400 cursor-not-allowed' :
                    isJoined ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loadingId === session._id ? 'Processing...' : isJoined ? 'Leave Session' : 'Join Session'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShowSessions;
