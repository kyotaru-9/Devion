import { useState } from 'react';

function Download() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert('Download started! If not, check your downloads folder.');
    }, 1500);
  };

  return (
    <section className="download" id="download">
      <h3 className="section-title">Download</h3>
      <div className="download-content">
        <p className="download-text">
          Get started with Devion Desktop today. It's free and open source.
        </p>
        <button
          className={`download-btn-large ${downloading ? 'loading' : ''}`}
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? 'Preparing Download...' : 'Download for Windows'}
        </button>
        <p className="download-info">v1.0.0 • Windows 10/11 • 64-bit</p>
      </div>
    </section>
  );
}

export default Download;
