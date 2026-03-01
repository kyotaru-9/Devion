import { Routes, Route } from 'react-router-dom';
import Rift from './pages/Rift';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Rift />} />
    </Routes>
  );
}

export default App;
