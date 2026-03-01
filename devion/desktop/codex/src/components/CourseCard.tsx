import 'bootstrap-icons/font/bootstrap-icons.css';

interface CourseCardProps {
  title: string;
  description: string;
  difficulty: string;
  icon?: string;
  onClick?: () => void;
}

const iconMap: Record<string, string> = {
  javascript: 'bi-filetype-js',
  typescript: 'bi-filetype-ts',
  python: 'bi-filetype-py',
  java: 'bi-filetype-java',
  csharp: 'bi-filetype-cs',
  cpp: 'bi-filetype-cpp',
  c: 'bi-filetype-c',
  go: 'bi-filetype-go',
  rust: 'bi-filetype-rs',
  ruby: 'bi-filetype-rb',
  php: 'bi-filetype-php',
  swift: 'bi-filetype-swift',
  kotlin: 'bi-filetype-kt',
  html: 'bi-filetype-html',
  css: 'bi-filetype-css',
  sql: 'bi-filetype-sql',
  bash: 'bi-terminal',
  shell: 'bi-terminal',
  default: 'bi-code-slash',
};

function CourseCard({ title, description, difficulty, icon, onClick }: CourseCardProps) {
  const getIconClass = (iconName?: string) => {
    if (!iconName) return iconMap.default;
    const key = iconName.toLowerCase();
    return iconMap[key] || iconMap.default;
  };

  return (
    <div
      onClick={onClick}
      className="group bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-blue-500/50 hover:bg-dark-750 transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-dark-600 group-hover:border-blue-500/30 transition-colors mb-4">
          <i className={`${getIconClass(icon)} text-blue-400`} style={{ fontSize: '2rem' }}></i>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-100 transition-colors">{title}</h3>
        <p className="text-sm text-dark-400 mb-4 line-clamp-2">{description}</p>
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
          difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
          difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {difficulty}
        </span>
      </div>
      <i className="bi bi-chevron-right absolute bottom-4 right-4 text-dark-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" style={{ fontSize: '1.25rem' }}></i>
    </div>
  );
}

export default CourseCard;
