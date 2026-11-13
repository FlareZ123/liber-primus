# p36 p56 prime-totient transfer gates (negative)

**Decision:** three finite, source-motivated starting positions for the verified p56 prime-totient clock all fail on physical p36. This rejects these exact transfers; it does not establish a cipher for p36 or disprove other independently sourced mechanisms.

## Source path and selectors

Physical LP2 p36 (original scan `50.jpg`) contains **238 GP29 runes in 50 printed words**. The solved p56 mechanism subtracts consecutive prime totients modulo 29, with one page-specific literal-F interrupter. A human solver might ask whether a source-selected p36 number chooses the initial prime ordinal.

Three starts were admitted, and no others:

1. **Ordinal 15 → prime 47.** The signed 2013 DH23 example uses client exponent 15; the 15th prime is 47. This is the cleanest signed numerical selector, but nothing says the p56 cipher transfers to p36.
2. **Ordinal 36 → prime 151.** p36's physical page number is 36, and 151 is the 36th prime. An unsigned participant DH3301 transcript gives (e\equiv11\pmod{550}); one representative is (1661=11\times151). The transcript does not authenticate this as an LP2 instruction.
3. **Ordinal 705 → prime 5323.** In the p36/p3 quadratic-field register, with (u^2=3u+8), (u=(0,1)) and p36 relative norm (v=(19,26)), exact arithmetic gives
   [
   u^{705}=v,\quad \operatorname{ord}(u)=840,\quad \operatorname{ord}(v)=56.
   ]
   Hence (\log_u(v)=705). The factorization (705=15\times47) links the signed DH exponent 15 and the 15th prime 47, but that factorization is post-discovery and does not itself select an operation.

The p3 root and p36 norm are documented in [the p36 GF(29²)/DH11 gate](./p36-grid238-dh11-field-multiplication-gate.md). The signed DH23 example and unsigned participant-transcript limitations are summarized in [the 2013 BASE29/GF(29²) source analysis](./2013-base29-gf29-grid-factor.md). These are candidate selectors, not evidence that the p56 cipher was intended for p36.

## Frozen original-input test

For each admitted 1-based prime ordinal (s\in\{15,36,705\}), apply exactly

\[
P_i=C_i-(p_{s+i}-1)\pmod{29},
\]

where (p_n) is the (n\)-th prime. The first primes/shifts are respectively (47/17), (151/5), and (5323/15). The key advances continuously across all 238 original GP runes and across printed word boundaries.

The p36 10-dot event and printed Arabic numeral 1 are non-GP material and do not consume a rune key. No p36 F skip, reset, phase, sign alternative, or arbitrary start search is introduced: the p56 literal-F exception is page-specific, and no source selects a corresponding p36 position.

The canonical transcription is checked against the corpus register: **238 runes / 50 words**.

## Results

The raw p36 register has IoC **0.035989079176** and within-word GP trigram mean log score **−4.342497283**. A Shakespeare GP trigram model was trained on the first 80% of control words; the remaining 20% supplied **2,000 deterministic, length-matched 50-word samples** (seed `0x361511`). Their score range is **−2.350446** to **−1.531877**, with median **−1.889255**.

| Prime ordinal start | First prime | First shift | Decoded IoC | Within-word trigram score | Holdout samples at or below |
|---:|---:|---:|---:|---:|---:|
| 15 | 47 | 17 | 0.03492536 | −4.323200 | 0 / 2,000 |
| 36 | 151 | 5 | 0.03407439 | −4.582592 | 0 / 2,000 |
| 705 | 5323 | 15 | 0.03329433 | −4.538626 | 0 / 2,000 |

The ordinal-15 candidate improves the raw trigram score by only 0.0193 log units and remains far below every native holdout sample; the other two are worse than raw. None produces readable plaintext. Initial decoded words:

- ordinal 15: `NS UCPAE NGGN THU WDA BWO SHOOEIA ONGDANGX`
- ordinal 36: `NGIA PSDR FIS IS PML POW NGIUAAE CDAEUDR`
- ordinal 705: `JP LOEGT HOENG XB AETHU NGPB JREAAP OEPWEONF`

The SFT verifies exact forward re-encoding of the original p36 register and a synthetic native-GP positive plant under the selected continuous key. Reversibility validates the implementation, not the historical transfer hypothesis.

## Scope and next decision

Reject only these three p36 starts for the p56 φ(prime) operator. In particular, do not turn the discrete-log value 705, its factorization (15\times47), or the page number 36 into an unconstrained prime-start search. The signed DH23 example authenticates the number 15, but not the transfer of the p56 cipher to p36; the (e\equiv11\pmod{550}) participant transcript remains unsigned.

Reopen this branch only if an independent source identifies the p36 key clock, a p36-specific interrupter, or a different reversible operation. Otherwise prioritize independent routes to authentic key material or plaintext.

**Reproducer:** [`sims/p36_prime36_p56_totient_transfer_sft.cjs`](../sims/p36_prime36_p56_totient_transfer_sft.cjs), Node.js 22. Run the three frozen starts with `node sims/p36_prime36_p56_totient_transfer_sft.cjs 15`, `... 36`, or `... 705`. Inputs: `resources/liber-primus/lp2-corpus.json`, `resources/lp2-transcription.txt`, and `resources/control/shakespeare_first300k.txt`. The p56 clock is documented in [`im-results/lp2-punctuation-solved-clock.md`](./lp2-punctuation-solved-clock.md).
