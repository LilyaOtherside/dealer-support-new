import React from 'react';
import { useUser } from './lib/context/UserContext';
import './styles.css';

function App() {
  const { user, loading, error } = useUser();
  console.log('App render state:', { user, loading, error });

  if (loading) {
    return (
      <div className="container">
        <h2>Loading...</h2>
        <p>Please wait while we initialize the application</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2>Error occurred:</h2>
        <div className="error">
          <p>{error.message}</p>
          <p>Please make sure you're opening this app through Telegram</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <h2>Not authenticated</h2>
        <p>Please open this app through Telegram</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Welcome, {user.first_name}!</h1>
      {user.photo_url && (
        <img 
          src={user.photo_url} 
          alt={user.first_name} 
          className="avatar"
        />
      )}
    </div>
  );
}

export default App;