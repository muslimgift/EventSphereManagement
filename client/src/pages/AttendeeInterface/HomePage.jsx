import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userContext } from '../../context/UserContext';
import ShowEvents from './ShowEvents';
import ShowSessions from './ShowSessions';
import ShowExhibitors from './ShowExhibitors';

const HomePage = () => {
  const { LogoutUser } = useContext(userContext);
  const navigate = useNavigate();
  const eventsRef = useRef(null);
  const sessionsRef = useRef(null);
  const exhibitorsRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    LogoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white shadow-lg flex items-center justify-between px-6 py-4 sticky top-0 z-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img src="/images/logo/logo.svg" alt="Logo" className="h-10 w-10 object-contain" />
          <h1 className="text-2xl font-extrabold text-blue-800">Event Sphere Management</h1>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex gap-2 mr-4">
            <button
              onClick={() => scrollToSection(eventsRef)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-700"
            >
              Events
            </button>
            <button
              onClick={() => scrollToSection(sessionsRef)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition bg-purple-100 hover:bg-purple-600 hover:text-white text-purple-700"
            >
              Sessions
            </button>
            <button
              onClick={() => scrollToSection(exhibitorsRef)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition bg-green-100 hover:bg-green-600 hover:text-white text-green-700"
            >
              Exhibitors
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition shadow"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content Sections */}
      <main className="flex-1 p-6 space-y-24">
        <section ref={eventsRef} className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-4xl font-bold text-blue-800 mb-6 text-center">🎉 Upcoming Events</h2>
          <ShowEvents />
        </section>

        <section ref={sessionsRef} className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-4xl font-bold text-purple-800 mb-6 text-center">📅 Featured Sessions</h2>
          <ShowSessions />
        </section>

        <section ref={exhibitorsRef} className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-4xl font-bold text-green-800 mb-6 text-center">🏢 Exhibitors</h2>
          <ShowExhibitors />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-950 text-white text-center py-6 text-sm mt-auto shadow-inner">
        © {new Date().getFullYear()} Event Sphere Management. Crafted with 💙 Event Sphere Management
      </footer>
    </div>
  );
};

export default HomePage;