function Modes() {
  const modes = [
    {
      title: 'Codex Mode',
      description: 'Browse and explore documentation with ease.',
      icon: '📚'
    },
    {
      title: 'Rift Mode',
      description: 'Connect and collaborate with other developers.',
      icon: '🔗'
    },
    {
      title: 'Forge Mode',
      description: 'Build and deploy your projects seamlessly.',
      icon: '🔨'
    }
  ];

  return (
    <section className="modes" id="modes">
      <h3 className="section-title">Modes</h3>
      <div className="modes-grid">
        {modes.map((mode, index) => (
          <div key={index} className="mode-card">
            <span className="mode-icon">{mode.icon}</span>
            <h4>{mode.title}</h4>
            <p>{mode.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Modes;
