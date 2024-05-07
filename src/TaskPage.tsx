import { useState, useEffect } from 'react';

interface TaskPageProps {
  userId: string;
  username: string;
  isAdmin: boolean;
}

function TaskPage({userId, username, isAdmin}: TaskPageProps) {
  const [newTaskName, setNewTaskName] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [intervalIds, setIntervalIds] = useState<{ [taskId: string]: number }>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserTasks, setSelectedUserTasks] = useState<any[]>([]);
  const [selectedUserTotalTime, setSelectedUserTotalTime] = useState<number>(0);

  const addTask = async () => {
    try {
      const response = await fetch(`https://timetrackerbackend-5kvue.ondigitalocean.app/task/userId/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTaskName, userId: userId }),
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
      const response = await fetch( `https://timetrackerbackend-5kvue.ondigitalocean.app/task/userId/${userId}`, {
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

  const adminFetchTasks = async () => {
    try {
      const response = await fetch(`https://timetrackerbackend-5kvue.ondigitalocean.app/all-tasks`, {
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
  

  const startTimer = async (taskId: string) => {
    try {
      const task = tasks.find(task => task.id === taskId);
      if (task && !task.timerRunning) {
        const response = await fetch(`https://timetrackerbackend-5kvue.ondigitalocean.app/task/start/${taskId}`, {
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
        const response = await fetch(`https://timetrackerbackend-5kvue.ondigitalocean.app/task/pause/${taskId}`, {
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
    fetch(`https://timetrackerbackend-5kvue.ondigitalocean.app/task/taskId/${taskId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      }
    })
  }
  const fetchUsers = async () => {
    try {
      const response = await fetch(`https://timetrackerbackend-5kvue.ondigitalocean.app/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Kunde inte hämta användare');
      }
    } catch (error) {
      console.error('Ett fel uppstod:', error);
    }
  };

  const calculateTotalTime = () => {
    let totalTime = 0;
    tasks.forEach(task => {
      totalTime += task.totalTime;
    });
    setSelectedUserTotalTime(totalTime);
  };

  useEffect(() => {
    if(isAdmin) {
      fetchUsers();
      adminFetchTasks();
    }else {
       fetchTasks();
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      const userTasks = tasks.filter((task) => task.userId === selectedUserId);
      setSelectedUserTasks(userTasks);
      calculateTotalTime()
    } else {
      setSelectedUserTasks([]);
    }
  }, [selectedUserId, tasks]);

  return (
    <div className="task-page">
      <p>Inloggad som: {username}</p>
      {!isAdmin ? (
        <div>
          <h1>Uppgifter:</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTask();
            }}
          >
            <input
              type="text"
              placeholder="Lägg till uppgift"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
            />
            <button type="submit">Lägg till</button>
          </form>
        </div>
      ) : (
        <div className="taskBox">
          <h2>Alla användare:</h2>
          <ul>
            {users.map((user) => (
              <li key={user.id} onClick={() => setSelectedUserId(user.id)}>
                {user.username}
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul>
      {isAdmin && selectedUserId && (
        <h2>Användare: {selectedUserTasks[0]?.username}</h2> 
      )}
        {isAdmin ? ( 
          selectedUserTasks.map((task) => (
            <li key={task.id} className="taskBox">
              <h2>{task.name}</h2>
              <h3> ({formatTotalTime(task.totalTime)}) </h3>      
            </li>
          ))
        ) : (
          tasks.map((task) => (
            <li key={task.id} className="taskBox">
              <h2>{task.name}</h2>
              <h3>
                ({formatTotalTime(task.totalTime)})
                {!task.timerRunning ? (
                  <button className="startBtn" onClick={() => startTimer(task.id)}>
                    Starta timer
                  </button>
                ) : (
                  <button className="pauseBtn" onClick={() => pauseTimer(task.id)}>
                    Pausa timer
                  </button>
                )}
                <button onClick={() => removeTask(task.id)}>X</button>
              </h3>
            </li>
          ))
        )}
      </ul>
      {isAdmin && selectedUserId && (
        <p>
          Total tid: {formatTotalTime(selectedUserTasks.reduce((total, task) => total + task.totalTime, 0))}
        </p>
      )}
    </div>
  );
}

export default TaskPage;