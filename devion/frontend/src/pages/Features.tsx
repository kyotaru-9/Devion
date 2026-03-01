function Features() {
  const features = [
    {
      title: 'Code Editor',
      description: 'Powerful built-in code editor with syntax highlighting and IntelliSense.',
      color: '#6366f1'
    },
    {
      title: 'Project Management',
      description: 'Organize your projects with built-in management tools.',
      color: '#a855f7'
    },
    {
      title: 'Fast & Secure',
      description: 'Built with performance and security in mind. Your code stays safe.',
      color: '#ec4899'
    }
  ];

  return (
    <section className="features" id="features">
      <h3 className="section-title">Features</h3>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <h4 style={{ color: feature.color }}>{feature.title}</h4>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
