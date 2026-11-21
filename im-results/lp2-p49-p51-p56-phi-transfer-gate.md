# p49/p51 10-dot bridge: p56 prime-totient transfer gate

**Status: negative under both natural clock models.** This is an intermediate exclusion, not plaintext recovery.

## Hypothesis and source motivation

The original LP2 sequence has 66 runes on p49, a 10-dot marker and the 256-cell p50 numeric table, then 92 runes on p51. The visible p49→p50→p51 structure suggests a 158-rune text bridge if the table and marker are non-rune material. The solved p56 cipher supplies a concrete, already-authenticated candidate operation: add/subtract the prime-totient stream modulo 29, with plaintext F transparent and not consuming a key step.

Test only the two natural treatments of the 10-dot/table interruption:

1. **Continuous:** start at prime 2 on p49; let the non-rune marker/table consume zero steps; continue p51 at the key position reached after p49.
2. **Reset at p51:** start at prime 2 independently on p51.

No phase search, alternate modulus, sign search, or word-boundary reset is used.

## Exact operation

For primes (p_0=2,p_1=3,p_2=5,ldots), the p56 key is
[
k_n = arphi(p_n)mod29 = (p_n-1)mod29.
]
For ciphertext index (c_i), a nonzero plaintext is (m_i=(c_i-k_n)mod29), consuming one key step, provided (m_i\ne0). If (c_i=0), a transparent plaintext F branch is also allowed and consumes no key step. An encrypted branch that would produce plaintext F is forbidden. This is the same F-transparent clock rule used by the established p56 solution.

## Reproduction

Run from the repository root with Node.js; no dependencies:

```js
const fs = require("node:fs");
const corpus = JSON.parse(fs.readFileSync(
  "resources/liber-primus/lp2-corpus.json", "utf8"
));
const page = n => corpus.pages.find(p => p.page === n).indices;

function primeKeys(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) {
      if (x % d === 0) { prime = false; break; }
    }
    if (prime) out.push((x - 1) % 29);
  }
  return out;
}
const key = primeKeys(5000);
const mod = x => (x % 29 + 29) % 29;

function reach(cipher, start = 0) {
  let states = new Set([0]); // consumed prime-key symbols
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const used of states) {
      if (cipher[i] === 0) next.add(used); // transparent F
      const plain = mod(cipher[i] - key[start + used]);
      if (plain !== 0) next.add(used + 1); // encrypted non-F only
    }
    if (!next.size) return { complete: false, fail: i, prior: [...states] };
    states = next;
  }
  return { complete: true, terminal: [...states] };
}

const p49 = page(49), p51 = page(51), p56 = page(56);
const r49 = reach(p49, 0);
const p51Reset = reach(p51, 0);
const p51Continuous = reach(p51, r49.terminal[0]);
const wholeContinuous = reach([...p49, ...p51], 0);
const control = reach(p56, 0);

console.log(JSON.stringify({
  lengths: { p49: p49.length, p51: p51.length, p56: p56.length },
  p56PositiveControl: control,
  p49: r49,
  p51Reset: p51Reset,
  p51Continuous: p51Continuous,
  wholeContinuous: wholeContinuous
}, null, 2));
```

## Observed result

| Segment / model | Result |
|---|---|
| p56 positive control, start 0 | Complete 85/85; terminal consumed-key counts 81–85 |
| p49, start 0 | Complete 66/66; exactly 64 key advances (two transparent F positions) |
| p51 reset to start 0 | Impossible at local offset 49 (50th rune); prior consumed count 48; ciphertext index 23 equals current key 23 |
| p51 continuous after p49 | Impossible at local offset 36 (37th rune); prior consumed count 35 after p49's 64 advances; ciphertext index 18 equals current key 18 |
| p49+p51 continuous, table/marker zero-step | Impossible at bridge offset 102 (103rd rune) |

Thus neither a continuous p49→p51 clock nor a reset at p51 yields a complete p56-style inverse. The p56 positive control confirms the implementation admits the known solved page.

## Interpretation and limit

This rejects only the direct p56 prime-totient/F-transparent transfer on this 158-rune bridge under the two source-obvious clock models. It does not reject another cipher, a table-derived key, or a separately specified operation. The p49/p51 receiver itself remains conditional; this test supplies no plaintext, key, or new first-party instruction. Do not rescue the branch with arbitrary phase, sign, or reset searches.

## Separate source-selected bridge-key checks

Two additional narrow candidates were checked on the same 158-rune p49+p51 bridge, without changing its transcription:

- The p50 base60 2-cycle addresses [249,158], reduced mod29, give the period-2 key [17,13]. Both cycle phases were tested under additive/Beaufort and multiplicative/inverse-multiplicative forms. All eight outputs remain near the uniform baseline: IoC 0.03249–0.03507, with no readable text.
- The p55 recursive five-core [1,6,2,11,18] was tested as a repeating period-5 additive key in both signs. IoCs are 0.03531 and 0.03604; neither output is readable.

These reject only the direct short-period GP29 consumers above. They do not establish that the 2-cycle or five-core has no other role. The p49/p51 bridge still has no source-selected reversible receiver.

A final source-motivated graph-stream control was also negative: using the GP-prime sum of VERIFY (216, with V→F) as the base60 p50 graph start, the 158 visited addresses form an 11-step preperiod followed by the 11-cycle. Mapping each visited address mod29 to a key symbol and applying it additively to the p49+p51 bridge, both signs and the one-step successor-shifted stream, gives IoCs 0.03177–0.03515 and no plaintext. This rejects only the direct p50-walk additive keystream receiver; the V→F start itself remains a transliteration-dependent hypothesis.
