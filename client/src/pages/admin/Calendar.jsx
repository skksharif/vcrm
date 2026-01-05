import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AdminCalendar(){
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const fetchEvents = () => {
    setLoading(true);
    api.get('/admin/calendar/global')
      .then(r => setEvents(r.data.calendar || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
       console.log('Fetched events:', events);
    fetchEvents();
 
  }, []);
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Task Calendar</h1>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#026c8a]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(ev => {
            const isPosted = ev.stage === 'Posted';
            return (
              <Card 
                key={ev.id} 
                className={`hover:shadow-md transition-shadow ${isPosted ? 'bg-green-50 border-green-200' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className={`font-semibold ${isPosted ? 'text-green-800' : 'text-gray-800'}`}>
                    {ev.title}
                    {isPosted && <span className="ml-2">✓</span>}
                  </div>
                </div>
                <div className={`text-xs font-medium mb-1 ${isPosted ? 'text-green-700' : 'text-[#026c8a]'}`}>
                  {ev.clientName}
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  {new Date(ev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                <div className="flex justify-between text-xs mb-1">
                  <span className={`capitalize font-medium ${isPosted ? 'text-green-700 bg-green-100 px-2 py-1 rounded' : 'text-gray-600'}`}>
                    {ev.stage || 'Not Started Yet'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  )
}
