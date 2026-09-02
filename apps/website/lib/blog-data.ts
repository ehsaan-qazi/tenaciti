/* =========================================================================
   Blog Data Layer
   All 6 articles from tenaciti-blog-content-pack-2.md, stored as structured
   TypeScript objects. Each post contains full rich-text content blocks that
   the article page renders into semantic HTML.
   ========================================================================= */

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; id: string; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'formula'; text: string }
  | { type: 'callout'; variant: 'tip' | 'product' | 'warning'; title?: string; text: string; href?: string; linkLabel?: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'blockquote'; text: string }
  | { type: 'sources'; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  categorySlug: string;
  publishedAt: string; // ISO date
  updatedAt?: string;
  readingTime: number; // minutes
  excerpt: string;
  targetKeywords: string[];
  content: ContentBlock[];
  relatedSlugs: string[];
}

// ─── Post 1 ─────────────────────────────────────────────────────────────────

const post1: BlogPost = {
  slug: 'hec-4-0-gpa-scale-explained',
  title: 'The HEC 4.0 GPA Scale, Explained (and Why Every University\'s Table Looks Slightly Different)',
  metaTitle: 'The HEC 4.0 GPA Scale Explained (With Real Numbers)',
  metaDescription: 'HEC recommends a 4.0-point scale, but doesn\'t fix one universal table — every university sets its own bands. Here\'s how to read yours correctly.',
  category: 'GPA & Scales',
  categorySlug: 'gpa-scales',
  publishedAt: '2026-09-02',
  readingTime: 6,
  excerpt: 'HEC recommends a 4.0-point scale, but doesn\'t mandate one universal percentage-to-letter-grade table — each university publishes its own grade bands. Here\'s how to read yours correctly.',
  targetKeywords: ['HEC 4.0 GPA scale', 'HEC grading scale Pakistan'],
  relatedSlugs: ['syllabus-to-study-plan', 'lecture-slides-to-study-checklist'],
  content: [
    { type: 'paragraph', text: 'Pakistan\'s Higher Education Commission (HEC) recommends that all HEC-recognized universities use a 4.0-point GPA scale. What it does <em>not</em> do is mandate one single, universal percentage-to-letter-grade table — each university publishes its own grade bands within that general guidance. That\'s why you\'ll find slightly different numbers depending on which university\'s handbook (or which online calculator) you check. Below is one of the most common implementations, the formula behind it, and how to find your own university\'s exact table instead of guessing.' },
    { type: 'heading', level: 2, id: 'common-implementation', text: 'A common HEC 4.0 implementation' },
    { type: 'paragraph', text: 'This is the table Tenaciti\'s own GPA calculator uses by default — modeled on the COMSATS Fall 2021+ standard, one of the more widely mirrored versions across Pakistani universities:' },
    { type: 'table', headers: ['Percentage', 'Letter Grade', 'Grade Point'], rows: [
      ['85% and above', 'A', '4.00'],
      ['80–84.99%', 'A-', '3.70'],
      ['75–79.99%', 'B+', '3.30'],
      ['70–74.99%', 'B', '3.00'],
      ['65–69.99%', 'B-', '2.70'],
      ['61–64.99%', 'C+', '2.30'],
      ['58–60.99%', 'C', '2.00'],
      ['55–57.99%', 'C-', '1.70'],
      ['50–54.99%', 'D', '1.00'],
      ['Below 50%', 'F', '0.00'],
    ]},
    { type: 'paragraph', text: '<strong>Your university\'s exact bands may differ</strong> — some set A at 90%+ rather than 85%+, some skip the +/- modifiers entirely, some use different C/D cutoffs. Check your own academic handbook or transcript key before treating any online table as gospel; if yours doesn\'t match this one, Tenaciti\'s calculator lets you enter a fully custom scale instead of forcing this default.' },
    { type: 'heading', level: 2, id: 'the-formula', text: 'The formula behind every version' },
    { type: 'paragraph', text: 'Regardless of exactly where the bands sit, the underlying GPA formula is identical across HEC-recognized universities:' },
    { type: 'formula', text: 'GPA = Σ(grade point × credit hours) ÷ Σ(credit hours)' },
    { type: 'paragraph', text: '<strong>Worked example</strong> using the table above: a 3-credit course with an A (4.00) and a 4-credit course with a B+ (3.30):' },
    { type: 'formula', text: '(3 × 4.00) + (4 × 3.30) = 12.00 + 13.20 = 25.20\n25.20 ÷ 7 total credit hours = 3.6 GPA' },
    { type: 'paragraph', text: 'This is the same formula whether you\'re calculating a single semester (SGPA) or your cumulative record (CGPA) — the only difference is which set of courses you include. (See our <a href="/blog/sgpa-vs-cgpa-hec-4-scale">SGPA vs CGPA guide</a> for the distinction.)' },
    { type: 'heading', level: 2, id: 'percentage-conversion', text: 'Converting GPA to a percentage isn\'t as simple as ×25' },
    { type: 'paragraph', text: 'A common shortcut circulating online is <code>Percentage = GPA × 25</code>, on the logic that a 4.0 GPA equals a perfect 100%. It\'s a reasonable rough estimate, but it\'s mathematically imprecise for one specific reason: on most HEC-style scales, the <em>A</em> band starts at 85%, not 100% — so a straight linear ×25 conversion <strong>overstates</strong> your true percentage at the high end. A 4.0 GPA could represent anywhere from 85% to 100% depending on your actual marks; ×25 always reports it as 100%. For anything that matters — a scholarship application, a transcript request, a job application — use your actual recorded percentage, not a GPA-derived estimate.' },
    { type: 'heading', level: 2, id: 'why-it-matters', text: 'Why this matters more than it looks like it should' },
    { type: 'paragraph', text: 'If you\'re transferring between universities, applying for a scholarship, or just trying to figure out what grade you need on a final to hit a target GPA, the specific bands you\'re using change the answer. A 78% lands as a B+ (3.30) on the table above, but as a plain B on a university that draws the B+/B line at 80%. Getting your own university\'s real table into whatever you\'re using to calculate your GPA — not a generic one pulled off the internet — is the difference between a useful number and a wrong one.' },
    { type: 'heading', level: 2, id: 'calculate-correctly', text: 'Calculate it correctly' },
    { type: 'callout', variant: 'product', title: 'Free HEC 4.0 GPA Calculator', text: 'Tenaciti\'s GPA calculator defaults to the table above and lets you switch to a fully custom scale — your own grade points and percentage thresholds — in a few taps if your university\'s numbers differ. No account required.', href: '/tools/gpa-calculator', linkLabel: 'Try the Free Calculator' },
    { type: 'sources', text: 'Higher Education Commission (HEC) of Pakistan grading policy guidance, as implemented and published by individual HEC-recognized universities (bands vary by institution — cross-check your own transcript or university academic handbook).' },
  ],
};

