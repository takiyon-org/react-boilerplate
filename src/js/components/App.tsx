import React from 'react';

interface AppProps {
  name: string;
}

function App({ name }: AppProps) {
  return <h1>{`Hello, ${name}!`}</h1>;
}

export default App;
