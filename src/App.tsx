import { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

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
        alert('Du lyckades logga in')
        setUsername('')
        setPassword('')
      } else {
        alert('Inloggning misslyckades')
        setUsername('')
        setPassword('')
      }
    } catch (error) {
      alert('Inloggning misslyckades')
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
        alert('Användaren ('+(newUsername)+') skapades');
        setNewUsername('')
        setNewPassword('')
      } else {
        alert('Användarnamnet är upptaget');
        setNewUsername('')
        setNewPassword('')
      }
    } catch (error) {
      alert('Ett fel uppstod:');
      setNewUsername('')
      setNewPassword('')
    }
  };

  return (
    <>
    <div>
      <h1>Inloggning</h1>
      <form>
        <input type="text" placeholder="Användarnamn" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Lösenord" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        <button type="button" onClick={handleLogin}>Logga in</button>
      </form>
    </div>
    <div>
      <h1>Skapa konto</h1>
      <form>
        <input type ="text" placeholder='Användarnamn' value ={newUsername} onChange={(evt) => setNewUsername(evt.target.value)} />
        <input type ="password" placeholder='Lösenord' value ={newPassword} onChange={(evt) => setNewPassword(evt.target.value)} />
        <button type="button" onClick={handleRegister}>Skapa konto</button>
      </form>
    </div> 
    </>
  );
}

export default App;
