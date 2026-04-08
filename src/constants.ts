import { AlphaItem, NumberItem, Mascot, ExerciseItem } from './types';

export const ALPHA: AlphaItem[] = [
  {l:'A',n:'Abelha',   e:'🐝', c:'#FFD553', tip:'A de Abelha! Escuta: Aaa... como em abrir a boca bem grande!'},
  {l:'B',n:'Borboleta',e:'🦋', c:'#FF6FA8', tip:'B de Borboleta! O B tem duas barrigas redondas, como asas!'},
  {l:'C',n:'Cavalo',   e:'🐴', c:'#4ECDC4', tip:'C de Cavalo! O C é como uma ferradura de cavalo virada!'},
  {l:'D',n:'Dinossauro',e:'🦕',c:'#5CDB8F', tip:'D de Dinossauro! O D tem uma barriga enorme, como um dino!'},
  {l:'E',n:'Elefante', e:'🐘', c:'#45B7F5', tip:'E de Elefante! As três linhas do E são as pernas do elefante!'},
  {l:'F',n:'Flamingo', e:'🦩', c:'#FF6FA8', tip:'F de Flamingo! O F fica em pé numa perna só, como o flamingo!'},
  {l:'G',n:'Girafa',   e:'🦒', c:'#FFD553', tip:'G de Girafa! O G tem um pescoço comprido escondido!'},
  {l:'H',n:'Hipopótamo',e:'🦛',c:'#C9A7FF', tip:'H de Hipopótamo! O H tem duas pernas bem grossas!'},
  {l:'I',n:'Iguana',   e:'🦎', c:'#4ECDC4', tip:'I de Iguana! O I é fininho como uma iguana na pedra!'},
  {l:'J',n:'Jacaré',   e:'🐊', c:'#5CDB8F', tip:'J de Jacaré! O J tem um gancho como a cauda do jacaré!'},
  {l:'K',n:'Koala',    e:'🐨', c:'#45B7F5', tip:'K de Koala! Os braços do K abraçam as árvores!'},
  {l:'L',n:'Leão',     e:'🦁', c:'#FFD553', tip:'L de Leão! O L é como a juba do rei da selva!'},
  {l:'M',n:'Macaco',   e:'🐒', c:'#FF7B54', tip:'M de Macaco! As pontas do M são as orelhas do macaco!'},
  {l:'N',n:'Narval',   e:'🐬', c:'#C9A7FF', tip:'N de Narval! O N tem um dente especial escondido!'},
  {l:'O',n:'Orca',     e:'🐋', c:'#4ECDC4', tip:'O de Orca! Redondo como a barriga da baleia orca!'},
  {l:'P',n:'Pinguim',  e:'🐧', c:'#45B7F5', tip:'P de Pinguim! O P usa um casacão elegante!'},
  {l:'Q',n:'Quati',    e:'🦝', c:'#5CDB8F', tip:'Q de Quati! O Q tem um rabinho pequenino!'},
  {l:'R',n:'Raposa',   e:'🦊', c:'#FF7B54', tip:'R de Raposa! O R fica de pé com uma perinha!'},
  {l:'S',n:'Sapo',     e:'🐸', c:'#5CDB8F', tip:'S de Sapo! O S reboleia como um sapo a saltar!'},
  {l:'T',n:'Tartaruga',e:'🐢', c:'#4ECDC4', tip:'T de Tartaruga! O T carrega um chapéu largo!'},
  {l:'U',n:'Urso',     e:'🐻', c:'#C9A7FF', tip:'U de Urso! O U é o abraço quentinho do urso!'},
  {l:'V',n:'Vaca',     e:'🐄', c:'#FFD553', tip:'V de Vaca! As pontas do V são os cornos da vaca!'},
  {l:'W',n:'Wombat',   e:'🦔', c:'#FF6FA8', tip:'W de Wombat! São dois V juntos, como dois animais a dançar!'},
  {l:'X',n:'Xenartro', e:'🦥', c:'#FF7B54', tip:'X de Xenartro! O bicho-preguiça tem os braços cruzados como o X!'},
  {l:'Y',n:'Yak',      e:'🐃', c:'#45B7F5', tip:'Y de Yak! O Y parece os cornos do yak, um boi peludo!'},
  {l:'Z',n:'Zebra',    e:'🦓', c:'#FF6FA8', tip:'Z de Zebra! As riscas da zebra formam um Z!'},
];

