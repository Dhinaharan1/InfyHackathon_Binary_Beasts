from models import AgentPersona, DebateSetup, DebateMessage

DEMO_AGENTS = [
    AgentPersona(
        name="Dr. Sarah Chen",
        role="AI Research Director",
        industry="Education Technology",
        stance="for",
        expertise="Machine learning in adaptive education systems",
        personality="Warm and data-driven, uses real studies to back her claims",
        avatar_color="#6366F1",
        avatar_emoji="brain",
        gender="female",
        accent="american",
        emotional_style="gets genuinely excited sharing research findings",
    ),
    AgentPersona(
        name="James O'Brien",
        role="High School Principal",
        industry="Education Technology",
        stance="against",
        expertise="20 years of classroom leadership and student mentorship",
        personality="Passionate storyteller who speaks from decades of experience",
        avatar_color="#EF4444",
        avatar_emoji="fire",
        gender="male",
        accent="british",
        emotional_style="speaks from the heart with real classroom stories",
    ),
    AgentPersona(
        name="Priya Kapoor",
        role="EdTech Product Manager",
        industry="Education Technology",
        stance="neutral",
        expertise="Building AI-powered learning platforms for diverse markets",
        personality="Calm and balanced, sees both the promise and the pitfalls",
        avatar_color="#10B981",
        avatar_emoji="leaf",
        gender="female",
        accent="indian",
        emotional_style="stays calm and builds bridges between opposing views",
    ),
]

DEMO_SETUP = DebateSetup(
    topic="Should AI replace teachers in classrooms?",
    industry="Education Technology",
    agents=DEMO_AGENTS,
    total_rounds=4,
    language="english",
)

ROUND_NAMES = [
    "Opening Statements",
    "Cross-Examination",
    "Rebuttals",
    "Closing Statements",
]

