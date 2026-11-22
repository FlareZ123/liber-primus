"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const parts = transcription.split(/^\s*%\s*$/m);
const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes = grid.pages.flatMap((page) => page.bytes);
const state = {p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4};
const stateValues = new Set(Object.values(state));

function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) { prime = false; break; }
    }
    if (prime) out.push(candidate);
  }
  return out;
}
const primes = firstPrimes(501);
const T1 = (n) => (primes[n - 1] - 1) % 29;
const T0 = (n) => (primes[n] - 1) % 29;

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}
function lengths(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map((word) => [...word].length);
}
function spell(lengths_, T) {
  return lengths_.map(T).map((value) => corpus.translit[value]).join("");
}
function audit(T) {
  let broadEligible = 0;
  const broadSelf = [];
  const terminalSelf = [];
  const terminalStatePairs = [];
  for (let page = 0; page <= 55; page += 1) {
    if (page === 50) continue;
    const lines = physicalPart(page).split(/\n/u)
      .filter((line) => /[\u16A0-\u16FF]/u.test(line));
    if (!lines.length) continue;

    const terminal = lengths(lines.at(-1));
    const terminalSerialized = terminal.map(T);
    const terminalAddress = terminalSerialized.reduce((sum, value) => sum + value, 0);
    if (terminalAddress < bytes.length) {
      const pair = [Math.floor(bytes[terminalAddress] / 29), bytes[terminalAddress] % 29];
      if (stateValues.has(pair[0]) && stateValues.has(pair[1])) {
        terminalStatePairs.push({
          page, address:terminalAddress, token:tokens[terminalAddress],
          byte:bytes[terminalAddress], pair, serialized:spell(terminal, T)
        });
      }
    }

    if (terminal.length >= 4) {
      const suffix = terminal.slice(-4);
      const address = suffix.map(T).reduce((sum, value) => sum + value, 0);
      if (address < bytes.length && bytes[address] === page) {
        terminalSelf.push({page,address,token:tokens[address],serialized:spell(suffix,T)});
      }
    }

    for (const [lineRole,line] of [["first",lines[0]],["last",lines.at(-1)]]) {
      const row = lengths(line);
      if (row.length < 4) continue;
      for (const [windowRole,base] of [["first4",row.slice(0,4)],["last4",row.slice(-4)]]) {
        for (const reverse of [false,true]) {
          broadEligible += 1;
          const window = reverse ? [...base].reverse() : base;
          const address = window.map(T).reduce((sum, value) => sum + value, 0);
          if (address < bytes.length && bytes[address] === page) {
            broadSelf.push({page,lineRole,windowRole,reverse,address,serialized:spell(window,T)});
          }
        }
      }
    }
  }
  return {broadEligible,broadSelf,terminalSelf,terminalStatePairs};
}

const p28Lines = physicalPart(28).split(/\n/u)
  .filter((line) => /[\u16A0-\u16FF]/u.test(line));
const terminal = lengths(p28Lines.at(-1));
assert.deepEqual(terminal, [1,2,8,3,8]);
assert.equal(spell(terminal,T1), "UTHERE");
assert.equal(spell(terminal.slice(1),T1), "THERE");
assert.equal(spell(terminal,T0), "THROEGOE");

const one = audit(T1);
const zero = audit(T0);
assert.equal(one.broadEligible, 404);
assert.equal(zero.broadEligible, 404);
assert.deepEqual(one.broadSelf.map((row) => [row.page,row.lineRole,row.windowRole,row.reverse,row.serialized,row.address]), [
  [25,"last","first4",false,"UTGR",27],
  [25,"last","first4",true,"RGTU",27],
  [28,"first","last4",false,"ITIG",42],
  [28,"first","last4",true,"GITI",42],
  [28,"last","last4",false,"THERE",42],
  [28,"last","last4",true,"ERETH",42],
]);
assert.deepEqual(zero.broadSelf, []);
assert.deepEqual(one.terminalSelf, [{page:28,address:42,token:"0S",serialized:"THERE"}]);
assert.deepEqual(zero.terminalSelf, []);
assert.deepEqual(
  one.terminalStatePairs.filter((row) => row.pair[0] === state.K && row.pair[1] === state.b),
  [{page:28,address:43,token:"1D",byte:73,pair:[2,15],serialized:"UTHERE"}]
);
assert.deepEqual(
  zero.terminalStatePairs.filter((row) => row.pair[0] === state.K && row.pair[1] === state.b),
  []
);

// Director #1796 semantic alternatives and prospective frozen consumer.
const semantic = {
  literalU:{address:1,token:tokens[1],byte:bytes[1]},
  homophoneYOU0:{address:32,token:tokens[32],byte:bytes[32]},
  homophoneYOU1:{address:33,token:tokens[33],byte:bytes[33]},
  there:{address:42,token:tokens[42],byte:bytes[42]},
};
assert.deepEqual(semantic, {
  literalU:{address:1,token:"3p",byte:231},
  homophoneYOU0:{address:32,token:"1t",byte:115},
  homophoneYOU1:{address:33,token:"1s",byte:114},
  there:{address:42,token:"0S",byte:28},
});
const literalAccepted =
  (semantic.literalU.byte >= 0 && semantic.literalU.byte <= 57) ||
  stateValues.has(semantic.literalU.byte);
assert.equal(literalAccepted, false);

console.log("PASS lp2_p28_terminal_cardinal_there_director_audit_sft");
console.log(JSON.stringify({
  terminal,
  oneBased:{spell:spell(terminal,T1),broadSelf:one.broadSelf,terminalSelf:one.terminalSelf},
  zeroBased:{spell:spell(terminal,T0),broadSelf:zero.broadSelf,terminalSelf:zero.terminalSelf},
  semantic,
  prospectiveLiteralUAccepted:literalAccepted
}, null, 2));
