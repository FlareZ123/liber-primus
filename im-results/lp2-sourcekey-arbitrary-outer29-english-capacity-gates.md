# LP2 original-source prime and table keys: exact all-secret outer-alphabet E/O bounds

**22 November 2026, Agent14. Classification: bounded original-cipher negative on native-English frequency controls.** No unknown-page plaintext, historical secret key, or destination is recovered. This note establishes a necessary condition stronger than previous heuristic outer-alphabet recovery, with all possible 29-symbol permutations covered algebraically.

## Why these two source-key hypotheses matter

The authentic solved physical p56 uses consecutive-prime totients as GP29 shifts, so the same mathematical stream is a plausible, though unselected, key for the unresolved 12,956 rune symbols. Physical pp49–51 print a complete 32-by-8 numeral grid (the rune-free page p50 and adjacent pages), a second original visible candidate stream. Direct additive tests and an arbitrary 29!-outer-permutation heuristic on p0–p2 had already yielded no plaintext. The present question is whether **any** undisclosed *fixed alphabet permutation* could conceal normal GP-native English even if the public key source were correct.

The nine independently illustrated original chapters are physical pp0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55, with rune lengths 729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308. Give each chapter **its own** entirely secret outer GP29 alphabet, independent key phase, and any nonzero multiplier 1–28. For original ciphertext value C at rune offset i, the candidate reversible encoder is

\[
  C_i = \sigma\left((P_i + m K_{s+i})\bmod29\right), \qquad \sigma\in S_{29}.
\]

All original rune positions are retained in printed order and all consume key, including plaintext F. The solved p56's *literal plaintext-F transparent bypass* is explicitly **outside** this model.

## A key-independent theorem

Let h[c,k] count all positions with original ciphertext value c and candidate source-key residue k (both in 0–28). GP29 E has value 18 and O has value 3. Under any secret alphabet, plaintext is P = sigma_inverse(C) - m*k modulo29. For each fixed ciphertext label c, E or O can therefore occur only at two key residues, whose separation is the nonzero value delta = (18-3)*inverse(m) modulo29. Since m ranges through 1–28, delta also ranges through 1–28.

The exact candidate-wise bound is

\[
 B(C,K)=\max_{\delta=1}^{28}\sum_{c=0}^{28}
       \max_{k=0}^{28}\left(h[c,k]+h[c,(k+\delta)\bmod29]\right).
\]

For every possible secret 29-symbol permutation, its total plaintext E+O count **cannot exceed B**. The proof even grants *independent optimal inverse assignments for each ciphertext symbol*, ignoring the requirement that all 29 assignments be a bijection. Thus B is a rigorous relaxed upper bound, potentially larger than what any true sigma can achieve. No algorithm searches or approximates the 29! secret permutations.

Independently maximizing B over every allowed source-key start within each chapter, then summing the nine chapter maxima, relaxes the mechanism further. This protects the exclusion from any single fitted chapter phase or non-affine secret alphabet.

The earlier independent original-length native-GP reference census in [nine-chapter predecessor-S-box capacity](lp2-ninechapter-predecessor-sbox-original-capacity.md) finds **at least 2,408 E-or-O symbols among 12,956 runes** in every tested Shakespeare, Gibran and Emerson contiguous source window, including the historical ING-to-NG and IO-to-IA GP spelling alternatives. This is a **finite benchmark**, not a theorem that every possible English manuscript has the same letter frequencies. Solved genuine p57 has 18 E/O in 95 runes and solved LP1 has 216 in 1,001.

## Original LP2 results

### Consecutive prime-totient source

For the authentic prime sequence p_0=2, p_1=3, ... set K_i=(p_i-1) modulo29. Exhaust **5,000 starts (0–4,999) for each of nine independent chapters**, **all 28 key multipliers**, and all arbitrary fixed alphabets via the theorem.

