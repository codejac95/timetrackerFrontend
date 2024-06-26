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
  const [showRegisterForm, setShowRegisterForm] = useState(false);

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
    const registerRegex = /^\S*$/; 

    if (!newUsername.trim() || !newPassword.trim()) {
      alert('Användarnamn och lösenord får inte vara tomt.'); 
      setNewUsername('');
      setNewPassword('');
      return;
    }
    if (!registerRegex.test(newUsername) || !registerRegex.test(newPassword)) {
      alert('Användarnamnet eller lösenordet får inte innehålla mellanslag.');
      setNewUsername('');
      setNewPassword('');
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
        setNewPassword('');
        setShowRegisterForm(false);
      } else {
        alert(data);
        setNewUsername('');
        setNewPassword('');
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
        alert("Ett fel uppstod..");
      }
    })
    .catch(error => {
      console.error('Ett fel uppstod:', error);
      alert("Ett fel uppstod..");
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
          {!showRegisterForm ? ( 
            <div>
              <h1>Inloggning</h1>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}>
                <input 
                type="text" 
                placeholder="Användarnamn" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} />

                <input 
                type="password" 
                placeholder="Lösenord" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} />

                <button type="submit">Logga in</button>
              </form>
              <br />
              <p onClick={() => setShowRegisterForm(true)}style= {{textDecoration: 'underline'}}>Registrera dig här</p>
            </div>
          ) : (
            <div>
              <h1>Registrering</h1>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}>
                <input 
                type="text" 
                placeholder='Användarnamn' 
                value={newUsername} 
                onChange={(e) => setNewUsername(e.target.value)} />

                <input 
                type="password" 
                placeholder='Lösenord' 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} />
                <button type="submit">Registrera konto</button>
              </form>
              <br />
              <p onClick={() => setShowRegisterForm(false)} style= {{textDecoration: 'underline'}}>Tillbaka till inloggning</p>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default App;
