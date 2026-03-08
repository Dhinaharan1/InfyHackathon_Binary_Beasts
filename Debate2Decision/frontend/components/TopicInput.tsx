"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSubmit: (
    topic: string,
    language: string,
    demo?: boolean,
    transcript?: string,
    numAgents?: number,
    numRounds?: number,
    personaConstraints?: string,
  ) => void;
  isLoading: boolean;
}

const LANGUAGES = [
  { code: "english", label: "English", flag: "\uD83C\uDDEC\uD83C\uDDE7", native: "English" },
  { code: "hindi", label: "Hindi", flag: "\uD83C\uDDEE\uD83C\uDDF3", native: "\u0939\u093F\u0928\u094D\u0926\u0940" },
  { code: "tamil", label: "Tamil", flag: "\uD83C\uDDEE\uD83C\uDDF3", native: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD" },
  { code: "telugu", label: "Telugu", flag: "\uD83C\uDDEE\uD83C\uDDF3", native: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41" },
  { code: "kannada", label: "Kannada", flag: "\uD83C\uDDEE\uD83C\uDDF3", native: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1" },
  { code: "bengali", label: "Bengali", flag: "\uD83C\uDDEE\uD83C\uDDF3", native: "\u09AC\u09BE\u0982\u09B2\u09BE" },
  { code: "marathi", label: "Marathi", flag: "\uD83C\uDDEE\uD83C\uDDF3", native: "\u092E\u0930\u093E\u0920\u0940" },
  { code: "spanish", label: "Spanish", flag: "\uD83C\uDDEA\uD83C\uDDF8", native: "Espa\u00F1ol" },
  { code: "french", label: "French", flag: "\uD83C\uDDEB\uD83C\uDDF7", native: "Fran\u00E7ais" },
  { code: "german", label: "German", flag: "\uD83C\uDDE9\uD83C\uDDEA", native: "Deutsch" },
  { code: "japanese", label: "Japanese", flag: "\uD83C\uDDEF\uD83C\uDDF5", native: "\u65E5\u672C\u8A9E" },
  { code: "chinese", label: "Chinese", flag: "\uD83C\uDDE8\uD83C\uDDF3", native: "\u4E2D\u6587" },
  { code: "korean", label: "Korean", flag: "\uD83C\uDDF0\uD83C\uDDF7", native: "\uD55C\uAD6D\uC5B4" },
  { code: "arabic", label: "Arabic", flag: "\uD83C\uDDF8\uD83C\uDDE6", native: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
  { code: "portuguese", label: "Portuguese", flag: "\uD83C\uDDE7\uD83C\uDDF7", native: "Portugu\u00EAs" },
];

const EXAMPLE_TOPICS: Record<string, { text: string; icon: string }[]> = {
  english: [
    { text: "Should AI replace teachers?", icon: "\uD83E\uDD16" },
    { text: "Is remote work sustainable long-term?", icon: "\uD83C\uDFE0" },
    { text: "Should companies adopt a 4-day work week?", icon: "\uD83D\uDCC5" },
    { text: "Is cryptocurrency the future of finance?", icon: "\uD83D\uDCB0" },
    { text: "Should we colonize Mars?", icon: "\uD83D\uDE80" },
    { text: "Is nuclear energy the solution to climate change?", icon: "\u26A1" },
  ],
  hindi: [
    { text: "\u0915\u094D\u092F\u093E AI \u0915\u094B \u0936\u093F\u0915\u094D\u0937\u0915\u094B\u0902 \u0915\u0940 \u091C\u0917\u0939 \u0932\u0947\u0928\u0940 \u091A\u093E\u0939\u093F\u090F?", icon: "\uD83E\uDD16" },
    { text: "\u0915\u094D\u092F\u093E \u0935\u0930\u094D\u0915 \u092B\u094D\u0930\u0949\u092E \u0939\u094B\u092E \u0932\u0902\u092C\u0947 \u0938\u092E\u092F \u0924\u0915 \u091A\u0932 \u0938\u0915\u0924\u093E \u0939\u0948?", icon: "\uD83C\uDFE0" },
    { text: "\u0915\u094D\u092F\u093E \u092D\u093E\u0930\u0924 \u092E\u0947\u0902 \u092F\u0942\u0928\u093F\u0935\u0930\u094D\u0938\u0932 \u092C\u0947\u0938\u093F\u0915 \u0907\u0928\u0915\u092E \u0932\u093E\u0917\u0942 \u0939\u094B\u0928\u0940 \u091A\u093E\u0939\u093F\u090F?", icon: "\uD83D\uDCB0" },
    { text: "\u0915\u094D\u092F\u093E \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u092A\u094D\u0930\u0923\u093E\u0932\u0940 \u092E\u0947\u0902 \u092C\u0926\u0932\u093E\u0935 \u091C\u0930\u0942\u0930\u0940 \u0939\u0948?", icon: "\uD83D\uDCC5" },
    { text: "\u0915\u094D\u092F\u093E \u0915\u094D\u0930\u093F\u0915\u0947\u091F \u092D\u093E\u0930\u0924 \u0915\u093E \u0938\u092C\u0938\u0947 \u092C\u0921\u093C\u093E \u0927\u0930\u094D\u092E \u0939\u0948?", icon: "\u26BD" },
    { text: "\u0915\u094D\u092F\u093E \u0938\u094B\u0936\u0932 \u092E\u0940\u0921\u093F\u092F\u093E \u0938\u092E\u093E\u091C \u0915\u0947 \u0932\u093F\u090F \u0905\u091A\u094D\u0926\u093E \u0939\u0948?", icon: "\uD83D\uDCF1" },
  ],
  tamil: [
    { text: "AI \u0B86\u0B9A\u0BBF\u0BB0\u0BBF\u0BAF\u0BB0\u0BCD\u0B95\u0BB3\u0BC1\u0B95\u0BCD\u0B95\u0BC1 \u0BAA\u0BA4\u0BBF\u0BB2\u0BBE\u0B95 \u0BB5\u0BB0 \u0BAE\u0BC1\u0B9F\u0BBF\u0BAF\u0BC1\u0BAE\u0BBE?", icon: "\uD83E\uDD16" },
    { text: "\u0BB5\u0BC0\u0B9F\u0BCD\u0B9F\u0BBF\u0BB2\u0BBF\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4\u0BC1 \u0BB5\u0BC7\u0BB2\u0BC8 \u0B9A\u0BC6\u0BAF\u0BCD\u0BB5\u0BA4\u0BC1 \u0BA8\u0BBF\u0BB2\u0BC8\u0BAF\u0BBE\u0BA9\u0BA4\u0BBE?", icon: "\uD83C\uDFE0" },
    { text: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD\u0BA8\u0BBE\u0B9F\u0BC1 \u0BA4\u0BA9\u0BBF \u0BA8\u0BBE\u0B9F\u0BBE\u0B95 \u0BAA\u0BBF\u0BB0\u0BBF\u0BAF \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BBE?", icon: "\uD83C\uDFD7\uFE0F" },
    { text: "\u0B95\u0BCD\u0BB0\u0BBF\u0B95\u0BCD\u0B95\u0BC6\u0B9F\u0BCD \u0BA4\u0BAE\u0BBF\u0BB4\u0BCD\u0BA8\u0BBE\u0B9F\u0BCD\u0B9F\u0BBF\u0BA9\u0BCD \u0BAE\u0BBF\u0B95\u0BAA\u0BCD\u0BAA\u0BC6\u0BB0\u0BBF\u0BAF \u0BB5\u0BBF\u0BB3\u0BC8\u0BAF\u0BBE\u0B9F\u0BCD\u0B9F\u0BBE?", icon: "\uD83C\uDFCF" },
    { text: "\u0B9A\u0BC2\u0BB0\u0BBF\u0BAF \u0B9A\u0B95\u0BCD\u0BA4\u0BBF \u0BA4\u0BAE\u0BBF\u0BB4\u0BCD\u0BA8\u0BBE\u0B9F\u0BCD\u0B9F\u0BBF\u0BB2\u0BCD \u0BAA\u0BAF\u0BA9\u0BCD\u0BAA\u0B9F\u0BC1\u0BA4\u0BCD\u0BA4 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BBE?", icon: "\u26A1" },
    { text: "\u0B9A\u0BCA\u0BB7\u0BB2\u0BCD \u0BAE\u0BC0\u0B9F\u0BBF\u0BAF\u0BBE \u0BA8\u0BB2\u0BCD\u0BB2\u0BA4\u0BBE \u0B95\u0BC6\u0B9F\u0BCD\u0B9F\u0BA4\u0BBE?", icon: "\uD83D\uDCF1" },
  ],
};

const DEMO_TRANSCRIPTS = [
  {
    title: "Corporate Dress Code Policy",
    icon: "\uD83D\uDC54",
    preview: "HR, developers, and client relations discuss whether strict dress codes are outdated...",
    transcript: `[Ananya Sharma - HR Manager]: Hi team, as discussed in the town hall, we are revisiting our corporate dress code policy starting next quarter. I would love to hear everyone's honest thoughts before we draft the new guidelines.

[Rajesh Iyer - Senior Developer]: Honestly Ananya, I think strict dress codes are completely outdated in 2025. We are a tech company, not a law firm. We should be judged by our code quality and deliverables, not by whether we are wearing a collared shirt.

[Meera Nair - Client Relations Lead]: I understand where you are coming from Rajesh, but when we have client visits and stakeholder meetings, first impressions absolutely matter. I have had enterprise clients specifically mention that professional attire builds trust and credibility.

[Rajesh Iyer - Senior Developer]: But that is exactly my point, most of us never meet clients face to face. Why should the entire backend engineering team wear formals when we are sitting at our desks writing code all day?

[Ananya Sharma - HR Manager]: That is a fair point. We could potentially have different guidelines for client-facing roles versus non-client-facing roles. Some companies already do this successfully.

[Vikram Desai - Engineering Team Lead]: I have seen companies like Google and even Infosys digital teams go fully casual and it has done wonders for morale and retention. People feel more comfortable and actually perform better when they are not worrying about their outfit.

[Meera Nair - Client Relations Lead]: Sure, but we have actually received written feedback from two enterprise clients last quarter saying that casual attire during on-site meetings felt unprofessional. We cannot ignore that.

[Priya Menon - Junior Developer]: As someone who joined just six months ago, I would honestly appreciate clearer guidelines either way. Right now business casual means completely different things to different people on my floor.

[Vikram Desai - Engineering Team Lead]: Exactly Priya, the ambiguity is the real problem here, not whether we wear formals or casuals.

[Ananya Sharma - HR Manager]: These are all excellent points. Let me compile these perspectives and present them to leadership.`,
  },
  {
    title: "Remote Work vs Return to Office",
    icon: "\uD83C\uDFE0",
    preview: "VP, product manager, and culture lead debate mandatory return-to-office policy...",
    transcript: `[Sunita Patel - VP of Operations]: Team, the leadership is considering a mandatory 3-day return-to-office policy starting next month. I wanted to get your candid feedback before we finalize.

[Arjun Mehta - Product Manager]: I am strongly against a blanket mandate. Our team's productivity has actually increased 20% since we went remote. The data speaks for itself.

[Kavitha Reddy - People & Culture Lead]: I hear you Arjun, but we are seeing a real decline in cross-team collaboration and mentorship for junior employees. New hires are struggling to build relationships through Zoom alone.

[Arjun Mehta - Product Manager]: That is a valid concern, but forcing everyone back 3 days a week is not the answer. We could do monthly team offsites or dedicated collaboration days instead.

[Deepak Kumar - Senior Architect]: I have been in the industry 18 years and I can tell you, some of the best architectural decisions happen in whiteboard sessions that simply cannot be replicated on Miro or FigJam.

[Nisha Gupta - UX Designer]: But I do my best design work from home without the constant office interruptions. Open offices are terrible for deep focus work.

[Kavitha Reddy - People & Culture Lead]: What about the junior team members though? New graduates need that in-person mentorship and osmotic learning that happens naturally in an office.

[Arjun Mehta - Product Manager]: Then make it optional for seniors and required for juniors in their first year. One size does not fit all.

[Sunita Patel - VP of Operations]: These are helpful perspectives. It sounds like a flexible hybrid model with some structure might be the sweet spot.`,
  },
  {
    title: "AI Tools Adoption in Development",
    icon: "\uD83E\uDD16",
    preview: "CTO, engineers, and security lead discuss rolling out GitHub Copilot...",
    transcript: `[Rahul Verma - CTO]: I want to discuss rolling out GitHub Copilot and other AI coding assistants across all engineering teams. Some teams have been piloting it and I am hearing mixed reactions.

[Sneha Krishnan - Staff Engineer]: I have been using Copilot for three months and it has genuinely boosted my velocity by about 30%. For boilerplate code and unit tests, it is a game changer.

[Manoj Tiwari - Security Lead]: I have serious concerns about code security. AI-generated code can introduce vulnerabilities that pass code review because developers trust the AI output too much.

[Sneha Krishnan - Staff Engineer]: That is why we have code review processes Manoj. The AI is a tool, not a replacement for developer judgment.

[Lakshmi Venkatesh - Junior Developer]: Honestly, I am worried about the learning aspect. If I use AI to write code in my first year, am I really learning the fundamentals?

[Rahul Verma - CTO]: That is a really thoughtful concern Lakshmi. We need to think about the training and growth implications.

[Manoj Tiwari - Security Lead]: Also, what about our proprietary code being sent to third-party servers? The IP and compliance implications are not trivial, especially for our banking clients.

[Sneha Krishnan - Staff Engineer]: There are enterprise versions with private instances. And honestly, our competitors are already using these tools. If we do not adopt, we fall behind.

[Lakshmi Venkatesh - Junior Developer]: Maybe we could have a policy where juniors use it only after their first six months, once they have built a foundation?

[Rahul Verma - CTO]: I like that graduated approach. Let me draft a phased rollout plan with guardrails.`,
  },
];

const FLOATING_ICONS = [
  "\uD83E\uDD16", "\uD83D\uDDE3\uFE0F", "\uD83C\uDFC6", "\u2696\uFE0F",
  "\uD83D\uDCA1", "\uD83C\uDF0D", "\uD83D\uDD25", "\uD83C\uDFAF",
];

type Tab = "topic" | "transcript";

export default function TopicInput({ onSubmit, isLoading }: Props) {
  const [tab, setTab] = useState<Tab>("topic");
  const [topic, setTopic] = useState("");
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState("english");
  const [customLanguage, setCustomLanguage] = useState("");
  const [numAgents, setNumAgents] = useState(3);
  const [numRounds, setNumRounds] = useState(4);
  const [personaConstraints, setPersonaConstraints] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sensitivityWarning, setSensitivityWarning] = useState<{
    level: string;
    categories: string[];
    warning: string;
    suggestion: string;
  } | null>(null);

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setChecking(true);
    try {
      const res = await fetch("http://localhost:8000/api/check-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      setSensitivityWarning(data);
    } catch {
      onSubmit(topic.trim(), language, false, undefined, numAgents, numRounds, personaConstraints);
    }
    setChecking(false);
  };

  const handleProceedAnyway = () => {
    setSensitivityWarning(null);
    onSubmit(topic.trim(), language, false, undefined, numAgents, numRounds, personaConstraints);
  };

  const handleUseSuggestion = () => {
    if (sensitivityWarning?.suggestion) {
      setTopic(sensitivityWarning.suggestion);
    }
    setSensitivityWarning(null);
  };

  const handleDismissWarning = () => {
    setSensitivityWarning(null);
  };

  const handleTranscriptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim())
      onSubmit("transcript-debate", language, false, transcript.trim(), numAgents, numRounds, personaConstraints);
  };

  const currentExamples = EXAMPLE_TOPICS[language] || EXAMPLE_TOPICS.english;

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative overflow-hidden">
      {FLOATING_ICONS.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-10 select-none pointer-events-none"
          initial={{
            x: `${(i * 13 + 5) % 90}vw`,
            y: `${(i * 17 + 10) % 85}vh`,
          }}
          animate={{
            y: [
              `${(i * 17 + 10) % 85}vh`,
              `${((i * 17 + 10) % 85) - 15}vh`,
              `${(i * 17 + 10) % 85}vh`,
            ],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {icon}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-indigo-500/30">
              {"\u2696\uFE0F"}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-extrabold text-white mb-3 tracking-tight"
          >
            Debate 2 Decision{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animated-gradient">
              AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-lg max-w-md mx-auto"
          >
            Your AI decision council for every complex question.
          </motion.p>
        </div>

        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex gap-1 mb-4 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]"
        >
          <button
            type="button"
            onClick={() => setTab("topic")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "topic"
                ? "bg-indigo-600/80 text-white shadow-lg shadow-indigo-500/20"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]"
            }`}
          >
            <span>{"\uD83D\uDDE3\uFE0F"}</span>
            Debate Topic
          </button>
          <button
            type="button"
            onClick={() => setTab("transcript")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "transcript"
                ? "bg-indigo-600/80 text-white shadow-lg shadow-indigo-500/20"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]"
            }`}
          >
            <span>{"\uD83D\uDCCB"}</span>
            Chat Transcript
          </button>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card-strong rounded-2xl p-6 shadow-2xl shadow-indigo-500/5"
        >
          {/* Language selector */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-300 block mb-2">
              Debate Language
            </label>
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setCustomLanguage("");
                    setTopic("");
                  }}
                  className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    language === lang.code && !customLanguage
                      ? "bg-indigo-600/80 text-white border border-indigo-500/50 shadow-lg shadow-indigo-500/20"
                      : "bg-white/[0.03] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08] hover:border-indigo-500/30"
                  }`}
                  title={lang.native}
                >
                  <span>{lang.flag}</span>
                  <span className="truncate">{lang.label}</span>
                </button>
              ))}
              <div className="col-span-5 flex gap-2 mt-1">
                <input
                  type="text"
                  value={customLanguage}
                  onChange={(e) => {
                    setCustomLanguage(e.target.value);
                    if (e.target.value.trim()) {
                      setLanguage(e.target.value.trim().toLowerCase());
                    } else {
                      setLanguage("english");
                    }
                  }}
                  placeholder="Or type any language..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-300 transition-colors"
            >
              <motion.span
                animate={{ rotate: showAdvanced ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {"\u25B6"}
              </motion.span>
              Advanced Settings
            </button>
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4 mt-3 p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                    <div>
                      <label className="text-xs font-medium text-gray-400 block mb-1.5">
                        Number of Agents
                      </label>
                      <div className="flex items-center gap-2">
                        {[2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setNumAgents(n)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              numAgents === n
                                ? "bg-indigo-600/80 text-white border border-indigo-500/50"
                                : "bg-white/[0.03] text-gray-400 border border-white/[0.06] hover:border-indigo-500/30"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 block mb-1.5">
                        Number of Rounds
                      </label>
                      <div className="flex items-center gap-2">
                        {[2, 3, 4, 5, 6].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setNumRounds(n)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              numRounds === n
                                ? "bg-indigo-600/80 text-white border border-indigo-500/50"
                                : "bg-white/[0.03] text-gray-400 border border-white/[0.06] hover:border-indigo-500/30"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-400 block mb-1.5">
                        Persona Constraints{" "}
                        <span className="text-gray-600">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={personaConstraints}
                        onChange={(e) => setPersonaConstraints(e.target.value)}
                        placeholder='e.g. "include someone from healthcare" or "add a Gen-Z perspective"'
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {tab === "topic" ? (
              <motion.form
                key="topic-tab"
                onSubmit={handleTopicSubmit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <label className="text-sm font-medium text-gray-300 block mb-2">
                  Enter a Debate Topic
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder={
                        language === "hindi"
                          ? "\u0909\u0926\u093E\u0939\u0930\u0923: \u0915\u094D\u092F\u093E AI \u0936\u093F\u0915\u094D\u0937\u0915\u094B\u0902 \u0915\u0940 \u091C\u0917\u0939 \u0932\u0947 \u0938\u0915\u0924\u093E \u0939\u0948?"
                          : language === "tamil"
                            ? "\u0B89\u0BA4\u0BBE\u0BB0\u0BA3\u0BAE\u0BCD: AI \u0B86\u0B9A\u0BBF\u0BB0\u0BBF\u0BAF\u0BB0\u0BCD\u0B95\u0BB3\u0BC1\u0B95\u0BCD\u0B95\u0BC1 \u0BAA\u0BA4\u0BBF\u0BB2\u0BBE\u0B95 \u0BB5\u0BB0 \u0BAE\u0BC1\u0B9F\u0BBF\u0BAF\u0BC1\u0BAE\u0BBE?"
                            : "e.g. Should we move to Microservices?"
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-base"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!topic.trim() || isLoading || checking}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:shadow-none"
                  >
                    {checking ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Analyzing...
                      </span>
                    ) : "Start Debate"}
                  </button>
                </div>

                <div className="mt-5">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-medium">
                    Popular Topics
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {currentExamples.map((ex) => (
                      <button
                        key={ex.text}
                        type="button"
                        onClick={() => setTopic(ex.text)}
                        className="text-left text-sm bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-indigo-500/30 text-gray-300 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2.5 group"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">
                          {ex.icon}
                        </span>
                        <span className="truncate">{ex.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="transcript-tab"
                onSubmit={handleTranscriptSubmit}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <label className="text-sm font-medium text-gray-300 block mb-2">
                  Paste a Chat / Conversation Transcript
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste a team chat, forum discussion, Slack conversation, or meeting transcript here..."
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm leading-relaxed resize-none"
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-500">
                    {transcript.length > 0
                      ? `${transcript.split("\n").filter((l) => l.trim()).length} messages`
                      : "AI will extract the debate topic automatically"}
                  </span>
                  <button
                    type="submit"
                    disabled={!transcript.trim() || isLoading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:shadow-none"
                  >
                    Analyze & Debate
                  </button>
                </div>

                <div className="mt-5">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-medium">
                    Sample Transcripts
                  </p>
                  <div className="flex flex-col gap-2">
                    {DEMO_TRANSCRIPTS.map((demo) => (
                      <button
                        key={demo.title}
                        type="button"
                        onClick={() => setTranscript(demo.transcript)}
                        className={`text-left text-sm border px-4 py-3 rounded-xl transition-all flex items-start gap-3 group ${
                          transcript === demo.transcript
                            ? "bg-indigo-500/10 border-indigo-500/30 text-white"
                            : "bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.06] hover:border-indigo-500/30 text-gray-300"
                        }`}
                      >
                        <span className="text-xl mt-0.5 group-hover:scale-110 transition-transform flex-shrink-0">
                          {demo.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium">{demo.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {demo.preview}
                          </p>
                        </div>
                        {transcript === demo.transcript && (
                          <span className="text-indigo-400 text-xs font-medium ml-auto flex-shrink-0 mt-1">
                            Selected
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Demo button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-5"
        >
          <div className="flex items-center gap-3 justify-center mb-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              or
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <button
            type="button"
            onClick={() =>
              tab === "transcript"
                ? onSubmit("demo", "english", true, "demo-transcript")
                : onSubmit("demo", "english", true)
            }
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] border border-amber-500/20 hover:border-amber-500/40 text-amber-200 px-6 py-2.5 rounded-xl transition-all text-sm font-medium disabled:opacity-50"
          >
            <span className="text-lg">{"\uD83C\uDFAC"}</span>
            {tab === "transcript" ? "Try Transcript Demo" : "Try Demo"}
            <span className="text-xs text-amber-400/60">
              (no API key needed)
            </span>
          </button>
        </motion.div>

        {/* Footer features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex justify-center gap-8 mt-8"
        >
          {[
            { icon: "\uD83E\uDD16", label: "AI Personas" },
            { icon: "\uD83D\uDD04", label: `${numRounds} Rounds` },
            { icon: "\uD83C\uDFC6", label: "Final Verdict" },
            { icon: "\uD83C\uDF10", label: "Multi-Language" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-1">
              <span className="text-xl">{f.icon}</span>
              <span className="text-[11px] text-gray-500 font-medium">
                {f.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Sensitivity Warning Modal */}
      <AnimatePresence>
        {sensitivityWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card-strong rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">
                  {sensitivityWarning.level === "low" ? "\u2705" : sensitivityWarning.level === "medium" ? "\u26A0\uFE0F" : "\uD83D\uDED1"}
                </div>
                <h3 className="text-lg font-bold text-white">
                  Topic Sensitivity: {sensitivityWarning.level.charAt(0).toUpperCase() + sensitivityWarning.level.slice(1)}
                </h3>
              </div>

              {/* Sensitivity meter bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Low</span><span>Medium</span><span>High</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: sensitivityWarning.level === "low" ? "33%" : sensitivityWarning.level === "medium" ? "66%" : "100%" }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${
                      sensitivityWarning.level === "low" ? "bg-green-500" : sensitivityWarning.level === "medium" ? "bg-yellow-500" : "bg-red-500"
                    }`}
                  />
                </div>
              </div>

              {/* Categories */}
              {sensitivityWarning.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {sensitivityWarning.categories.map((cat) => (
                    <span key={cat} className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 text-gray-300 border border-white/10">
                      {cat}
                    </span>
                  ))}
                </div>
              )}

              {/* Warning text */}
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                {sensitivityWarning.warning}
              </p>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleProceedAnyway}
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${
                    sensitivityWarning.level === "high"
                      ? "bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/30"
                      : sensitivityWarning.level === "medium"
                        ? "bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-200 border border-yellow-500/30"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
                  }`}
                >
                  {sensitivityWarning.level === "low" ? "\uD83D\uDE80 Start Debate" : "\u26A0\uFE0F Proceed Anyway"}
                </button>

                {sensitivityWarning.suggestion && (
                  <button
                    onClick={handleUseSuggestion}
                    className="w-full py-2.5 rounded-xl font-medium text-sm bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 transition-all"
                  >
                    {"\uD83D\uDCA1"} Use Suggestion: &ldquo;{sensitivityWarning.suggestion.length > 50 ? sensitivityWarning.suggestion.slice(0, 50) + "..." : sensitivityWarning.suggestion}&rdquo;
                  </button>
                )}

                <button
                  onClick={handleDismissWarning}
                  className="w-full py-2 rounded-xl text-sm text-gray-400 hover:text-gray-200 transition-all"
                >
                  {"\u270F\uFE0F"} Change My Topic
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