| Physical chapter | Original GP29 runes | Upper bound for all secret alphabets |
|---|---:|---:|
| p0–p2 | 729 | 160 |
| p3–p7 | 1,145 | 208 |
| p8–p14 | 1,729 | 279 |
| p15–p22 | 1,903 | 296 |
| p23–p26 | 1,021 | 196 |
| p27–p32 | 1,433 | 246 |
| p33–p39 | 1,680 | 275 |
| p40–p53 | 3,008 | 422 |
| p54–p55 | 308 | 95 |
| **Total** | **12,956** | **2,177** |

The native-GP English reference minimum 2,408 exceeds the **most permissive chapter-wise all-secret bound by 231** original rune positions. This excludes a constant-skip prime-minus-one stream enveloped by any chapter-fixed substitution alphabet and arbitrary chapter-specific start/multiplier, **subject to the original GP-native control register**. The prime stream's actual historically attested F nonconsumption cannot be rejected by this calculation.

[Windows Node22 CommonJS reproducible SFT](../sims/lp2_primephi_outer29_allsecret_5000phase_eo_bound_sft.cjs), [passing Actions run 44990734412](https://github.com/FlareZ123/liber-primus/actions/runs/44990734412).

### Source pp49–51 printed 256-cell table

The [canonical exact table digits](../resources/liber-primus/base60-grid.json) are read in original 32-by-8 row-major order, repeated cyclically. Decode either the printed radix60 numeral or the existing alternate radix59 reading deleting unused lowercase f. Apply each residue directly as K, or cumulatively sum source numerals modulo29 before using it as K. For **every one of the 256 phases per chapter**, grant an independently arbitrary secret sigma and every nonzero scalar. The nine chapter maxima are independently optimized.

| Source table interpretation | Key use | Full-book all-secret E+O upper bound | Deficit to 2,408 |
|---|---|---:|---:|
| Base60 printed numerals | Direct byte residue | **2,376** | 32 |
| Base59 deletion of unused f | Direct byte residue | **2,236** | 172 |
| Base60 printed numerals | Cumulative byte residues | **2,080** | 328 |
| Base59 deletion of unused f | Cumulative byte residues | **2,086** | 322 |

For full reproduction, the per-chapter maxima in corresponding table order are:

- base60/direct: [163,222,308,334,206,270,300,478,95];
- base59/direct: [158,215,289,310,200,251,281,439,93];
- base60/cumulative: [153,199,268,286,188,233,263,400,90];
- base59/cumulative: [153,202,266,284,187,236,264,404,90].

This excludes all four **specific fixed-clock p50 additive-key families plus any chapter-fixed secret alphabet**, including every phase and multiplier, under the finite native-GP control criterion. The base60 direct 32-rune margin is narrow, so it must not be portrayed as a universal obstruction to an atypical original prose register.

[Windows Node22 CommonJS original-data SFT](../sims/lp2_p50_outer29_allsecret_256phase_eo_bound_sft.cjs), [Actions run 44990932506](https://github.com/FlareZ123/liber-primus/actions/runs/44990932506).

## Control and decision

Both SFTs read the original p0–p55 GP29 runes and, for the table variants, the original image-adjudicated numeral transcription. Each builds an independently secret alphabet/key-phase/multiplier in **each** chapter, encrypts a source-native plaintext made from the genuine **solved 95-rune p57 register**, exactly decrypts every synthetic rune with the true private inverse, and asserts that the algebraic bound correctly admits its E/O count. The original bound maxima are pinned as regression assertions. The planted cipher validates implementation and model feasibility; a round trip with a wrong secret would not count as historical progress.

**Research decision:** Source-key models using a fixed direct or cumulative prime/table stream and one entirely unknown chapter-fixed outer substitution alphabet no longer warrant more secret-alphabet guesswork. This result is an original-input all-secret *exclusion* for a finite GP-native English register, not recovered plaintext or a proof of Cicada's intended cipher. The live alternatives are genuine p56-style plaintext-F skips, output-collision key rejection, changing keys/alphabets inside chapters, non-GP plaintext, altered word or rune order, and an author-specified different operation. A valuable successor must derive one such exception from a visible puzzle clue and predict actual unknown plaintext on withheld pages.
