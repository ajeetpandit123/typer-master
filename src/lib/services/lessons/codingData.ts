import { CodingLesson } from '../mockData';

export const CODING_LESSONS_DATA: CodingLesson[] = [
  // --- JAVASCRIPT (35 lessons) ---
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
  {
    id: 'js-8', level: 8, language: 'javascript', difficulty: 'Beginner',
    title: 'Template Literals',
    description: 'Use backticks to format dynamic strings.',
    code: `const name = "Ajeet";\nconst stats = \`Typist \${name} has reached level \${10 + 2}!\`;\nconsole.log(stats);`
  },
  {
    id: 'js-9', level: 9, language: 'javascript', difficulty: 'Beginner',
    title: 'Arrow Functions',
    description: 'Use the ES6 arrow function syntax for shorter definitions.',
    code: `const add = (a, b) => a + b;\nconst square = x => x * x;\nconsole.log(add(10, 5), square(9));`
  },
  {
    id: 'js-10', level: 10, language: 'javascript', difficulty: 'Beginner',
    title: 'Logical OR Operator',
    description: 'Fallback variables using double vertical lines.',
    code: `const config = userConfig || {};\nconst theme = config.theme || "dark";\nconsole.log("Active theme: " + theme);`
  },
  {
    id: 'js-11', level: 11, language: 'javascript', difficulty: 'Intermediate',
    title: 'Object Destructuring',
    description: 'Extract fields directly from an object configuration.',
    code: `const user = { id: 102, profile: { name: "Bob", speed: 70 } };\nconst { id, profile: { name, speed } } = user;\nconsole.log(id, name, speed);`
  },
  {
    id: 'js-12', level: 12, language: 'javascript', difficulty: 'Intermediate',
    title: 'Array Filter method',
    description: 'Get sub-lists matching filters.',
    code: `const scores = [45, 88, 92, 54, 110];\nconst proScores = scores.filter(score => score >= 80);\nconsole.log(proScores);`
  },
  {
    id: 'js-13', level: 13, language: 'javascript', difficulty: 'Intermediate',
    title: 'Object Keys Iteration',
    description: 'Map over keys in a dictionary configuration.',
    code: `const stats = { speed: 82, accuracy: 98, errors: 3 };\nObject.keys(stats).forEach(key => {\n  console.log(\`\${key}: \${stats[key]}\`);\n});`
  },
  {
    id: 'js-14', level: 14, language: 'javascript', difficulty: 'Intermediate',
    title: 'setTimeout and Intervals',
    description: 'Execute function asynchronously after elapsed time.',
    code: `let count = 0;\nconst interval = setInterval(() => {\n  count++;\n  if (count >= 5) clearInterval(interval);\n}, 1000);`
  },
  {
    id: 'js-15', level: 15, language: 'javascript', difficulty: 'Intermediate',
    title: 'Promise Declarations',
    description: 'Initialize a custom async promise.',
    code: `const delay = ms => new Promise(resolve => setTimeout(resolve, ms));\ndelay(500).then(() => console.log("Delay finished!"));`
  },
  {
    id: 'js-16', level: 16, language: 'javascript', difficulty: 'Intermediate',
    title: 'Array Reduce accumulator',
    description: 'Combine all list items into a single summary.',
    code: `const WPMs = [70, 75, 80, 85];\nconst average = WPMs.reduce((sum, val) => sum + val, 0) / WPMs.length;\nconsole.log(average);`
  },
  {
    id: 'js-17', level: 17, language: 'javascript', difficulty: 'Intermediate',
    title: 'Optional Chaining',
    description: 'Read deep properties safely without throwing errors.',
    code: `const user = { details: null };\nconst phone = user?.details?.phone || "No phone number configured";\nconsole.log(phone);`
  },
  {
    id: 'js-18', level: 18, language: 'javascript', difficulty: 'Intermediate',
    title: 'Nullish Coalescing',
    description: 'Fallback selectively for undefined or null only.',
    code: `const score = 0;\nconst defaultScore = score ?? 50;\nconsole.log("User score:", defaultScore); // prints 0`
  },
  {
    id: 'js-19', level: 19, language: 'javascript', difficulty: 'Intermediate',
    title: 'Spread Syntax Arrays',
    description: 'Concatenate lists cleanly.',
    code: `const listA = [1, 2];\nconst listB = [3, 4];\nconst combined = [...listA, ...listB, 5];\nconsole.log(combined);`
  },
  {
    id: 'js-20', level: 20, language: 'javascript', difficulty: 'Intermediate',
    title: 'Spread Syntax Objects',
    description: 'Merge or clone attributes cleanly.',
    code: `const base = { theme: 'dark', sound: true };\nconst userSettings = { ...base, sound: false, volume: 80 };\nconsole.log(userSettings);`
  },
  {
    id: 'js-21', level: 21, language: 'javascript', difficulty: 'Advanced',
    title: 'Async Generator Iterators',
    description: 'Generate items asynchronously using yields.',
    code: `async function* generator() {\n  yield await Promise.resolve(1);\n  yield await Promise.resolve(2);\n}\nfor await (const val of generator()) { console.log(val); }`
  },
  {
    id: 'js-22', level: 22, language: 'javascript', difficulty: 'Advanced',
    title: 'Custom Event Dispatcher',
    description: 'Broadcast and handle events dynamically.',
    code: `const dispatcher = {\n  events: {},\n  on(name, fn) { (this.events[name] = this.events[name] || []).push(fn); },\n  emit(name, data) { (this.events[name] || []).forEach(fn => fn(data)); }\n};`
  },
  {
    id: 'js-23', level: 23, language: 'javascript', difficulty: 'Advanced',
    title: 'Debounce Execution',
    description: 'Limit rapid successive function invocations.',
    code: `function debounce(func, delay) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => func(...args), delay);\n  };\n}`
  },
  {
    id: 'js-24', level: 24, language: 'javascript', difficulty: 'Advanced',
    title: 'Throttle Execution',
    description: 'Guarantee function execution at most once per interval.',
    code: `function throttle(func, limit) {\n  let inThrottle;\n  return (...args) => {\n    if (!inThrottle) {\n      func(...args);\n      inThrottle = true;\n      setTimeout(() => inThrottle = false, limit);\n    }\n  };\n}`
  },
  {
    id: 'js-25', level: 25, language: 'javascript', difficulty: 'Advanced',
    title: 'Deep Clone Objects',
    description: 'Safely duplicate objects handling nested values.',
    code: `function deepClone(obj) {\n  if (obj === null || typeof obj !== "object") return obj;\n  const copy = Array.isArray(obj) ? [] : {};\n  for (let key in obj) { copy[key] = deepClone(obj[key]); }\n  return copy;\n}`
  },
  {
    id: 'js-26', level: 26, language: 'javascript', difficulty: 'Advanced',
    title: 'Memoize Function Results',
    description: 'Cache inputs to speed up execution of expensive functions.',
    code: `function memoize(fn) {\n  const cache = {};\n  return (...args) => {\n    const key = JSON.stringify(args);\n    return cache[key] || (cache[key] = fn(...args));\n  };\n}`
  },
  {
    id: 'js-27', level: 27, language: 'javascript', difficulty: 'Advanced',
    title: 'Dynamic Import Loader',
    description: 'Load bundles dynamically on demand.',
    code: `async function loadAdminModule() {\n  try {\n    const module = await import("./adminModule.js");\n    module.initDashboard();\n  } catch (err) { console.error(err); }\n}`
  },
  {
    id: 'js-28', level: 28, language: 'javascript', difficulty: 'Advanced',
    title: 'Currying Function Abstraction',
    description: 'Decompose functions into chains of single argument calls.',
    code: `const curry = (fn) => {\n  return function curried(...args) {\n    if (args.length >= fn.length) return fn(...args);\n    return (...args2) => curried(...args, ...args2);\n  };\n};`
  },
  {
    id: 'js-29', level: 29, language: 'javascript', difficulty: 'Advanced',
    title: 'Proxy Trap Validation',
    description: 'Intercept and validate writing data to object properties.',
    code: `const validator = {\n  set(target, prop, val) {\n    if (prop === "age" && typeof val !== "number") throw new Error();\n    target[prop] = val;\n    return true;\n  }\n};\nconst person = new Proxy({}, validator);`
  },
  {
    id: 'js-30', level: 30, language: 'javascript', difficulty: 'Advanced',
    title: 'Binary Search Implementation',
    description: 'Optimized binary searching of sorted lists.',
    code: `function binarySearch(arr, val) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    let mid = Math.floor((left + right) / 2);\n    if (arr[mid] === val) return mid;\n    if (arr[mid] < val) left = mid + 1; else right = mid - 1;\n  }\n  return -1;\n}`
  },
  {
    id: 'js-31', level: 31, language: 'javascript', difficulty: 'Advanced',
    title: 'GraphQL Query Fetcher',
    description: 'Request complex schemas from GraphQL services.',
    code: `async function queryGraphQL(id) {\n  const query = \`query { user(id: "\${id}") { name email } }\`;\n  const response = await fetch("/graphql", {\n    method: "POST", headers: { "Content-Type": "application/json" },\n    body: JSON.stringify({ query })\n  });\n  return response.json();\n}`
  },
  {
    id: 'js-32', level: 32, language: 'javascript', difficulty: 'Advanced',
    title: 'WebSockets Connection Manager',
    description: 'Establish and handle real-time messaging.',
    code: `class wsManager {\n  connect(url) {\n    this.ws = new WebSocket(url);\n    this.ws.onmessage = e => this.handleMessage(e.data);\n    this.ws.onclose = () => this.reconnect(url);\n  }\n  send(msg) { this.ws.send(JSON.stringify(msg)); }\n}`
  },
  {
    id: 'js-33', level: 33, language: 'javascript', difficulty: 'Advanced',
    title: 'Fetch with AbortController',
    description: 'Allow cancelling active HTTP network requests.',
    code: `const controller = new AbortController();\nconst signal = controller.signal;\nfetch("/api/data", { signal })\n  .then(r => r.json())\n  .catch(err => { if (err.name === "AbortError") console.log("Cancelled"); });\ncontroller.abort();`
  },
  {
    id: 'js-34', level: 34, language: 'javascript', difficulty: 'Advanced',
    title: 'Matrix Transposition',
    description: 'Flip a 2D matrix layout columns into rows.',
    code: `const transpose = (matrix) => {\n  return matrix[0].map((_, colIndex) => {\n    return matrix.map(row => row[colIndex]);\n  });\n};`
  },
  {
    id: 'js-35', level: 35, language: 'javascript', difficulty: 'Advanced',
    title: 'Custom Promise implementation',
    description: 'A miniature custom implementation of a Promise flow.',
    code: `class MiniPromise {\n  constructor(executor) {\n    this.callbacks = [];\n    const resolve = value => this.callbacks.forEach(cb => cb(value));\n    executor(resolve);\n  }\n  then(cb) { this.callbacks.push(cb); return this; }\n}`
  },

  // --- JAVA (35 lessons) ---
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
  {
    id: 'java-7', level: 7, language: 'java', difficulty: 'Beginner',
    title: 'Variables and Arithmetic',
    description: 'Declare integers and perform basic mathematical math.',
    code: `int maxWpm = 120;\nint currentWpm = 85;\nint wpmDifference = maxWpm - currentWpm;\nSystem.out.println("Difference: " + wpmDifference);`
  },
  {
    id: 'java-8', level: 8, language: 'java', difficulty: 'Beginner',
    title: 'String Concatenation',
    description: 'Format dynamic outputs by combining text objects.',
    code: `String firstName = "Kumar";\nString lastName = "Ajeet";\nString fullName = firstName + " " + lastName;\nSystem.out.println("Typist: " + fullName);`
  },
  {
    id: 'java-9', level: 9, language: 'java', difficulty: 'Beginner',
    title: 'Methods and Parameters',
    description: 'Write helper methods that accept parameters.',
    code: `public static double getRatio(int typed, int errors) {\n    int correct = typed - errors;\n    return (double) correct / typed;\n}`
  },
  {
    id: 'java-10', level: 10, language: 'java', difficulty: 'Beginner',
    title: 'If-Else Conditionals',
    description: 'Branch application code paths depending on boolean stats.',
    code: `if (accuracy > 95) {\n    System.out.println("High Accuracy!");\n} else {\n    System.out.println("Focus on precision.");\n}`
  },
  {
    id: 'java-11', level: 11, language: 'java', difficulty: 'Intermediate',
    title: 'HashMap Lookups',
    description: 'Map unique keys to dynamic dictionary values.',
    code: `HashMap<String, Integer> userScores = new HashMap<>();\nuserScores.put("alice", 98);\nuserScores.put("bob", 84);\nSystem.out.println(userScores.get("alice"));`
  },
  {
    id: 'java-12', level: 12, language: 'java', difficulty: 'Intermediate',
    title: 'File Readers (BufferedReader)',
    description: 'Safely read data line by line from file descriptors.',
    code: `try (BufferedReader br = new BufferedReader(new FileReader("stats.txt"))) {\n    String line;\n    while ((line = br.readLine()) != null) {\n        System.out.println(line);\n    }\n} catch (IOException e) { e.printStackTrace(); }`
  },
  {
    id: 'java-13', level: 13, language: 'java', difficulty: 'Intermediate',
    title: 'Custom Class Constructors',
    description: 'Define custom parameters during object initialization.',
    code: `public class Typist {\n    private String alias;\n    private int wpm;\n    public Typist(String alias, int wpm) {\n        this.alias = alias;\n        this.wpm = wpm;\n    }\n}`
  },
  {
    id: 'java-14', level: 14, language: 'java', difficulty: 'Intermediate',
    title: 'List Sorting via Comparator',
    description: 'Order custom objects using inline comparator sort keys.',
    code: `List<Integer> list = Arrays.asList(4, 2, 8, 5);\nlist.sort((a, b) -> b.compareTo(a));\nSystem.out.println("Reverse Sorted: " + list);`
  },
  {
    id: 'java-15', level: 15, language: 'java', difficulty: 'Intermediate',
    title: 'Enhanced For Loop',
    description: 'Iterate over list arrays using modern foreach parameters.',
    code: `String[] list = {"code", "type", "play"};\nfor (String item : list) {\n    System.out.println("Action: " + item);\n}`
  },
  {
    id: 'java-16', level: 16, language: 'java', difficulty: 'Intermediate',
    title: 'StringBuilder Buffer',
    description: 'Concatenate strings efficiently inside loops.',
    code: `StringBuilder sb = new StringBuilder();\nfor (int i = 0; i < 5; i++) {\n    sb.append("run-").append(i).append(" ");\n}\nSystem.out.println(sb.toString().trim());`
  },
  {
    id: 'java-17', level: 17, language: 'java', difficulty: 'Intermediate',
    title: 'Method Overloading',
    description: 'Define matching methods supporting different signatures.',
    code: `public class Tool {\n    public void log(String s) { System.out.println(s); }\n    public void log(int i) { System.out.println("Val: " + i); }\n}`
  },
  {
    id: 'java-18', level: 18, language: 'java', difficulty: 'Intermediate',
    title: 'Enums and Switches',
    description: 'Manage distinct categories cleanly.',
    code: `enum Mode { ZEN, BATTLE, SANDBOX }\nMode active = Mode.ZEN;\nswitch(active) {\n    case ZEN -> System.out.println("Peaceful practice.");\n    case BATTLE -> System.out.println("Multiplayer arena!");\n}`
  },
  {
    id: 'java-19', level: 19, language: 'java', difficulty: 'Intermediate',
    title: 'Static Attributes',
    description: 'Declare context variables shared across all instances.',
    code: `public class GameSession {\n    public static int activePlayers = 0;\n    public GameSession() {\n        activePlayers++;\n    }\n}`
  },
  {
    id: 'java-20', level: 20, language: 'java', difficulty: 'Intermediate',
    title: 'Interface Default Methods',
    description: 'Write default handler code directly in interface blueprints.',
    code: `interface Logging {\n    void logMsg(String s);\n    default void logError(String err) {\n        logMsg("[ERROR] " + err);\n    }\n}`
  },
  {
    id: 'java-21', level: 21, language: 'java', difficulty: 'Advanced',
    title: 'Stream API pipeline',
    description: 'Filter and sum list attributes cleanly using modern streams.',
    code: `List<Integer> list = Arrays.asList(1, 2, 3, 4, 5, 6);\nint sum = list.stream()\n    .filter(n -> n % 2 == 0)\n    .mapToInt(n -> n * 2)\n    .sum();\nSystem.out.println("Result sum: " + sum);`
  },
  {
    id: 'java-22', level: 22, language: 'java', difficulty: 'Advanced',
    title: 'CompletableFuture Async task',
    description: 'Run non-blocking async operations asynchronously.',
    code: `CompletableFuture.supplyAsync(() -> "Task finished")\n    .thenAccept(result -> System.out.println("Out: " + result));\nThread.sleep(100);`
  },
  {
    id: 'java-23', level: 23, language: 'java', difficulty: 'Advanced',
    title: 'Reflection field extraction',
    description: 'Inspect class structure attributes at run-time.',
    code: `Class<?> clazz = Main.class;\nMethod[] methods = clazz.getDeclaredMethods();\nfor (Method m : methods) {\n    System.out.println("Method signature: " + m.getName());\n}`
  },
  {
    id: 'java-24', level: 24, language: 'java', difficulty: 'Advanced',
    title: 'Custom Generic Box',
    description: 'Implement a generic class that holds dynamic objects.',
    code: `public class Container<T> {\n    private T item;\n    public void pack(T item) { this.item = item; }\n    public T unpack() { return item; }\n}`
  },
  {
    id: 'java-25', level: 25, language: 'java', difficulty: 'Advanced',
    title: 'ExecutorService Threadpool',
    description: 'Distribute threads efficiently over executor pools.',
    code: `ExecutorService exec = Executors.newFixedThreadPool(4);\nexec.submit(() -> System.out.println("Task in Threadpool"));\nexec.shutdown();`
  },
  {
    id: 'java-26', level: 26, language: 'java', difficulty: 'Advanced',
    title: 'Locks and ReentrantLocks',
    description: 'Coordinate thread access to critical segments safely.',
    code: `ReentrantLock lock = new ReentrantLock();\nlock.lock();\ntry {\n    counter++;\n} finally {\n    lock.unlock();\n}`
  },
  {
    id: 'java-27', level: 27, language: 'java', difficulty: 'Advanced',
    title: 'Optional Wrapper mapping',
    description: 'Handle possible null pointers safely without crashes.',
    code: `Optional<String> name = Optional.ofNullable(fetchName());\nString upper = name.map(String::toUpperCase).orElse("UNKNOWN");\nSystem.out.println(upper);`
  },
  {
    id: 'java-28', level: 28, language: 'java', difficulty: 'Advanced',
    title: 'Singleton Inner Class',
    description: 'Implement a thread-safe Bill Pugh Singleton pattern.',
    code: `public class SoundService {\n    private SoundService() {}\n    private static class Holder {\n        private static final SoundService INSTANCE = new SoundService();\n    }\n    public static SoundService getInstance() { return Holder.INSTANCE; }\n}`
  },
  {
    id: 'java-29', level: 29, language: 'java', difficulty: 'Advanced',
    title: 'JDBC DB Transaction block',
    description: 'Safely process database modifications inside manual rollback brackets.',
    code: `try (Connection c = getConnection()) {\n    c.setAutoCommit(false);\n    updateProfiles(c);\n    c.commit();\n} catch (SQLException e) { rollback(c); }`
  },
  {
    id: 'java-30', level: 30, language: 'java', difficulty: 'Advanced',
    title: 'Design Pattern Observer',
    description: 'Broadcast score changes to listening components.',
    code: `interface Listener { void update(int score); }\nclass ScoreFeed {\n    private List<Listener> obs = new ArrayList<>();\n    public void add(Listener l) { obs.add(l); }\n    public void set(int val) { obs.forEach(l -> l.update(val)); }\n}`
  },
  {
    id: 'java-31', level: 31, language: 'java', difficulty: 'Advanced',
    title: 'Functional Interface Lambda',
    description: 'Write custom target expressions for custom functional interfaces.',
    code: `@FunctionalInterface\ninterface Transformer {\n    String transform(String s);\n}\nTransformer t = s -> s.trim().toLowerCase();`
  },
  {
    id: 'java-32', level: 32, language: 'java', difficulty: 'Advanced',
    title: 'Custom Annotation Processor',
    description: 'Implement structural validation using metadata fields.',
    code: `@Target(ElementType.METHOD)\n@Retention(RetentionPolicy.RUNTIME)\npublic @interface Speedtest {\n    int wpmTarget() default 60;\n}`
  },
  {
    id: 'java-33', level: 33, language: 'java', difficulty: 'Advanced',
    title: 'Deep Copy Object cloning',
    description: 'Recursively clone nested fields to avoid state sharing.',
    code: `public Profile deepCopy() {\n    Profile copy = new Profile(this.id);\n    copy.setStats(new Stats(this.stats.getWpm()));\n    return copy;\n}`
  },
  {
    id: 'java-34', level: 34, language: 'java', difficulty: 'Advanced',
    title: 'Custom Exception Class',
    description: 'Extend Exception subclass to raise platform errors.',
    code: `public class CheatException extends Exception {\n    public CheatException(String details) {\n        super("Cheating flag raised: " + details);\n    }\n}`
  },
  {
    id: 'java-35', level: 35, language: 'java', difficulty: 'Advanced',
    title: 'Deadlock Prevention Order',
    description: 'Avoid thread blocking by enforcing strict locking index order.',
    code: `public void transfer(Account a, Account b) {\n    Account first = a.id < b.id ? a : b;\n    Account second = a.id < b.id ? b : a;\n    synchronized(first) {\n        synchronized(second) {\n            processFunds(a, b);\n        }\n    }\n}`
  },

  // --- C++ (30 lessons) ---
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
  },
  {
    id: 'cpp-8', level: 8, language: 'cpp', difficulty: 'Beginner',
    title: 'Data types and constraints',
    description: 'Learn integer, boolean, float, and character bounds.',
    code: `bool completed = true;\nchar grade = 'A';\nfloat wpm = 94.5f;\ndouble accuracy = 0.985;\ncout << grade << " " << wpm;`
  },
  {
    id: 'cpp-9', level: 9, language: 'cpp', difficulty: 'Beginner',
    title: 'Standard Constants',
    description: 'Prevent modification of values using the const keyword.',
    code: `const int maxTime = 120;\nconst double taxRate = 0.08;\ncout << "Limits: " << maxTime << ", " << taxRate;`
  },
  {
    id: 'cpp-10', level: 10, language: 'cpp', difficulty: 'Intermediate',
    title: 'Function Signatures',
    description: 'Declare function blueprints before defining main entries.',
    code: `int add(int, int);\nint main() {\n    return add(4, 5);\n}\nint add(int x, int y) { return x + y; }`
  },
  {
    id: 'cpp-11', level: 11, language: 'cpp', difficulty: 'Intermediate',
    title: 'References vs Value copy',
    description: 'Speed up logic by referencing addresses without duplicating data.',
    code: `void addScore(int& currentScore) {\n    currentScore += 100;\n}\nint main() {\n    int s = 50; addScore(s);\n}`
  },
  {
    id: 'cpp-12', level: 12, language: 'cpp', difficulty: 'Intermediate',
    title: 'Structs configuration',
    description: 'Assemble collections of varying data structures.',
    code: `struct Typist {\n    string username;\n    int wpm;\n    double accuracy;\n};\nTypist t1 = {"Ajeet", 90, 99.1};`
  },
  {
    id: 'cpp-13', level: 13, language: 'cpp', difficulty: 'Intermediate',
    title: 'Classes and Access Modifiers',
    description: 'Protect object details using private and public modifiers.',
    code: `class Game {\nprivate:\n    int id;\npublic:\n    Game(int gameId) : id(gameId) {}\n    int getId() const { return id; }\n};`
  },
  {
    id: 'cpp-14', level: 14, language: 'cpp', difficulty: 'Intermediate',
    title: 'Standard Strings library',
    description: 'Manipulate text attributes using the string header library.',
    code: `#include <string>\nstring text = "TypeMaster";\ntext.append(" Pro");\ncout << "Len: " << text.length() << " Name: " << text;`
  },
  {
    id: 'cpp-15', level: 15, language: 'cpp', difficulty: 'Intermediate',
    title: 'Arrays and Indexing',
    description: 'Assemble static collections of elements.',
    code: `int scores[5] = {88, 92, 74, 99, 105};\nfor(int i = 0; i < 5; i++) {\n    cout << "Score " << i << ": " << scores[i] << endl;\n}`
  },
  {
    id: 'cpp-16', level: 16, language: 'cpp', difficulty: 'Intermediate',
    title: 'Pointer Math Operations',
    description: 'Navigate array memory addresses directly using pointer increments.',
    code: `int vals[3] = {10, 20, 30};\nint* p = vals;\ncout << *p << " " << *(p + 1) << " " << *(p + 2);`
  },
  {
    id: 'cpp-17', level: 17, language: 'cpp', difficulty: 'Intermediate',
    title: 'Namespaces declaration',
    description: 'Organize function scopes to prevent name collisions.',
    code: `namespace typemaster {\n    void logMsg() { cout << "Lobby log"; }\n}\nint main() {\n    typemaster::logMsg();\n}`
  },
  {
    id: 'cpp-18', level: 18, language: 'cpp', difficulty: 'Intermediate',
    title: 'Operator Overloading',
    description: 'Redefine how standard operators manipulate custom struct attributes.',
    code: `struct Point {\n    int x, y;\n    Point operator+(const Point& other) {\n        return {x + other.x, y + other.y};\n    }\n};`
  },
  {
    id: 'cpp-19', level: 19, language: 'cpp', difficulty: 'Intermediate',
    title: 'Inheritance and Polymorphism',
    description: 'Derive subclasses from base blueprints.',
    code: `class Engine { public: virtual void run() = 0; };\nclass V8 : public Engine {\npublic:\n    void run() override { cout << "V8 running"; }\n};`
  },
  {
    id: 'cpp-20', level: 20, language: 'cpp', difficulty: 'Intermediate',
    title: 'Static Class Members',
    description: 'Manage class constants and shared variables.',
    code: `class Counter {\npublic:\n    static int totalCount;\n    Counter() { totalCount++; }\n};\nint Counter::totalCount = 0;`
  },
  {
    id: 'cpp-21', level: 21, language: 'cpp', difficulty: 'Advanced',
    title: 'Smart Pointers (std::shared_ptr)',
    description: 'Coordinate shared memory references across multiple owners.',
    code: `#include <memory>\nauto speed = std::make_shared<int>(80);\nstd::shared_ptr<int> ref = speed;\ncout << "Ref count: " << speed.use_count();`
  },
  {
    id: 'cpp-22', level: 22, language: 'cpp', difficulty: 'Advanced',
    title: 'Template Class Box',
    description: 'Implement a template class that stores generic fields.',
    code: `template <class T>\nclass Box {\nprivate:\n    T value;\npublic:\n    Box(T val) : value(val) {}\n    T get() { return value; }\n};`
  },
  {
    id: 'cpp-23', level: 23, language: 'cpp', difficulty: 'Advanced',
    title: 'Lambda Closures capture',
    description: 'Define functions inline that access scope variables.',
    code: `#include <algorithm>\nint multiplier = 5;\nauto multiply = [multiplier](int val) { return val * multiplier; };\ncout << multiply(10); // 50`
  },
  {
    id: 'cpp-24', level: 24, language: 'cpp', difficulty: 'Advanced',
    title: 'Move Semantics (std::move)',
    description: 'Transfer ownership of dynamic data structures without duplication.',
    code: `#include <utility>\nstring source = "Resource";\nstring target = std::move(source);\ncout << "Src: " << source << " Target: " << target;`
  },
  {
    id: 'cpp-25', level: 25, language: 'cpp', difficulty: 'Advanced',
    title: 'Rvalue References (&&)',
    description: 'Write move constructor interfaces to handle temporary objects.',
    code: `class Buffer {\npublic:\n    int* data;\n    Buffer(Buffer&& other) noexcept : data(other.data) {\n        other.data = nullptr;\n    }\n};`
  },
  {
    id: 'cpp-26', level: 26, language: 'cpp', difficulty: 'Advanced',
    title: 'Concurrency (std::thread)',
    description: 'Execute background calculations in a separate thread.',
    code: `#include <thread>\nvoid printStats() { cout << "Printing stats"; }\nint main() {\n    std::thread t(printStats);\n    t.join();\n}`
  },
  {
    id: 'cpp-27', level: 27, language: 'cpp', difficulty: 'Advanced',
    title: 'Exception Throw & Catch',
    description: 'Throw dynamic runtime errors and catch them to prevent crashes.',
    code: `#include <stdexcept>\ntry {\n    throw std::runtime_error("Disk Full");\n} catch (const std::exception& e) {\n    cout << "Caught: " << e.what();\n}`
  },
  {
    id: 'cpp-28', level: 28, language: 'cpp', difficulty: 'Advanced',
    title: 'STL Map dictionary search',
    description: 'Write key lookup checks using logarithmic map iterators.',
    code: `#include <map>\nstd::map<string, int> registry;\nregistry["user"] = 101;\nauto it = registry.find("user");\nif (it != registry.end()) { cout << it->second; }`
  },
  {
    id: 'cpp-29', level: 29, language: 'cpp', difficulty: 'Advanced',
    title: 'Mutex Lock Guards',
    description: 'Enforce thread-safety in critical regions using locks.',
    code: `#include <mutex>\nstd::mutex mu;\nvoid safeIncrement() {\n    std::lock_guard<std::mutex> guard(mu);\n    shared_counter++;\n}`
  },
  {
    id: 'cpp-30', level: 30, language: 'cpp', difficulty: 'Advanced',
    title: 'Standard Hash function',
    description: 'Generate numeric hashes from string objects.',
    code: `#include <functional>\nstring text = "typemaster";\nstd::hash<string> hasher;\nsize_t hashedText = hasher(text);\ncout << "Hash: " << hashedText;`
  }
];
