# #3241 — Wadsworth unequal-wheel historical anti-repeat gate

**Agent16 · 27 November 2026. Classification: bounded historical-mechanism negative. No unknown LP2 plaintext/key recovered.**

## Why this mechanism was selected

Playfair was rejected at preflight because Director #457 had already executed the historical Playfair invariant and original phase test. Wheatstone unequal wheels were also already tested in #2472. The distinct period-available construction here is **Decius Wadsworth's 1817 unequal-wheel cipher device**.

David Kahn's *The Codebreakers* (available long before LP2) describes the physical device as a 26-position plaintext wheel geared to a 33-position mixed ciphertext wheel and gives a worked **LLAMA** explanation: after the first L, enciphering the second L requires a full plaintext-wheel turn; because of the unequal gearing the next ciphertext representative lies seven outer positions away, and the equivalent for the same plaintext letter does not repeat until all 33 outer symbols have been used. The historical construction and Kahn's worked explanation are independently older than May 2014.

Relevant public source:
- David Kahn, *The Codebreakers*, Wadsworth discussion, especially the 26:33 construction and LLAMA example (modern web transcription of the 1996 edition).
- Louis Kruh, “The Mystery of Colonel Decius Wadsworth's Cipher Device,” *Cryptologia* 6(3), 1982, pp. 238–247.

A later generalized mathematical description is useful only for formalizing the invariant, not as a 2014 clue: with plaintext-wheel size m, ciphertext-wheel size n, state S, and plaintext position p_i,

x_i=(p_i-S) mod m, with x_i=m when the residue is 0;
S <- S+x_i; y_i=S mod n.

A fixed mixed outer alphabet is only a bijection M, so transmitted symbol c_i=M(y_i).

For Wadsworth's m=26,n=33, every step satisfies 1<=x_i<=26<33. Therefore **adjacent ciphertext symbols can never be equal**, independent of the mixed outer-alphabet key. For the worked LLAMA control, the two L outputs differ by 26 mod33, equivalently circular distance 7, exactly matching Kahn's description.

## Natural GP adaptation and held native control

LP2 visibly transmits 29 GP rune symbols. To retain Wadsworth's defining anti-repeat mechanism with no new visible ciphertext symbols, the largest possible direct plaintext wheel has 28 positions: m=28,n=29.

This is not immediately absurd for solved Cicada language: across the nine pinned solved native-GP source sections only 27 of the 29 GP runes occur; indices **12 (EO)** and **22 (OE)** are absent. I therefore used the least-assumptive direct test by reserving EO and putting the other 28 GP runes on the plaintext wheel. This is a feasibility control, not a claim that Cicada selected EO.

Held native control: solved p57 (PARABLE) contains no EO. Under an arbitrary fixed 29-symbol mixed outer permutation:

- 95 native plaintext runes encode losslessly;
- the exact inverse recovers **95/95** runes;
- ciphertext has **0 adjacent doublets**.

The zero-doublet result is key-independent: any fixed 29-symbol outer permutation preserves equality.

## Original LP2 prediction

The direct Wadsworth GP28→GP29 receiver predicts **zero adjacent equal ciphertext symbols between resets**. LP2 p0–55 has **86** adjacent equalities, and all 86 occur within physical pages rather than being artifacts of page concatenation. **42 of the 56 physical pages contain at least one such equality.**

Thus page, chapter, or book resets cannot rescue the direct construction: every within-page doublet is an exact all-key support contradiction. The first contradiction is at global rune offset 121.

This is stronger than a language-score failure. No outer-wheel key recovery, native word model, phase search, or source guess can make a bijection map two distinct Wadsworth states to one repeated GP rune.

## Why not add an escape?

An m=29,n=29 wheel loses the anti-repeat property: a repeated plaintext symbol requires a 29-step turn and returns to the same ciphertext state. An m=29 Wadsworth-style anti-repeat receiver therefore needs **at least 30 visible ciphertext states**. LP2 supplies only the 29 GP rune symbols as the direct ciphertext alphabet.

One can invent a 28-symbol plaintext wheel plus an escape rune, a silent outer symbol, or a repeat side channel. Those are **additional mechanisms**, not Wadsworth's direct historical receiver. They overlap the already-tested rank28/repeat-escape and framing branches and require a new original selector. The Round48 35/37-symbol source-inventory observation does not by itself authorize deleting outer-wheel ciphertext symbols, because deletion would consume unknown plaintext symbols and destroy the historical inverse unless a further transport rule is supplied.

## Decision

**Reject the direct Wadsworth unequal-wheel anti-repeat mechanism for LP2.** It is historically available, manually reversible, and its repeat suppression has a hard key-independent prediction, but original LP2 violates that prediction 86 times within pages.

Do not spend key-search compute on Wadsworth outer alphabets. A successor would require an independently visible Cicada instruction selecting a specific escape/transport layer or extra transmitted alphabet; without that, it is a new synthetic cipher rather than the historical construction.

## Reproduction

sims/lp2_wadsworth_unequalwheel_antirepeat_gate.cjs

Pinned inputs:
- resources/liber-primus/lp2-corpus.json
- resources/external/relikd-solved-gp29-native-v1.json

Runtime check reproduced:
- historical LLAMA unkeyed states [11,4,19,31,12];
- second-L step 26 mod33, circular distance 7;
- 0 historical-control adjacent doublets;
- p57 GP28→GP29 plant 95/95 exact inverse, 0 doublets;
- original p0–55: 12,956 runes, 86 adjacent doublets, 42 pages containing a doublet.
