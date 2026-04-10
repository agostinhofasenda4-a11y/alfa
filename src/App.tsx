import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ArrowLeft, Trash2, Eraser, Download, Play, RotateCcw, Home as HomeIcon } from 'lucide-react';
import { ALPHA, NUMBERS, MASCOTS, EXERCISES } from './constants';
import { Page, AlphaItem, NumberItem } from './types';
import { voiceService } from './lib/voice';
import { SpeakingOrb } from './components/SpeakingOrb';
import { ExerciseView } from './components/ExerciseView';

// --- Components ---

const Header = ({ stars }: { stars: number }) => (
  <header className="relative z-20 flex items-center justify-between px-7 pt-7">
    <div className="font-['Titan_One'] text-3xl tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-400 drop-shadow-[0_0_20px_rgba(255,213,83,0.4)] sm:text-5xl">
      🦒 AlfaZoo
    </div>
    <div className="flex items-center gap-2 rounded-full border-1.5 border-white/20 bg-white/10 px-4.5 py-2 text-sm font-extrabold backdrop-blur-md sm:text-base">
      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      <span>{stars} estrelas</span>
    </div>
  </header>
);

const SectionHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <div className="my-8 flex items-center gap-3">
    <h2 className="font-['Titan_One'] text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-emerald-400 sm:text-3xl">
      {title}
    </h2>
    <button
      onClick={onBack}
      className="ml-auto flex items-center gap-2 rounded-full border-1.5 border-white/20 bg-white/10 px-4.5 py-2 text-sm font-extrabold text-white transition-all hover:scale-105 hover:bg-white/20 backdrop-blur-md"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar
    </button>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [stars, setStars] = useState(() => parseInt(localStorage.getItem('az2_stars') || '0'));
  const [seen, setSeen] = useState<Record<string, boolean>>(() => JSON.parse(localStorage.getItem('az2_seen') || '{}'));
  const [speakingText, setSpeakingText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mascot, setMascot] = useState(MASCOTS[0]);

  const addStars = useCallback((n: number) => {
    setStars(prev => {
      const next = prev + n;
      localStorage.setItem('az2_stars', next.toString());
      return next;
    });
  }, []);

  const speak = useCallback((text: string, opts = {}) => {
    setSpeakingText(text);
    setIsSpeaking(true);
    voiceService.speak(text, {
      ...opts,
      onEnd: () => setIsSpeaking(false)
    });
  }, []);

  useEffect(() => {
    // Greeting fires on the FIRST user tap (required for browser audio policy).
    // Without a user gesture, AudioContext stays suspended and no sound plays.
    const greet = () => {
      speak('Olá! Bem-vindo ao AlfaZoo! Eu sou a tua guia! Escolhe uma actividade para começar!');
    };
    window.addEventListener('click',      greet, { once: true });
    window.addEventListener('touchstart', greet, { once: true });
    return () => {
      window.removeEventListener('click',      greet);
      window.removeEventListener('touchstart', greet);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: Page) => {
    voiceService.cancel();
    setCurrentPage(page);
    if (page === 'home') {
      const m = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
      setMascot(m);
      const greetings = [
        `Olá! Eu sou o ${m.name}! O que queres aprender hoje?`,
        `Boa! Hoje vamos aprender muitas coisas giras juntos!`,
        `Uau, estás de volta! O ${m.name} estava à tua espera!`,
        `Vamos descobrir o mundo dos animais e das letras?`,
      ];
      const g = greetings[Math.floor(Math.random() * greetings.length)];
      speak(g);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0D1B3E] font-['Nunito'] text-white">
      {/* Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(69,183,245,0.18)_0%,transparent_60%),radial-gradient(ellipse_60%_50%_at_80%_100%,rgba(201,167,255,0.18)_0%,transparent_60%),radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(255,213,83,0.07)_0%,transparent_70%)]" />
      
      {/* Star Field */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute h-1 w-1 rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <Header stars={stars} />

      <main className="relative z-10 mx-auto max-w-[900px] px-5 pb-20">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <div className="pt-6 pb-2 text-center">
                <motion.div
                  animate={{ y: [0, -16, 0], rotate: [-3, 3, -3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block text-7xl drop-shadow-[0_10px_30px_rgba(255,213,83,0.3)] sm:text-9xl"
                >
                  {mascot.e}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                  className="mt-3 inline-block max-w-[480px] rounded-3xl border-1.5 border-white/20 bg-white/10 px-6 py-3.5 text-base font-bold leading-relaxed text-white/90 backdrop-blur-xl sm:text-lg"
                >
                  Olá! Eu sou o <span className="text-yellow-400">{mascot.name}</span>, o teu guia do AlfaZoo!<br />
                  O que queres aprender hoje? 🌟
                </motion.div>
              </div>

              <div className="mt-7 grid w-full grid-cols-2 gap-4 md:grid-cols-3">
                <MenuCard
                  icon="🔤"
                  title="Alfabeto"
                  desc="Letras A até Z"
                  color="text-emerald-400"
                  borderColor="border-emerald-400/40"
                  onClick={() => handlePageChange('alphabet')}
                />
                <MenuCard
                  icon="🔢"
                  title="Números"
                  desc="Conta de 1 a 10"
                  color="text-yellow-400"
                  borderColor="border-yellow-400/40"
                  onClick={() => handlePageChange('numbers')}
                />
                <MenuCard
                  icon="🎮"
                  title="Quiz"
                  desc="Testa o que sabes!"
                  color="text-pink-500"
                  borderColor="border-pink-500/40"
                  onClick={() => handlePageChange('quiz')}
                />
                <MenuCard
                  icon="📝"
                  title="Exercícios"
                  desc="Completa as palavras!"
                  color="text-emerald-400"
                  borderColor="border-emerald-400/40"
                  onClick={() => handlePageChange('exercises')}
                />
                <MenuCard
                  icon="🎨"
                  title="Pintar"
                  desc="Cria o teu desenho!"
                  color="text-purple-400"
                  borderColor="border-purple-400/40"
                  onClick={() => handlePageChange('paint')}
                />
              </div>
            </motion.div>
          )}

          {currentPage === 'alphabet' && (
            <motion.div
              key="alphabet"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <SectionHeader title="🔤 Alfabeto" onBack={() => handlePageChange('home')} />
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {ALPHA.map((item, i) => (
                  <AlphaCard
                    key={item.l}
                    item={item}
                    isSeen={seen[item.l]}
                    index={i}
                    onClick={() => {
                      if (!seen[item.l]) {
                        const newSeen = { ...seen, [item.l]: true };
                        setSeen(newSeen);
                        localStorage.setItem('az2_seen', JSON.stringify(newSeen));
                        addStars(3);
                      }
                      speak(`${item.l}! ${item.l} de ${item.n}. ${item.tip}`);
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {currentPage === 'numbers' && (
            <motion.div
              key="numbers"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <SectionHeader title="🔢 Números" onBack={() => handlePageChange('home')} />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {NUMBERS.map((item, i) => (
                  <NumberCard
                    key={item.n}
                    item={item}
                    index={i}
                    disabled={isSpeaking}
                    onClick={() => {
                      if (isSpeaking) return;
                      addStars(2);
                      // Flow: Intro -> Count (700ms pause) -> Example phrase
                      speak(`${item.n}! ... ${item.w}! ... Aqui temos ${item.n} ${item.n === 1 ? 'estrela' : 'estrelas'}!`);
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {currentPage === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <SectionHeader title="🎮 Quiz" onBack={() => handlePageChange('home')} />
              <QuizView addStars={addStars} speak={speak} onBack={() => handlePageChange('home')} />
            </motion.div>
          )}

          {currentPage === 'exercises' && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SectionHeader title="📝 Exercícios Especiais" onBack={() => handlePageChange('home')} />
              <ExerciseView addStars={addStars} speak={speak} onBack={() => handlePageChange('home')} />
            </motion.div>
          )}

          {currentPage === 'paint' && (
            <motion.div
              key="paint"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SectionHeader title="🎨 Pintar" onBack={() => handlePageChange('home')} />
              <PaintView addStars={addStars} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SpeakingOrb isVisible={isSpeaking} text={speakingText} />
    </div>
  );
}

// --- Sub-components ---

const MenuCard = ({ icon, title, desc, color, borderColor, onClick }: any) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative cursor-pointer overflow-hidden rounded-[28px] border-1.5 ${borderColor} bg-white/10 p-8 text-center backdrop-blur-xl transition-shadow hover:shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_40px_rgba(255,213,83,0.1)]`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
    <motion.span
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="relative block text-5xl sm:text-6xl"
    >
      {icon}
    </motion.span>
    <h3 className={`relative mt-3 font-['Titan_One'] text-lg tracking-wide ${color} sm:text-2xl`}>
      {title}
    </h3>
    <p className="relative mt-1 text-xs font-semibold opacity-60">
      {desc}
    </p>
  </motion.div>
);

interface AlphaCardProps {
  item: AlphaItem;
  isSeen: boolean;
  index: number;
  onClick: () => void;
}

const AlphaCard: React.FC<AlphaCardProps> = ({ item, isSeen, index, onClick }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.03 }}
    whileHover={{ y: -6, scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`relative cursor-pointer overflow-hidden rounded-3xl border-1.5 ${isSeen ? 'border-emerald-400 shadow-[0_0_18px_rgba(92,219,143,0.25)]' : 'border-white/10'} bg-white/10 p-5 text-center backdrop-blur-md`}
  >
    {isSeen && <div className="absolute top-2 right-2 text-xs">✅</div>}
    <span className="font-['Titan_One'] text-4xl leading-none" style={{ color: item.c }}>
      {item.l}
    </span>
    <span className="my-1.5 block text-3xl">{item.e}</span>
    <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">
      {item.n}
    </div>
  </motion.div>
);

interface NumberCardProps {
  item: NumberItem;
  index: number;
  onClick: () => void;
  disabled?: boolean;
}

const NumberCard: React.FC<NumberCardProps> = ({ item, index, onClick, disabled }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    whileHover={!disabled ? { y: -6, scale: 1.05 } : {}}
    whileTap={!disabled ? { scale: 0.95 } : {}}
    onClick={!disabled ? onClick : undefined}
    className={`relative cursor-pointer overflow-hidden rounded-3xl border-1.5 border-white/10 bg-white/10 p-6 text-center backdrop-blur-md ${disabled ? 'opacity-80 grayscale-[0.2]' : ''}`}
  >
    <div className="font-['Titan_One'] text-5xl leading-none" style={{ color: item.c }}>
      {item.n}
    </div>
    <div className="my-1.5 font-extrabold text-lg">{item.w}</div>
    <div className="text-xl leading-relaxed break-all">{item.e}</div>
  </motion.div>
);

// --- Quiz View ---

const QuizView = ({ addStars, speak, onBack }: any) => {
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizItems] = useState(() => [...ALPHA].sort(() => Math.random() - 0.5).slice(0, 8));
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentItem = quizItems[qIndex];
  const [options, setOptions] = useState<AlphaItem[]>([]);
  const [mode, setMode] = useState<'letter' | 'emoji'>('letter');

  useEffect(() => {
    if (currentItem) {
      const wrongs = [...ALPHA].filter(x => x.l !== currentItem.l).sort(() => Math.random() - 0.5).slice(0, 3);
      setOptions([...wrongs, currentItem].sort(() => Math.random() - 0.5));
      setMode(Math.random() > 0.5 ? 'letter' : 'emoji');
      
      const timer = setTimeout(() => {
        if (mode === 'letter') speak(`Qual animal começa com a letra ${currentItem.l}?`);
        else speak(`${currentItem.n}! Qual é a letra do ${currentItem.n}?`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [qIndex, currentItem, mode, speak]);

  const handleAnswer = (chosen: string) => {
    if (answered) return;
    voiceService.cancel();
    setAnswered(true);
    setSelected(chosen);
    if (chosen === currentItem.l) {
      setCorrectCount(prev => prev + 1);
      addStars(10);
      speak(`Muito bem! Fantástico! ${currentItem.l} de ${currentItem.n}! Excelente!`);
    } else {
      speak(`Boa tentativa! Olha, era a letra ${currentItem.l} de ${currentItem.n}. Mas não faz mal, vamos continuar a aprender!`);
    }
  };

  const nextQ = () => {
    voiceService.cancel();
    if (qIndex < 7) {
      setQIndex(prev => prev + 1);
      setAnswered(false);
      setSelected(null);
    } else {
      setIsFinished(true);
      const pct = Math.round((correctCount / 8) * 100);
      let msg = 'Boa tentativa! Continua a praticar!';
      if (pct >= 90) msg = 'Perfeito! És um supercampeão!';
      else if (pct >= 60) msg = 'Muito bem! Estás quase lá!';
      speak(`${msg} Acertaste ${correctCount} de 8 perguntas!`);
    }
  };

  if (isFinished) {
    const pct = Math.round((correctCount / 8) * 100);
    return (
      <div className="rounded-[28px] border-1.5 border-white/10 bg-white/10 p-10 text-center backdrop-blur-xl">
        <div className="mb-4 text-7xl">{pct >= 90 ? '🥇' : pct >= 60 ? '🥈' : '🥉'}</div>
        <h2 className="font-['Titan_One'] text-3xl mb-2">
          {pct >= 90 ? 'Perfeito!' : pct >= 60 ? 'Muito bem!' : 'Boa tentativa!'}
        </h2>
        <p className="mb-8 font-bold opacity-70">Acertaste {correctCount} de 8 perguntas! ({pct}%)</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => window.location.reload()} className="rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 px-9 py-3.5 font-black shadow-lg transition-transform hover:scale-105">
            🔄 Jogar de Novo
          </button>
          <button onClick={onBack} className="rounded-full bg-gradient-to-r from-purple-400 to-pink-500 px-9 py-3.5 font-black shadow-lg transition-transform hover:scale-105">
            🏠 Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border-1.5 border-white/10 bg-white/10 p-8 text-center backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between text-sm font-extrabold opacity-70">
        <span>Pergunta {qIndex + 1}/8</span>
        <span>✅ {correctCount} certas</span>
      </div>
      
      <div className="mb-6 flex justify-center gap-1.5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`h-2.5 w-2.5 rounded-full transition-all ${i < qIndex ? 'bg-emerald-400 scale-110' : i === qIndex ? 'bg-yellow-400 scale-125' : 'bg-white/20'}`} />
        ))}
      </div>

      <div className="mb-4">
        {mode === 'letter' ? (
          <motion.span key={currentItem.l} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="block font-['Titan_One'] text-8xl text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-pink-500">
            {currentItem.l}
          </motion.span>
        ) : (
          <motion.span key={currentItem.e} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="block text-7xl">
            {currentItem.e}
          </motion.span>
        )}
      </div>
      
      <p className="mb-7 text-lg font-bold opacity-80">
        {mode === 'letter' ? 'Qual animal começa com esta letra?' : `Este animal é o ${currentItem.n}. Qual é a sua letra?`}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {options.map(opt => (
          <button
            key={opt.l}
            disabled={answered}
            onClick={() => handleAnswer(opt.l)}
            className={`flex items-center justify-center gap-2 rounded-2xl border-2 p-5 font-extrabold transition-all ${
              answered
                ? opt.l === currentItem.l
                  ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
                  : opt.l === selected
                  ? 'border-red-400 bg-red-400/20 text-red-400'
                  : 'border-white/10 opacity-50'
                : 'border-white/15 bg-white/5 hover:scale-105 hover:bg-white/15'
            }`}
          >
            {mode === 'letter' ? (
              <div className="text-center">
                <span className="text-2xl">{opt.e}</span>
                <div className="text-[10px] opacity-70">{opt.n}</div>
              </div>
            ) : (
              <span className="text-2xl">{opt.l}</span>
            )}
          </button>
        ))}
      </div>

      {answered && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={nextQ}
          className="mt-7 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-10 py-3.5 font-black text-slate-900 shadow-xl transition-transform hover:scale-105"
        >
          Próxima ✨
        </motion.button>
      )}
    </div>
  );
};

// --- Paint View ---

const PaintView = ({ addStars }: any) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#FFD553');
  const [brushSize, setBrushSize] = useState(14);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#fffdf7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const getXY = (e: any) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const { x, y } = getXY(e);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const { x, y } = getXY(e);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.lineWidth = isEraser ? brushSize * 2.5 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#fffdf7' : color;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const save = () => {
    const link = document.createElement('a');
    link.href = canvasRef.current!.toDataURL('image/png');
    link.download = 'alfazoo_desenho.png';
    link.click();
    addStars(5);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border-1.5 border-white/10 bg-white/10 p-4 backdrop-blur-xl">
        {['#FFD553', '#FF6FA8', '#4ECDC4', '#5CDB8F', '#45B7F5', '#C9A7FF', '#FF7B54', '#FFFFFF', '#000000'].map(c => (
          <button
            key={c}
            onClick={() => { setColor(c); setIsEraser(false); }}
            className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${color === c && !isEraser ? 'border-white scale-125' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <div className="ml-auto flex items-center gap-3 text-xs font-bold opacity-80">
          🖌️ <input type="range" min="4" max="36" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="w-20 accent-yellow-400" />
          <span>{brushSize}px</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border-1.5 border-white/10 bg-white/10 backdrop-blur-xl">
        <canvas
          ref={canvasRef}
          width={640}
          height={460}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block w-full cursor-crosshair touch-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={clear} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-1.5 border-white/20 bg-white/10 p-3.5 font-extrabold transition-all hover:bg-white/20">
          <Trash2 className="h-4 w-4" /> Limpar
        </button>
        <button onClick={() => setIsEraser(!isEraser)} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-1.5 p-3.5 font-extrabold transition-all ${isEraser ? 'border-orange-500 bg-orange-500/20 text-orange-500' : 'border-white/20 bg-white/10 hover:bg-white/20'}`}>
          <Eraser className="h-4 w-4" /> Borracha
        </button>
        <button onClick={save} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-1.5 border-white/20 bg-white/10 p-3.5 font-extrabold transition-all hover:bg-white/20">
          <Download className="h-4 w-4" /> Guardar
        </button>
      </div>
    </div>
  );
};
