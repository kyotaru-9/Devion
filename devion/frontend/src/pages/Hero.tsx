import { useState } from 'react';

function Hero() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert('Download started! If not, check your downloads folder.');
    }, 1500);
  };

  return (
    <section className="hero">
      <h2 className="title">Devion Desktop</h2>
      <p className="subtitle">
        The ultimate development environment. Code, build, and deploy—all from your desktop.
      </p>
      <button
        className={`download-btn ${downloading ? 'loading' : ''}`}
        onClick={handleDownload}
        disabled={downloading}
      >
        {downloading ? 'Preparing Download...' : 'Download for Windows'}
      </button>
      <p className="version">v1.0.0 • Windows 10/11 • Free</p>
    </section>
  );
}

export default Hero;
