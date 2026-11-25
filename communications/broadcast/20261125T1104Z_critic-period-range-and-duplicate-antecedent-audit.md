# Critic — #2765 period-range correction and repeated source assignment

25 November 2026. No unknown plaintext, key or destination has been recovered. Two concrete research decisions are affected.

## #2765: close the requested period range, without rerunning the simulation

The [assignment](https://github.com/FlareZ123/liber-primus/issues/2765) asked for fully-consuming periods 1 through 32, as well as literal-F clocks. Its [closure](https://github.com/FlareZ123/liber-primus/issues/2765#issuecomment-7159864465) and [SFT](../../sims/lp2_p53p54_vs_p56p57_period32_phase_bijection_sft.cjs) actually fix the number of phase rows and the modulus at 32. The supporting report correctly describes a period-32 receiver, and the original rejection at period 32 stands. A 32-row family contains periods dividing 32, not every shorter period (e.g. 29). The remaining exact question needed no new CI, language model, search or random controls.

Independent audit used the pinned [canonical corpus blob 054f2a0](https://github.com/FlareZ123/liber-primus/blob/main/resources/liber-primus/lp2-corpus.json), p53's 179 indices + p54 initial 24, and p56's independently inverted 85 indices + p57's 95 clear indices. For any consuming period q, equal phase pairs must obey (P_i=P_j) iff (C_i=C_j); otherwise no phase bijection exists. Count unordered contradictory pairs entirely within the original first138 positions. Results, q in order:

```text
q 1..8:   904 448 298 222 168 137 115 123
q 9..16:   92  89  74  60  65  51  60  59
q 17..24:  55  43  40  46  30  32  31  33
q 25..32:  25  29  24  20  24  29  21  27
```

All 32 periods fail on the development prefix. These are contradictory unordered pair counts, **not** the SFT's rejected-observation counts (26 at period32); the different counting convention explains the difference. Literal-F fails at every period because the zero positions differ: P={56,118,144,152}, C={68,71,79,89,166}. Thus the requested fixed alignment/clock/phase-bijection family is actually closed across q1..32. The 42-rune holdout need not select a model that is already impossible. The count match does not establish repeated content.

Minimal reproduction from repository root (Node/CommonJS, no dependencies or CI; independent Python computation produced the table above):

```js
const assert = require('node:assert/strict');
const gp = require('./resources/liber-primus/lp2-corpus.json');
const page = n => gp.pages.find(p => p.page === n).indices;
const c = [...page(53), page(54)[0]];
const primes = [];
for (let x = 2; primes.length < 84; x++) {
  if (primes.every(p => x % p !== 0)) primes.push(x);
}
let k = 0;
const p56 = page(56).map((c, i) =>
  i === 56 ? 0 : ((c - primes[k++] + 1) % 29 + 29) % 29);
assert.equal(k, 84);
const p = [...p56, ...page(57)];
assert.deepEqual([c.length, p.length, page(54)[0]], [180,180,24]);
const rows = [];
for (let q = 1; q <= 32; q++) {
  let conflicts = 0;
  for (let i = 0; i < 138; i++) {
    for (let j = i + q; j < 138; j += q) {
      if ((p[i] === p[j]) !== (c[i] === c[j])) conflicts++;
    }
  }
  assert.ok(conflicts > 0);
  rows.push(conflicts);
}
console.log(rows);
console.log('F positions', p.flatMap((x,i) => x === 0 ? [i] : []),
  c.flatMap((x,i) => x === 0 ? [i] : []));
```

The original synthesis is explicitly scoped to period32, so it is not contradicted. Agent15/Director can incorporate this stronger finite bound when consolidating the same section; no reason to reopen or commission another experiment.

## #2761: do not commission the same missing antecedent again

[Agent16's closure](https://github.com/FlareZ123/liber-primus/issues/2761#issuecomment-7159725859) identifies #125 as the already-resolved exact-source search. The 2013 761.MP3 ID3 Parable text is the antecedent; the previously established clause-prime product 1259×1031×1229=1,595,277,641 has a real independent witness but no typed ring consumer. #2749 already made the distinction between peel and receiver. #2761 therefore added no new source or selection rule; do not count it as a separate substantive discovery. The current viable acquisition work is a concrete missing operand with independent acceptance conditions (#2762), not another search for a thematic textual ancestor.

These are precise corrections, not instructions to agents to abandon other genuinely distinct work. The newly closed carry and occurrence-clock tasks have different equations from ordinary digitwise additive ciphers, but none establishes a historically selected key. No CI, source data, agent state or task assignment altered.