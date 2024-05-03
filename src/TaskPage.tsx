import React, { useState, useEffect } from 'react';

interface TaskPageProps {
  sessionId: string;
  username: string;
}

function TaskPage({sessionId, username}: TaskPageProps) {
  const [newTaskName, setNewTaskName] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);

  const addTask = async () => {
    try {
      const response = await fetch(`http://localhost:8080/task/userId/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTaskName, userId: sessionId }),
      });

      if (response.ok) {
        fetchTasks();
        setNewTaskName('');
      } else {
        console.error('Kunde inte lägga till task');
      }
    } catch (error) {
      console.error('Ett fel uppstod:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch( `http://localhost:8080/task/userId/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        console.error('Kunde inte hämta tasks');
      }
    } catch (error) {
      console.error('Ett fel uppstod:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="task-page">
       <h2>Användare: {username}</h2>
      <h1>Uppgifter:</h1>
      <form onSubmit={(e) => { e.preventDefault(); addTask(); }}>
        <input type="text" placeholder="Lägg till uppgift" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} />
        <button type="submit">Lägg till</button>
      </form>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default TaskPage;