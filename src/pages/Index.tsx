
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';

const Index = () => {
  // Como a rota "/" já renderiza o Dashboard através do App.tsx,
  // podemos simplesmente renderizar o componente Dashboard diretamente
  return <Dashboard />;
};

export default Index;
