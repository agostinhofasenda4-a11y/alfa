import { AlphaItem, NumberItem, Mascot, ExerciseItem } from './types';

export const ALPHA: AlphaItem[] = [
  {l:'A',n:'Abelha',    e:'🐝', c:'#FFD553', tip:'A de Abelha! Aaa... como em abrir a boca bem grande!'},
  {l:'B',n:'Borboleta', e:'🦋', c:'#FF6FA8', tip:'B de Borboleta! O B tem duas barrigas redondas, como asas!'},
  {l:'C',n:'Cavalo',    e:'🐴', c:'#4ECDC4', tip:'C de Cavalo! O C é como uma ferradura de cavalo virada!'},
  {l:'D',n:'Dinossauro',e:'🦕', c:'#5CDB8F', tip:'D de Dinossauro! O D tem uma barriga enorme, como um dino!'},
  {l:'E',n:'Elefante',  e:'🐘', c:'#45B7F5', tip:'E de Elefante! As três linhas do E são as pernas do elefante!'},
  {l:'F',n:'Flamingo',  e:'🦩', c:'#FF6FA8', tip:'F de Flamingo! O F fica em pé numa perna só, como o flamingo!'},
  {l:'G',n:'Girafa',    e:'🦒', c:'#FFD553', tip:'G de Girafa! O G tem um pescoço comprido escondido!'},
  {l:'H',n:'Hipopótamo',e:'🦛', c:'#C9A7FF', tip:'H de Hipopótamo! O H tem duas pernas bem grossas!'},
  {l:'I',n:'Iguana',    e:'🦎', c:'#4ECDC4', tip:'I de Iguana! O I é fininho como uma iguana na pedra!'},
  {l:'J',n:'Jacaré',    e:'🐊', c:'#5CDB8F', tip:'J de Jacaré! O J tem um gancho como a cauda do jacaré!'},
  {l:'K',n:'Koala',     e:'🐨', c:'#45B7F5', tip:'K de Koala! Os braços do K abraçam as árvores!'},
  {l:'L',n:'Leão',      e:'🦁', c:'#FFD553', tip:'L de Leão! O L é como a juba do rei da selva!'},
  {l:'M',n:'Macaco',    e:'🐒', c:'#FF7B54', tip:'M de Macaco! As pontas do M são as orelhas do macaco!'},
  {l:'N',n:'Narval',    e:'🐬', c:'#C9A7FF', tip:'N de Narval! O N tem um dente especial escondido!'},
  {l:'O',n:'Orca',      e:'🐋', c:'#4ECDC4', tip:'O de Orca! Redondo como a barriga da baleia orca!'},
  {l:'P',n:'Pinguim',   e:'🐧', c:'#45B7F5', tip:'P de Pinguim! O P usa um casacão elegante!'},
  {l:'Q',n:'Quati',     e:'🦝', c:'#5CDB8F', tip:'Q de Quati! O Q tem um rabinho pequenino!'},
  {l:'R',n:'Raposa',    e:'🦊', c:'#FF7B54', tip:'R de Raposa! O R fica de pé com uma perinha!'},
  {l:'S',n:'Sapo',      e:'🐸', c:'#5CDB8F', tip:'S de Sapo! O S reboleia como um sapo a saltar!'},
  {l:'T',n:'Tartaruga', e:'🐢', c:'#4ECDC4', tip:'T de Tartaruga! O T carrega um chapéu largo!'},
  {l:'U',n:'Urso',      e:'🐻', c:'#C9A7FF', tip:'U de Urso! O U é o abraço quentinho do urso!'},
  {l:'V',n:'Vaca',      e:'🐄', c:'#FFD553', tip:'V de Vaca! As pontas do V são os cornos da vaca!'},
  {l:'W',n:'Wombat',    e:'🦔', c:'#FF6FA8', tip:'W de Wombat! São dois V juntos, como dois animais a dançar!'},
  {l:'X',n:'Xenartro',  e:'🦥', c:'#FF7B54', tip:'X de Xenartro! O bicho-preguiça tem os braços cruzados!'},
  {l:'Y',n:'Yak',       e:'🐃', c:'#45B7F5', tip:'Y de Yak! O Y parece os cornos do yak, um boi peludo!'},
  {l:'Z',n:'Zebra',     e:'🦓', c:'#FF6FA8', tip:'Z de Zebra! As riscas da zebra formam um Z!'},
];