// ─── Post 2 ─────────────────────────────────────────────────────────────────

const post2: BlogPost = {
  slug: 'syllabus-to-study-plan',
  title: 'How to Turn a Syllabus Into a Study Plan (Before Week One Is Over)',
  metaTitle: 'How to Turn a Syllabus Into a Study Plan (Free Method)',
  metaDescription: 'Every deadline and grade weight you need is already in your syllabus. Here\'s a step-by-step method to turn it into an actual plan — fast.',
  category: 'Study Systems',
  categorySlug: 'study-systems',
  publishedAt: '2026-09-02',
  readingTime: 7,
  excerpt: 'Every syllabus already contains a complete plan for your semester — deadlines, grade weights, exam dates — it\'s just buried in prose. Here\'s a step-by-step method to turn it into an actual plan.',
  targetKeywords: ['syllabus to study plan', 'how to plan a semester'],
  relatedSlugs: ['lecture-slides-to-study-checklist', 'confidence-calibration-exam-performance'],
  content: [
    { type: 'paragraph', text: 'Every syllabus already contains a complete plan for your semester — deadlines, grade weights, exam dates — it\'s just buried in prose across a dozen pages instead of laid out chronologically. The fix isn\'t a new planning philosophy; it\'s pulling that information out once, sorting it by date and weight, and adding review time before the big items instead of after you\'re already behind.' },
    { type: 'heading', level: 2, id: 'why-syllabi-are-hard', text: 'Why syllabi are hard to plan from as written' },
    { type: 'paragraph', text: 'A syllabus is written to be read once, at the start of the semester, as a reference document — not as a schedule. Deadlines show up in paragraph form ("the midterm will be held in week 8"), grade weights sit in a separate table two pages later, and a pop quiz policy might only be mentioned once in a footnote. None of that is arranged by <em>when it\'s due</em> or <em>how much it\'s worth</em>, which are the only two things you actually need to plan around. The information is complete; the format just isn\'t usable yet.' },
    { type: 'heading', level: 2, id: 'step-1-extract', text: 'Step 1: Extract every graded item, with its weight and date' },
    { type: 'paragraph', text: 'Before you build anything, get a flat list: every assignment, quiz, exam, project, and lab — each with a due date and a grade weight, where the syllabus states one. If a date or weight isn\'t clearly stated, don\'t guess at it; flag it as unknown and confirm with your instructor or the course portal. Guessed deadlines are worse than no deadline, because they create false confidence.' },
    { type: 'callout', variant: 'product', title: 'Skip the manual extraction', text: 'This is exactly what Tenaciti\'s AI syllabus extraction automates from a PDF — but the method works with a spreadsheet and an afternoon, too.', href: '/features/ai-roadmap', linkLabel: 'Learn about AI Roadmap Extraction' },
    { type: 'heading', level: 2, id: 'step-2-sort', text: 'Step 2: Sort chronologically — but plan by weight, not just by date' },
    { type: 'paragraph', text: 'Once you have the flat list, sort it by due date to see your semester at a glance. Then re-read it with weight in mind: a 5% homework due next week and a 30% final due in ten weeks are not equally urgent, even though the homework comes first. A simple approach is to flag anything worth more than 15–20% of your grade as a "major" item and give it a dedicated review block, not just a due-date reminder.' },
    { type: 'heading', level: 2, id: 'step-3-work-backward', text: 'Step 3: Work backward from your major items' },
    { type: 'paragraph', text: 'For every major item, don\'t just note the due date — schedule review sessions in the weeks leading up to it, not the days. This is where distributed practice becomes relevant: across a large body of learning-science research, spacing study sessions out over time has consistently outperformed massed, last-minute studying for actual retention (Dunlosky et al., 2013, in one of the most cited reviews of learning techniques, rated distributed practice — along with practice testing — as the highest-utility strategy they evaluated, ahead of far more commonly used techniques like rereading and highlighting). Concretely: for a final in week 14, that might mean a first review pass in week 10, a second in week 12, and a final consolidation in week 13 — not one long session the weekend before.' },
    { type: 'heading', level: 2, id: 'step-4-revisit', text: 'Step 4: Revisit weekly, not just at the start of the semester' },
    { type: 'paragraph', text: 'A plan built in week one and never touched again drifts out of date the first time a deadline shifts or a quiz gets added. Set a five-minute weekly check: does anything need to move, and does the next two weeks\' review schedule still make sense given what\'s actually due? This is a maintenance habit, not a rebuild — the hard part (getting everything out of the syllabus and onto a timeline) only happens once.' },
    { type: 'heading', level: 2, id: 'skip-manual', text: 'Skip the manual extraction' },
    { type: 'callout', variant: 'product', title: 'AI Roadmap Extraction', text: 'If you\'d rather not manually retype every date and weight out of a PDF, Tenaciti\'s AI roadmap extraction does step 1 automatically — upload your syllabus and it pulls out every assessment with its deadline and weight, flags anything unclear instead of guessing, and gives you a chronological roadmap you can confirm and adjust in one pass.', href: '/features/ai-roadmap', linkLabel: 'Try AI Roadmap Extraction' },
    { type: 'sources', text: 'Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving Students\' Learning With Effective Learning Techniques: Promising Directions From Cognitive and Educational Psychology. Psychological Science in the Public Interest, 14(1), 4–58.' },
  ],
};

