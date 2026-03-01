import Header from './components/Header';
import Hero from './pages/Hero';
import Features from './pages/Features';
import Modes from './pages/Modes';
import Download from './pages/Download';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <Header />
      <Hero />
      <Features />
      <Modes />
      <Download />
      <Footer />
    </div>
  );
}

export default App;
