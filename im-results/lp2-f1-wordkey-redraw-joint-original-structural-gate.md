# F1 five-phase word-key redraw: joint source-native fingerprint gate

**Research decision, 18 November 2026 (Agent 9).** A finite, reversible *candidate* for the LP2 anti-repeat/five-back channel simultaneously produces the original order of magnitude of adjacent-repeat suppression and word-internal fifth-back echoes when its single collision-rejection probability is calibrated from the original adjacency count. However, typical members of this same family do **not** reproduce the stronger word-internal six-back affine maximum and glyph-agnostic fifth-back concentration together. Across **3,000** independently secret-keyed, source-English synthetic books, **2** reached both original high-order maxima. There is **no newly recovered original plaintext, verified key, or destination**. This result lowers the priority of *random* five-phase tables as a full explanation. A specific source-selected table, nonuniform word shift or a different mechanism remains possible.

## Source-grounded question

The original 55 rune-bearing LP2 pages (physical p0–55; the p50 number page has no runes) contain **12,956** GP29 ciphertext runes arranged into **2,896** actual printed words. They exhibit **86/12,901** same-page adjacent equality events, **104/2,105** exact word-internal fifth-back equalities, **9** paired fifth-back equalities, and a word-internal six-back maximum of **80/1,290** under the *best of all 812* invertible affine GP29 maps. That last map is `T(x)=27x+24 mod29`. [The source-exact conditional evidence and original six-back localization](lp2-original-lagfive-conditional-page-markov-gate.md) establishes that the latter two phenomena concentrate within printed words rather than being explained solely by first-order original bigram counts.

A plausible, though **not source-authenticated**, generative explanation is a cipher that changes an alphabet every five positions within each printed word, draws a fresh word key and suppresses immediate duplicate output symbols by redrawing that key. This is a motivated finite model because lag-five within-word equality is the conspicuous original structural feature, while earlier Cicada methods use secret alphabet shifts and special unenciphered symbols. Neither historical source says to apply this particular F1 scheme to LP2.

## Frozen source-input simulator

Let `P[w,j]` be an independently sampled native GP29 English rune at position `j` of printed word `w`. Pick **one shared** secret output permutation `D` and **five shared** secret phase permutations `Q[0..4]`, each a uniformly shuffled bijection of all 29 original symbols. A uniform independent `k[w] in 0..28` initializes every printed word. Emit

```
C[w,j] = D[(Q[j mod 5][P[w,j]] + k[w,j]) mod 29]
```

The key `k[w,j]` normally persists inside its word. If this candidate `C` equals the immediately preceding emitted GP29 rune, reject it with probability `q` and draw a fresh uniform `k`, retrying the candidate; otherwise emit it. The *secret* permutations are chosen **once per synthetic book**, shared across all its words. The output-rejection state carries through word and page boundaries, while the shift reinitializes at each word. For each synthetic book, plaintext words are sampled **independently, conditional on all 2,896 exact original rune lengths**, from one of three GP29-encoded English source inventories: Gibran's *The Prophet*, the source Shakespeare sample, or the Emerson essays control. The original letters are never used as training plaintext.

The **only manuscript-fitted numerical parameter** is the nominal rejection rate

```
q = 1 - 29 * (86 / 12901) = 0.806681652585071
```

under an explicitly assumed uniform pre-rejection same-rune collision probability `1/29`. This is an idealized calibration; the actual fitted simulator's adjacent rate need not equal 86 in every source register. Agreement with 86 should **not be counted as an independent prediction**. The five-back and six-back tallies are genuine additional observables, although those observables were historically found by exploratory analysis of this ciphertext. The simulation uses a documented xorshift32 RNG and source-fixed seeds, **1,000 samples per English control**, with completely new `D`, `Q`, word keys and English words on every draw.

The program verifies that its 2,896 original word fragments reconstruct exactly the canonical 12,956 original indices and that the original target tuple is exactly `[86,63,23,104,9,11,80,27,24]` for (doublets, inside-word doublets, boundary doublets, lag-five hits, paired hits, glyph-max-five, affine-max-six, best affine slope and offset). It also **recovers a complete 12,956-rune source-native encrypted plant** by the exact inverse using each emitted symbol's recorded key history. That positive test verifies reversibility when the actual secret is supplied; it does not infer the original manuscript's unknown secrets.

## Complete original-source decision table

The columns below report the sample mean and the count whose statistic is **at least** the original. Each group contains 1,000 fully independent secret-keyed books, with original word lengths held fixed. The full script also prints minimum, median, maximum, sample SD, word-boundary doublets and the already-postselected fixed-S fifth-back tally.

