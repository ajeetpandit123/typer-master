export interface CodingLesson {
  id: string;
  level: number;
  language: 'javascript' | 'java' | 'cpp';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  description: string;
  code: string;
}

export interface Challenge {
  id: string;
  level: number;
  title: string;
  description: string;
  text: string;
  targetWpm: number;

  targetAccuracy: number;
  timeLimit: number; // in seconds
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: 'motivation' | 'business' | 'technology' | 'leadership' | 'education' | 'philosophy';
  lengthCategory: 'short' | 'medium' | 'long';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  conditionType: 'first_lesson' | 'wpm_50' | 'wpm_100' | 'streak_7' | 'streak_30' | 'challenge_20' | 'battle_win';
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_lesson', title: 'First Steps', description: 'Complete your first letter lesson', icon: 'BookOpen', xpReward: 100, conditionType: 'first_lesson' },
  { id: 'wpm_50', title: 'Speed Demon', description: 'Achieve 50 Words Per Minute in a test', icon: 'Zap', xpReward: 250, conditionType: 'wpm_50' },
  { id: 'wpm_100', title: 'Hyper Sonic', description: 'Achieve 100 Words Per Minute in a test', icon: 'Flame', xpReward: 500, conditionType: 'wpm_100' },
  { id: 'streak_7', title: 'Consistent Typist', description: 'Maintain a 7-day practice streak', icon: 'CalendarDays', xpReward: 300, conditionType: 'streak_7' },
  { id: 'streak_30', title: 'Unstoppable Force', description: 'Maintain a 30-day practice streak', icon: 'Trophy', xpReward: 1000, conditionType: 'streak_30' },
  { id: 'challenge_20', title: 'Grandmaster', description: 'Unlock and complete Challenge Level 20', icon: 'ShieldAlert', xpReward: 800, conditionType: 'challenge_20' },
  { id: 'battle_win', title: 'Arena Champion', description: 'Win a multiplayer typing battle', icon: 'Sword', xpReward: 400, conditionType: 'battle_win' },
];