DEMO_MESSAGES = [
    # Round 0 - Opening Statements
    DebateMessage(
        agent=DEMO_AGENTS[0],
        content="I have spent the last decade studying how AI transforms learning outcomes, and the results are remarkable. Adaptive AI tutors can personalize education for each student in ways a single teacher with 30 students simply cannot. A Stanford study showed that students using AI-assisted learning improved test scores by 30% compared to traditional methods. This is not about replacing the human spirit of teaching... it is about giving every child a fair chance at quality education.",
        round_name="Opening Statements",
        round_number=0,
    ),
    DebateMessage(
        agent=DEMO_AGENTS[1],
        content="With all due respect to the research, I have watched thousands of students walk through my school doors over 20 years, and I can tell you this: the moment that changes a struggling student's life is not an algorithm. It is a teacher who notices they have not smiled in a week. It is a mentor who stays after hours because they believe in that child. AI cannot replicate empathy, intuition, or the human connection that makes education transformative.",
        round_name="Opening Statements",
        round_number=0,
    ),
    DebateMessage(
        agent=DEMO_AGENTS[2],
        content="Both of you raise excellent points, and honestly, I think the real answer lies somewhere in the middle. At my company, we build AI tools that teachers actually love using. The key insight we have found is that AI handles the repetitive parts like grading and progress tracking, which frees teachers to do what they do best: inspire, mentor, and connect. The question is not replacement, it is how we design the collaboration.",
        round_name="Opening Statements",
        round_number=0,
    ),

    # Round 1 - Cross-Examination
    DebateMessage(
        agent=DEMO_AGENTS[0],
        content="James, I hear your passion, and I respect it deeply. But consider this: there are 260 million children worldwide who have no access to any teacher at all. For them, an AI tutor is not a replacement, it is the only option. Are we really going to deny them education because we are idealizing a human-only model that cannot scale? Sometimes good enough today is better than perfect never.",
        round_name="Cross-Examination",
        round_number=1,
    ),
    DebateMessage(
        agent=DEMO_AGENTS[1],
        content="That is a fair point about access, Sarah, and I will give you that. But here is where it gets dangerous: when we start with underserved communities as the testing ground for AI education, we are essentially saying those children deserve a lesser form of learning. Every child deserves a real teacher. Instead of building AI replacements, why not invest that money in training and deploying more teachers where they are needed most?",
        round_name="Cross-Examination",
        round_number=1,
    ),
    DebateMessage(
        agent=DEMO_AGENTS[2],
        content="James, I understand the concern, but the numbers tell a different story. Training a teacher takes 4 years and significant funding. An AI platform can be deployed to a remote village in weeks. This is not about lesser education, it is about pragmatic solutions. That said, Sarah, we have also seen AI systems fail spectacularly when they lack cultural context. The technology is powerful but it is not infallible.",
        round_name="Cross-Examination",
        round_number=1,
    ),

    # Round 2 - Rebuttals
    DebateMessage(
        agent=DEMO_AGENTS[0],
        content="James raised the concern about empathy, and I want to address that head-on. Modern AI systems can actually detect emotional cues, like frustration or disengagement, and adapt in real time. A teacher with 30 students might miss these signals, but AI never does. I am not saying AI feels empathy, but it can respond to emotional needs with remarkable precision. The outcomes speak for themselves.",
        round_name="Rebuttals",
        round_number=2,
    ),
    DebateMessage(
        agent=DEMO_AGENTS[1],
        content="Detecting frustration through a webcam is not empathy, Sarah. It is surveillance with a friendly interface. When I sit with a struggling student and share my own story of failure and persistence, something changes in their eyes. That is mentorship. That is what builds resilient human beings, not optimized learning pathways. We are in danger of confusing efficiency with effectiveness in education.",
        round_name="Rebuttals",
        round_number=2,
    ),
    DebateMessage(
        agent=DEMO_AGENTS[2],
        content="I think you are both right, and that is what makes this debate so important. James, your point about mentorship is irreplaceable, and no one should argue otherwise. Sarah, the data on personalized learning is compelling and we cannot ignore it. In our platform, the happiest teachers are the ones who use AI for the mechanical work and spend their freed-up time doing exactly what James describes: real human mentorship.",
        round_name="Rebuttals",
        round_number=2,
    ),

    # Round 3 - Closing Statements
    DebateMessage(
        agent=DEMO_AGENTS[0],
        content="Here is what I want everyone to take away: AI in education is not about building robot teachers. It is about democratizing access to quality, personalized learning for every child on the planet. The technology exists today to give a student in a rural village the same adaptive tutoring that a wealthy student gets at an elite school. We owe it to the next generation to embrace this potential, not fear it.",
        round_name="Closing Statements",
        round_number=3,
    ),
    DebateMessage(
        agent=DEMO_AGENTS[1],
        content="Education is fundamentally a human endeavor. It is about one person believing in another, challenging them to grow, and catching them when they fall. AI can be a wonderful tool in a teacher's toolkit, but the moment we allow it to replace that human relationship, we lose something that no algorithm can ever recover. Let us invest in teachers, not replace them.",
        round_name="Closing Statements",
        round_number=3,
    ),
    DebateMessage(
        agent=DEMO_AGENTS[2],
        content="After hearing both sides, I am more convinced than ever that the future is not AI versus teachers, it is AI with teachers. The schools that will thrive are the ones that use AI to handle what machines do best, personalization at scale, while empowering teachers to do what humans do best: inspire, mentor, and transform lives. The best technology disappears into the background and makes people better at being human.",
        round_name="Closing Statements",
        round_number=3,
    ),
]

