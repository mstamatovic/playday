import React, { useState } from 'react';

interface CreateTermProps {
  // props
}

const CreateTerm: React.FC<CreateTermProps> = () => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // poziv API-ja za kreiranje termina
    // poziv funkcije iz game.py fajla
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-md shadow-md">
      <h2 className="text-lg font-bold mb-4">Kreiraj termin</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-bold" htmlFor="title">
            Naslov:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-bold" htmlFor="location">
            Lokacija:
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-bold" htmlFor="date">
            Datum:
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-bold" htmlFor="maxPlayers">
            Maksimalan broj igrača:
          </label>
          <input
            type="number"
            id="maxPlayers"
            value={maxPlayers}
            onChange={(event) => setMaxPlayers(event.target.value)}
            className="px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-md"
        >
          Sačuvaj
        </button>
      </form>
    </div>
  );
};

export default CreateTerm;