// ── NÚMEROS — campo "thing" para narração correcta ───────────────────────────
export const NUMBERS: NumberItem[] = [
  {n:1, w:'Um',    e:'⭐',                              c:'#FFD553', thing:'estrela'},
  {n:2, w:'Dois',  e:'🌟🌟',                            c:'#FF6FA8', thing:'estrelas brilhantes'},
  {n:3, w:'Três',  e:'🍎🍎🍎',                          c:'#4ECDC4', thing:'maçãs'},
  {n:4, w:'Quatro',e:'🦋🦋🦋🦋',                        c:'#5CDB8F', thing:'borboletas'},
  {n:5, w:'Cinco', e:'⚽⚽⚽⚽⚽',                        c:'#45B7F5', thing:'bolas'},
  {n:6, w:'Seis',  e:'🐟🐟🐟🐟🐟🐟',                    c:'#C9A7FF', thing:'peixes'},
  {n:7, w:'Sete',  e:'🌈🌈🌈🌈🌈🌈🌈',                  c:'#FF7B54', thing:'arco-íris'},
  {n:8, w:'Oito',  e:'🐙🐙🐙🐙🐙🐙🐙🐙',                c:'#FF6FA8', thing:'polvos'},
  {n:9, w:'Nove',  e:'🐱🐱🐱🐱🐱🐱🐱🐱🐱',              c:'#4ECDC4', thing:'gatinhos'},
  {n:10,w:'Dez',   e:'🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈',            c:'#FFD553', thing:'balões'},
];

export const MASCOTS: Mascot[] = [
  {e:'🦁', name:'Leão Leo'},
  {e:'🦒', name:'Girafa Gigi'},
  {e:'🐬', name:'Golfinho Gui'},
  {e:'🦋', name:'Borboleta Bela'},
  {e:'🐸', name:'Sapo Simão'},
];

// ── SINAIS MATEMÁTICOS ───────────────────────────────────────────────────────
export interface MathSign {
  symbol: string; name: string; emoji: string;
  color: string; description: string; example: string; tip: string;
}

export const MATH_SIGNS: MathSign[] = [
  {
    symbol:'+', name:'Adição', emoji:'➕', color:'#5CDB8F',
    description:'O sinal de mais serve para JUNTAR coisas! Quando tens 2 maçãs e ganhas mais 3, usas o mais para saber quantas tens no total!',
    example:'2 + 3 = 5',
    tip:'Pensa assim: tens 2 dedos numa mão e levantas mais 3. Conta todos! Isso é adição!',
  },
  {
    symbol:'−', name:'Subtração', emoji:'➖', color:'#45B7F5',
    description:'O sinal de menos serve para TIRAR coisas! Se tens 5 bolachas e comes 2, o menos ajuda-te a saber quantas ficaram!',
    example:'5 − 2 = 3',
    tip:'Imagina 5 balões. Se 2 voaram para o céu, quantos ficaram? Conta os que sobram!',
  },
  {
    symbol:'×', name:'Multiplicação', emoji:'✖️', color:'#FF6FA8',
    description:'O sinal de vezes é como fazer adições muitas vezes rapidinho! Se tens 3 grupos de 2 rebuçados, em vez de somar 2 mais 2 mais 2, podes dizer 3 vezes 2!',
    example:'3 × 2 = 6',
    tip:'Pensa em 3 caixas com 2 bolas cada. Multiplicar é contar todas as bolas de uma vez!',
  },
  {
    symbol:'÷', name:'Divisão', emoji:'➗', color:'#C9A7FF',
    description:'O sinal de dividir serve para PARTILHAR em partes iguais! Se tens 8 bolachas para 2 amigos, a divisão diz que cada um fica com 4!',
    example:'8 ÷ 2 = 4',
    tip:'É como partilhar doces de forma justa! Todos ficam com a mesma quantidade!',
  },
  {
    symbol:'=', name:'Igual', emoji:'🟰', color:'#FFD553',
    description:'O sinal de igual diz que os dois lados têm o MESMO VALOR! É como uma balança equilibrada!',
    example:'3 + 2 = 5',
    tip:'O igual é como dizer: este lado e aquele lado são a mesma coisa!',
  },
];

