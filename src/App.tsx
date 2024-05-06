import { useEffect, useState } from 'react';
import './App.css';
import TaskPage from './TaskPage.tsx';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      setCurrentTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleLogin = async () => {   
    try {
        const response = await fetch('https://timetrackerbackend-5kvue.ondigitalocean.app/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            setUserId(data.id);
            setIsLoggedIn(true)
            setIsAdmin(data.admin)
            alert('Du loggades in.')
        } else {
            alert(`Fel användarnamn eller lösenord`);
            setUsername('');
            setPassword('');
        }
    } catch (error) {
        alert('Inloggning misslyckades');
        setUsername('');
        setPassword('');
    }
};


  const handleRegister = async () => {
    const response = await fetch(`https://timetrackerbackend-5kvue.ondigitalocean.app/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: newUsername, password: newPassword }),
      });

      const data = await response.text();
      if (data==="success") {
        alert('Användaren '+(newUsername)+' skapades');
        setNewUsername('')
        setNewPassword('')
      } else {
        alert(data);
        setNewUsername('')
        setNewPassword('')
      }
  };

  const handleLogout = () => {
    alert("Du loggas ut.")
    setIsLoggedIn(false)
    setUserId('');
    setUsername('')
    setPassword('')
  }

  return (
    <>
    <div className="clock">{currentTime}</div>
      {isLoggedIn ? (
        <>
          <br/><button onClick={handleLogout}>Logga ut</button>
          <TaskPage userId={userId} username={username} isAdmin={isAdmin} />
        </>
      ) : (
        <>
          <div>
            <h1>Inloggning</h1>
            <form>
              <input type="text" placeholder="Användarnamn" value={username} onChange={(e) => setUsername(e.target.value)} />
              <input type="password" placeholder="Lösenord" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={handleLogin}>Logga in</button>
            </form>
          </div>
          <div>
            <h1>Skapa konto</h1>
            <form>
              <input type="text" placeholder='Användarnamn' value={newUsername} onChange={(evt) => setNewUsername(evt.target.value)} />
              <input type="password" placeholder='Lösenord' value={newPassword} onChange={(evt) => setNewPassword(evt.target.value)} />
              <button type="button" onClick={handleRegister}>Skapa konto</button>
            </form>
          </div>
        </>
      )}
    </>
  );
}

export default App;
