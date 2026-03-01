import { Routes, Route } from 'react-router-dom';
import Forge from './pages/Forge';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Forge />} />
    </Routes>
  );
}

export default App;
