import { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabaseClient';

function App() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  async function fetchData() {
    try {
      const { data, error } = await supabase
        .from('test')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        console.log('Fetched data:', data);
        setData(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('test')
        .insert([{ name: newName }]);

      if (error) throw error;

      setNewName('');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error inserting data:', error);
      setError(error instanceof Error ? error.message : 'Failed to insert data');
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container">
      <h1>Supabase Test</h1>

      {/* Add new name form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter a name"
          style={{ marginRight: '1rem' }}
        />
        <button type="submit">Add Name</button>
      </form>

      {/* Error message */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Data display */}
      {loading ? (
        <p>Loading...</p>
      ) : data.length > 0 ? (
        <ul>
          {data.map((item) => (
            <li key={item.id}>
              {item.name} (ID: {item.id}, Created: {new Date(item.created_at).toLocaleString()})
            </li>
          ))}
        </ul>
      ) : (
        <p>No data found</p>
      )}
    </div>
  );
}

export default App;