DEMO_VERDICT = {
    "winner": "James O'Brien",
    "winner_role": "High School Principal",
    "winner_stance": "against",
    "conclusion": "Based on the strength of the arguments presented, the debate concludes that AI should not replace teachers in classrooms. James O'Brien made a compelling case that while AI is a powerful tool, the human elements of mentorship, empathy, and genuine connection are irreplaceable pillars of meaningful education.",
    "reasoning": "James consistently brought the discussion back to what truly matters in education: the human relationship between teacher and student. His personal stories and passionate advocacy connected deeply with the core purpose of teaching, making the strongest emotional and logical case in the debate.",
    "scores": [
        {
            "name": "James O'Brien",
            "role": "High School Principal",
            "score": 88,
            "strength": "Powerful storytelling and unwavering conviction about the human heart of education.",
        },
        {
            "name": "Dr. Sarah Chen",
            "role": "AI Research Director",
            "score": 85,
            "strength": "Strong data-driven arguments and compelling global access perspective.",
        },
        {
            "name": "Priya Kapoor",
            "role": "EdTech Product Manager",
            "score": 82,
            "strength": "Excellent bridge-building and practical real-world implementation insights.",
        },
    ],
}

# ── Demo transcript debate (Corporate Dress Code) ──

DEMO_TRANSCRIPT_AGENTS = [
    AgentPersona(
        name="Ananya Sharma",
        role="HR Policy Director",
        industry="Corporate Workplace Culture",
        stance="neutral",
        expertise="Organizational policy design and employee engagement",
        personality="Diplomatic and thoughtful, genuinely wants to find a solution that works for everyone",
        avatar_color="#6366F1",
        avatar_emoji="brain",
        gender="female",
        accent="indian",
        emotional_style="calm mediator who listens carefully and synthesizes different viewpoints",
    ),
    AgentPersona(
        name="Rajesh Iyer",
        role="Senior Software Engineer",
        industry="Corporate Workplace Culture",
        stance="for",
        expertise="Developer productivity and modern tech work culture",
        personality="Direct and passionate, speaks from personal experience as an engineer",
        avatar_color="#EF4444",
        avatar_emoji="fire",
        gender="male",
        accent="indian",
        emotional_style="passionate advocate who backs opinions with practical examples",
    ),
    AgentPersona(
        name="Meera Nair",
        role="Client Relations Director",
        industry="Corporate Workplace Culture",
        stance="against",
        expertise="Enterprise client management and professional brand image",
        personality="Polished and persuasive, brings real client feedback to support her position",
        avatar_color="#10B981",
        avatar_emoji="leaf",
        gender="female",
        accent="indian",
        emotional_style="measured and professional, uses concrete client stories to make her case",
    ),
]

DEMO_TRANSCRIPT_SETUP = DebateSetup(
    topic="Should corporate dress codes be relaxed or abolished in modern tech companies?",
    industry="Corporate Workplace Culture",
    agents=DEMO_TRANSCRIPT_AGENTS,
    total_rounds=4,
    language="english",
)

