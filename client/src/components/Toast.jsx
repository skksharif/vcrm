import React from 'react';
export default function Toast({ message, type='info' }){
  if (!message) return null;
  const cls = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500';
  return <div className={`fixed bottom-6 right-6 text-white p-3 rounded ${cls}`}>{message}</div>
}
