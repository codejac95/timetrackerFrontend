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

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) {
      const storedUserId = localStorage.getItem('userId');
      const storedUsername = localStorage.getItem('username');
      const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
      setUserId(storedUserId ?? '');
      setUsername(storedUsername ?? '');
      setIsAdmin(storedIsAdmin);
      setIsLoggedIn(true);
    }
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
            localStorage.setItem('isLoggedIn','true')
            localStorage.setItem('userId', data.id);
            localStorage.setItem('username', username);
            localStorage.setItem('isAdmin', data.admin ? 'true' : 'false');

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
    if (username.trim() === '' || password.trim() === '') {
      alert('Användarnamn och lösenord får inte vara tomt eller innehålla mellanslag.'); 
      setNewUsername('')
      setNewPassword('')
      return;
    }
  
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
    fetch(`https://timetrackerbackend-5kvue.ondigitalocean.app/logout/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (response.ok) {
        alert("Du loggas ut.");
        setIsLoggedIn(false);
        setUserId('');
        setUsername('');
        setPassword('');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('isAdmin');
      } else {
        alert("Det gick inte att logga ut. Försök igen senare.");
      }
    })
    .catch(error => {
      console.error('Något gick fel:', error);
      alert("Ett fel uppstod. Vänligen försök igen senare.");
    });
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