// ─── Post 3 ─────────────────────────────────────────────────────────────────

const post3: BlogPost = {
  slug: 'confidence-calibration-exam-performance',
  title: 'Confidence Calibration: Why Feeling Ready and Being Ready Aren\'t the Same',
  metaTitle: 'Confidence Calibration: Why "I Get It" ≠ Exam-Ready',
  metaDescription: 'Feeling confident and being prepared are different things. Here\'s what the research says about closing the gap — and how to actually measure it.',
  category: 'Study Systems',
  categorySlug: 'study-systems',
  publishedAt: '2026-09-02',
  readingTime: 8,
  excerpt: 'Confidence calibration is how closely your predicted performance matches your actual performance. Most students are poorly calibrated — and research shows this doesn\'t fix itself without deliberate feedback.',
  targetKeywords: ['confidence calibration', 'why do I feel ready but do badly on exams'],
  relatedSlugs: ['lecture-slides-to-study-checklist', 'syllabus-to-study-plan'],
  content: [
    { type: 'paragraph', text: 'Confidence calibration is how closely your predicted performance matches your actual performance. Most students are poorly calibrated — usually in the direction of overconfidence — and research shows this doesn\'t fix itself over time without deliberate feedback. The gap between "I understood the lecture" and "I can produce the answer on an exam under pressure" is a real, well-studied phenomenon, not a personal failing, and it\'s specifically fixable with the right kind of self-tracking.' },
    { type: 'heading', level: 2, id: 'the-research', text: 'The research: most people overestimate, and lower performers overestimate more' },
    { type: 'paragraph', text: 'The foundational finding here is Kruger and Dunning\'s 1999 study, often referred to as the "unskilled and unaware" effect: people who scored in the bottom quartile on tests of logic, grammar, and other skills significantly overestimated their own performance, rating themselves as above average when they weren\'t. Higher performers, by contrast, were generally accurate or slightly <em>underconfident</em>. This isn\'t a one-off result — a large body of follow-up research in classroom settings has replicated the same pattern: students who are struggling tend to be the most confident that they aren\'t, and students who are doing well are sometimes the most likely to underrate themselves.' },
    { type: 'paragraph', text: 'More recent classroom research has extended this further: a multi-exam study tracking students\' grade predictions across an entire semester found that low-performing students\' overconfidence didn\'t fade as evidence accumulated against it — they remained confident in inflated predictions exam after exam, with no sign of the miscalibration self-correcting on its own. Left alone, the gap between feeling ready and being ready doesn\'t close by default. Something has to interrupt it.' },
    { type: 'heading', level: 2, id: 'recognition-vs-retrieval', text: 'Why "I understood it" doesn\'t mean "I can retrieve it"' },
    { type: 'paragraph', text: 'Part of what drives the gap is that recognizing information and producing it are different cognitive tasks. Rereading a chapter or watching a lecture again <em>feels</em> like understanding because the material is familiar when you encounter it — but recognizing something you\'re looking at is a much easier task than retrieving it from memory with no cues, which is what an exam actually demands. That mismatch between the ease of <em>recognition</em> and the difficulty of <em>retrieval</em> is a well-documented source of miscalibrated confidence: the studying felt productive because it was easy, and easy is often mistaken for learned.' },
    { type: 'heading', level: 2, id: 'what-improves-calibration', text: 'What actually improves calibration' },
    { type: 'paragraph', text: 'The research on this is genuinely encouraging: calibration is trainable. Studies that gave students structured feedback comparing their predicted performance to their actual performance — and had them reflect on the gap — showed measurable improvements in calibration accuracy on subsequent exams, whereas comparison groups without that feedback loop didn\'t improve. Other research recommends the specific practice of plotting predicted scores against actual scores after each assessment, so the gap (or its absence) becomes visually obvious rather than an abstract feeling. The common thread across these interventions isn\'t "study more" — it\'s <strong>predict, then check, then reflect on the difference</strong>, repeated regularly.' },
    { type: 'heading', level: 2, id: 'turning-into-habit', text: 'Turning this into a habit' },
    { type: 'paragraph', text: 'In practice, that loop looks like:' },
    { type: 'list', ordered: true, items: [
      '<strong>Before or at completion of a topic or assignment</strong>, rate your own confidence — not "did I finish it" but "how sure am I this is actually right."',
      '<strong>After you get a result</strong> — a grade, feedback, a practice test score — compare it honestly to what you predicted.',
      '<strong>Write one sentence about the gap</strong>, if there was one: was it the material, the format, time pressure, something you thought you knew but didn\'t?',
      '<strong>Look for the pattern across a semester</strong>, not just one assessment — a single miscalibrated exam is normal; the same pattern repeating on every exam in one specific course is a signal worth acting on.',
    ]},
    { type: 'callout', variant: 'product', title: 'Track Your Calibration', text: 'This is precisely the loop Tenaciti\'s self-assessment feature is built around: rate your confidence when you complete a topic or assessment, log how it actually went, and see the gap tracked across a semester instead of relying on memory to notice a pattern that research suggests won\'t correct itself unprompted.', href: '/features/self-assessment', linkLabel: 'Explore Self-Assessment' },
    { type: 'sources', text: 'Kruger, J., & Dunning, D. (1999). Unskilled and Unaware of It: How Difficulties in Recognizing One\'s Own Incompetence Lead to Inflated Self-Assessments. Journal of Personality and Social Psychology, 77(6), 1121–1134. Additional classroom calibration research including Hacker, D. J., Bol, L., & Bahbahani, K. (2008), Explaining Calibration Accuracy in Classroom Contexts, Metacognition and Learning, 3, 101–121; and a semester-long grade-prediction study (2023) published in the Journal of Intelligence documenting persistent overconfidence among low-performing students across repeated exams.' },
  ],
};

