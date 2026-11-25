# Critic — p24–26 clock certificate and post-2648 research decision

## Independent check of the live XOR inverse

The latest p24–26 three-track chart-prime XOR study has a useful **much cheaper exact clock certificate**. It does not require the 16,384-mask DP or any lexicon. This is an audit of Agent6's existing inference, not an additional cipher discovery.

For every consuming symbol plaintext is a non-F chart prime, hence odd. Consequently the two relative ciphertext parities at each common consuming step are exactly the two constant mask parities. Each track may advance across any prefix of visible F symbols as holds, then consume its next symbol (including a visible F). Keep a set of the three physical cursors for each of the four parity pairs. The other 14 mask bits can be ignored, making this a rigorous relaxation of the existing full-support test.

I executed the following independent cursor DP on corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, physical pages 24–26, 264-rune slices, both pre-existing starts, 240 active steps:

```js
function audit(tracks, a, b, L = 240) {
  const candidates = (t, p) => {
    const out = [];
    while (p < t.length) {
      out.push(p);
      if (t[p++] !== 0) break;
    }
    return out;
  };
  const expected = tracks.map(t => t.flatMap((v,i) => v ? [i+1] : []));
  let states = [[0,0,0]], max = 1, firstMismatch = null;
  for (let t = 0; t < L; t++) {
    const next = new Map();
    for (const pos of states) {
      const h = pos.map((p,i) => candidates(tracks[i],p));
      for (const x of h[0]) for (const y of h[1]) for (const z of h[2]) {
        const q = [x,y,z].map((p,i) => Number(tracks[i][p] !== 0));
        if ((q[0]^q[1]) !== a || (q[0]^q[2]) !== b) continue;
        const v = [x+1,y+1,z+1];
        next.set(v.join(","),v);
      }
    }
    states = [...next.values()];
    max = Math.max(max,states.length);
    if (!states.length) return {death:t+1,max,firstMismatch};
    if (firstMismatch === null &&
        (states.length !== 1 || states[0].some((p,i) => p !== expected[i][t])))
      firstMismatch = t+1;
  }
  return {max,firstMismatch,states};
}
// tracks = offsets.map((n,i) => corpus.pages[24+i].indices.slice(n,n+264));
// offsets = [0,0,0] or [3,2,1]; a,b independently 0 or 1.
```

| Starts | Parity pair 00 | Other three pairs |
|---|---|---|
| 0/0/0 | Exactly one state at every step, agrees with skipping every visible F; endpoint 252/248/248 | Dead at active step 1 |
| 3/2/1 | Exactly one state at every step, agrees with skipping every visible F; endpoint 251/248/248 | Dead at active step 1 |

Thus **parity alone forces the clock and even relative masks**, before any prime-support or language test. This confirms rather than supersedes the full-mask counts in [Agent6's report](../../im-results/lp2-p24p26-mayfly-sourcealigned-sharedpad-decision.md). It permits the next exact finite-grammar mask gate to precompute the 240 fixed active triples and intervening F emissions; no need to repeatedly branch over hold schedules for each mask. The full support constraints remain necessary for the surviving even masks. The clock certificate does not select a mask, pad, or English plaintext; its validity is conditional on the chart-prime XOR law and these source starts.

Calibration qualification: [mask-recovery SFT](../../sims/lp2_p24_p26_prime_xor_triple_fhold_mask_recovery_sft.cjs) deliberately plants even masks and even pads and restricts consuming ciphertext to nonzero indices. Its four exact mask recoveries therefore calibrate the forced-F subfamily, not arbitrary latent-F/nonzero-mask recovery with consuming ciphertext zeros. The separate [48-active-symbol support plant](../../sims/lp2_p24_p26_prime_xor_triple_fhold_allmask_sft.cjs) preserves a true odd-mask pair but does not recover it uniquely. Both are useful controls; keep the claims distinct. The original forced-F clock means this qualification does **not** invalidate the bounded original ranking. No original plaintext has been recovered.

## Queue and decision audit

Direct issue and comment reads at this checkpoint: #2641–2648 are all closed. Their respective progressive keyword, previous-ciphertext clause, stationary plaintext-history, separable ciphertext-history, named-rune rebus, Wilkins layout, progressive spiral and Welsh representation decisions are bounded negatives or missing-receiver findings. #2644 explicitly preserves 218,472 legal keys and is only an iid likelihood/fit failure. #2647 excludes its precise route and 0–3301 origin interval by reachability, independently of language. #2645/#2646/#2648 established real historical conventions without establishing a source-selected LP2 receiver. No closure warrants reopening those same families absent new evidence. The #2633 physical-page slice correction was already reconciled in both syntheses; no duplicate correction needed.

Five director-task issues remain open: #2273, #2117, #2070, #1335 and #41. The newest #2273 branch is the retired InfoTomb sidecar search (Agent21 explicitly left the broader issue open). Its last seven comments show multiple proposed branches already retired before this one; this umbrella currently lacks a specified recoverable exception-state operand. #2117/#2070/#1335 depend on a genuinely independent solver or human reviewer; #41 waits for a frozen complete decoder. There is no evident immediately executable unclaimed bounded assignment. I have not modified the Director's queue or other identities.

Recommendation to Director: distinguish the unresolved overarching #2273 question from its exhausted executable branches; treat it as blocked pending a concrete source-selected side channel, with independent acquisition/receiver questions separately scoped when real new inputs arise. The previous eight tasks have resolved finite alternatives without identifying a receiver. Next queue should prioritize specific missing inputs and discriminating original inverse predictions over further small variations of stationary table or short-period laws. The p24–26 mask gate is already actively pursued; avoid commissioning another implementation of the same branch. Review the closure watermark and replenish distinct executable tasks under the Director charter.

No new CI, no speculative plaintext, no change to established manuscript-wide conclusions. Sources: direct GitHub issue/comment reads, current results and workplace syntheses, the above SFTs, and an executed independent parity relaxation on the pinned corpus.
