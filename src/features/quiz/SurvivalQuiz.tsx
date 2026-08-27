import React, { useState } from "react";
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  HelpCircle, 
  ArrowRight,
  BookOpen,
  Trophy,
  Zap
} from "lucide-react";
import { QuizQuestion } from "../../types";

interface SurvivalQuizProps {
  speakVoiceFeedback: (text: string) => void;
}

export const SurvivalQuiz: React.FC<SurvivalQuizProps> = ({ speakVoiceFeedback }) => {
  const quizBank: QuizQuestion[] = [
    {
      id: "q1",
      question: "If you are being closely followed by a suspicious individual on a dark urban street, what is the safest immediate course of action?",
      options: [
        "Run directly to your house to lock yourself inside.",
        "Turn down a dark alleyway to lose them using tight corners.",
        "Cross the street, keep your head high, and navigate immediately into a brightly lit 24-hour retail store or hotel lobby.",
        "Confront them aggressively and demand to know why they are following you."
      ],
      correctOptionIndex: 2,
      explanation: "Running home is dangerous because it reveals your address. Alleys trap you. Confrontation increases risk. Heading to a bright, crowded commercial place provides immediate safety and witnesses.",
      category: "Self Defense"
    },
    {
      id: "q2",
      question: "What is the recommended rate for giving chest compressions during adult CPR?",
      options: [
        "60 compressions per minute",
        "100 to 120 compressions per minute (to the rhythm of 'Stayin' Alive')",
        "150 to 180 compressions per minute",
        "Compressions are not recommended; only rescue breathing is used."
      ],
      correctOptionIndex: 1,
      explanation: "The recommended rate is 100-120 compressions per minute to maintain sufficient blood circulation to the brain and heart. The rhythm of the song 'Stayin' Alive' matches this timing.",
      category: "First Aid"
    },
    {
      id: "q3",
      question: "In extreme cold, what is the best technique to avoid hypothermia when building a temporary insulated bedding platform?",
      options: [
        "Sleep directly on the frozen ground to stay close to moisture.",
        "Lay a flat rock directly over the snow and sleep on the rock.",
        "Erect an elevated framework of dry pine/spruce boughs, dry leaves, or moss to create a 6-inch dead-air barrier off the ground.",
        "Cover yourself completely with wet pine bark to retain moisture."
      ],
      correctOptionIndex: 2,
      explanation: "Conduction (sleeping directly on frozen ground/rocks) drains body heat rapidly. A 6-inch thick dead-air barrier of dry plant matter provides critical thermal insulation to conserve body warmth.",
      category: "Wilderness Navigation"
    },
    {
      id: "q4",
      question: "During a high-magnitude earthquake inside a concrete structure, what should you do first?",
      options: [
        "Rush quickly to the elevators to escape to the ground level.",
        "Drop to your hands and knees, take cover under a sturdy table, and hold on firmly.",
        "Jump out of the nearest window before the walls collapse.",
        "Stand firmly under a heavy structural doorway on the top level."
      ],
      correctOptionIndex: 1,
      explanation: "The 'Drop, Cover, and Hold On' protocol is universally recommended. Moving during shaking is highly dangerous as falling items, masonry, and glass cause the vast majority of seismic injuries.",
      category: "Disaster Response"
    },
    {
      id: "q5",
      question: "An attacker grabs your wrist tightly with their hand. What is the most effective mechanical escape technique?",
      options: [
        "Pull directly backward as hard as you can against their grip.",
        "Rotate your arm and pull your wrist directly through the gap where their thumb and fingers meet.",
        "Drop to the ground and play dead.",
        "Try to pry their individual fingers off your arm one by one."
      ],
      correctOptionIndex: 1,
      explanation: "A wrist grab is strongest against direct backward pulls. However, the anatomical weak spot of any grip is the small gap where the thumb and fingertips meet. Rotating your wrist and driving it through that gap breaks the hold with minimal effort.",
      category: "Self Defense"
    }
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const activeQuestion = quizBank[currentIdx];

  const handleSelectOption = (optIdx: number) => {
    if (hasSubmitted) return;
    setSelectedAnswer(optIdx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || hasSubmitted) return;
    setHasSubmitted(true);
    
    const isCorrect = selectedAnswer === activeQuestion.correctOptionIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      speakVoiceFeedback("Excellent! That answer is tactically correct.");
    } else {
      speakVoiceFeedback("Incorrect protocol. Read the explanation carefully.");
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setHasSubmitted(false);
    
    if (currentIdx + 1 < quizBank.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setQuizCompleted(true);
      speakVoiceFeedback(`Survival assessment completed. You scored ${score} out of ${quizBank.length}.`);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setHasSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
    speakVoiceFeedback("Tactical survival quiz restarted.");
  };

  return (
    <div className="bg-[#0b101d]/60 border border-[#14213c] rounded-xl p-4 flex flex-col gap-4 text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#131d35] pb-2">
        <div>
          <h3 className="text-xs font-display font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            AI Survival & Self-Defense Training Quiz
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Test your reflexes and situational decision-making with mock tactical safety dilemmas.</p>
        </div>
        
        {!quizCompleted && (
          <span className="text-[10px] font-mono text-gray-400">
            QUESTION {currentIdx + 1} OF {quizBank.length}
          </span>
        )}
      </div>

      {quizCompleted ? (
        // Results Screen
        <div className="flex flex-col items-center justify-center py-6 gap-3 text-center animate-fade-in font-mono">
          <div className="w-16 h-16 rounded-full bg-sky-950/40 border-2 border-sky-500 flex items-center justify-center text-2xl mb-1 animate-bounce">
            🏆
          </div>
          <h4 className="text-sm font-display font-black text-sky-300 uppercase tracking-wider">Survival Roster Assessment Completed</h4>
          <p className="text-[11px] text-gray-300 max-w-sm leading-relaxed">
            Your safety preparedness rating: <strong className="text-emerald-400 text-xs">{(score / quizBank.length * 100).toFixed(0)}%</strong>. You got <strong className="text-sky-300">{score}</strong> correct out of <strong className="text-gray-300">{quizBank.length}</strong> questions.
          </p>

          <div className="bg-[#090f1e] border border-[#1c2e55] p-3 rounded-lg max-w-xs mt-1 text-left text-[10px] text-gray-400 leading-relaxed">
            {score === quizBank.length ? (
              <span className="text-emerald-400 font-bold">🥇 ELITE DEFENDER LEVEL: You exhibit masterful situational awareness and medical protocols.</span>
            ) : score >= 3 ? (
              <span className="text-sky-300 font-bold">🥈 FIELD OPERATOR LEVEL: Good safety instincts. Expand your self-defense hold breaks.</span>
            ) : (
              <span className="text-amber-400 font-bold">⚠️ RECRUIT PROTOCOL: Review the self-defense and medical library to build safety muscle-memory.</span>
            )}
          </div>

          <button
            id="btn_restart_quiz"
            onClick={handleRestartQuiz}
            className="mt-3 px-5 py-2 bg-sky-950 border border-sky-600 hover:bg-sky-900 text-sky-300 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESTART ASSESSMENT
          </button>
        </div>
      ) : (
        // Active Question Screen
        <div className="flex flex-col gap-3 animate-fade-in font-mono">
          
          {/* Question Category Tag */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#121c32] border border-[#20345d] text-sky-400 rounded text-[9px] font-bold uppercase">
              {activeQuestion.category}
            </span>
            <span className="text-gray-500 text-[9px]">DIFFICULTY: FIELD CERTIFIED</span>
          </div>

          {/* Question Text */}
          <p className="text-[11px] font-bold text-gray-100 leading-relaxed font-sans border-l-2 border-sky-500 pl-2.5 my-1">
            {activeQuestion.question}
          </p>

          {/* Options List */}
          <div className="flex flex-col gap-2 mt-1">
            {activeQuestion.options.map((option, idx) => {
              let btnClass = "bg-[#090f1d]/80 border-[#152341] text-gray-300 hover:border-sky-500 hover:bg-[#0f1930]/30";
              
              if (selectedAnswer === idx) {
                btnClass = "bg-sky-950/60 border-sky-500 text-sky-300 font-bold";
              }

              if (hasSubmitted) {
                if (idx === activeQuestion.correctOptionIndex) {
                  btnClass = "bg-emerald-950/40 border-emerald-500 text-emerald-400 font-bold";
                } else if (selectedAnswer === idx) {
                  btnClass = "bg-red-950/40 border-red-500 text-red-400 line-through";
                } else {
                  btnClass = "bg-[#090f1d]/20 border-gray-800 text-gray-600 cursor-not-allowed";
                }
              }

              return (
                <button
                  id={`quiz_opt_${idx}`}
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasSubmitted}
                  className={`w-full text-left p-2.5 rounded-lg border text-[10px] transition-all flex items-start gap-2.5 leading-relaxed cursor-pointer ${btnClass}`}
                >
                  <span className="w-5 h-5 rounded bg-sky-900/40 text-sky-400 border border-sky-700/50 flex items-center justify-center font-bold text-[9px] flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {hasSubmitted && (
            <div className="mt-2 bg-[#0d1629] border border-sky-900/50 p-3 rounded-lg flex gap-2 animate-fade-in">
              <Zap className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold text-sky-400 uppercase tracking-wider">Tactical protocol reasoning:</p>
                <p className="text-[10px] text-gray-300 leading-relaxed font-mono mt-0.5">{activeQuestion.explanation}</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-end gap-2 border-t border-[#131d35] pt-3 mt-1">
            {!hasSubmitted ? (
              <button
                id="btn_submit_quiz_ans"
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  selectedAnswer !== null 
                    ? 'bg-sky-950 border border-sky-500 text-sky-300 hover:bg-sky-900' 
                    : 'bg-gray-900 border border-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                VERIFY ANSWER
              </button>
            ) : (
              <button
                id="btn_next_quiz_q"
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-emerald-950 border border-emerald-500 text-emerald-400 font-bold rounded-lg hover:bg-emerald-900 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{currentIdx + 1 === quizBank.length ? "FINISH ASSESSMENT" : "NEXT DILEMMA"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
