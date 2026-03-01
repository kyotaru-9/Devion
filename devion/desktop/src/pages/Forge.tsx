import { useState } from 'react';
import { ArrowLeft, Hammer, Code, Clock, CheckCircle, XCircle } from 'lucide-react';

function Forge() {
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [code, setCode] = useState('// Write your solution here\n\n');

  const challenges = [
    { id: '1', title: 'Two Sum', difficulty: 'Easy', category: 'Arrays', acceptance: '49%', submissions: 15420 },
    { id: '2', title: 'Valid Parentheses', difficulty: 'Easy', category: 'Stack', acceptance: '40%', submissions: 12350 },
    { id: '3', title: 'Merge Two Sorted Lists', difficulty: 'Easy', category: 'Linked List', acceptance: '62%', submissions: 9870 },
    { id: '4', title: 'Maximum Subarray', difficulty: 'Medium', category: 'Dynamic Programming', acceptance: '50%', submissions: 8540 },
    { id: '5', title: 'Container With Most Water', difficulty: 'Medium', category: 'Two Pointers', acceptance: '54%', submissions: 7890 },
  ];

  const testResults = [
    { id: 1, input: '[2,7,11,15], 9', expected: '[0,1]', actual: '[0,1]', passed: true },
    { id: 2, input: '[3,2,4], 6', expected: '[1,2]', actual: '[1,2]', passed: true },
    { id: 3, input: '[3,3], 6', expected: '[0,1]', actual: '[0,1]', passed: true },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
        <div className="flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-dark-400" />
          </a>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Forge</h1>
              <p className="text-sm text-dark-400">Master algorithms with LeetCode-style challenges</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <aside className="w-80 bg-dark-800 border-r border-dark-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-4">Challenges</h2>
            <div className="space-y-2">
              {challenges.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => setSelectedChallenge(challenge.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedChallenge === challenge.id
                      ? 'bg-orange-500/20 border border-orange-500/30'
                      : 'hover:bg-dark-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">{challenge.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      challenge.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      challenge.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <div className="text-xs text-dark-400">
                    {challenge.category} • {challenge.acceptance} acceptance
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          {selectedChallenge ? (
            <>
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Two Sum</h2>
                  <p className="text-dark-400">
                    Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
                  </p>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 mb-6">
                  <h3 className="text-sm font-semibold text-white mb-3">Example 1:</h3>
                  <pre className="text-sm text-dark-300 font-mono">
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
                  </pre>
                </div>
              </div>

              <div className="h-80 border-t border-dark-700 flex">
                <div className="flex-1 flex flex-col">
                  <div className="bg-dark-800 px-4 py-2 border-b border-dark-700 flex items-center justify-between">
                    <span className="text-sm text-dark-400 flex items-center gap-2">
                      <Code className="w-4 h-4" /> JavaScript
                    </span>
                    <button className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors">
                      Run Code
                    </button>
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 bg-dark-900 p-4 text-dark-200 font-mono text-sm resize-none focus:outline-none"
                    spellCheck={false}
                  />
                </div>

                <div className="w-80 border-l border-dark-700 bg-dark-800 flex flex-col">
                  <div className="px-4 py-2 border-b border-dark-700">
                    <span className="text-sm font-medium text-white">Test Results</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {testResults.map((result) => (
                      <div key={result.id} className="flex items-center gap-3 text-sm">
                        {result.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-dark-300">Case {result.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-dark-400">
              Select a challenge to start coding
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Forge;