export const CODING_LESSONS: CodingLesson[] = [
  // JavaScript
  {
    id: 'js-1', level: 1, language: 'javascript', difficulty: 'Beginner',
    title: 'Variables and Constants',
    description: 'Learn to declare standard variables and constants using let and const.',
    code: `const username = "TypeMaster";\nlet currentScore = 150;\nlet isWinner = false;\nconsole.log(username, currentScore);`
  },
  {
    id: 'js-2', level: 2, language: 'javascript', difficulty: 'Beginner',
    title: 'Conditional Statements',
    description: 'Use if-else checks to implement logic gates.',
    code: `if (accuracy >= 98 && wpm > 60) {\n  console.log("Excellent job!");\n} else {\n  console.log("Keep practicing.");\n}`
  },
  {
    id: 'js-3', level: 3, language: 'javascript', difficulty: 'Beginner',
    title: 'Standard Functions',
    description: 'Define and invoke functions with return items.',
    code: `function calculateWpm(chars, minutes) {\n  const words = chars / 5;\n  return Math.round(words / minutes);\n}`
  },
  {
    id: 'js-4', level: 4, language: 'javascript', difficulty: 'Intermediate',
    title: 'Array Mapping',
    description: 'Manipulate lists using array iteration functions.',
    code: `const words = ["code", "type", "speed"];\nconst uppercaseWords = words.map(word => {\n  return word.toUpperCase();\n});`
  },
  {
    id: 'js-5', level: 5, language: 'javascript', difficulty: 'Intermediate',
    title: 'Async Fetch Request',
    description: 'Fetch data asynchronously from endpoints.',
    code: `async function fetchQuotes() {\n  const response = await fetch("/api/quotes");\n  const data = await response.json();\n  return data.results;\n}`
  },
  {
    id: 'js-6', level: 6, language: 'javascript', difficulty: 'Advanced',
    title: 'ES6 Classes and Prototypes',
    description: 'Define classes, constructors, methods, and getters.',
    code: `class TypingRoom {\n  constructor(id, players) {\n    this.id = id;\n    this.players = players;\n  }\n  get playerCount() {\n    return this.players.length;\n  }\n}`
  },
  {
    id: 'js-7', level: 7, language: 'javascript', difficulty: 'Advanced',
    title: 'Singleton Design Pattern',
    description: 'Implement a strict Singleton manager instance.',
    code: `class DatabaseService {\n  constructor() {\n    if (DatabaseService.instance) {\n      return DatabaseService.instance;\n    }\n    DatabaseService.instance = this;\n  }\n}`
  },

  // Java
  {
    id: 'java-1', level: 1, language: 'java', difficulty: 'Beginner',
    title: 'Main Entry Point',
    description: 'Standard Java main method structure and console logging.',
    code: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Typist!");\n    }\n}`
  },
  {
    id: 'java-2', level: 2, language: 'java', difficulty: 'Beginner',
    title: 'ArrayList Operations',
    description: 'Use dynamic lists for adding and accessing details.',
    code: `ArrayList<String> lobby = new ArrayList<>();\nlobby.add("player1");\nlobby.add("player2");\nSystem.out.println(lobby.get(0));`
  },
  {
    id: 'java-3', level: 3, language: 'java', difficulty: 'Intermediate',
    title: 'Exception Handling',
    description: 'Handle run-time bugs and failures gracefully.',
    code: `try {\n    int result = charsCount / duration;\n} catch (ArithmeticException e) {\n    System.out.println("Error: " + e.getMessage());\n}`
  },
  {
    id: 'java-4', level: 4, language: 'java', difficulty: 'Intermediate',
    title: 'Java Interfaces',
    description: 'Declare interface abstractions and enforce signatures.',
    code: `interface Competitor {\n    int getSpeed();\n    double getAccuracy();\n    void recordMatch(int score);\n}`
  },
  {
    id: 'java-5', level: 5, language: 'java', difficulty: 'Advanced',
    title: 'Binary Search Implementation',
    description: 'Write an optimized divide-and-conquer search algorithm.',
    code: `public int search(int[] arr, int target) {\n    int low = 0, high = arr.length - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`
  },
  {
    id: 'java-6', level: 6, language: 'java', difficulty: 'Advanced',
    title: 'Multithreading and Runnable',
    description: 'Launch standard threads to process background actions.',
    code: `Runnable runRace = () -> {\n    System.out.println("Race Thread Running");\n};\nThread thread = new Thread(runRace);\nthread.start();`
  },

  // C++
  {
    id: 'cpp-1', level: 1, language: 'cpp', difficulty: 'Beginner',
    title: 'Input Output Streams',
    description: 'Basic C++ template using standard header libraries.',
    code: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Ready to Type!" << endl;\n    return 0;\n}`
  },
  {
    id: 'cpp-2', level: 2, language: 'cpp', difficulty: 'Beginner',
    title: 'Pointers and Memory Addresses',
    description: 'Referencing memory addresses directly.',
    code: `int score = 95;\nint* ptr = &score;\ncout << "Value: " << *ptr << endl;\ncout << "Address: " << ptr << endl;`
  },
  {
    id: 'cpp-3', level: 3, language: 'cpp', difficulty: 'Intermediate',
    title: 'Vectors and Iteration',
    description: 'Declare vectors and iterate with reference references.',
    code: `#include <vector>\nvector<int> speeds = {55, 72, 90};\nfor (int speed : speeds) {\n    cout << speed << " ";\n}`
  },
  {
    id: 'cpp-4', level: 4, language: 'cpp', difficulty: 'Intermediate',
    title: 'Smart Pointers (std::unique_ptr)',
    description: 'Manage dynamic memory allocation safely without memory leaks.',
    code: `#include <memory>\nstd::unique_ptr<int> value = std::make_unique<int>(100);\nstd::cout << *value << std::endl;`
  },
  {
    id: 'cpp-5', level: 5, language: 'cpp', difficulty: 'Advanced',
    title: 'Template Functions',
    description: 'Write generic functions using templates.',
    code: `template <typename T>\nT findMax(T a, T b) {\n    return (a > b) ? a : b;\n}`
  },
  {
    id: 'cpp-6', level: 6, language: 'cpp', difficulty: 'Advanced',
    title: 'Recursive QuickSort Partition',
    description: 'Quicksort partitioning step using direct references.',
    code: `int partition(int arr[], int low, int high) {\n    int pivot = arr[high];\n    int i = (low - 1);\n    for (int j = low; j <= high - 1; j++) {\n        if (arr[j] < pivot) {\n            i++;\n            swap(arr[i], arr[j]);\n        }\n    }\n    swap(arr[i + 1], arr[high]);\n    return (i + 1);\n}`
  },
  {
    id: 'cpp-7', level: 7, language: 'cpp', difficulty: 'Advanced',
    title: 'Fast I/O Performance',
    description: 'Optimize input-output stream speeds for algorithmic competitive programming.',
    code: `void optimizeIO() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n}`
  }
];

