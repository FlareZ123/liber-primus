# Authenticated primitive composition: selector gate and affine normal form

**Decision (13 November 2026): close the multi-step synthesis branch without a new LP2 decoder.** The authenticated historical operations are real, but the original manuscript does not currently select an untested composition, key, clock and target chapter. A broad program synthesizer over the known affine primitives would mostly enumerate equivalent descriptions of one positionwise affine-permutation transform.

## Primitive-to-selector map

| Authenticated operation | What the source actually selects | LP2 consequence |
|---|---|---|
| GP29 Atbash, (P_i=28-C_i) | Used on solved LP1 material. On LP2, the red13 brackets select exactly the two isolated red triads at p3 and p39; Atbash gives `SCY` (plausibly “SKY” under the GP C/K alias) and `UDP`. | This selects a local six-rune clue, not a whole unknown chapter or a global Atbash layer. The source-fixed SCY/UDP repeating-key consumers are negative; no 40-rune plaintext follows. |
| Additive GP29 Vigenère | Recovered on LP1 p3–4 with the literal key DIVINITY; independently demonstrated in 2014 Stage04's small rune image with the key WELCOME PILGRIM TO THE. | These keys are selected for their original solved/Stage04 objects, not for an LP2 unknown chapter. The exact Stage04 shift + Stage05 seven-column composite has already been tested on source-selected p8–14, p33–39 and p54–55 spans and is nonlinguistic. |
| Stage05 seven-column inverse | The original 2014 seven-column example fixes the inverse permutation `[0,6,2,5,1,4,3]`. | No unknown LP2 chapter has an independent seven-column visual selector. The p54–55 Stage05-only test is unexceptional among all 5,040 seven-position permutations. |
| Prime-totient subtraction with the p56 literal-F exception | Authentically solves p56; LP1 p5 explicitly says primes and the totient function are sacred. p15 independently supplies the Fibonacci-indexed prime spiral. | The obvious source-selected transfers have already been tested: p33's 91-rune titled unit, p40–55's sixteen-page floral mapping, p54–55, and the p15 φ(prime) four-state matrix. None recovers original plaintext. The F exception is p56-local; it is not a free global reset/skip rule. |
| 2014 OutGuess / OpenPuff | Authenticated for the 2014 carriers and documented extraction commands. | No LP2 carrier, password, or extraction instruction is selected by the original pages. F5 is a separate speculative carrier hypothesis, not an authenticated Cicada primitive. |

## Why another affine program search is redundant

Represent an additive/subtractive Vigenère step at position (i) as
[
V_{k_i}^{sigma}(x)=x+sigma k_i pmod{29},qquad sigmain{+1,-1}.
]
Atbash is
[
A(x)=28-x=-x-1pmod{29}.
]
Each is therefore an affine map (xmapsto epsilon_i x+b_ipmod{29}), with (epsilon_iin{+1,-1}). Composition preserves this form:
[
(epsilon_2(epsilon_1x+b_1)+b_2)
=(epsilon_2epsilon_1)x+(epsilon_2b_1+b_2)pmod{29}.
]
A fixed transposition only permutes positions. Multiple fixed transpositions compose to one permutation, and the offset vector is permuted with it. Therefore any finite composition of fixed-key additive/subtractive Vigenère-style shifts, Atbash and fixed columnar permutations has the normal form
[
Y_i=epsilon_i X_{pi(i)}+b_ipmod{29}.
]
With one global Atbash choice, (epsilon_i) is a global sign; allowing Atbash at selected stages still yields a known positionwise sign vector. Multiple additive keys merely add (or subtract) after being reindexed. The composition order does not create a new nonlinear cipher family.

A fixed prime-totient stream is just another deterministic additive offset vector in this algebra. A fixed F-bypass mask can be folded into a per-position rule only after its positions and clock are independently selected; the p56 page-specific exception does not authorize applying that mask to unknown pages. Data-dependent state updates or nonlinear symbol mixing would be genuinely different, but none is selected for an unknown chapter by the sources listed above.

The exact Stage04×Stage05 test and the p15/p56 source-derived transfers already cover the strongest source-motivated consumers. A new synthesizer over arbitrary combinations would add free keys, phases, page resets or exception masks without adding an independent clue. It would not answer the missing source question.

## Existing original-input gates that close the obvious candidates

- [p3/p39 red119 Atbash and direct consumers](lp2-p3-p39-red119-atbash-sky-udp.md): exact local Atbash result; the fixed SCY/UDP key readings do not decode the following passages or the book.
- [Stage04 Vigenère × Stage05 seven-column inverse](lp2-2014-stage04-source-exact-stage05-seven-column-inverse.md): both authenticated historical steps and exact positive controls pass; the three frozen LP2 spans remain unreadable. The p54–55 Stage05-only order is not exceptional in the complete (7!) null.
- [p33 91-rune p56 transfer](p33-91-rune-p56-totient-transfer-gate.md): the source-motivated direct transfer is negative; no second operation is selected by the shared title/13-dot typography.
- [p15 Fibonacci-prime spiral to sixteen floral pages](lp2-p15-16value-to-floral16-prime-totient-gate.md): the fixed pagewise p56 φ(prime) consumer is negative across all 3,316 original runes.
- [p15 φ(prime) four-state inversion](source-4d-fourier-fullkey-inversion.md): all 707,281 states for the source-derived matrix were tested under transparent-EA/15-step and direct-additive outputs with GP and Latin controls; the original heldout remains near uniform.
- [p15 exact spiral and historical source gate](../results/lp2-p15-fibonacci-prime-spiral.md) and [bounded pre-2014 source review](p15-fibonacci-prime-spiral-historical-source-gate.md): the grid formula is established, but no external source supplies a successor cipher consumer.

## Reproducibility and disposition

The algebraic normal form is proved above and checked by [`sims/affine_composition_collapse_sft.cjs`](../sims/affine_composition_collapse_sft.cjs). The fixed-seed test evaluates 500 deterministic compositions (up to 12 operations each) over 14 positions and all 29 input symbols at each position: **203,000** exact input-position-symbol checks, including the exact Stage05 inverse repeated over two seven-rune blocks. It confirms the reduction to one signed affine-permutation map; it does not claim to test unknown ciphertext.

**Close this branch as “no new source-selected multi-step operator.”** Do not run a broader affine composition search. The one next source-based question is the terminal p22 engraving already identified in the p15–21 artifact audit: can its original geometry select a genuinely non-affine operation or a specific operand for the p15 infinity cue? Keep that question under the existing #749 handoff rather than creating a duplicate assignment.