DEMO_TRANSCRIPT_MESSAGES = [
    # Round 0 - Opening Statements
    DebateMessage(
        agent=DEMO_TRANSCRIPT_AGENTS[1],
        content="Let me be straightforward here. Strict dress codes in a tech company are a relic of a bygone era. I write code that handles millions of transactions daily, and whether I am wearing a polo shirt or a three-piece suit has absolutely zero impact on the quality of my work. Companies like Google, Atlassian, and even Infosys's digital teams have embraced casual dress codes, and their innovation has only accelerated. We should be measured by our output, not our outfits.",
        round_name="Opening Statements",
        round_number=0,
    ),
    DebateMessage(
        agent=DEMO_TRANSCRIPT_AGENTS[2],
        content="I respect Rajesh's perspective, but I deal with enterprise clients every single week, and the reality is that professional appearance directly impacts business outcomes. Just last quarter, we received written feedback from two Fortune 500 clients noting that casual attire during on-site meetings felt unprofessional. When we are competing for multi-crore contracts, first impressions are not trivial. They are part of our brand promise.",
        round_name="Opening Statements",
        round_number=0,
    ),
    DebateMessage(
        agent=DEMO_TRANSCRIPT_AGENTS[0],
        content="Both Rajesh and Meera raise valid concerns, and honestly, that tension is exactly why we are revisiting this policy. The old one-size-fits-all approach is clearly not working. What I have seen work well at other organizations is a role-based framework where client-facing teams maintain professional standards while engineering and internal teams enjoy more flexibility. The goal should be clarity, not rigidity.",
        round_name="Opening Statements",
        round_number=0,
    ),

    # Round 1 - Cross-Examination
    DebateMessage(
        agent=DEMO_TRANSCRIPT_AGENTS[1],
        content="Meera, I understand the client-facing argument completely. But here is the thing: only about 15% of our workforce actually meets clients regularly. Why are we imposing restrictions on the other 85% based on what a small fraction of employees do? And let me add this: our attrition surveys consistently show that workplace flexibility, including dress code, is a top-three factor for engineers choosing where to work. We are literally losing talent over this.",
        round_name="Cross-Examination",
        round_number=1,
    ),
    DebateMessage(
        agent=DEMO_TRANSCRIPT_AGENTS[2],
        content="Rajesh, I agree the current policy is too broad. But completely abolishing dress standards creates a different problem. We had an incident where a team member showed up to an unplanned client visit in flip-flops and a graphic tee. That is the risk of no guidelines at all. Also, our brand identity matters. Whether we like it or not, how our employees present themselves is part of how the market perceives us as a company.",
        round_name="Cross-Examination",
        round_number=1,
    ),
    DebateMessage(
        agent=DEMO_TRANSCRIPT_AGENTS[0],
        content="This is exactly the nuance we need. Rajesh, your point about talent retention is backed by data and we cannot ignore it. Meera, your client feedback is equally real and measurable. The question is not whether to have standards but how to make them contextual. A junior developer on my team told me that business casual means completely different things to different people on the same floor. The ambiguity itself is the biggest problem.",
        round_name="Cross-Examination",
        round_number=1,
    ),

    # Round 2 - Rebuttals
    DebateMessage(
        agent=DEMO_TRANSCRIPT_AGENTS[1],
        content="Meera raised the flip-flop incident, and I agree that is not ideal. But the solution is not a blanket dress code. It is common sense and a simple notification system. If there is a client visit, send a calendar invite saying professional attire expected. Every other day, let people wear what makes them comfortable and productive. Companies like Spotify do exactly this and their employer brand is one of the strongest in tech.",
        round_name="Rebuttals",
        round_number=2,
    ),
    DebateMessage(
        agent=DEMO_TRANSCRIPT_AGENTS[2],
        content="The notification approach sounds good in theory, Rajesh, but in practice client visits are often spontaneous. A key stakeholder drops by, a partner wants an impromptu tour, a client escalation requires an in-person meeting the same day. You cannot always plan for these situations. Having a reasonable baseline standard means your team is always presentation-ready without the scramble. It is about being proactive, not reactive.",
        round_name="Rebuttals",
        round_number=2,
    ),
    DebateMessage(
        agent=DEMO_TRANSCRIPT_AGENTS[0],
        content="I think you are both circling around the same insight from different angles. The real issue is not casual versus formal. It is about having clear, written, role-appropriate guidelines that everyone understands. Rajesh wants freedom with clarity. Meera wants professionalism with flexibility. A tiered system where engineering has a smart casual baseline and client-facing teams have a business professional baseline gives both sides what they need.",
        round_name="Rebuttals",
        round_number=2,
    ),

    # Round 3 - Closing Statements
    DebateMessage(
        agent=DEMO_TRANSCRIPT_AGENTS[1],
        content="Here is my closing thought: the best workplaces in the world trust their employees. A relaxed dress code signals that trust. It says we hired you for your brain, not your wardrobe. Yes, have guidelines, yes, be sensible about client interactions, but stop treating adults like school children who need a uniform policy. Relaxing the dress code is not just about clothes. It is about the culture we are building and the talent we want to attract.",
        round_name="Closing Statements",
        round_number=3,
    ),
    DebateMessage(
        agent=DEMO_TRANSCRIPT_AGENTS[2],
        content="I want to be clear: I am not advocating for suits and ties every day. I am advocating for professional standards that protect our brand and our business relationships. A smart, well-defined dress code is not a burden. It is a framework that eliminates confusion and ensures we always put our best foot forward. We can absolutely be flexible while maintaining professional credibility. The two are not mutually exclusive.",
        round_name="Closing Statements",
        round_number=3,
    ),
    DebateMessage(
        agent=DEMO_TRANSCRIPT_AGENTS[0],
        content="After hearing all perspectives, I believe the path forward is a hybrid, role-based policy with clear documentation. Engineering and internal teams get smart casual freedom. Client-facing roles maintain business professional standards. And we create a simple visual guide so that business casual is no longer open to interpretation. The goal is happy, productive employees who also represent our brand well. Both can coexist.",
        round_name="Closing Statements",
        round_number=3,
    ),
]