export const NUMBERS: NumberItem[] = [
  {n:1, w:'Um',    e:'⭐',       c:'#FFD553'},
  {n:2, w:'Dois',  e:'🌟🌟',     c:'#FF6FA8'},
  {n:3, w:'Três',  e:'🍎🍎🍎',   c:'#4ECDC4'},
  {n:4, w:'Quatro',e:'🦋🦋🦋🦋', c:'#5CDB8F'},
  {n:5, w:'Cinco', e:'⚽⚽⚽⚽⚽', c:'#45B7F5'},
  {n:6, w:'Seis',  e:'🐟🐟🐟🐟🐟🐟', c:'#C9A7FF'},
  {n:7, w:'Sete',  e:'🌈🌈🌈🌈🌈🌈🌈', c:'#FF7B54'},
  {n:8, w:'Oito',  e:'🐙🐙🐙🐙🐙🐙🐙🐙', c:'#FF6FA8'},
  {n:9, w:'Nove',  e:'🐱🐱🐱🐱🐱🐱🐱🐱🐱', c:'#4ECDC4'},
  {n:10,w:'Dez',   e:'🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈',c:'#FFD553'},
];

export const MASCOTS: Mascot[] = [
  {e:'🦁',name:'Leão Leo'},
  {e:'🦒',name:'Girafa Gigi'},
  {e:'🐬',name:'Golfinho Gui'},
  {e:'🦋',name:'Borboleta Bela'},
  {e:'🐸',name:'Sapo Simão'},
];

export const EXERCISES: ExerciseItem[] = [
  // Palavras
  { type: 'word', question: 'C _ S A', answer: 'A', options: ['A', 'E', 'O'], emoji: '🏠', word: 'CASA', missingIndex: 1 },
  { type: 'word', question: 'B _ L A', answer: 'O', options: ['O', 'A', 'U'], emoji: '⚽', word: 'BOLA', missingIndex: 1 },
  { type: 'word', question: 'M _ Ç Ã', answer: 'A', options: ['A', 'E', 'O'], emoji: '🍎', word: 'MAÇÃ', missingIndex: 1 },
  { type: 'word', question: 'U _ A', answer: 'V', options: ['V', 'B', 'P'], emoji: '🍇', word: 'UVA', missingIndex: 1 },
  
  // Matemática (Soma e Subtração)
  { type: 'math', question: '2 + _ = 5', answer: '3', options: ['2', '3', '4'], emoji: '➕' },
  { type: 'math', question: '10 - _ = 7', answer: '3', options: ['2', '3', '4'], emoji: '➖' },
  { type: 'math', question: '4 + 4 = _', answer: '8', options: ['7', '8', '9'], emoji: '🧮' },
  { type: 'math', question: '_ + 2 = 6', answer: '4', options: ['3', '4', '5'], emoji: '🔢' },

  // Sequências
  { type: 'sequence', question: '2 - 4 - _', answer: '6', options: ['5', '6', '7'], emoji: '📈' },
  { type: 'sequence', question: '10 - 20 - _', answer: '30', options: ['25', '30', '40'], emoji: '🚀' },
  { type: 'sequence', question: '5 - 10 - _', answer: '15', options: ['12', '15', '20'], emoji: '🏃' },

  // Multiplicação e Divisão (Simples)
  { type: 'math', question: '2 x 2 = _', answer: '4', options: ['3', '4', '5'], emoji: '✖️' },
  { type: 'math', question: '6 ÷ 2 = _', answer: '3', options: ['2', '3', '4'], emoji: '➗' },
  { type: 'math', question: '3 x _ = 9', answer: '3', options: ['2', '3', '4'], emoji: '✨' },
];
