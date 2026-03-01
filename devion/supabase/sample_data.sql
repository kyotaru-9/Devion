-- Devion Sample Data

-- Note: Run schema.sql first, then this file

-- Insert sample courses (Codex Mode)
INSERT INTO public.courses (title, description, difficulty, estimated_hours, is_published) VALUES
  ('JavaScript Fundamentals', 'Master the basics of JavaScript programming including variables, functions, and control flow.', 'beginner', 20, true),
  ('Python for Beginners', 'Learn Python from scratch with hands-on exercises and real-world projects.', 'beginner', 25, true),
  ('Data Structures & Algorithms', 'Deep dive into essential data structures and algorithmic problem-solving.', 'intermediate', 40, true),
  ('React Mastery', 'Build modern web applications with React hooks, context, and best practices.', 'advanced', 35, true);

-- Insert modules for JavaScript course
INSERT INTO public.modules (course_id, title, description, order_index) VALUES
  ((SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals'), 'Getting Started', 'Introduction to JavaScript and development environment', 1),
  ((SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals'), 'Variables & Data Types', 'Understanding variables, primitives, and objects', 2),
  ((SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals'), 'Functions & Scope', 'Creating and using functions effectively', 3),
  ((SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals'), 'Control Flow', 'Conditionals, loops, and logic', 4);

-- Insert modules for Python course
INSERT INTO public.modules (course_id, title, description, order_index) VALUES
  ((SELECT id FROM public.courses WHERE title = 'Python for Beginners'), 'Python Basics', 'Your first Python programs', 1),
  ((SELECT id FROM public.courses WHERE title = 'Python for Beginners'), 'Control Structures', 'If statements and loops', 2),
  ((SELECT id FROM public.courses WHERE title = 'Python for Beginners'), 'Functions', 'Creating reusable code', 3);

-- Insert lessons for JavaScript - Getting Started module
INSERT INTO public.lessons (module_id, title, content, order_index) VALUES
  ((SELECT id FROM public.modules WHERE course_id = (SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals') AND order_index = 1), 'What is JavaScript?', 'JavaScript is a versatile programming language that powers the interactive web. Originally created in 1995, it has evolved to become one of the most popular languages in the world.', 1),
  ((SELECT id FROM public.modules WHERE course_id = (SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals') AND order_index = 1), 'Setting Up Your Environment', 'Learn how to set up a development environment with VS Code and browser developer tools.', 2),
  ((SELECT id FROM public.modules WHERE course_id = (SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals') AND order_index = 1), 'Your First Script', 'Write and execute your first JavaScript code.', 3);

-- Insert lessons for JavaScript - Variables module
INSERT INTO public.lessons (module_id, title, content, order_index) VALUES
  ((SELECT id FROM public.modules WHERE course_id = (SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals') AND order_index = 2), 'Variables and Constants', 'Learn about let, const, and var declarations.', 1),
  ((SELECT id FROM public.modules WHERE course_id = (SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals') AND order_index = 2), 'Primitive Types', 'Understanding string, number, boolean, null, and undefined.', 2),
  ((SELECT id FROM public.modules WHERE course_id = (SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals') AND order_index = 2), 'Working with Objects', 'Creating and manipulating objects in JavaScript.', 3);

-- Insert exercises
INSERT INTO public.exercises (lesson_id, title, description, instructions, starter_code, solution, test_cases, points) VALUES
  ((SELECT id FROM public.lessons WHERE module_id = (SELECT id FROM public.modules WHERE course_id = (SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals') AND order_index = 1) AND order_index = 3), 'Hello World', 'Write your first JavaScript program', 'Create a variable called message that contains the string "Hello, World!" and log it to the console.', '// Write your code here\n', 'const message = "Hello, World!";\nconsole.log(message);', '[{"input": "", "expected": "Hello, World!"}]', 10),
  ((SELECT id FROM public.lessons WHERE module_id = (SELECT id FROM public.modules WHERE course_id = (SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals') AND order_index = 2) AND order_index = 1), 'Variable Declaration', 'Practice declaring variables', 'Declare a constant called PI with the value 3.14159 and a variable called radius with value 5.', '// Declare your variables here\n', 'const PI = 3.14159;\nlet radius = 5;', '[{"input": "", "expected": "PI: 3.14159, radius: 5"}]', 15),
  ((SELECT id FROM public.lessons WHERE module_id = (SELECT id FROM public.modules WHERE course_id = (SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals') AND order_index = 2) AND order_index = 2), 'Type Conversion', 'Convert between types', 'Convert the string "42" to a number and add 8 to it.', 'const str = "42";\n// Convert and add here\n', 'const str = "42";\nconst num = Number(str);\nconst result = num + 8;\nconsole.log(result);', '[{"input": "", "expected": "50"}]', 20);

-- Insert Rift Mode challenges (created_by set to NULL for sample data)
INSERT INTO public.challenges (title, description, difficulty, category, starter_code, solution, test_cases, points, time_limit, created_by) VALUES
  ('FizzBuzz', 'Print numbers 1-100, but for multiples of 3 print "Fizz", for multiples of 5 print "Buzz", and for multiples of both print "FizzBuzz".', 'easy', 'Logic', '// Write your FizzBuzz solution\n', 'for (let i = 1; i <= 100; i++) {\n  if (i % 15 === 0) console.log("FizzBuzz");\n  else if (i % 3 === 0) console.log("Fizz");\n  else if (i % 5 === 0) console.log("Buzz");\n  else console.log(i);\n}', '[{"input": "1", "expected": "1"}, {"input": "3", "expected": "Fizz"}, {"input": "5", "expected": "Buzz"}, {"input": "15", "expected": "FizzBuzz"}]', 50, 300, NULL),
  ('Palindrome Checker', 'Check if a given string is a palindrome (reads the same forwards and backwards).', 'easy', 'Strings', 'function isPalindrome(str) {\n  // Your code here\n}\n', 'function isPalindrome(str) {\n  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return cleaned === cleaned.split("").reverse().join("");\n}', '[{"input": "racecar", "expected": "true"}, {"input": "hello", "expected": "false"}, {"input": "A man a plan a canal Panama", "expected": "true"}]', 30, 180, NULL),
  ('Two Sum', 'Given an array of numbers and a target, return indices of two numbers that add up to the target.', 'medium', 'Arrays', 'function twoSum(nums, target) {\n  // Return indices of two numbers that add up to target\n}\n', 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}', '[{"input": "[2,7,11,15], 9", "expected": "[0,1]"}, {"input": "[3,2,4], 6", "expected": "[1,2]"}]', 75, 600, NULL),
  ('Binary Search', 'Implement binary search to find a target in a sorted array.', 'medium', 'Algorithms', 'function binarySearch(arr, target) {\n  // Return index of target or -1 if not found\n}\n', 'function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}', '[{"input": "[1,2,3,4,5], 3", "expected": "2"}, {"input": "[1,2,3,4,5], 6", "expected": "-1"}]', 80, 600, NULL),
  ('Merge Intervals', 'Merge all overlapping intervals in the array.', 'hard', 'Algorithms', 'function merge(intervals) {\n  // Return merged intervals\n}\n', 'function merge(intervals) {\n  if (intervals.length <= 1) return intervals;\n  intervals.sort((a, b) => a[0] - b[0]);\n  const result = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    if (result[result.length - 1][1] >= intervals[i][0]) {\n      result[result.length - 1][1] = Math.max(result[result.length - 1][1], intervals[i][1]);\n    } else {\n      result.push(intervals[i]);\n    }\n  }\n  return result;\n}', '[{"input": "[[1,3],[2,6],[8,10],[15,18]]", "expected": "[[1,6],[8,10],[15,18]]"}]', 100, 900, NULL);

-- Insert Forge Mode challenges (created_by set to NULL for sample data)
INSERT INTO public.forge_challenges (title, description, difficulty, category, starter_code, solution, test_cases, constraints, examples, points, created_by) VALUES
  ('Reverse String', 'Write a function that reverses a string.', 'easy', 'Strings', 'function reverseString(s) {\n  // Return reversed string\n}\n', 'function reverseString(s) {\n  return s.split("").reverse().join("");\n}', '[{"input": "hello", "output": "olleh"}, {"input": "JavaScript", "output": "tpircSavaJ"}]', '1 <= s.length <= 10^5', '[{"input": "hello", "output": "olleh"}]', 50, NULL),
  ('Valid Parentheses', 'Determine if input string has valid parentheses.', 'medium', 'Stacks', 'function isValid(s) {\n  // Return true if valid, false otherwise\n}\n', 'function isValid(s) {\n  const stack = [];\n  const map = { ")": "(", "}": "{", "]": "[" };\n  for (const char of s) {\n    if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}', '[{"input": "()", "output": "true"}, {"input": "()[]{}", "output": "true"}, {"input": "(]", "output": "false"}]', '1 <= s.length <= 10^4', '[{"input": "()", "output": "true"}, {"input": "(]", "output": "false"}]', 100, NULL),
  ('Longest Substring', 'Find length of longest substring without repeating characters.', 'hard', 'Sliding Window', 'function lengthOfLongestSubstring(s) {\n  // Return the length\n}\n', 'function lengthOfLongestSubstring(s) {\n  const seen = new Map();\n  let start = 0, maxLen = 0;\n  for (let end = 0; end < s.length; end++) {\n    if (seen.has(s[end])) {\n      start = Math.max(start, seen.get(s[end]) + 1);\n    }\n    seen.set(s[end], end);\n    maxLen = Math.max(maxLen, end - start + 1);\n  }\n  return maxLen;\n}', '[{"input": "abcabcbb", "output": "3"}, {"input": "bbbbb", "output": "1"}]', '0 <= s.length <= 5 * 10^4', '[{"input": "abcabcbb", "output": "3"}]', 150, NULL);