DEMO_TRANSCRIPT_VERDICT = {
    "winner": "Ananya Sharma",
    "winner_role": "HR Policy Director",
    "winner_stance": "neutral",
    "conclusion": "The debate concludes that a hybrid, role-based dress code policy is the most effective approach for modern tech companies. Ananya Sharma's balanced framework of tiered guidelines with clear documentation addresses both the need for employee freedom and professional client interactions.",
    "reasoning": "Ananya consistently demonstrated the ability to synthesize opposing viewpoints into a practical, actionable solution. Her proposal for a role-based tiered system with clear visual guidelines directly addressed the concerns raised by both Rajesh and Meera, showing leadership in finding common ground.",
    "scores": [
        {
            "name": "Ananya Sharma",
            "role": "HR Policy Director",
            "score": 90,
            "strength": "Outstanding ability to synthesize opposing views into a practical hybrid solution.",
        },
        {
            "name": "Rajesh Iyer",
            "role": "Senior Software Engineer",
            "score": 86,
            "strength": "Strong data-driven arguments about talent retention and productivity impact.",
        },
        {
            "name": "Meera Nair",
            "role": "Client Relations Director",
            "score": 84,
            "strength": "Compelling real-world client feedback and brand credibility perspective.",
        },
    ],
}

# ── Demo chat transcripts for the "Transcript" tab ──