// ── 100 EXERCÍCIOS ────────────────────────────────────────────────────────────
const POOL: ExerciseItem[] = [
  // PALAVRAS (40)
  {type:'word',emoji:'🏠',word:'CASA',     missingIndex:1,answer:'A',options:['A','E','O']},
  {type:'word',emoji:'⚽',word:'BOLA',     missingIndex:1,answer:'O',options:['O','A','U']},
  {type:'word',emoji:'🍎',word:'MACA',     missingIndex:1,answer:'A',options:['A','E','I']},
  {type:'word',emoji:'🍇',word:'UVA',      missingIndex:1,answer:'V',options:['V','B','P']},
  {type:'word',emoji:'🐱',word:'GATO',     missingIndex:1,answer:'A',options:['A','O','E']},
  {type:'word',emoji:'☀️',word:'SOL',      missingIndex:1,answer:'O',options:['O','U','A']},
  {type:'word',emoji:'🌙',word:'LUA',      missingIndex:1,answer:'U',options:['U','O','A']},
  {type:'word',emoji:'🐘',word:'ELEFANTE', missingIndex:3,answer:'F',options:['F','V','P']},
  {type:'word',emoji:'🦁',word:'LEAO',     missingIndex:2,answer:'A',options:['A','E','O']},
  {type:'word',emoji:'🐸',word:'SAPO',     missingIndex:2,answer:'P',options:['P','B','T']},
  {type:'word',emoji:'🎂',word:'BOLO',     missingIndex:1,answer:'O',options:['O','A','U']},
  {type:'word',emoji:'🚗',word:'CARRO',    missingIndex:1,answer:'A',options:['A','O','E']},
  {type:'word',emoji:'🌺',word:'FLOR',     missingIndex:1,answer:'L',options:['L','R','N']},
  {type:'word',emoji:'🍌',word:'BANANA',   missingIndex:2,answer:'N',options:['N','M','L']},
  {type:'word',emoji:'🍊',word:'LARANJA',  missingIndex:2,answer:'R',options:['R','L','N']},
  {type:'word',emoji:'🍓',word:'MORANGO',  missingIndex:3,answer:'A',options:['A','O','E']},
  {type:'word',emoji:'🥭',word:'MANGA',    missingIndex:2,answer:'N',options:['N','M','L']},
  {type:'word',emoji:'🍍',word:'ANANÁS',   missingIndex:2,answer:'N',options:['N','M','B']},
  {type:'word',emoji:'🍋',word:'LIMAO',    missingIndex:2,answer:'M',options:['M','N','B']},
  {type:'word',emoji:'🍒',word:'CEREJA',   missingIndex:2,answer:'R',options:['R','L','N']},
  {type:'word',emoji:'🍐',word:'PERA',     missingIndex:2,answer:'R',options:['R','L','N']},
  {type:'word',emoji:'🍉',word:'MELANCIA', missingIndex:3,answer:'A',options:['A','E','O']},
  {type:'word',emoji:'🍈',word:'MELAO',    missingIndex:2,answer:'L',options:['L','N','R']},
  {type:'word',emoji:'🥥',word:'COCO',     missingIndex:1,answer:'O',options:['O','A','U']},
  {type:'word',emoji:'🐠',word:'PEIXE',    missingIndex:2,answer:'I',options:['I','E','A']},
  {type:'word',emoji:'🌸',word:'ROSA',     missingIndex:1,answer:'O',options:['O','A','U']},
  {type:'word',emoji:'🐝',word:'ABELHA',   missingIndex:2,answer:'E',options:['E','A','I']},
  {type:'word',emoji:'⭐',word:'ESTRELA',  missingIndex:3,answer:'E',options:['E','A','I']},
  {type:'word',emoji:'🎈',word:'BALAO',    missingIndex:2,answer:'L',options:['L','N','R']},
  {type:'word',emoji:'🌊',word:'MAR',      missingIndex:1,answer:'A',options:['A','E','O']},
  {type:'word',emoji:'🦋',word:'BORBOLETA',missingIndex:3,answer:'B',options:['B','P','V']},
  {type:'word',emoji:'🐢',word:'TARTARUGA',missingIndex:3,answer:'T',options:['T','D','P']},
  {type:'word',emoji:'🌈',word:'ARCO',     missingIndex:2,answer:'C',options:['C','G','Q']},
  {type:'word',emoji:'🏔️',word:'MONTANHA', missingIndex:3,answer:'T',options:['T','D','N']},
  {type:'word',emoji:'🌊',word:'OCEANO',   missingIndex:3,answer:'A',options:['A','E','O']},
  {type:'word',emoji:'🍑',word:'PESSEGO',  missingIndex:2,answer:'S',options:['S','Z','X']},
  {type:'word',emoji:'🫐',word:'MIRTILO',  missingIndex:3,answer:'T',options:['T','D','P']},
  {type:'word',emoji:'🥝',word:'KIWI',     missingIndex:2,answer:'W',options:['W','V','U']},
  {type:'word',emoji:'🍑',word:'ABACATE',  missingIndex:3,answer:'C',options:['C','G','T']},
  {type:'word',emoji:'🐦',word:'PASSARO',  missingIndex:3,answer:'S',options:['S','Z','X']},

  // ADIÇÃO (15)
  {type:'math',emoji:'➕',question:'1 + 1 = _', answer:'2', options:['1','2','3']},
  {type:'math',emoji:'➕',question:'2 + 1 = _', answer:'3', options:['2','3','4']},
  {type:'math',emoji:'➕',question:'2 + 2 = _', answer:'4', options:['3','4','5']},
  {type:'math',emoji:'➕',question:'3 + 2 = _', answer:'5', options:['4','5','6']},
  {type:'math',emoji:'➕',question:'4 + 2 = _', answer:'6', options:['5','6','7']},
  {type:'math',emoji:'➕',question:'3 + 4 = _', answer:'7', options:['6','7','8']},
  {type:'math',emoji:'➕',question:'5 + 3 = _', answer:'8', options:['7','8','9']},
  {type:'math',emoji:'➕',question:'_ + 3 = 6', answer:'3', options:['2','3','4']},
  {type:'math',emoji:'➕',question:'_ + 2 = 5', answer:'3', options:['2','3','4']},
  {type:'math',emoji:'➕',question:'6 + _ = 9', answer:'3', options:['2','3','4']},
  {type:'math',emoji:'➕',question:'5 + 5 = _', answer:'10',options:['8','9','10']},
  {type:'math',emoji:'➕',question:'7 + 2 = _', answer:'9', options:['8','9','10']},
  {type:'math',emoji:'➕',question:'4 + 4 = _', answer:'8', options:['7','8','9']},
  {type:'math',emoji:'➕',question:'_ + 1 = 4', answer:'3', options:['2','3','4']},
  {type:'math',emoji:'➕',question:'6 + 4 = _', answer:'10',options:['9','10','11']},

  // SUBTRAÇÃO (15)
  {type:'math',emoji:'➖',question:'3 - 1 = _', answer:'2', options:['1','2','3']},
  {type:'math',emoji:'➖',question:'5 - 2 = _', answer:'3', options:['2','3','4']},
  {type:'math',emoji:'➖',question:'6 - 3 = _', answer:'3', options:['2','3','4']},
  {type:'math',emoji:'➖',question:'8 - 4 = _', answer:'4', options:['3','4','5']},
  {type:'math',emoji:'➖',question:'9 - 3 = _', answer:'6', options:['5','6','7']},
  {type:'math',emoji:'➖',question:'10 - 5 = _',answer:'5', options:['4','5','6']},
  {type:'math',emoji:'➖',question:'7 - 2 = _', answer:'5', options:['4','5','6']},
  {type:'math',emoji:'➖',question:'_ - 2 = 3', answer:'5', options:['4','5','6']},
  {type:'math',emoji:'➖',question:'10 - _ = 7',answer:'3', options:['2','3','4']},
  {type:'math',emoji:'➖',question:'8 - _ = 5', answer:'3', options:['2','3','4']},
  {type:'math',emoji:'➖',question:'6 - 1 = _', answer:'5', options:['4','5','6']},
  {type:'math',emoji:'➖',question:'9 - 4 = _', answer:'5', options:['4','5','6']},
  {type:'math',emoji:'➖',question:'4 - 4 = _', answer:'0', options:['0','1','2']},
  {type:'math',emoji:'➖',question:'_ - 3 = 4', answer:'7', options:['6','7','8']},
  {type:'math',emoji:'➖',question:'10 - 2 = _',answer:'8', options:['7','8','9']},

  // MULTIPLICAÇÃO (10)
  {type:'math',emoji:'✖️',question:'2 x 1 = _', answer:'2', options:['1','2','3']},
  {type:'math',emoji:'✖️',question:'2 x 2 = _', answer:'4', options:['3','4','5']},
  {type:'math',emoji:'✖️',question:'2 x 3 = _', answer:'6', options:['5','6','7']},
  {type:'math',emoji:'✖️',question:'3 x 3 = _', answer:'9', options:['8','9','10']},
  {type:'math',emoji:'✖️',question:'2 x 5 = _', answer:'10',options:['8','10','12']},
  {type:'math',emoji:'✖️',question:'3 x 2 = _', answer:'6', options:['5','6','7']},
  {type:'math',emoji:'✖️',question:'4 x 2 = _', answer:'8', options:['6','8','10']},
  {type:'math',emoji:'✖️',question:'_ x 2 = 6', answer:'3', options:['2','3','4']},
  {type:'math',emoji:'✖️',question:'5 x 2 = _', answer:'10',options:['8','9','10']},
  {type:'math',emoji:'✖️',question:'_ x 3 = 9', answer:'3', options:['2','3','4']},

  // DIVISÃO (10)
  {type:'math',emoji:'➗',question:'4 ÷ 2 = _', answer:'2', options:['1','2','3']},
  {type:'math',emoji:'➗',question:'6 ÷ 2 = _', answer:'3', options:['2','3','4']},
  {type:'math',emoji:'➗',question:'8 ÷ 2 = _', answer:'4', options:['3','4','5']},
  {type:'math',emoji:'➗',question:'9 ÷ 3 = _', answer:'3', options:['2','3','4']},
  {type:'math',emoji:'➗',question:'10 ÷ 2 = _',answer:'5', options:['4','5','6']},
  {type:'math',emoji:'➗',question:'6 ÷ 3 = _', answer:'2', options:['1','2','3']},
  {type:'math',emoji:'➗',question:'_ ÷ 2 = 3', answer:'6', options:['4','6','8']},
  {type:'math',emoji:'➗',question:'8 ÷ 4 = _', answer:'2', options:['1','2','3']},
  {type:'math',emoji:'➗',question:'10 ÷ 5 = _',answer:'2', options:['1','2','3']},
  {type:'math',emoji:'➗',question:'_ ÷ 3 = 2', answer:'6', options:['4','6','9']},

  // SEQUÊNCIAS (10)
  {type:'sequence',emoji:'📈',question:'2 - 4 - _',    answer:'6', options:['5','6','8']},
  {type:'sequence',emoji:'📈',question:'5 - 10 - _',   answer:'15',options:['12','15','20']},
  {type:'sequence',emoji:'📈',question:'1 - 2 - 3 - _',answer:'4', options:['3','4','5']},
  {type:'sequence',emoji:'📈',question:'10 - 20 - _',  answer:'30',options:['25','30','40']},
  {type:'sequence',emoji:'📈',question:'3 - 6 - 9 - _',answer:'12',options:['10','11','12']},
  {type:'sequence',emoji:'📈',question:'2 - 4 - 6 - _',answer:'8', options:['7','8','10']},
  {type:'sequence',emoji:'📈',question:'1 - 3 - 5 - _',answer:'7', options:['6','7','9']},
  {type:'sequence',emoji:'📈',question:'5 - 4 - 3 - _',answer:'2', options:['1','2','3']},
  {type:'sequence',emoji:'📈',question:'10 - 8 - 6 - _',answer:'4',options:['3','4','5']},
  {type:'sequence',emoji:'📈',question:'0 - 5 - 10 - _',answer:'15',options:['12','15','20']},
];

function shuffle<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getSessionExercises(): ExerciseItem[] {
  return shuffle(POOL);
}

export const EXERCISES = POOL;
