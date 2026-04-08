import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EXERCISES } from '../constants';
import { ExerciseItem } from '../types';
import { voiceService } from '../lib/voice';

interface ExerciseViewProps {
  addStars: (n: number) => void;
  speak: (text: string, opts?: any) => void;
  onBack: () => void;
}

export const ExerciseView: React.FC<ExerciseViewProps> = ({ addStars, speak, onBack }) => {
  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentItem = EXERCISES[qIndex];
  const progress = ((qIndex) / EXERCISES.length) * 100;

  useEffect(() => {
    if (currentItem && !answered) {
      let prompt = '';
      if (currentItem.type === 'word') {
        const wordWithBlank = currentItem.word!.split('').map((l, i) => i === currentItem.missingIndex ? '_' : l).join(' ');
        prompt = `Vamos completar a palavra! O que falta em ${wordWithBlank}?`;
      } else if (currentItem.type === 'math') {
        const spokenQuestion = currentItem.question
          .replace(/\+/g, 'mais')
          .replace(/-/g, 'menos')
          .replace(/x/g, 'vezes')
          .replace(/÷/g, 'a dividir por')
          .replace(/_/g, 'quanto')
          .replace(/=/g, 'é igual a');
        prompt = `Hora da matemática! ${spokenQuestion}?`;
      } else if (currentItem.type === 'sequence') {
        prompt = `Qual é o próximo número na sequência? ${currentItem.question.replace('_', '...')}`;
      }
      speak(prompt);
    }
  }, [qIndex, currentItem, answered, speak]);

  const handleAnswer = (letter: string) => {
    if (answered) return;
    voiceService.cancel();
    setAnswered(true);
    setSelected(letter);

    if (letter === currentItem.answer) {
      setCorrectCount(prev => prev + 1);
      addStars(15);
      const feedback = currentItem.type === 'word' 
        ? `Muito bem! Tu formaste a palavra ${currentItem.word}!`
        : `Espetacular! A resposta correta é ${currentItem.answer}!`;
      speak(feedback);
    } else {
      speak(`Quase! A resposta certa era ${currentItem.answer}. Vamos tentar a próxima?`);
    }
  };

  const nextQ = () => {
    voiceService.cancel();
    if (qIndex < EXERCISES.length - 1) {
      setQIndex(prev => prev + 1);
      setAnswered(false);
      setSelected(null);
    } else {
      setIsFinished(true);
      speak(`Incrível! Completaste todos os exercícios! Ganhaste muitas estrelas!`);
    }
  };

  if (isFinished) {
    return (
      <div className="rounded-[28px] border-1.5 border-white/10 bg-white/10 p-10 text-center backdrop-blur-xl">
        <div className="mb-4 text-7xl">🏆</div>
        <h2 className="font-['Titan_One'] text-3xl mb-2 text-yellow-400">Exercícios Completos!</h2>
        <p className="mb-8 font-bold opacity-70">Foste fantástico! Acertaste em {correctCount} de {EXERCISES.length} desafios!</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => { speak(''); window.location.reload(); }} className="rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 px-9 py-3.5 font-black shadow-lg transition-transform hover:scale-105">
            🔄 Recomeçar
          </button>
          <button onClick={() => { speak(''); onBack(); }} className="rounded-full bg-gradient-to-r from-purple-400 to-pink-500 px-9 py-3.5 font-black shadow-lg transition-transform hover:scale-105">
            🏠 Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border-1.5 border-white/10 bg-white/10 p-8 text-center backdrop-blur-xl">
      {/* Progress Bar */}
      <div className="mb-8 h-3 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-emerald-400 to-sky-400"
        />
      </div>

      <div className="mb-6 text-7xl">{currentItem.emoji}</div>
      
      <div className="mb-10 flex justify-center gap-4 text-5xl font-['Titan_One'] tracking-widest">
        {currentItem.type === 'word' ? (
          currentItem.word!.split('').map((letter, i) => (
            <div key={i} className="relative flex flex-col items-center">
              <div className="h-16 w-12 flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                  {i === currentItem.missingIndex ? (
                    answered ? (
                      <motion.span
                        key="answer"
                        layoutId={`letter-${qIndex}-${currentItem.answer}`}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={letter === selected ? 'text-emerald-400' : 'text-red-400'}
                      >
                        {letter}
                      </motion.span>
                    ) : (
                      <motion.span key="placeholder" className="text-yellow-400 opacity-50">?</motion.span>
                    )
                  ) : (
                    <span key="letter">{letter}</span>
                  )}
                </AnimatePresence>
              </div>
              <div className={`h-1.5 w-full rounded-full ${i === currentItem.missingIndex ? 'bg-yellow-400' : 'bg-white/20'}`} />
            </div>
          ))
        ) : (
          <div className="flex items-center gap-4 text-4xl sm:text-6xl">
            {currentItem.question.split(' ').map((part, i) => (
              <div key={i} className="relative flex flex-col items-center">
                <div className="h-20 flex items-center justify-center min-w-[40px]">
                  <AnimatePresence mode="popLayout">
                    {part === '_' ? (
                      answered ? (
                        <motion.span
                          key="answer"
                          layoutId={`letter-${qIndex}-${currentItem.answer}`}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={currentItem.answer === selected ? 'text-emerald-400' : 'text-red-400'}
                        >
                          {currentItem.answer}
                        </motion.span>
                      ) : (
                        <motion.span key="placeholder" className="text-yellow-400">?</motion.span>
                      )
                    ) : (
                      <span key="part">{part}</span>
                    )}
                  </AnimatePresence>
                </div>
                {part === '_' && <div className="h-1.5 w-full rounded-full bg-yellow-400" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {currentItem.options.map(opt => (
          <motion.button
            key={opt}
            disabled={answered}
            whileHover={!answered ? { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' } : {}}
            whileTap={!answered ? { scale: 0.95 } : {}}
            onClick={() => handleAnswer(opt)}
            className={`relative rounded-2xl border-2 p-6 text-3xl font-['Titan_One'] transition-all ${
              answered
                ? opt === currentItem.answer
                  ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
                  : opt === selected
                  ? 'border-red-400 bg-red-400/20 text-red-400'
                  : 'border-white/10 opacity-50'
                : 'border-white/15 bg-white/5 shadow-lg'
            }`}
          >
            <AnimatePresence>
              {answered && opt === selected && opt === currentItem.answer ? null : (
                <motion.span
                  layoutId={opt === currentItem.answer ? `letter-${qIndex}-${opt}` : undefined}
                >
                  {opt}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-10"
          >
            <button
              onClick={nextQ}
              className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-12 py-4 text-xl font-black text-slate-900 shadow-xl transition-transform hover:scale-105"
            >
              Continuar ✨
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
