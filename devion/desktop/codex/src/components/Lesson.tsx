import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Lesson {
  id: string;
  title: string;
  content: string;
  order_index: number;
}

function Lesson() {
  const { courseId, moduleId, lessonId } = useParams<{ courseId: string; moduleId: string; lessonId?: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const currentIndex = lessons.findIndex(l => l.id === lesson?.id);
  const hasNext = currentIndex < lessons.length - 1;
  const hasPrev = currentIndex > 0;
  const nextLesson = hasNext ? lessons[currentIndex + 1] : null;

  useEffect(() => {
    if (!moduleId) return;
    
    fetch(`${API_BASE}/api/courses/${courseId}/modules/${moduleId}/lessons`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLessons(data);
          if (lessonId) {
            const found = data.find((l: Lesson) => l.id === lessonId);
            if (found) setLesson(found);
          } else if (data.length > 0) {
            setLesson(data[0]);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId, moduleId, lessonId]);

  const handleNext = () => {
    if (nextLesson) {
      navigate(`/courses/${courseId}/modules/${moduleId}/lessons/${nextLesson.id}`);
    }
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'ol') {
          elements.push(
            <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 ml-4 my-4">
              {listItems.map((item, i) => (
                <li key={i} className="text-dark-300">{item}</li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 ml-4 my-4">
              {listItems.map((item, i) => (
                <li key={i} className="text-dark-300">{item}</li>
              ))}
            </ul>
          );
        }
        listItems = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          flushList();
          inCodeBlock = true;
          codeContent = [];
        } else {
          elements.push(
            <pre key={`code-${elements.length}`} className="bg-dark-950 rounded-xl p-4 my-4 overflow-x-auto border border-dark-700">
              <code className="text-sm font-mono text-blue-400">{codeContent.join('\n')}</code>
            </pre>
          );
          inCodeBlock = false;
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      if (line.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={index} className="text-3xl font-bold text-white mt-8 mb-4">{line.slice(2)}</h1>);
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={index} className="text-2xl font-bold text-white mt-6 mb-3">{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={index} className="text-xl font-semibold text-blue-400 mt-4 mb-2">{line.slice(4)}</h3>);
      } else if (line.startsWith('- **')) {
        flushList();
        const match = line.match(/^- \*\*([^*]+)\*\*:?\s*(.*)$/);
        if (match) {
          elements.push(
            <div key={index} className="flex items-start gap-2 my-2">
              <span className="text-blue-400 mt-1">▹</span>
              <span className="text-white font-bold">{match[1]}</span>
              <span className="text-dark-400">{match[2]}</span>
            </div>
          );
        }
      } else if (line.startsWith('- ')) {
        if (listType !== 'ul') flushList();
        listType = 'ul';
        listItems.push(line.slice(2));
      } else if (/^\d+\.\s/.test(line)) {
        if (listType !== 'ol') flushList();
        listType = 'ol';
        listItems.push(line.replace(/^\d+\.\s/, ''));
      } else if (line.trim() === '') {
        flushList();
      } else {
        flushList();
        let processedLine = line;
        processedLine = processedLine.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
        elements.push(
          <p 
            key={index} 
            className="text-dark-300 leading-relaxed my-2"
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        );
      }
    });

    flushList();
    return elements;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <header className="bg-dark-800/50 border-b border-dark-700 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-dark-700" />
            <div className="space-y-2">
              <div className="w-32 h-5 rounded bg-dark-700" />
              <div className="w-24 h-4 rounded bg-dark-700" />
            </div>
          </div>
        </header>
        <div className="flex">
          <aside className="w-72 bg-dark-800/50 border-r border-dark-700 p-4">
            <div className="space-y-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-dark-700" />
                  <div className="w-24 h-4 rounded bg-dark-700" />
                </div>
              ))}
            </div>
          </aside>
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="w-3/4 h-8 rounded bg-dark-700" />
              <div className="w-full h-4 rounded bg-dark-700" />
              <div className="w-full h-4 rounded bg-dark-700" />
              <div className="w-5/6 h-4 rounded bg-dark-700" />
              <div className="w-1/2 h-32 rounded bg-dark-700 mt-6" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <header className="bg-dark-800/50 backdrop-blur-sm border-b border-dark-700 px-6 py-4">
        <Link to={`/courses/${courseId}`} className="flex items-center gap-2 text-dark-400 hover:text-white mb-3 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
            <Play className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{lesson?.title || 'Lesson'}</h1>
            <p className="text-sm text-dark-400">{lessons.length} lessons in this module</p>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-72 bg-dark-800/50 border-r border-dark-700 p-4">
          <h3 className="text-sm font-semibold text-dark-400 mb-4 uppercase tracking-wider">Lessons</h3>
          <div className="space-y-2">
            {lessons.map((l, index) => (
              <Link
                key={l.id}
                to={`/courses/${courseId}/modules/${moduleId}/lessons/${l.id}`}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  lesson?.id === l.id
                    ? 'bg-blue-500/20 border border-blue-500/30 text-white'
                    : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                  lesson?.id === l.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-dark-700 text-dark-400'
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm font-medium truncate flex-1">{l.title}</span>
                {lesson?.id === l.id && <ChevronRight className="w-4 h-4 text-blue-400" />}
              </Link>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-8">
          {lesson ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-8 border border-dark-700">
                {renderContent(lesson.content || 'No content available.')}
              </div>
              <div className="mt-8 flex items-center justify-between">
                <div className="flex gap-3">
                  {hasPrev && (
                    <Link
                      to={`/courses/${courseId}/modules/${moduleId}/lessons/${lessons[currentIndex - 1].id}`}
                      className="flex items-center gap-2 px-4 py-3 bg-dark-700 text-white rounded-xl font-medium hover:bg-dark-600 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Previous
                    </Link>
                  )}
                  {hasNext ? (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25"
                    >
                      Next Lesson
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25">
                      <Play className="w-5 h-5" />
                      Start Exercise
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-dark-500">
                  <span>Lesson {currentIndex + 1} of {lessons.length}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-dark-400">Select a lesson to begin.</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default Lesson;
