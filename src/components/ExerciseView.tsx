import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MATH_SIGNS, getSessionExercises } from '../constants';
import { ExerciseItem } from '../types';
import { voiceService } from '../lib/voice';

interface Props {
  addStars: (n: number) => void;
  speak: (text: string) => void;
  onBack: () => void;
}

// ── Ecrã dos Sinais Matemáticos ──────────────────────────────────────────────
const SignsView: React.FC<{ speak: (t: string) => void; onBack: () => void }> = ({ speak, onBack }) => {
  const [sel, setSel] = useState(0);
  const lesson = MATH_SIGNS[sel];

  useEffect(() => {
    speak(
      `Vamos aprender sobre o sinal de ${lesson.name}! ` +
      `${lesson.description} ` +
      `Por exemplo: ${lesson.example}. ` +
      `${lesson.tip}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);

  return (
    <div className="flex flex-col gap-5">
      {/* Selector de sinais */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {MATH_SIGNS.map((s, i) => (
          <button
            key={s.symbol}
            onClick={() => { voiceService.cancel(); setSel(i); }}
            className={`flex-shrink-0 rounded-2xl border-2 px-6 py-3 font-black text-3xl transition-all ${
              sel === i ? 'border-yellow-400 bg-yellow-400/20 scale-110' : 'border-white/15 bg-white/5 hover:bg-white/10'
            }`}
            style={{ color: s.color }}
          >
            {s.symbol}
          </button>
        ))}
      </div>

      {/* Card da lição */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="rounded-[28px] border-1.5 border-white/10 bg-white/10 p-8 text-center backdrop-blur-xl"
        >
          <div className="mb-2 text-6xl">{lesson.emoji}</div>
          <div className="mb-1 font-black text-6xl" style={{ color: lesson.color }}>{lesson.symbol}</div>
          <h3 className="mb-5 font-['Titan_One'] text-2xl">{lesson.name}</h3>

          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left text-base font-semibold leading-relaxed text-white/90">
            {lesson.description}
          </div>

          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest opacity-50">Exemplo</p>
            <p className="font-['Titan_One'] text-3xl" style={{ color: lesson.color }}>{lesson.example}</p>
          </div>

          <div className="mb-5 rounded-2xl bg-yellow-400/10 p-4 text-sm font-bold text-yellow-300">
            💡 {lesson.tip}
          </div>

          <button
            onClick={() => speak(`${lesson.description} ${lesson.tip}`)}
            className="rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 px-8 py-3 font-black text-slate-900 shadow-lg transition-transform hover:scale-105"
          >
            🔊 Ouvir novamente
          </button>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() => { voiceService.cancel(); onBack(); }}
        className="rounded-full border-1.5 border-white/20 bg-white/10 px-8 py-3 font-extrabold transition-all hover:bg-white/20"
      >
        ← Voltar
      </button>
    </div>
  );
};

// ── Vista principal dos Exercícios ───────────────────────────────────────────
export const ExerciseView: React.FC<Props> = ({ addStars, speak, onBack }) => {
  const [mode, setMode]         = useState<'menu' | 'game' | 'signs'>('menu');
  const [exercises]             = useState<ExerciseItem[]>(() => getSessionExercises());
  const [qIndex, setQIndex]     = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect]   = useState(0);
  const [finished, setFinished] = useState(false);
  const spokenRef               = useRef(false);

  const cur      = exercises[qIndex];
  const total    = exercises.length;
  const progress = (qIndex / total) * 100;

  // Narra a pergunta assim que muda (após 300ms para não colidir com o cancel da resposta anterior)
  useEffect(() => {
    if (mode !== 'game' || !cur || answered) return;
    spokenRef.current = false;

    const t = setTimeout(() => {
      if (spokenRef.current) return;
      spokenRef.current = true;

      if (cur.type === 'word') {
        const withGap = cur.word!
          .split('')
          .map((l, i) => (i === cur.missingIndex ? '...' : l))
          .join(' ');
        speak(`Que letra falta? ${withGap}`);
      } else if (cur.type === 'math') {
        const spoken = (cur.question ?? '')
          .replace(/\+/g, ' mais ')
          .replace(/-/g, ' menos ')
          .replace(/x/g, ' vezes ')
          .replace(/÷/g, ' a dividir por ')
          .replace(/_/g, ' quanto?');
        speak(`Matemática! ${spoken}`);
      } else {
        const seq = (cur.question ?? '')
          .replace(/-/g, ' ... ')
          .replace('_', ' qual é o próximo?');
        speak(`Qual é o próximo número? ${seq}`);
      }
    }, 300);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, mode]);

  // ── Resposta ────────────────────────────────────────────────────────────────
  const handleAnswer = (opt: string) => {
    if (answered) return;
    voiceService.cancel();
    setAnswered(true);
    setSelected(opt);

    if (opt === cur.answer) {
      setCorrect(p => p + 1);
      addStars(15);

      let feedback = '';
      if (cur.type === 'word') {
        const intros = ['Espetacular!', 'Muito bem!', 'Fantástico!', 'Incrível!'];
        const intro  = intros[Math.floor(Math.random() * intros.length)];
        feedback = `${intro} Formaste a palavra ${cur.word}! Vamos continuar!`;
      } else if (cur.type === 'math') {
        const intros = ['Correto!', 'Muito bem!', 'Excelente!', 'Espetacular!'];
        const intro  = intros[Math.floor(Math.random() * intros.length)];
        // Lê a operação completa com a resposta no lugar do "_"
        const spoken = (cur.question ?? '')
          .replace(/\+/g, ' mais ')
          .replace(/-/g, ' menos ')
          .replace(/x/g, ' vezes ')
          .replace(/÷/g, ' a dividir por ')
          .replace('_', cur.answer);
        feedback = `${intro} ${spoken} é igual a ${cur.answer}!`;
      } else {
        feedback = `Certo! A sequência continua com ${cur.answer}! Muito bem!`;
      }
      speak(feedback);

    } else {
      let feedback = '';
      if (cur.type === 'word') {
        feedback = `Quase! A letra que faltava era ${cur.answer}. A palavra é ${cur.word}. Vamos continuar!`;
      } else {
        feedback = `Boa tentativa! A resposta certa era ${cur.answer}. Não desistas, vamos à próxima!`;
      }
      speak(feedback);
    }
  };

  // ── Próxima pergunta ────────────────────────────────────────────────────────
  const nextQ = () => {
    voiceService.cancel();
    if (qIndex < total - 1) {
      setQIndex(p => p + 1);
      setAnswered(false);
      setSelected(null);
    } else {
      setFinished(true);
      speak(`Fantástico! Completaste todos os exercícios! Acertaste ${correct} de ${total}! És incrível!`);
    }
  };

  // ── Ecrã final ──────────────────────────────────────────────────────────────
  if (finished) return (
    <div className="rounded-[28px] border-1.5 border-white/10 bg-white/10 p-10 text-center backdrop-blur-xl">
      <div className="mb-4 text-7xl">🏆</div>
      <h2 className="mb-2 font-['Titan_One'] text-3xl text-yellow-400">Exercícios Completos!</h2>
      <p className="mb-8 font-bold opacity-70">Acertaste em {correct} de {total} desafios!</p>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => { voiceService.cancel(); window.location.reload(); }}
          className="rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 px-9 py-3.5 font-black shadow-lg transition-transform hover:scale-105"
        >
          🔄 Recomeçar
        </button>
        <button
          onClick={() => { voiceService.cancel(); onBack(); }}
          className="rounded-full bg-gradient-to-r from-purple-400 to-pink-500 px-9 py-3.5 font-black shadow-lg transition-transform hover:scale-105"
        >
          🏠 Início
        </button>
      </div>
    </div>
  );

  // ── Sinais ──────────────────────────────────────────────────────────────────
  if (mode === 'signs') return <SignsView speak={speak} onBack={() => setMode('menu')} />;

  // ── Menu ────────────────────────────────────────────────────────────────────
  if (mode === 'menu') return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.div
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setMode('game'); speak('Vamos começar os exercícios! Boa sorte!'); }}
          className="cursor-pointer rounded-[28px] border-1.5 border-emerald-400/40 bg-white/10 p-8 text-center backdrop-blur-xl hover:bg-white/15"
        >
          <div className="mb-3 text-6xl">🎯</div>
          <h3 className="font-['Titan_One'] text-xl text-emerald-400">Exercícios</h3>
          <p className="mt-1 text-sm font-semibold opacity-60">{total} desafios aleatórios</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setMode('signs')}
          className="cursor-pointer rounded-[28px] border-1.5 border-yellow-400/40 bg-white/10 p-8 text-center backdrop-blur-xl hover:bg-white/15"
        >
          <div className="mb-3 text-6xl">📚</div>
          <h3 className="font-['Titan_One'] text-xl text-yellow-400">Aprender Sinais</h3>
          <p className="mt-1 text-sm font-semibold opacity-60">+ − × ÷ = explicados com voz</p>
        </motion.div>
      </div>

      <button
        onClick={() => { voiceService.cancel(); onBack(); }}
        className="rounded-full border-1.5 border-white/20 bg-white/10 px-8 py-3 font-extrabold transition-all hover:bg-white/20"
      >
        ← Voltar
      </button>
    </div>
  );

  // ── Jogo ────────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-[28px] border-1.5 border-white/10 bg-white/10 p-6 sm:p-8 text-center backdrop-blur-xl">
      {/* Progresso */}
      <div className="mb-2 flex items-center justify-between text-xs font-bold opacity-60">
        <span>{qIndex + 1}/{total}</span>
        <span>✅ {correct} certas</span>
      </div>
      <div className="mb-6 h-3 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
        />
      </div>

      {/* Emoji da pergunta */}
      <motion.div
        key={qIndex + '-e'}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-5 text-7xl"
      >
        {cur.emoji}
      </motion.div>

      {/* Palavra com espaço em branco */}
      {cur.type === 'word' ? (
        <div className="mb-8 flex justify-center gap-3 font-['Titan_One'] text-5xl tracking-widest">
          {cur.word!.split('').map((letter, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="flex h-14 w-11 items-center justify-center">
                <AnimatePresence mode="popLayout">
                  {i === cur.missingIndex ? (
                    answered ? (
                      <motion.span
                        key="ans"
                        initial={{ scale: 0, y: -30 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className={selected === cur.answer ? 'text-emerald-400' : 'text-red-400'}
                      >
                        {letter}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="blank"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="text-yellow-400"
                      >
                        ?
                      </motion.span>
                    )
                  ) : (
                    <span key="l">{letter}</span>
                  )}
                </AnimatePresence>
              </div>
              <div className={`mt-1 h-1.5 w-full rounded-full ${i === cur.missingIndex ? 'bg-yellow-400' : 'bg-white/20'}`} />
            </div>
          ))}
        </div>
      ) : (
        /* Matemática / Sequência */
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 font-['Titan_One'] text-4xl sm:text-5xl">
          {(cur.question ?? '').split(' ').map((part, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="flex h-16 min-w-[36px] items-center justify-center">
                {part === '_' ? (
                  answered ? (
                    <motion.span
                      initial={{ scale: 0, y: -20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className={selected === cur.answer ? 'text-emerald-400' : 'text-red-400'}
                    >
                      {cur.answer}
                    </motion.span>
                  ) : (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="text-yellow-400"
                    >
                      ?
                    </motion.span>
                  )
                ) : (
                  <span>{part}</span>
                )}
              </div>
              {part === '_' && <div className="h-1.5 w-full rounded-full bg-yellow-400" />}
            </div>
          ))}
        </div>
      )}

      {/* Opções */}
      <div className="grid grid-cols-3 gap-3">
        {cur.options.map(opt => (
          <motion.button
            key={opt}
            disabled={answered}
            whileHover={!answered ? { scale: 1.07 } : {}}
            whileTap={!answered ? { scale: 0.93 } : {}}
            onClick={() => handleAnswer(opt)}
            className={`rounded-2xl border-2 py-5 font-['Titan_One'] text-2xl transition-all ${
              answered
                ? opt === cur.answer
                  ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
                  : opt === selected
                  ? 'border-red-400 bg-red-400/20 text-red-400'
                  : 'border-white/10 opacity-40'
                : 'border-white/15 bg-white/5 hover:border-white/40 hover:bg-white/15'
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={nextQ}
            className="mt-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-12 py-4 text-xl font-black text-slate-900 shadow-xl transition-transform hover:scale-105"
          >
            Continuar ✨
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
