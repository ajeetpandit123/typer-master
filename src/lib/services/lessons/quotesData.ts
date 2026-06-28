import { Quote } from '../mockData';

export const QUOTES_DATA: Quote[] = [
  // Short quotes
  { id: 'q-1', text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", category: "philosophy", lengthCategory: "short" },
  { id: 'q-2', text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "technology", lengthCategory: "short" },
  { id: 'q-3', text: "Action is the foundational key to all success.", author: "Pablo Picasso", category: "motivation", lengthCategory: "short" },
  { id: 'q-4', text: "The details are not the details. They make the design.", author: "Charles Eames", category: "business", lengthCategory: "short" },
  { id: 'q-5', text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "leadership", lengthCategory: "short" },
  { id: 'q-6', text: "Stay hungry, stay foolish.", author: "Steve Jobs", category: "motivation", lengthCategory: "short" },
  { id: 'q-7', text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "technology", lengthCategory: "short" },
  { id: 'q-8', text: "Be himself, and not what others want him to be.", author: "Ralph Waldo Emerson", category: "philosophy", lengthCategory: "short" },
  { id: 'q-9', text: "The only source of knowledge is experience.", author: "Albert Einstein", category: "education", lengthCategory: "short" },
  { id: 'q-10', text: "Quality is more important than quantity. One home run is much better than two doubles.", author: "Steve Jobs", category: "business", lengthCategory: "short" },
  { id: 'q-11', text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein", category: "philosophy", lengthCategory: "short" },
  { id: 'q-12', text: "Knowledge is power.", author: "Francis Bacon", category: "education", lengthCategory: "short" },
  { id: 'q-13', text: "Make each day your masterpiece.", author: "John Wooden", category: "motivation", lengthCategory: "short" },
  { id: 'q-14', text: "Lead me, follow me, or get out of my way.", author: "George S. Patton", category: "leadership", lengthCategory: "short" },
  { id: 'q-15', text: "It is not that I am so smart, it's just that I stay with problems longer.", author: "Albert Einstein", category: "education", lengthCategory: "short" },
  { id: 'q-16', text: "Done is better than perfect.", author: "Sheryl Sandberg", category: "business", lengthCategory: "short" },
  { id: 'q-17', text: "A user interface is like a joke. If you have to explain it, it's not that good.", author: "Martin Leblanc", category: "technology", lengthCategory: "short" },
  { id: 'q-18', text: "Do one thing every day that scares you.", author: "Eleanor Roosevelt", category: "motivation", lengthCategory: "short" },
  { id: 'q-19', text: "Management is doing things right; leadership is doing the right things.", author: "Peter Drucker", category: "leadership", lengthCategory: "short" },
  { id: 'q-20', text: "You miss one hundred percent of the shots you don't take.", author: "Wayne Gretzky", category: "motivation", lengthCategory: "short" },
  { id: 'q-21', text: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "technology", lengthCategory: "short" },
  { id: 'q-22', text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack", category: "business", lengthCategory: "short" },
  { id: 'q-23', text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi", category: "education", lengthCategory: "short" },
  { id: 'q-24', text: "If you want to walk fast, walk alone. But if you want to walk far, walk together.", author: "Ratan Tata", category: "leadership", lengthCategory: "short" },
  { id: 'q-25', text: "Code never lies, comments sometimes do.", author: "Ron Jeffries", category: "technology", lengthCategory: "short" },
  { id: 'q-26', text: "Great designs are simple. They strip away the unnecessary to let the core shine.", author: "Dieter Rams", category: "philosophy", lengthCategory: "short" },
  { id: 'q-27', text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "motivation", lengthCategory: "short" },
  { id: 'q-28', text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela", category: "education", lengthCategory: "short" },
  { id: 'q-29', text: "Innovation is taking two things that already exist and putting them together in a new way.", author: "Tom Freston", category: "business", lengthCategory: "short" },
  { id: 'q-30', text: "Act as if what you do makes a difference. It does.", author: "William James", category: "motivation", lengthCategory: "short" },

  // Medium quotes
  {
    id: 'q-31',
    text: "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma, which is living with the results of other people's thinking. Don't let the noise of others' opinions drown out your own inner voice.",
    author: "Steve Jobs", category: "technology", lengthCategory: "medium"
  },
  {
    id: 'q-32',
    text: "Learn from yesterday, live for today, hope for tomorrow. The important thing is not to stop questioning. Curiosity has its own reason for existing. One cannot help but be in awe when he contemplates the mysteries of eternity.",
    author: "Albert Einstein", category: "philosophy", lengthCategory: "medium"
  },
  {
    id: 'q-33',
    text: "First, solve the problem. Then, write the code. Don't get caught up in the details before you understand the broad architecture of your solution. Software engineering is a discipline of structured logic.",
    author: "John Johnson", category: "education", lengthCategory: "medium"
  },
  {
    id: 'q-34',
    text: "Great things in business are never done by one person. They're done by a team of people. True leadership lies in empowering others to work together, leveraging their unique individual strengths to achieve a unified vision.",
    author: "Steve Jobs", category: "business", lengthCategory: "medium"
  },
  {
    id: 'q-35',
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit. Daily improvement, no matter how small, compounds into massive gains over time. Maintain focus and stay dedicated to your journey.",
    author: "Aristotle", category: "motivation", lengthCategory: "medium"
  },
  {
    id: 'q-36',
    text: "Computers are good at following instructions, but not at reading your mind. Programming is the art of expressing your ideas in a clear, logical, and unambiguous way so that a machine can execute them precisely.",
    author: "Donald Knuth", category: "technology", lengthCategory: "medium"
  },
  {
    id: 'q-37',
    text: "The function of good software is to make the complex appear simple. Designing systems requires a balance of engineering precision and user experience design to solve real-world problems effectively.",
    author: "Grady Booch", category: "technology", lengthCategory: "medium"
  },
  {
    id: 'q-38',
    text: "If you define yourself by how you differ from the competition, you're design-focused. If you define yourself by how you can make your customers lives better, you are customer-centric and bound to succeed.",
    author: "Jeff Bezos", category: "business", lengthCategory: "medium"
  },
  {
    id: 'q-39',
    text: "The best leaders are those most interested in surrounding themselves with assistants and associates smarter than they are. They are frank in admitting this, and willing to pay for such talents.",
    author: "Anteneh Roba", category: "leadership", lengthCategory: "medium"
  },
  {
    id: 'q-40',
    text: "It is the mark of an educated mind to be able to entertain a thought without accepting it. True education lies in developing critical thinking, reasoning, and standard logic to navigate complex situations.",
    author: "Aristotle", category: "education", lengthCategory: "medium"
  },
  {
    id: 'q-41',
    text: "Continuous effort, not strength or intelligence, is the key to unlocking our potential. When we push through limits in typing, coding, or any skill, we rewire our brains to achieve what was once impossible.",
    author: "Liane Cardes", category: "motivation", lengthCategory: "medium"
  },
  {
    id: 'q-42',
    text: "Simplicity is not the absence of clutter, that's a consequence of simplicity. Simplicity is somehow describing the purpose and place of an object and product. Clutter is simply a failure of structure.",
    author: "Jony Ive", category: "philosophy", lengthCategory: "medium"
  },
  {
    id: 'q-43',
    text: "Good code is its own best documentation. As you're about to add a comment, ask yourself, How can I improve the code so that this comment isn't needed? Refactor the code to make it clean and readable.",
    author: "Steve McConnell", category: "technology", lengthCategory: "medium"
  },
  {
    id: 'q-44',
    text: "The critical ingredient is getting off your butt and doing something. It's as simple as that. A lot of people have ideas, but there are few who decide to do something about them now. Not tomorrow, but today.",
    author: "Nolan Bushnell", category: "motivation", lengthCategory: "medium"
  },
  {
    id: 'q-45',
    text: "A leader is best when people barely know he exists, when his work is done, his aim fulfilled, they will say: we did it ourselves. Empowering others is the absolute highest form of leadership.",
    author: "Lao Tzu", category: "leadership", lengthCategory: "medium"
  },
  {
    id: 'q-46',
    text: "Do not go where the path may lead, go instead where there is no path and leave a trail. Innovation, entrepreneurship, and creativity are born when you step off the standard comfortable pathways of life.",
    author: "Ralph Waldo Emerson", category: "motivation", lengthCategory: "medium"
  },
  {
    id: 'q-47',
    text: "The structure of any programming language is a reflection of the logical patterns of human thought. By learning to code in different paradigms, you expand your capacity to analyze and decompose complex systems.",
    author: "Yukihiro Matsumoto", category: "education", lengthCategory: "medium"
  },
  {
    id: 'q-48',
    text: "In the middle of difficulty lies opportunity. When you hit a speed plateau in typing or find a bug in your code, do not get discouraged. These challenges are the exact place where growth occurs.",
    author: "Albert Einstein", category: "philosophy", lengthCategory: "medium"
  },
  {
    id: 'q-49',
    text: "Design is not just what it looks like and feels like. Design is how it works. A premium product must be beautiful on the surface, but its underlying code and structure must be even more elegant and robust.",
    author: "Steve Jobs", category: "business", lengthCategory: "medium"
  },
  {
    id: 'q-50',
    text: "The beautiful thing about learning is that nobody can take it away from you. Every new character, chord, language, or concept you master expands your capabilities and changes who you are as an individual.",
    author: "B.B. King", category: "education", lengthCategory: "medium"
  },
  {
    id: 'q-51',
    text: "To build a successful startup, you must do two things: make something people want, and spend less than you make. All the rest is noise. Keep your team focused on delivering real value to your users daily.",
    author: "Paul Graham", category: "business", lengthCategory: "medium"
  },
  {
    id: 'q-52',
    text: "True authority is not based on rank or title, but on trust, competence, and care. Leaders who listen to their team, take responsibility for failures, and share credit for successes are those who build lasting empires.",
    author: "Simon Sinek", category: "leadership", lengthCategory: "medium"
  },
  {
    id: 'q-53',
    text: "If you don't love what you do, you won't do it with much conviction or passion. Success comes from aligning your daily labor with what brings you curiosity, joy, and a sense of true creative expression.",
    author: "Mia Hamm", category: "motivation", lengthCategory: "medium"
  },
  {
    id: 'q-54',
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. Keep your functions short, variables descriptive, and classes cohesive to ensure future readability.",
    author: "Martin Fowler", category: "technology", lengthCategory: "medium"
  },
  {
    id: 'q-55',
    text: "The measure of intelligence is the ability to change. In software architecture, the only constant is change. Write systems that are loosely coupled, modular, and easy to extend when requirements inevitably evolve.",
    author: "Albert Einstein", category: "philosophy", lengthCategory: "medium"
  },
  {
    id: 'q-56',
    text: "The only limit to our realization of tomorrow will be our doubts of today. Let us move forward with strong and active faith, knowing that daily efforts in writing, typing, and learning compound into mastery.",
    author: "Franklin D. Roosevelt", category: "motivation", lengthCategory: "medium"
  },
  {
    id: 'q-57',
    text: "It is not the strongest of the species that survives, nor the most intelligent that survives. It is the one that is most adaptable to change. Adaptability is the key to thriving in any technology landscape.",
    author: "Charles Darwin", category: "education", lengthCategory: "medium"
  },
  {
    id: 'q-58',
    text: "If you think your users are idiots, only idiots will use your software. Design with respect for your audience. Provide clear feedback, readable layouts, and intuitive paths to make interactions comfortable and pleasing.",
    author: "Bruce Tognazzini", category: "technology", lengthCategory: "medium"
  },
  {
    id: 'q-59',
    text: "A user interface is well-designed when it gets out of the user's way and allows them to focus entirely on their work. Zen-like simplicity in layout reduces cognitive load and maximizes productivity.",
    author: "Edward Tufte", category: "philosophy", lengthCategory: "medium"
  },
  {
    id: 'q-60',
    text: "We make a living by what we get, but we make a life by what we give. Sharing your knowledge, mentoring junior developers, and contributing to open source are how we build a strong software engineering community.",
    author: "Winston Churchill", category: "leadership", lengthCategory: "medium"
  },

  // Long quotes
  {
    id: 'q-61',
    text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart, you'll know when you find it. And, like any great relationship, it just gets better and better as the years roll on. So keep looking until you find it. Don't settle, because settle is the enemy of excellence.",
    author: "Steve Jobs", category: "motivation", lengthCategory: "long"
  },
  {
    id: 'q-62',
    text: "It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood; who strives valiantly; who errs, who comes short again and again, because there is no effort without error and shortcoming; but who does actually strive to do the deeds; who knows great enthusiasms, the great devotions; who spends himself in a worthy cause.",
    author: "Theodore Roosevelt", category: "leadership", lengthCategory: "long"
  },
  {
    id: 'q-63',
    text: "Computer science is no more about computers than astronomy is about telescopes. It is about information, algorithms, and computational methods. Coding is a form of digital expression, turning thoughts and logical systems into reality. As a software programmer, typing is your direct physical interface to the digital world. Master it to bridge the gap between human imagination and computer execution with maximum bandwidth and speed.",
    author: "Edsger W. Dijkstra", category: "technology", lengthCategory: "long"
  },
  {
    id: 'q-64',
    text: "Our deepest fear is not that we are inadequate. Our deepest fear is that we are powerful beyond measure. It is our light, not our darkness that most frightens us. We ask ourselves, 'Who am I to be brilliant, gorgeous, talented, fabulous?' Actually, who are you not to be? Your playing small does not serve the world. There is nothing enlightened about shrinking so that other people won't feel insecure around you.",
    author: "Marianne Williamson", category: "motivation", lengthCategory: "long"
  },
  {
    id: 'q-65',
    text: "A dynamic design requires an understanding of typography, color, spacing, and rhythm. When designing interfaces, we select harmonious palettes and subtle transitions that make the user feel like the interface is alive and responsive. Micro-animations, such as hover elevations, sliding fades, and color transitions, turn a simple utility into a premium digital experience that wows the user at first glance.",
    author: "Antigravity UI Guide", category: "business", lengthCategory: "long"
  },
  {
    id: 'q-66',
    text: "In coding, we find a unique blend of structural science and artistic expression. We write instructions that are compiled into machine commands, executing millions of operations in milliseconds. Yet, the way we layout our modules, choose namespaces, and structure flow is an act of design. The best code reads like a well-written book, guiding the developer's mind through complex logic with ease, clarity, and elegance.",
    author: "Clean Coder Principles", category: "technology", lengthCategory: "long"
  },
  {
    id: 'q-67',
    text: "You can change your speed and your life if you change your habits. We think of success as a single monumental event, but it is actually the summation of tiny, daily improvements. Typing ten WPM faster is not a matter of one intense day of typing, but of ten minutes of focused, accurate practice every day for a month. Consistency beats intensity every single time, in software development, typing, and health.",
    author: "Atomic Habits Summary", category: "motivation", lengthCategory: "long"
  },
  {
    id: 'q-68',
    text: "The major problem of software development is not technical, but sociological. It is the interaction of people, the alignment of teams, and the clarity of communication that determines whether a project succeeds or crashes. Technical skills are necessary, but listening, empathy, clear writing, and structured thinking are what make you a senior engineer capable of leading massive, highly complex system integrations.",
    author: "Peopleware Insights", category: "business", lengthCategory: "long"
  },
  {
    id: 'q-69',
    text: "The internet is a vast decentralized repository of human knowledge, built on open standards, collaborative protocols, and open source frameworks. By contributing to open source, we build public infrastructure that anyone can use to learn, create, and build. This shared code creates a massive multiplier effect, allowing a single developer in their bedroom to deploy applications that serve millions of users worldwide.",
    author: "Decentralized Web Manifesto", category: "technology", lengthCategory: "long"
  },
  {
    id: 'q-70',
    text: "To think is to create. Our minds are continually organizing patterns, processing inputs, and outputting solutions. When we write, type, or speak, we translate these internal thoughts into external symbols that can be received by other minds. Mastering touch typing increases the bandwidth of this translation, allowing your hands to keep pace with the speed of your imagination, reducing cognitive latency.",
    author: "Cognitive Bandwidth Guide", category: "philosophy", lengthCategory: "long"
  },
  {
    id: 'q-71',
    text: "Simplicity does not mean writing minimal code or making features basic. True simplicity is achieved when we build complex systems using simple, highly reusable components that are isolated in responsibility. By keeping modules focused and boundaries clean, we create codebases that are easy to reason about, simple to test, and resistant to regressions, even as the team grows and features double in size.",
    author: "Architecture Patterns", category: "technology", lengthCategory: "long"
  },
  {
    id: 'q-72',
    text: "Whenever you feel like criticizing anyone, he told me, just remember that all the people in this world haven't had the advantages that you've had. He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me.",
    author: "F. Scott Fitzgerald", category: "philosophy", lengthCategory: "long"
  },
  {
    id: 'q-73',
    text: "The master in the art of living makes little distinction between his work and his play, his labor and his leisure, his mind and his body, his education and his recreation, his love and his religion. He hardly knows which is which. He simply pursues his vision of excellence in whatever he does, leaving others to decide whether he is working or playing. To him, he's always doing both, in absolute harmony.",
    author: "Zen Wisdom", category: "philosophy", lengthCategory: "long"
  },
  {
    id: 'q-74',
    text: "True learning occurs at the boundaries of your current capacity. If you practice what you can already do easily, you maintain your skill, but you do not grow. To increase your typing speed, you must type at a speed that forces mistakes, then slow down to rebuild accuracy. This cycle of pushing boundaries and stabilizing accuracy is the scientific path to rapid skill acquisition in any domain.",
    author: "Peak Performance Guide", category: "education", lengthCategory: "long"
  },
  {
    id: 'q-75',
    text: "A business starts as a hypothesis about how to solve a user problem. The goal of a startup is to test this hypothesis as quickly and cheaply as possible through customer feedback. By iterating on your product with real feedback, you pivot and adapt your features to align with the market. This empirical process reduces waste and ensures you are building something that users actually value and love.",
    author: "Lean Startup Summary", category: "business", lengthCategory: "long"
  },
  {
    id: 'q-76',
    text: "I have a dream that one day this nation will rise up and live out the true meaning of its creed: 'We hold these truths to be self-evident, that all men are created equal.' I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character. I have a dream today!",
    author: "Martin Luther King Jr.", category: "leadership", lengthCategory: "long"
  },
  {
    id: 'q-77',
    text: "Software engineering is more than just writing code; it is a discipline of design, testing, deployment, and operational maintenance. We write automated tests to verify our code behavior, automate deployments to release features, and setup monitoring to ensure high availability. This complete lifecycle ensures that the software we build remains reliable, performant, and secure under production load.",
    author: "Site Reliability Principles", category: "technology", lengthCategory: "long"
  },
  {
    id: 'q-78',
    text: "The greatest leader is not necessarily the one who does the greatest things. He is the one that gets the people to do the greatest things. Leadership is about setting a clear, inspiring vision, providing the resources and support your team needs to succeed, and then getting out of their way so they can innovate, create, and deliver results that exceed expectations.",
    author: "Ronald Reagan", category: "leadership", lengthCategory: "long"
  },
  {
    id: 'q-79',
    text: "If you want to build a ship, don't drum up people to collect wood and don't assign them tasks and work, but rather teach them to long for the endless immensity of the sea. By inspiring a shared vision, you tap into intrinsic motivation, encouraging team members to take ownership, solve problems creatively, and dedicate themselves to achieving a grand goal.",
    author: "Antoine de Saint-Exupéry", category: "leadership", lengthCategory: "long"
  },
  {
    id: 'q-80',
    text: "Nothing in this world can take the place of persistence. Talent will not; nothing is more common than unsuccessful men with talent. Genius will not; unrewarded genius is almost a proverb. Education will not; the world is full of educated derelicts. Persistence and determination alone are omnipotent. The slogan 'press on' has solved and always will solve the problems of the human race.",
    author: "Calvin Coolidge", category: "motivation", lengthCategory: "long"
  },
  {
    id: 'q-81',
    text: "Success on a typing platform is not just about raw words per minute, but the cognitive control of your hands. When typing, your brain processes letters in groups and plans the muscle movements for the next several keys ahead. Smooth, rhythmic typing where each key is struck with equal force and interval is actually faster than chaotic bursts of speed, because it minimizes mistakes and keyboard lockups.",
    author: "Typing Mechanics Analysis", category: "education", lengthCategory: "long"
  },
  {
    id: 'q-82',
    text: "The most important property of a program is whether it does what it's supposed to do. If it doesn't, nothing else matters. But secondary properties like maintainability, readability, performance, and security determine whether the program can survive in a production environment. Professional developers write code that is clean, modular, and thoroughly tested to satisfy both primary and secondary requirements.",
    author: "Software Craftsmanship", category: "technology", lengthCategory: "long"
  },
  {
    id: 'q-83',
    text: "To build a strong brand, you must deliver a consistent, high-quality user experience at every touchpoint. From the load speed of the website and the color choices of the UI to the helpfulness of support and the reliability of features, every detail counts. A brand is not a logo, it is the collection of expectations, stories, and relationships that a user associates with your product and company.",
    author: "Brand Strategy Handbook", category: "business", lengthCategory: "long"
  },
  {
    id: 'q-84',
    text: "True wisdom lies in knowing that you know nothing. By maintaining a beginner's mind, you remain open to new ideas, willing to learn from others, and eager to test your assumptions. The moment you believe you are an expert who knows everything, you close your mind to innovation, stop asking questions, and become obsolete in a rapidly changing world like software engineering.",
    author: "Socrates", category: "philosophy", lengthCategory: "long"
  },
  {
    id: 'q-85',
    text: "The goal of education is not the knowledge of facts, but the training of the mind to think. We are inundated with information, but true understanding requires sorting, analyzing, and synthesizing that information into logical structures. By learning to code, type, and solve mathematical proofs, we train our minds in structured reasoning, which is useful in any intellectual pursuit.",
    author: "Albert Einstein", category: "education", lengthCategory: "long"
  },
  {
    id: 'q-86',
    text: "We can only see a short distance ahead, but we can see plenty there that needs to be done. Software engineering projects are built step-by-step. Do not be overwhelmed by the complexity of the final system; instead, break it down into modular components, write unit tests for each, and integrate them incrementally. This structured workflow turns an impossible project into a series of achievable tasks.",
    author: "Alan Turing", category: "technology", lengthCategory: "long"
  },
  {
    id: 'q-87',
    text: "A classy web application is built on solid design tokens: consistent margins, balanced typography, elegant HSL-derived color schemes, and subtle transitions. It avoids visual clutter, presenting the user with clear interactive cues and dynamic visual feedback. When an interface feels cohesive and responsive, it builds trust and makes the time the user spends on the platform pleasurable and satisfying.",
    author: "UI Aesthetics Guide", category: "business", lengthCategory: "long"
  },
  {
    id: 'q-88',
    text: "The only limit to our realization of tomorrow will be our doubts of today. Let us move forward with strong and active faith. Dedicate yourself to practicing the skills that matter. Whether it is coding, typing, writing, or designing, daily consistent effort compounds into true professional mastery, unlocking opportunities you cannot even imagine today.",
    author: "Franklin D. Roosevelt", category: "motivation", lengthCategory: "long"
  },
  {
    id: 'q-89',
    text: "The basic concept of web accessibility is that the web should be available to everyone, regardless of hardware, software, language, location, or ability. When writing code, we use semantic HTML, provide text alternatives for images, and ensure keyboard navigation works cleanly. This inclusive design ensures our products are accessible to all users, expanding our platform's reach and impact.",
    author: "W3C Accessibility Guide", category: "education", lengthCategory: "long"
  },
  {
    id: 'q-90',
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit. Daily practice is how we master complex motor skills like playing piano or touch typing. By dedicating fifteen minutes a day to practicing keyboard drills, you train your motor cortex, building automatic reflexes that bypass conscious thought, allowing your hands to type faster than your mind can spell.",
    author: "Aristotle", category: "philosophy", lengthCategory: "long"
  },
  {
    id: 'q-91',
    text: "The art of writing code requires an absolute focus on details. A single missing semicolon, misplaced bracket, or misspelled variable can crash a production environment. However, senior engineers look beyond details to see the overall architecture: how modules interact, how data flows, and where scalability bottlenecks might occur. They design simple systems that are easy to debug and verify.",
    author: "Architectural Principles", category: "technology", lengthCategory: "long"
  },
  {
    id: 'q-92',
    text: "The world is changing faster than ever. To thrive in this environment, you must become a lifelong learner who is constantly updating their skills, reading new documentation, and testing new technologies. The skills that got you your first job will not be enough to keep you there in five years. Embrace curiosity, step out of your comfort zone, and make learning a core part of your daily life.",
    author: "Lifelong Learning Guide", category: "education", lengthCategory: "long"
  },
  {
    id: 'q-93',
    text: "The best product is not necessarily the one with the most features, but the one that solves the user's primary problem with the least amount of friction. When planning features, focus on user stories: what are they trying to accomplish, and how can we make that process simple and satisfying? Strip away the secondary options until the core workflow is elegant, clean, and fast.",
    author: "Product Design Manual", category: "business", lengthCategory: "long"
  },
  {
    id: 'q-94',
    text: "To build a great team, you must hire people who share your values, but bring diverse perspectives and experiences. A team of identical thinkers will have the same blind spots, while a diverse team will challenge each other, leading to creative solutions and innovative ideas. Set high standards for competence, but prioritize character, collaboration, and a growth mindset.",
    author: "Team Building Handbook", category: "leadership", lengthCategory: "long"
  },
  {
    id: 'q-95',
    text: "In the end, it is not the years in your life that count. It is the life in your years. Make the most of every day, pursue excellence, work on projects that challenge you, and surround yourself with people who inspire you to grow. The effort you put into learning, creating, and helping others is what builds a legacy that endures long after your typing runs are complete.",
    author: "Abraham Lincoln", category: "motivation", lengthCategory: "long"
  },
  {
    id: 'q-96',
    text: "The internet is the printing press of the modern age, a technology that democratizes the creation and distribution of information. Through websites, web applications, and digital platforms, we can reach billions of people instantly. As web developers, we have the power to create tools that educate, connect, and empower users globally. Use this power responsibly to build a better web.",
    author: "Digital Era Manifesto", category: "technology", lengthCategory: "long"
  },
  {
    id: 'q-97',
    text: "When you practice typing, focus entirely on accuracy. Every typo you make creates a negative muscle reflex that must be unlearned. If you type slowly but perfectly, your speed will naturally increase over time as your brain streamlines the motor paths. However, if you type quickly but with errors, you will hit a speed ceiling that is difficult to break. Slow down, get it right, and speed will follow.",
    author: "Touch Typing Pedagogy", category: "education", lengthCategory: "long"
  },
  {
    id: 'q-98',
    text: "A premium user interface uses HSL-based colors to derive shadows, borders, and active selections dynamically from the background. This ensures that whether the user is on a dark carbon theme or a light ivory theme, the contrast remains optimal and typography remains legible. Dynamic, code-driven styling is how we create beautiful interfaces that adapt to user preferences automatically.",
    author: "Dynamic Color Systems", category: "business", lengthCategory: "long"
  },
  {
    id: 'q-99',
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall. When you fail a typing challenge, crash a server, or write buggy code, treat it as a valuable data point. Analyze what went wrong, understand the underlying cause, and adjust your approach. This empirical method of debugging and learning is how you build resilience and master any technical skill.",
    author: "Nelson Mandela", category: "motivation", lengthCategory: "long"
  },
  {
    id: 'q-100',
    text: "Congratulations! You have completed the final quote typing lesson. By practicing quotes of varying lengths and categories, you have built high fluency in standard sentence structure, capitalizations, and punctuation. Continue practicing daily to maintain your speed, push your limits, and level up your skills. Remember, touch typing is a journey of continuous improvement. Keep typing!",
    author: "TypeMaster Certification", category: "motivation", lengthCategory: "long"
  }
];