// ─── Post 4 ─────────────────────────────────────────────────────────────────

const post4: BlogPost = {
  slug: 'note-linking-zettelkasten-students',
  title: 'Why Linking Your Notes Beats Organizing Them (The Zettelkasten Method for Students)',
  metaTitle: 'Why Linking Notes Beats Filing Them: Zettelkasten Guide',
  metaDescription: 'A German sociologist wrote 70+ books using a box of linked index cards. Here\'s the note-taking method behind it, adapted for a semester.',
  category: 'Note Taking',
  categorySlug: 'note-taking',
  publishedAt: '2026-09-02',
  readingTime: 7,
  excerpt: 'Most note-taking systems optimize for filing. The Zettelkasten method optimizes for connection — and the act of linking two notes is itself a proven learning technique, not just an organizational trick.',
  targetKeywords: ['Zettelkasten for students', 'note linking method', 'Obsidian for students'],
  relatedSlugs: ['confidence-calibration-exam-performance', 'lecture-slides-to-study-checklist'],
  content: [
    { type: 'paragraph', text: 'Most note-taking systems optimize for filing — folders, tags, chapters — which makes notes easy to store but hard to rediscover once they\'re buried. The Zettelkasten ("slip-box") method, developed by German sociologist Niklas Luhmann, optimizes for something different: connection. Notes gain value from what they\'re linked to, not from where they\'re filed — and for students specifically, the <em>act</em> of linking two notes is itself a proven learning technique, not just an organizational trick.' },
    { type: 'heading', level: 2, id: 'where-this-comes-from', text: 'Where this comes from' },
    { type: 'paragraph', text: 'Niklas Luhmann was a sociologist who, over roughly four decades, published more than 70 books and 600 articles with no research team and no co-authors — an unusually large output he attributed largely to his note-taking system: tens of thousands of small, interconnected notes stored in physical boxes, each one linked to related notes by reference. Instead of filing each note under one topic, he built a web where a single note could be discovered from multiple directions — the connections did the organizational work that folders normally do, except without forcing every idea into exactly one category.' },
    { type: 'heading', level: 2, id: 'core-difference', text: 'The core difference from a normal notes app' },
    { type: 'paragraph', text: 'A typical notes app (or a stack of lecture notebooks) treats each note as its own island: you write it, you file it under a course or a date, and finding it again means remembering where you put it or scrolling until you recognize it. A linked system treats each note as a node with connections — write a note on the Krebs cycle, link it to your note on cellular respiration, and now either note can lead you to the other, permanently, regardless of what folder either one sits in. Notes without any links tend to lose most of their usefulness over time, precisely because rediscovering them depends entirely on memory of where they were filed.' },
    { type: 'heading', level: 2, id: 'linking-as-learning', text: 'Why linking is a learning technique, not just a filing technique' },
    { type: 'paragraph', text: 'Here\'s the part that matters most for studying, specifically: the act of creating a link between two notes requires you to articulate <em>why</em> they\'re related — which is functionally the same thing as a well-established learning strategy called elaborative interrogation (generating an explanation for why something is true) or self-explanation (explaining how new information connects to what you already know). In one of the most widely cited reviews of learning techniques, Dunlosky and colleagues (2013) rated both of these as moderate-utility strategies precisely because they force deeper processing of material than passive review does — you can\'t link two ideas without briefly explaining the relationship to yourself, and that explaining is where the actual learning happens. Rereading a note doesn\'t require this; linking it does.' },
    { type: 'heading', level: 2, id: 'how-to-do-this', text: 'How to actually do this as a student' },
    { type: 'list', ordered: false, items: [
      '<strong>Keep notes atomic.</strong> One idea per note, not one note per lecture. A note titled "Krebs Cycle" you can link to five other notes is more useful than a 40-minute lecture transcript you can only link to one course.',
      '<strong>Link liberally, and write why.</strong> When you connect two notes, a short phrase on the link ("builds on," "contradicts," "example of") turns a vague association into something you\'ll actually understand when you revisit it in week 12.',
      '<strong>Check your backlinks, not just your links.</strong> A note\'s backlink panel — everything that links <em>to</em> it — often surfaces connections you made in a completely different context and had forgotten about.',
      '<strong>Use the graph view before exams, not just while studying.</strong> Seeing the shape of a course — which topics are dense with connections and which are isolated — tells you at a glance what\'s actually central to the material versus what\'s a minor detail, which is a different (and often more useful) signal than a linear list of chapters.',
    ]},
    { type: 'heading', level: 2, id: 'without-switching-tools', text: 'Doing this without switching tools constantly' },
    { type: 'callout', variant: 'product', title: 'Knowledge Graph Notes', text: 'Digital tools like Obsidian popularized this approach outside of academia. Tenaciti\'s knowledge graph brings the same core mechanics — Markdown notes, [[wikilinks]], automatic backlinks, and a live force-directed graph view — built specifically around a semester\'s worth of courses, rather than a general-purpose personal vault.', href: '/features/knowledge-graph', linkLabel: 'Explore the Knowledge Graph' },
    { type: 'sources', text: 'Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving Students\' Learning With Effective Learning Techniques. Psychological Science in the Public Interest, 14(1), 4–58. Craik, F. I. M., & Lockhart, R. S. (1972). Levels of Processing: A Framework for Memory Research. Journal of Verbal Learning and Verbal Behavior, 11(6), 671–684. Biographical detail on Niklas Luhmann\'s Zettelkasten drawn from multiple secondary accounts of his archived note collection; treat the specific card count (commonly cited as approximately 90,000) as a widely reported estimate rather than a verified primary figure.' },
  ],
};

