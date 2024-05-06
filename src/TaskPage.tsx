import React, { useState, useEffect } from 'react';

interface TaskPageProps {
  sessionId: string;
  username: string;
}

function TaskPage({sessionId, username}: TaskPageProps) {
  const [newTaskName, setNewTaskName] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [intervalIds, setIntervalIds] = useState<{ [taskId: string]: number }>({});

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
        console.error('Kunde inte lägga till uppgift');
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
        console.error('Kunde inte hämta uppgifterna');
      }
    } catch (error) {
      console.error('Ett fel uppstod:', error);
    }
  };

  const adminFetchTasks = () => {
    fetch(`http://localhost:8080/all-tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      
    })
    .catch(error => {
      
    });
  }
  

  const startTimer = async (taskId: string) => {
    try {
      const task = tasks.find(task => task.id === taskId);
      if (task && !task.timerRunning) {
        const response = await fetch(`http://localhost:8080/task/start/${taskId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          setTasks(prevTasks => {
            return prevTasks.map(task => {
              if (task.id === taskId) {
                return { ...task, timerRunning: true }; 
              }
              return task;
            });
          });
  
          const id = setInterval(() => {
            setTasks(prevTasks => {
              return prevTasks.map(task => {
                if (task.id === taskId) {
                  return { ...task, totalTime: task.totalTime + 1 }; 
                }
                return task;
              });
            });
          }, 1000);
  
          setIntervalIds(prevIds => ({ ...prevIds, [taskId]: id }));
        } else {
          console.error('Kunde inte starta timer för uppgift');
        }
      } else {
        console.log('Timer is already running for this task');
      }
    } catch (error) {
      console.error('Ett fel uppstod:', error);
    }
  };
  
  const pauseTimer = async (taskId: string) => {
    try {
        const response = await fetch(`http://localhost:8080/task/pause/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
          const id = intervalIds[taskId];
          if (id) {
            
            clearInterval(id);
            const newIntervalIds = { ...intervalIds };
            delete newIntervalIds[taskId];
            setIntervalIds(newIntervalIds);

            setTasks(prevTasks => {
              return prevTasks.map(task => {
                if (task.id === taskId) {
                  return { ...task, timerRunning: false };
                }
                return task;
              })
             
            })
          }
        } else {
          console.error('Kunde inte pausa timer för uppgift');
        }
      } catch (error) {
        console.error('Ett fel uppstod:', error);
      }
    };

  const formatTotalTime = (totalTime: number) => {
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    const seconds = totalTime % 60;
    return `${hours}h:${minutes}m:${seconds}s`;
  };

  const removeTask = (taskId : string) => {
    fetch(`http://localhost:8080/task/taskId/${taskId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      }
    })
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="task-page">
      <h2>Användare: {username}</h2>
      <h1>Uppgifter:</h1>
      <form onSubmit={(e) => { e.preventDefault(); addTask(); }}>
        <input
          type="text"
          placeholder="Lägg till uppgift"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
        />
        <button type="submit">Lägg till</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className='taskBox' >
            <h2>{task.name}</h2>
            <h3>({formatTotalTime(task.totalTime)})
            {!task.timerRunning ? (
              <button className='startBtn' onClick={() => startTimer(task.id)}>Starta timer</button>
            ):(
              <button className='pauseBtn' onClick={() => pauseTimer(task.id)}>Pausa timer</button>
            )}     
              <button onClick={() => removeTask(task.id)}>[X]</button></h3>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskPage;