#!/usr/bin/env node
'use strict';

// Bounded exploratory test of the p14 mayfly/tree ↔ Old English Rune Poem
// hypothesis. Reads only the repository's canonical source corpus/transcription.
const fs = require('node:fs');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcription = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');
const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const GP = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const GP_PRIMES = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const pages = transcription.split('%');

function pageWords(pageNumber) {
  const page = pages[pageNumber];
  const words = [];
  let current = '';
  for (const ch of page) {
    if (runeSet.has(ch)) current += ch;
    else if (ch === '/' || /\s/u.test(ch)) { /* printed line boundary, not word boundary */ }
    else if (current) { words.push(current); current = ''; }
  }
  if (current) words.push(current);
  return words;
}

function oldEnglishToGP(text) {
  const s = text.toUpperCase()
    .replace(/[ÞÐ]/g, 'TH')
    .replace(/Æ/g, 'AE')
    .replace(/Œ/g, 'OE')
    .replace(/[^A-Z]/g, '');
  const out = [];
  const digraphs = ['TH','NG','OE','AE','EO','IA'];
  for (let i = 0; i < s.length;) {
    const digraph = digraphs.find(x => s.startsWith(x, i));
    if (digraph) { out.push(digraph); i += 2; }
    else out.push(s[i++]);
  }
  return out.map(token => {
    const value = GP.indexOf(token);
    assert.notEqual(value, -1, `unmapped Old English token ${token}`);
    return value;
  });
}

function decodeAdd(cipher, key, sign) {
  assert.ok(key.length >= cipher.length, 'running key shorter than target');
  return cipher.map((value, i) => GP[(value + sign * key[i] + 29) % 29]).join('');
}

function modPow(base, exponent, modulus) {
  let x = 1n, b = BigInt(base) % BigInt(modulus);
  let e = BigInt(exponent), m = BigInt(modulus);
  while (e) {
    if (e & 1n) x = (x * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(x);
}

function base29Integer(digits) {
  let value = 0n;
  for (const digit of digits) value = value * 29n + BigInt(digit);
  return value;
}

function fromBase29(value) {
  if (value === 0n) return [0];
  const out = [];
  while (value) { out.push(Number(value % 29n)); value /= 29n; }
  return out.reverse();
}

function rsaBlocks(words, p, q, e) {
  const n = p * q, phi = (p - 1) * (q - 1);
  let d = 0;
  for (let candidate = 1; candidate < phi; candidate++) {
    if ((candidate * e) % phi === 1) { d = candidate; break; }
  }
  assert.ok(d, 'RSA exponent has no inverse');
  return {
    n, phi, d,
    words: words.map(word => {
      const digits = [...word].map(ch => runeIndex.get(ch));
      const c = Number(base29Integer(digits) % BigInt(n));
      const m = modPow(c, d, n);
      return { ciphertext: digits.map(i => GP[i]).join(''), decoded: fromBase29(BigInt(m)).map(i => GP[i]).join('') };
    }),
  };
}

const poem = `
byþ frofur fira gehwylcum sceal þeah manna gehwylc miclun hyt dælan gif he wile for drihtne domes hleotan
byþ anmod and oferhyrned felafrecne deor feohteþ mid hornum mære morstapa þæt is modig wuht
byþ ðearle scearp þegna gehwylcum anfeng ys yfyl ungemetun reþe manna gehwylcun ðe him mid resteð
byþ ordfruma ælcre spræce wisdomes wraþu and witena frofur and eorla gehwam eadnys and tohiht
byþ on recyde rinca gehwylcum sefte and swiþhwæt ðam ðe sitteþ on ufan meare mægenheardum ofer milpaþas
byþ cwicera gehwam cuþ on fyre blac and beorhtlic byrneþ oftust ðær hi æþelingas inne restaþ
gumena byþ gleng and herenys wraþu and wyrþscype and wræcna gehwam ar and ætwist ðe byþ oþra leas
ne bruceþ ðe can weana lyt sares and sorge and him sylfa hæfþ blæd and blysse and eac byrga geniht
byþ hwitust corna hwyrft hit of heofones lyfte wealcaþ hit windes scuras weorþeþ hit to wætere syððan
byþ nearu on breostan weorþeþ hi ðeah oft niþa bearnum to helpe and to hæle gehwæþre gif hi his hlystaþ æror
byþ oferceald ungemetum slidor glisnaþ glæshluttur gimmum gelicust flor forste geworuht fæger ansyne
byþ gumena hiht ðon god læteþ halig heofones cyning hrusan syllan beorhte bleda beornum and ðearfum
byþ utan unsmeþe treow heard hrusan fæst hyrde fyres wyrtrumun underwreþyd wyn on eþle
byþ symble plega and hlehter wlancum ðar wigan sittaþ on beorsele bliþe ætsomne
secg eard hæfþ oftust on fenne wexeð on wature wundaþ grimme blode breneð beorna gehwylcne ðe him ænigne onfeng gedeð
semannum symble biþ on hihte ðonn hi hine feriaþ ofer fisces beþ oþ hi brimhengest bringeþ to lande
biþ tacna sum healdeþ trywa wel wiþ æþelingas a biþ on færylde ofer nihta genipu næfre swiceþ
byþ bleda leas bereþ efne swa ðeah tanas butan tudder biþ on telgum wlitig heah on helme hrysted fægere geloden leafum lyfte getenge
byþ for eorlum æþelinga wyn hors hofum wlanc ðær him hæleþ ymbe welege on wicgum wrixlaþ spræce and biþ unstyllum æfre frofur
byþ on myrgþe his magan leof sceal þeah anra gehwylc oðrum swican for ðam dryhten wyle dome sine þæt earme flæsc eorþan betæcan
byþ leodum langsum geþuht gif hi sculun neþan on nacan tealtum and hi sæyþa swyþe bregaþ and se brimhengest bridles ne gymeð
wæs ærest mid Eastdenum gesewen secgun oþ he siððan eft ofer wæg gewat wæn æfter ran ðus heardingas ðone hæle nemdun
byþ oferleof æghwylcum men gif he mot ðær rihtes and gerysena on brucan on bolde bleadum oftast
byþ drihtnes sond deore mannum mære metodes leoht myrgþ and tohiht eadgum and earmum eallum brice
byþ on eorþan elda bearnum flæsces fodor fereþ gelome ofer ganotes bæþ garsecg fandaþ hwæþer ac hæbbe æþele treowe
biþ oferheah eldum dyre stiþ on staþule stede rihte hylt ðeah him feohtan on firas monige
byþ æþelinga and eorla gehwæs wyn and wyrþmynd byþ on wicge fæger fæstlic on færelde fyrdgeatewa sum
byþ eafix and ðeah a bruceþ fodres on foldan hafaþ fægerne eard wætre beworpen ðær he wynnum leofaþ
byþ egle eorla gehwylcun ðonn fæstlice flæsc onginneþ hraw colian hrusan ceosan blac to gebeddan bleda gedreosaþ wynna gewitaþ wera geswicaþ
`;
const fullPoemKey = oldEnglishToGP(poem);
assert.equal(fullPoemKey.length, 2468);

const eolhx = oldEnglishToGP('secg eard hæfþ oftust on fenne wexeð on wature wundaþ grimme blode breneð beorna gehwylcne ðe him ænigne onfeng gedeð');
const eoh = oldEnglishToGP('byþ utan unsmeþe treow heard hrusan fæst hyrde fyres wyrtrumun underwreþyd wyn on eþle');
const daeg = oldEnglishToGP('byþ drihtnes sond deore mannum mære metodes leoht myrgþ and tohiht eadgum and earmum eallum brice');
const eolhxDaeg = [...eolhx, ...daeg];
const eohDaeg = [...eoh, ...daeg];
const p14 = corpus.pages.find(p => p.page === 14).indices;
const p15 = corpus.pages.find(p => p.page === 15).indices;
const p22 = corpus.pages.find(p => p.page === 22).indices;
const p14Words = pageWords(14);
const p15Words = pageWords(15);
const p22Words = pageWords(22);
const p14Lines = pages[14].split('\n').filter(line => [...line].some(ch => runeSet.has(ch))).length;

const primeSample = GP_PRIMES.map(prime => fullPoemKey[prime - 1]);
const poemWords = poem.match(/[A-Za-zÆæÞþÐð]+/g).map(w => w.toLowerCase());
const primeWordSample = GP_PRIMES.map(prime => poemWords[prime - 1]);

const p14LcgMod = p14.map((_, i) => ((47 * i + 89) % 137) % 29);
const p14LcgScaled = p14.map((_, i) => Math.floor(29 * ((47 * i + 89) % 137) / 137));
const render = (indices) => indices.map(i => GP[i]).join('');

const result = {
  source: {
    p14Runes: p14.length, p14PrintedLines: p14Lines, p14Words: p14Words.length,
    p15Runes: p15.length, p15Words: p15Words.length,
    p22Runes: p22.length, p22Words: p22Words.length,
    gpPrimeSumEohDaegPlusP14Lines: GP_PRIMES[12] + GP_PRIMES[23] + p14Lines,
    gpPrimeSumEolhxDaegPlusOne: GP_PRIMES[14] + GP_PRIMES[23] + 1,
  },
  runningKeys: {
    eolhxDaegLength: eolhxDaeg.length,
    eolhxDaegMinusP14: decodeAdd(p14, eolhxDaeg, -1),
    eolhxDaegPlusP14: decodeAdd(p14, eolhxDaeg, +1),
    eolhxDaegMinusP15: decodeAdd(p15, eolhxDaeg, -1),
    eolhxDaegPlusP15: decodeAdd(p15, eolhxDaeg, +1),
    eohDaegLength: eohDaeg.length,
    eohDaegMinusP14: decodeAdd(p14, eohDaeg, -1),
    eohDaegPlusP14: decodeAdd(p14, eohDaeg, +1),
    fullRunePoemKeyLength: fullPoemKey.length,
    fullRunePoemMinusPrefix: decodeAdd(corpus.pages.flatMap(p => p.indices).slice(0, fullPoemKey.length), fullPoemKey, -1).slice(0, 180),
    fullRunePoemPlusPrefix: decodeAdd(corpus.pages.flatMap(p => p.indices).slice(0, fullPoemKey.length), fullPoemKey, +1).slice(0, 180),
  },
  bookCipher: {
    primeIndexedLetters: render(primeSample.map(token => GP.indexOf(token))),
    primeIndexedWords: primeWordSample,
  },
  affinePage14: {
    a47c89m137Mod29Minus: decodeAdd(p14, p14LcgMod, -1),
    a47c89m137Mod29Plus: decodeAdd(p14, p14LcgMod, +1),
    a47c89m137ScaledMinus: decodeAdd(p14, p14LcgScaled, -1),
    a47c89m137ScaledPlus: decodeAdd(p14, p14LcgScaled, +1),
  },
  rsaWordBlocks: {
    p14EolhxDaeg_p47q89e137: rsaBlocks(p14Words, 47, 89, 137),
    p14EohDaeg_p41q89e137: rsaBlocks(p14Words, 41, 89, 137),
    p22LaguEar_p73q109e131: rsaBlocks(p22Words, 73, 109, 131),
  },
};

console.log(JSON.stringify(result, null, 2));