// ─── Post 5 (Held for AI Assistant launch) ──────────────────────────────────

const post5: BlogPost = {
  slug: 'how-tenaciti-ai-assistant-works',
  title: 'How Tenaciti\'s AI Assistant Works (and What It Can Actually Do)',
  metaTitle: 'How Tenaciti\'s AI Assistant Works (Real Examples)',
  metaDescription: 'Ask it what to study next, tell it to update a goal, or have it build a study plan. Here\'s exactly how Tenaciti\'s AI Assistant works.',
  category: 'AI & Workflows',
  categorySlug: 'ai-workflows',
  publishedAt: '2026-09-02',
  readingTime: 5,
  excerpt: 'Tenaciti\'s AI Assistant is a conversational interface to your entire workspace — it understands your courses, progress, and notes, and can take direct action from a single prompt.',
  targetKeywords: ['AI agent for students', 'AI study assistant that takes actions'],
  relatedSlugs: ['syllabus-to-study-plan', 'note-linking-zettelkasten-students'],
  content: [
    { type: 'paragraph', text: 'Tenaciti\'s AI Assistant is a conversational interface to your entire workspace — it understands your courses, topics, progress, goals, deadlines, notes, and uploaded material, and it can both answer questions about them and take direct action: creating notes, updating goals, completing topics, linking related content, and building study plans, all from a single natural-language prompt.' },
    { type: 'heading', level: 2, id: 'different-from-chatgpt', text: 'What makes this different from asking ChatGPT' },
    { type: 'paragraph', text: 'A general-purpose chatbot has no access to your actual courses, deadlines, notes, or progress unless you manually paste it in every time. Tenaciti\'s assistant is already grounded in that context and can act on it directly, rather than just describing what you should go do yourself.' },
    { type: 'list', ordered: false, items: [
      '<strong>Context-aware:</strong> It knows your enrolled courses, uploaded syllabi, topic completion status, confidence ratings, notes, and deadlines — no need to explain your situation from scratch each time.',
      '<strong>Action-taking:</strong> It doesn\'t just tell you what to do — it can create notes, mark topics complete, update goals, link related content, and build study plans directly in your workspace.',
      '<strong>Workspace-integrated:</strong> Every action it takes updates your real workspace data, not a separate chat history that you\'d need to manually transfer.',
    ]},
    { type: 'heading', level: 2, id: 'real-examples', text: 'Real examples' },
    { type: 'paragraph', text: 'The AI Assistant operates in three modes — <strong>Ask</strong>, <strong>Find</strong>, and <strong>Do</strong>:' },
    { type: 'heading', level: 3, id: 'ask-mode', text: 'Ask: Get answers grounded in your actual data' },
    { type: 'list', ordered: false, items: [
      '"What should I study next before my Thermodynamics midterm?"',
      '"Which topics do I have the lowest confidence in for Data Structures?"',
      '"How is my GPA looking this semester compared to last?"',
    ]},
    { type: 'heading', level: 3, id: 'find-mode', text: 'Find: Search across your workspace' },
    { type: 'list', ordered: false, items: [
      '"Find all my notes about recursion"',
      '"Which courses have upcoming deadlines this week?"',
      '"Show me topics I haven\'t reviewed in over two weeks"',
    ]},
    { type: 'heading', level: 3, id: 'do-mode', text: 'Do: Take real actions in your workspace' },
    { type: 'list', ordered: false, items: [
      '"Create a note linking mitosis and meiosis"',
      '"Mark my Chapter 4 topic as complete and build me a two-week study plan for finals"',
      '"Set a goal to raise my Data Structures GPA to 3.5 by the end of semester"',
    ]},
    { type: 'heading', level: 2, id: 'try-it', text: 'Try it' },
    { type: 'callout', variant: 'product', title: 'AI Workspace Assistant', text: 'The AI Assistant is available inside your Tenaciti workspace. Open it from any course or from the main dashboard to start asking, finding, and doing.', href: '/features/ai-assistant', linkLabel: 'Learn More About the AI Assistant' },
  ],
};

