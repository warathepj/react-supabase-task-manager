import { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabaseClient';

function App() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState('');  // Renamed from newName
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState('');

  async function fetchData() {
    try {
      console.log('Fetching data from Supabase...');
      const { data, error, status } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Supabase error:', error);
        console.error('Status code:', status);
        throw error;
      }
      
      if (data) {
        console.log('Fetched data successfully:', data);
        setData(data);
      }
    } catch (error) {
      console.error('Error details:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!newTask.trim()) {
        throw new Error('Task cannot be empty');
      }

      const { data, error } = await supabase
        .from('tasks')        // Correct table name
        .insert([{ 
          task: newTask.trim()  // Correct column name
          // Removed 'name' field if it's not needed
        }])
        .select();

      if (error) {
        // Enhanced error logging
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!data) {
        throw new Error('No data returned after insertion');
      }

      console.log('Successfully inserted:', data);
      setNewTask('');  // Use newTask instead of newName
      fetchData();
    } catch (error) {
      // Improved error handling
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setError(error.message);
      } else {
        console.error('Unknown error:', error);
        setError('An unexpected error occurred');
      }
    }
  }

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditingTask(item.task || '');
  };

  const handleSave = async (id: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ task: editingTask })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error instanceof Error ? error.message : 'Failed to update task');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingTask('');
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete task');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container">
      <h1>Supabase Task Manager</h1>

      {/* Add new task form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter a task"
          style={{ marginRight: '1rem' }}
        />
        <button type="submit">Add Task</button>
      </form>

      {/* Error message */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Data display */}
      {loading ? (
        <p>Loading...</p>
      ) : data.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {data.map((item) => (
            <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ marginRight: '1rem' }}>
                Task: {' '}
                {editingId === item.id ? (
                  <span>
                    <input
                      type="text"
                      value={editingTask}
                      onChange={(e) => setEditingTask(e.target.value)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <button 
                      onClick={() => handleSave(item.id)}
                      style={{
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        marginRight: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>
                    <button 
                      onClick={handleCancel}
                      style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <span>
                    {item.task}  {/* Display the task column */}
                    <button 
                      onClick={() => handleEdit(item)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontSize: '1.2em',
                        marginLeft: '0.5rem'
                      }}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontSize: '1.2em',
                        marginLeft: '0.5rem',
                        color: '#f44336'
                      }}
                      title="Delete"
                    >
                      ×
                    </button>
                  </span>
                )}
                (ID: {item.id}, Created: {new Date(item.created_at).toLocaleString()})
              </span>
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