export const CHALLENGES: Challenge[] = Array.from({ length: 20 }, (_, index) => {
  const level = index + 1;
  const speedTarget = 20 + level * 4; // Level 1: 24 WPM, Level 20: 100 WPM
  const accuracyTarget = 80 + Math.min(18, Math.floor(level / 1.2)); // Level 1: 80%, Level 20: 96%
  const timeLimit = Math.max(20, 90 - level * 3); // Level 1: 87s, Level 20: 30s

  const texts = [
    "A simple beginning to test your alignment. Place your index fingers on J and F keys.",
    "Slow and steady wins the race. Maintain high focus on typing letters correctly before gaining speed.",
    "Moving up! Let's practice simple words such as standard home row letters: asdf, jkl; and short words.",
    "To reach success, consistency is essential. Build the habit of practicing typing routines daily.",
    "Typing speed increases naturally as finger memory develops. Never look down at the keyboard keys while practicing.",
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter in the alphabet.",
    "Intermediate typing requires utilizing capitalization. Hold the Shift key with your opposite hand.",
    "Numbers are positioned on the top row. Try typing: 12345, 67890. Keep your wrists hovering comfortably.",
    "Punctuation adds clarity. Use commas, periods, and semicolons correctly: let's do this, okay?",
    "Software engineers type special characters often. Parentheses (like these) and braces {like this} are common.",
    "Excellent speed is achieved through muscle memory. Let the hands flow over the keyboard without thinking.",
    "Advanced typing requires speed, precision, and endurance. Keep your target accuracy high above ninety percent.",
    "Look ahead at the next word! While typing the current word, your eyes should already scan the upcoming characters.",
    "Challenge your limits! Focus on the rhythm of your typing rather than the speed. Smooth is fast, and fast is smooth.",
    "Programmers need to master symbols: &&, ||, ++, --, ==, !=, +=, -=, *=, /=. Practice these double combinations.",
    "Can you handle complex syntax? Check this out: function test() { return Math.max(a, b); }",
    "Patience is a virtue, and practice is the path. Consistency beats intensity every single time. Keep pushing!",
    "Only three levels left. The speed target is intense, and the accuracy threshold leaves almost no room for errors.",
    "Precision is paramount. Every single misstep will drastically drag your typing speed down. Remain perfectly focused.",
    "Congratulations on reaching Level 20! Prove you are a true TypeMaster by finishing this final extreme speedrun challenge."
  ];

  return {
    id: `challenge-${level}`,
    level,
    title: `Level ${level}: ${getLevelName(level)}`,
    description: `Target Speed: ${speedTarget} WPM. Target Accuracy: ${accuracyTarget}%. Time Limit: ${timeLimit}s.`,
    text: texts[index] || "Default typing challenge text.",
    targetWpm: speedTarget,
    targetAccuracy: accuracyTarget,
    timeLimit
  };
});

function getLevelName(level: number): string {
  if (level <= 5) return 'Initiation';
  if (level <= 10) return 'Apprentice';
  if (level <= 15) return 'Specialist';
  return 'Grandmaster';
}

export const QUOTES: Quote[] = [
  // Short (10-30 words)
  {
    id: 'q-1',
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    category: "philosophy",
    lengthCategory: "short"
  },
  {
    id: 'q-2',
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    category: "technology",
    lengthCategory: "short"
  },
  {
    id: 'q-3',
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
    category: "motivation",
    lengthCategory: "short"
  },
  {
    id: 'q-4',
    text: "The details are not the details. They make the design.",
    author: "Charles Eames",
    category: "business",
    lengthCategory: "short"
  },
  {
    id: 'q-5',
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "leadership",
    lengthCategory: "short"
  },

  // Medium (30-80 words)
  {
    id: 'q-6',
    text: "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma, which is living with the results of other people's thinking. Don't let the noise of others' opinions drown out your own inner voice.",
    author: "Steve Jobs",
    category: "technology",
    lengthCategory: "medium"
  },
  {
    id: 'q-7',
    text: "Learn from yesterday, live for today, hope for tomorrow. The important thing is not to stop questioning. Curiosity has its own reason for existing. One cannot help but be in awe when he contemplates the mysteries of eternity.",
    author: "Albert Einstein",
    category: "philosophy",
    lengthCategory: "medium"
  },
  {
    id: 'q-8',
    text: "First, solve the problem. Then, write the code. Don't get caught up in the details before you understand the broad architecture of your solution. Software engineering is a discipline of structured logic.",
    author: "John Johnson",
    category: "education",
    lengthCategory: "medium"
  },
  {
    id: 'q-9',
    text: "Great things in business are never done by one person. They're done by a team of people. True leadership lies in empowering others to work together, leveraging their unique individual strengths to achieve a unified vision.",
    author: "Steve Jobs",
    category: "business",
    lengthCategory: "medium"
  },
  {
    id: 'q-10',
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit. Daily improvement, no matter how small, compounds into massive gains over time. Maintain focus and stay dedicated to your journey.",
    author: "Aristotle",
    category: "motivation",
    lengthCategory: "medium"
  },

  // Long (80+ words)
  {
    id: 'q-11',
    text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart, you'll know when you find it. And, like any great relationship, it just gets better and better as the years roll on. So keep looking until you find it. Don't settle, because settle is the enemy of excellence.",
    author: "Steve Jobs",
    category: "motivation",
    lengthCategory: "long"
  },
  {
    id: 'q-12',
    text: "It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood; who strives valiantly; who errs, who comes short again and again, because there is no effort without error and shortcoming; but who does actually strive to do the deeds; who knows great enthusiasms, the great devotions; who spends himself in a worthy cause.",
    author: "Theodore Roosevelt",
    category: "leadership",
    lengthCategory: "long"
  },
  {
    id: 'q-13',
    text: "Computer science is no more about computers than astronomy is about telescopes. It is about information, algorithms, and computational methods. Coding is a form of digital expression, turning thoughts and logical systems into reality. As a software programmer, typing is your direct physical interface to the digital world. Master it to bridge the gap between human imagination and computer execution with maximum bandwidth and speed.",
    author: "Edsger W. Dijkstra",
    category: "technology",
    lengthCategory: "long"
  }
];
