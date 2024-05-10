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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserTasks, setSelectedUserTasks] = useState<any[]>([]);

  const addTask = async () => {
    if (!newTaskName.trim()) {
      alert('Uppgiften måste ha ett namn.');
      return;
    }
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
    const response = await fetch(`https://timetrackerbackend-5kvue.ondigitalocean.app/task/start/${taskId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });  
    if (response.ok) {
      fetchTasks();
    };
  }

  const pauseTimer = async (taskId: string) => {
    const response = await fetch(`https://timetrackerbackend-5kvue.ondigitalocean.app/task/pause/${taskId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
      if (response.ok) {
        fetchTasks();
      }
  }

  const formatTotalTime = (totalTime: number) => {
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    const seconds = Math.floor(totalTime % 60);
    return `${hours}h:${minutes}m:${seconds}`;
  };

  const formatTime = (totalTime: number) => {
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    return `${hours}h:${minutes}m`;
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

  const removeUser = (userId : string) => {
    fetch (`https://timetrackerbackend-5kvue.ondigitalocean.app/user/${userId}`, {
      method: 'DELETE'  
    })
      .then(response => {
        if(response.ok) {
          setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
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
    selectedUserTasks.forEach(task => {
      totalTime += task.totalTime;
    });
    return totalTime;
  };

  useEffect(() => {
    if (isAdmin) {
        fetchUsers();
        adminFetchTasks();
    } else {
        fetchTasks();
    }

    const interval = setInterval(() => {
        if (!isAdmin) {
            fetchTasks();
        } else {
            fetchUsers()
            adminFetchTasks();
            calculateTotalTime()
        }
    }, 1000);

    return () => clearInterval(interval);
}, [isAdmin]);

  useEffect(() => {
    if (selectedUserId) {
      const userTasks = tasks.filter((task) => task.userId === selectedUserId);
      setSelectedUserTasks(userTasks);
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
            {users.filter(user => !user.admin).map((user) => (
              <li key={user.id} onClick={() => setSelectedUserId(user.id)}>
                {user.username}
                <button onClick={() => removeUser(user.id)}>X</button>
              </li>
            ))}
          </ul>
        </div>

      )}
      <ul>
      {isAdmin && selectedUserId && (
    <h2>Användare: {users.find(user => user.id === selectedUserId)?.username}</h2>
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
                ({formatTime(task.totalTime)})
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
         Total tid: {formatTotalTime(calculateTotalTime())}
        </p>
      )}
    </div>
  );
}

export default TaskPage;