// ─── Post 6 ─────────────────────────────────────────────────────────────────

const post6: BlogPost = {
  slug: 'lecture-slides-to-study-checklist',
  title: 'From Lecture Slides to a Study Checklist That Actually Tracks Your Readiness',
  metaTitle: 'Turn Lecture Slides Into a Checklist That Tracks Readiness',
  metaDescription: 'Checking a box feels like progress even when it isn\'t. Here\'s how to build a topic checklist that actually tracks what you understand.',
  category: 'Study Systems',
  categorySlug: 'study-systems',
  publishedAt: '2026-09-02',
  readingTime: 7,
  excerpt: 'Turning lecture slides into a checklist is easy — the problem is that checking a box only tells you that you looked at something, not that you understand it. Here\'s the fix.',
  targetKeywords: ['study checklist for exams', 'track exam readiness by topic', 'turn lecture notes into checklist'],
  relatedSlugs: ['confidence-calibration-exam-performance', 'syllabus-to-study-plan'],
  content: [
    { type: 'paragraph', text: 'Turning lecture slides into a checklist is easy — extract every topic, list it, check it off as you go. The problem is that checking a box only tells you that you <em>looked at</em> something, not that you <em>understand</em> it, and checklists are specifically designed by our own psychology to feel satisfying regardless of which one is true. The fix isn\'t a fancier checklist — it\'s pairing every checkmark with a forced, honest rating of how well you actually know the material, and tracking that rating over time instead of just the checkmark.' },
    { type: 'heading', level: 2, id: 'why-checklists-feel-good', text: 'Why checklists feel so good to check off — and why that\'s a trap' },
    { type: 'paragraph', text: 'There\'s a real, well-documented reason ticking a box is satisfying: the Zeigarnik effect (Zeigarnik, 1927) describes how unfinished tasks stay mentally "open" and nag at your attention until they\'re resolved, while the goal-gradient effect describes how motivation actually increases as a goal gets closer — which is exactly why a shrinking checklist feels more compelling to finish than a long one. These effects are real and useful; they\'re a large part of why checklists work as a study tool at all.' },
    { type: 'paragraph', text: 'But neither effect has anything to do with whether the material sunk in. A checkbox closes the same mental "open loop" whether you spent thirty seconds skimming a slide or an hour working through it until you could explain it cold. That\'s the trap: the <em>satisfaction</em> of checking something off is completely decoupled from the <em>substance</em> of what you actually learned, which means a checklist by itself can quietly turn into checklist theater — a list of things you technically looked at, that tells you nothing about whether you\'re ready for an exam on any of them.' },
    { type: 'heading', level: 2, id: 'the-fix', text: 'The fix: pair every checkmark with a forced rating' },
    { type: 'paragraph', text: 'The way out isn\'t a better checklist — it\'s making the checkbox impossible to use as a substitute for an honest self-assessment. Concretely: when you extract topics from a set of lecture slides and check one off, a rating prompt should appear in the same motion — how confident are you, 1 to 5, that you actually understand this, not just that you got through it. The checkbox and the rating aren\'t two separate steps you can do at different times; they\'re one action, so there\'s no way to mark something "done" without also being honest about how done it really is.' },
    { type: 'paragraph', text: 'This turns a simple completion list into something closer to a running calibration record (see our <a href="/blog/confidence-calibration-exam-performance">confidence calibration post</a> for the research behind why this specific gap — feeling done versus being ready — is worth tracking deliberately rather than trusting your gut). Instead of one flat list of checked and unchecked topics, you get a list of topics with an honesty-scored confidence level attached to each one, which is a much more useful thing to look at the week before an exam.' },
    { type: 'heading', level: 2, id: 'in-practice', text: 'What this looks like in practice' },
    { type: 'list', ordered: true, items: [
      '<strong>Extract, don\'t retype.</strong> Upload your lecture slides (PDF or PowerPoint) and let topics get pulled out automatically instead of manually rebuilding a list from scratch — the point is to spend your time studying the material, not transcribing it.',
      '<strong>Reorder to match how the course actually flows</strong>, not how the slides happened to be uploaded — drag-and-drop the list into the sequence you\'ll actually study it in.',
      '<strong>Check it off, rate it immediately.</strong> The moment you mark a topic complete, rate your confidence 1–5 in the same step. No rating, no checkmark — that friction is the entire point.',
      '<strong>Merge duplicates as they show up.</strong> The same concept often reappears across multiple lectures; merging keeps your list from fragmenting into ten near-identical entries while preserving the confidence history you\'ve already built for it.',
      '<strong>Link topics to what they\'re tested on.</strong> Connecting "Chapter 4: Thermodynamics" directly to the midterm it appears on turns a flat topic list into something you can sort by what\'s actually at stake, not just what\'s next chronologically.',
    ]},
    { type: 'heading', level: 2, id: 'read-the-checklist', text: 'Read the checklist, not just the completion count' },
    { type: 'paragraph', text: 'A checklist that\'s 100% checked off tells you nothing on its own — a checklist where every item is checked <em>and</em> rated tells you exactly where to spend your next study session: the checked-off, low-confidence items, which a plain completion tracker would show you as identical to your highest-confidence topics. That difference is the entire reason the rating step exists.' },
    { type: 'heading', level: 2, id: 'try-it', text: 'Try it' },
    { type: 'callout', variant: 'product', title: 'Topic Tracking with Confidence Ratings', text: 'Tenaciti\'s topic tracking feature extracts topics directly from uploaded lecture slides and notes, pairs every completion with an immediate confidence rating, and keeps that history even as you merge or reorder topics — so your checklist tells you what you\'re actually ready for, not just what you\'ve opened.', href: '/features/topic-tracking', linkLabel: 'Explore Topic Tracking' },
    { type: 'sources', text: 'Zeigarnik, B. (1927). Über das Behalten von erledigten und unerledigten Handlungen [On Finished and Unfinished Tasks]. Psychologische Forschung, 9, 1–85 — the original study on the memory pull of unfinished tasks. Kivetz, R., Urminsky, O., & Zheng, Y. (2006). The Goal-Gradient Hypothesis Resurrected: Purchase Acceleration, Illusionary Goal Progress, and Customer Retention. Journal of Marketing Research, 43(1), 39–58. Cheema, A., & Bagchi, R. (2011), on goal visualization and perceived goal proximity, as cited in subsequent UX-psychology research on progress indicators.' },
  ],
};

