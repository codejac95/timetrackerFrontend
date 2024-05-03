import { useState } from 'react';
import './App.css';
import TaskPage from './TaskPage.tsx';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setIsLoggedIn(true)
        alert('Du loggades in.')
      } else {
        alert('Inloggning misslyckades.')
        setUsername('')
        setPassword('')
      }
    } catch (error) {
      alert('Inloggning misslyckades.')
      setUsername('')
      setPassword('')
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`http://localhost:8080/register/${newUsername}/${newPassword}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Användaren '+(newUsername)+' skapades');
        setNewUsername('')
        setNewPassword('')
      } else {
        alert('Användarnamnet är upptaget.');
        setNewUsername('')
        setNewPassword('')
      }
    } catch (error) {
      alert('Ett fel uppstod.');
      setNewUsername('')
      setNewPassword('')
    }
  };
const handleLogout = () => {
  alert("Du loggas ut.")
  setIsLoggedIn(false)
  setSessionId('');
  setUsername('')
  setPassword('')
}
  return (
    <>
    {isLoggedIn ? (
      <>
        <button onClick={handleLogout}>Logga ut</button>
      <TaskPage sessionId={sessionId} username={username} />
      </>
    ) : (

      <><div>
            <h1>Inloggning</h1>
            <form>
              <input type="text" placeholder="Användarnamn" value={username} onChange={(e) => setUsername(e.target.value)} />
              <input type="password" placeholder="Lösenord" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={handleLogin}>Logga in</button>
            </form>
          </div><div>
              <h1>Skapa konto</h1>
              <form>
                <input type="text" placeholder='Användarnamn' value={newUsername} onChange={(evt) => setNewUsername(evt.target.value)} />
                <input type="password" placeholder='Lösenord' value={newPassword} onChange={(evt) => setNewPassword(evt.target.value)} />
                <button type="button" onClick={handleRegister}>Skapa konto</button>
              </form>
            </div></> 
    )}
    
    </>
  );
}


export default App;
