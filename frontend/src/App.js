import React, { useEffect, useState } from 'react';
import mediator from './services/mediator';
import api from './services/api';

function App() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // ejemplo: usar mediator para pedir al backend un saludo
    mediator.send({ type: 'GetGreeting', payload: { name: 'Mesero' }})
      .then(res => setGreeting(res))
      .catch(err => setGreeting('Error: ' + err.message));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Konrad Gourmet - Frontend (skeleton)</h1>
      <p>{greeting || 'Cargando...'}</p>
      <p>API base: {api.getBaseUrl()}</p>
    </div>
  );
}

export default App;