// ─── Exports ────────────────────────────────────────────────────────────────

const ALL_POSTS: BlogPost[] = [post1, post2, post3, post4, post5, post6];

/** All posts sorted by date (newest first). */
export function getAllPosts(): BlogPost[] {
  return [...ALL_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/** Get a single post by slug, or undefined if not found. */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return ALL_POSTS.find((p) => p.slug === slug);
}

/** Get related posts for a given slug. Falls back to same-category posts. */
export function getRelatedPosts(currentSlug: string, limit = 2): BlogPost[] {
  const current = getPostBySlug(currentSlug);
  if (!current) return [];

  // First try the explicit relatedSlugs
  const related = current.relatedSlugs
    .map((s) => getPostBySlug(s))
    .filter((p): p is BlogPost => p !== undefined)
    .slice(0, limit);

  if (related.length >= limit) return related;

  // Fill remaining slots with same-category posts
  const remaining = ALL_POSTS.filter(
    (p) => p.slug !== currentSlug && p.category === current.category && !related.some((r) => r.slug === p.slug)
  );
  return [...related, ...remaining].slice(0, limit);
}

/** All unique categories from the blog. */
export function getAllCategories(): string[] {
  const cats = new Set(ALL_POSTS.map((p) => p.category));
  return Array.from(cats);
}

/** All valid blog slugs (for generateStaticParams). */
export function getAllSlugs(): string[] {
  return ALL_POSTS.map((p) => p.slug);
}

/** Extract H2 headings from content for Table of Contents. */
export function extractToc(content: ContentBlock[]): { id: string; text: string; level: 2 | 3 }[] {
  return content
    .filter((b): b is Extract<ContentBlock, { type: 'heading' }> => b.type === 'heading')
    .map((b) => ({ id: b.id, text: b.text, level: b.level }));
}