| Statistic (original) | Gibran: mean / ≥ original | Shakespeare: mean / ≥ original | Emerson: mean / ≥ original |
| --- | ---: | ---: | ---: |
| Adjacent GP29 repeat (**86**) | 88.223 / 487 | 89.062 / 548 | 87.903 / 517 |
| Fifth-back inside printed words (**104**) | 115.146 / 851 | 115.668 / 853 | 122.374 / 948 |
| Paired fifth-back echoes (**9**) | 4.398 / 45 | 2.497 / 0 | 7.479 / 342 |
| Largest fifth-back count over **all 29 rune identities** (**11**) | 8.511 / 82 | 8.614 / 95 | 8.853 / 120 |
| Largest word-internal six-back count over **all 812 invertible affine maps** (**80**) | 68.349 / **13** | 68.477 / **7** | 67.308 / **1** |

**Joint whole-book structural gate:** A sample must reach **both** the 80-hit best-of-812 affine relation **and** the 11-hit best-of-29 rune-specific fifth-back concentration. Counts were **1/1,000 Gibran, 1/1,000 Shakespeare, 0/1,000 Emerson = 2/3,000**. The descriptive plus-one combined tail is **3/3,001 ≈ 0.0010** under this *random-secret, length-matched-English, probabilistic-redraw* ensemble. It is **not** a p-value for all cipher families or the original historical discovery search.

Conditioning *after simulation* on close matches to the two more conspicuous manuscript counts (`abs(doublets−86)<=18` and `abs(fifth−104)<=12`) retains **337, 346 and 201** samples from the three sources, respectively. Within these **884** samples, **only one** also reaches both strong high-order maxima. The condition is descriptive; its tolerances were picked for the follow-up, so the resulting conditional proportion is no independent significance claim.

A fixed-rune `S` has 11 fifth-back occurrences in the original. It exceeds 11 in only **4/1,000, 4/1,000 and 8/1,000** of these plants; **S was itself selected retrospectively**, so the correct primary glyph test is the 29-way maximum above, which is much less extreme. Likewise, the six-back map `(27,24)` was selected *from the original*: every simulated book independently reselects its own winner among all **812** maps. The model scores the source-original images' canonical rune registrations and real printed word separators without fitting their unknown plaintext.

## Structural algebra behind the sixth-back obstacle

The original winning affine `T(x)=27x+24 mod29` fixes **x=8 (GP H)** and has one cycle of length **28** on all other symbols. This is a mathematical property of the selected map, **not** a source-authored instruction or decrypted H marker.

For an exact *key-independent same-plaintext-letter phase-transfer* in the F1 family, assume for some phases `r,s` that, for **every** GP symbol `p` and word shift `k`,

```
T(D(Q[r](p)+k)) = D(Q[s](p)+k).
```

Set `H=D^-1 ◦ T ◦ D` and `x=Q[r](p)`. Then `H(x+k)=R(x)+k` for all `x,k`, with `R=Q[s] ◦ Q[r]^-1`. At `k=0`, `R=H`; therefore `H(x+k)=H(x)+k`. Over the prime cyclic group of size 29, `H` must be a translation. Any nontrivial such translation is a **single 29-cycle**, and the trivial one is the identity. The original selected `T`, with cycle structure **1+28**, cannot be the universal key-independent deterministic transfer specified here. This theorem says nothing about a partial **80/1,290** statistical relation, changing keys during a six-rune span, plaintext correlations or more general nonrandom phase maps.

## Research consequence and independent reproduction

This is a **constructive competing model** that accounts for the two headline observations using a word-local phase and one rejection parameter. The original stronger sixth-back and maximal same-rune fifth-back effects reveal what this typical random-secret model is missing. They remain jointly unusual even when **all 812 six-back affine candidates and all 29 marker glyphs** are included in every null realization. Future F1 work needs a *creator-selected* phase-table/word-key relation capable of explaining these correlated original outputs and producing untouched coherent plaintext; further uniform random table draws have little value.

- [Full read-only Windows/Node22 SFT](../sims/lp2_f1_wordkey_redraw_joint_original_sft.cjs)
- [Passing Windows Node22 source run 44280852425](https://github.com/FlareZ123/liber-primus/actions/runs/44280852425)
- [F1 unconditional lexical capacity and four difficult words](lp2-wordlocal-fivephase-allword-lexical-forcing.md)
- [Original exact-page-bigram fifth/sixth-return benchmark](lp2-original-lagfive-conditional-page-markov-gate.md)

**Status:** empirically discriminating but still hypothesis-bound. No unknown LP2 plaintext, authenticated key, historically demonstrated F1 consumer, or deep-web destination has been recovered.
