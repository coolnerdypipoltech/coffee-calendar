import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Resource } from '../lib/types';
import ResourceList from '../components/ResourceList';
import Calendar from '../components/Calendar';
import BookingPanel from '../components/BookingPanel';

export default function Dashboard() {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  const handleSlotSelect = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
  };

  const handleReset = () => {
    setStartTime(null);
    setEndTime(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="dashboard">
      <header className="topbar">
        <h1>☕ Coffee Calendar</h1>
        <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
      </header>
      <div className="dashboard-body">
        <aside className="sidebar">
          <ResourceList
            selected={selectedResource}
            onSelect={(r) => {
              setSelectedResource(r);
              handleReset();
            }}
          />
        </aside>
        <main className="main-panel">
          {selectedResource ? (
            <>
              <Calendar
                resourceId={selectedResource.id}
                onSlotSelect={handleSlotSelect}
              />
              <BookingPanel
                resource={selectedResource}
                startTime={startTime}
                endTime={endTime}
                onReset={handleReset}
              />
            </>
          ) : (
            <div className="placeholder">
              <h2>Welcome!</h2>
              <p>Select a resource from the sidebar to view availability and make a booking.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