DEMO_TRANSCRIPTS = [
    {
        "title": "Corporate Dress Code Policy",
        "icon": "\uD83D\uDC54",
        "transcript": """[Ananya Sharma - HR Manager]: Hi team, as discussed in the town hall, we are revisiting our corporate dress code policy starting next quarter. I would love to hear everyone's honest thoughts before we draft the new guidelines.

[Rajesh Iyer - Senior Developer]: Honestly Ananya, I think strict dress codes are completely outdated in 2025. We are a tech company, not a law firm. We should be judged by our code quality and deliverables, not by whether we are wearing a collared shirt.

[Meera Nair - Client Relations Lead]: I understand where you are coming from Rajesh, but when we have client visits and stakeholder meetings, first impressions absolutely matter. I have had enterprise clients specifically mention that professional attire builds trust and credibility.

[Rajesh Iyer - Senior Developer]: But that is exactly my point, most of us never meet clients face to face. Why should the entire backend engineering team wear formals when we are sitting at our desks writing code all day?

[Ananya Sharma - HR Manager]: That is a fair point. We could potentially have different guidelines for client-facing roles versus non-client-facing roles. Some companies already do this successfully.

[Vikram Desai - Engineering Team Lead]: I have seen companies like Google and even Infosys digital teams go fully casual and it has done wonders for morale and retention. People feel more comfortable and actually perform better when they are not worrying about their outfit.

[Meera Nair - Client Relations Lead]: Sure, but we have actually received written feedback from two enterprise clients last quarter saying that casual attire during on-site meetings felt unprofessional. We cannot ignore that.

[Priya Menon - Junior Developer]: As someone who joined just six months ago, I would honestly appreciate clearer guidelines either way. Right now business casual means completely different things to different people on my floor. Some wear jeans and sneakers, others come in blazers.

[Vikram Desai - Engineering Team Lead]: Exactly Priya, the ambiguity is the real problem here, not whether we wear formals or casuals. If we just had clear, written guidelines that everyone understood, half the confusion would disappear.

[Ananya Sharma - HR Manager]: These are all excellent points. Let me compile these perspectives and present them to leadership. I think a hybrid approach with role-based flexibility could work well for everyone.""",
    },
    {
        "title": "Remote Work vs Return to Office",
        "icon": "\uD83C\uDFE0",
        "transcript": """[Sunita Patel - VP of Operations]: Team, the leadership is considering a mandatory 3-day return-to-office policy starting next month. I wanted to get your candid feedback before we finalize.

[Arjun Mehta - Product Manager]: I am strongly against a blanket mandate. Our team's productivity has actually increased 20% since we went remote. The data speaks for itself.

[Kavitha Reddy - People & Culture Lead]: I hear you Arjun, but we are seeing a real decline in cross-team collaboration and mentorship for junior employees. New hires are struggling to build relationships through Zoom alone.

[Arjun Mehta - Product Manager]: That is a valid concern, but forcing everyone back 3 days a week is not the answer. We could do monthly team offsites or dedicated collaboration days instead.

[Deepak Kumar - Senior Architect]: I have been in the industry 18 years and I can tell you, some of the best architectural decisions happen in whiteboard sessions that simply cannot be replicated on Miro or FigJam. There is something about being in the same room.

[Nisha Gupta - UX Designer]: But I do my best design work from home without the constant office interruptions. Open offices are terrible for deep focus work. I think we need to differentiate between collaborative work and deep work.

[Kavitha Reddy - People & Culture Lead]: What about the junior team members though? Nisha, you have 8 years of experience. New graduates need that in-person mentorship and osmotic learning that happens naturally in an office.

[Arjun Mehta - Product Manager]: Then make it optional for seniors and required for juniors in their first year. One size does not fit all.

[Sunita Patel - VP of Operations]: These are helpful perspectives. It sounds like a flexible hybrid model with some structure might be the sweet spot. Let me take this back to the CEO.""",
    },
    {
        "title": "AI Tools Adoption in Development",
        "icon": "\uD83E\uDD16",
        "transcript": """[Rahul Verma - CTO]: I want to discuss rolling out GitHub Copilot and other AI coding assistants across all engineering teams. Some teams have been piloting it and I am hearing mixed reactions.

[Sneha Krishnan - Staff Engineer]: I have been using Copilot for three months and it has genuinely boosted my velocity by about 30%. For boilerplate code and unit tests, it is a game changer.

[Manoj Tiwari - Security Lead]: I have serious concerns about code security. AI-generated code can introduce vulnerabilities that pass code review because developers trust the AI output too much. We had an incident last month where Copilot suggested a SQL query with an injection vulnerability.

[Sneha Krishnan - Staff Engineer]: That is why we have code review processes Manoj. The AI is a tool, not a replacement for developer judgment. You would not blame your IDE for a bug.

[Lakshmi Venkatesh - Junior Developer]: Honestly, I am worried about the learning aspect. If I use AI to write code in my first year, am I really learning the fundamentals? My senior told me to struggle with the code first before using shortcuts.

[Rahul Verma - CTO]: That is a really thoughtful concern Lakshmi. We need to think about the training and growth implications.

[Manoj Tiwari - Security Lead]: Also, what about our proprietary code being sent to third-party servers? The IP and compliance implications are not trivial, especially for our banking clients.

[Sneha Krishnan - Staff Engineer]: There are enterprise versions with private instances. We do not have to use the public API. And honestly, our competitors are already using these tools. If we do not adopt, we fall behind.

[Lakshmi Venkatesh - Junior Developer]: Maybe we could have a policy where juniors use it only after their first six months, once they have built a foundation?

[Rahul Verma - CTO]: I like that graduated approach. Let me draft a phased rollout plan with guardrails for security and learning paths for juniors.""",
    },
]
