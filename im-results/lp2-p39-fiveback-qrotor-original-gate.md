# P39 red-quadratic five-back contextual rotor: original LP2 inversion gate

**14 November 2026 · Agent 6 · Director #867. Bounded original-source negative; no recovered unknown plaintext, historical key, cipher, or destination.**

## Source clue and proposed reversible cipher

The p39 original red triad gives GP29 coefficients **[27,5,15]**, yielding `Q(x)=27+5x+15x²=15(x−24)² mod29`. Source five-circle stencils and LP2's anomalous 104 within-word five-back echoes (of 2,105 eligible positions) motivate testing a nonlinear *changing* alphabet that reads both the preceding published ciphertext rune and the word-local fifth predecessor. The source does **not** authenticate the assignments or indicate that this is Cicada's operation. Prior stationary-five-phase alphabet gates do not directly test this ciphertext-driven rank rotor.

For each plaintext rune `P`, keep the previous **published ciphertext** `h` across words and pages, using initial `h=H(index8)` taken from the p40 red heading. For each word-local index `j`, define a 29-way bijection:

1. `EA(index28) → h`, reserving the immediately repeated glyph.
2. For `j≥5`, `S(index15) → C[j−5]`. If that equals `h`, assign `h+1 mod29` instead, preventing duplicate cipher outputs.
3. Delete those reserved plaintext and cipher symbols from the ordered GP29 alphabets. Let their common residual length be `m=28` when `j<5`, otherwise `m=27`. Map residual plaintext rank `r` to residual cipher rank `(r−Q(h)) mod m`.
4. Update `h` to the actual emitted ciphertext glyph. Decrypt by reversing each rank permutation and applying identical published history.

Each state maps all 29 plaintext runes to **29 distinct ciphertext runes**, with no erasure, arbitrary repair, or hidden per-rune randomness. Rotations change nonperiodically with ciphertext state. These marker names and priority are investigator-selected conjectures. All source inputs are original and no cipher parameters are tuned after scoring.

## Untouched original ciphertext and two independent failure modes

Parse all **12,956** original unknown p0–55 GP rune IDs into **2,896** original complete words, including **32** words carried across physical page turns. The inverse exactly re-encrypts all 12,956 original runes, which checks implementation only.

| Original region | Original ciphertext GP29 IoC | Frozen inverse GP29 IoC |
| --- | ---: | ---: |
| Entire p0–55 | 0.034478397865 | **0.035313048981** |
| First p0–2, 729 runes | 0.034082515564 | **0.035695443103** |
| p40–53 black body, 3,000 runes | 0.034544403690 | **0.035306880071** |
| Final p54–55 | 0.033821227632 | **0.035344134693** |

All inverses remain GP29-uniform; the full decoded prefix begins `Y G U NG H W Y L P D L I A D L E P S`. The authentic p40–53 black body starts after its eight-rune red heading, has 3,000 original runes and **13 one-rune words**. Model-decoded singletons in source order are `EO O N E U A Y T R T EO B T`: **2/13** belong to genuine English GP single-rune words `A/I/O`, whereas 13/13 would need to if the visible printed boundaries directly preserved English. This is a decisive original-input objection for that text register, independent of IoC.

## Fifty original-layout positive controls

Encode the repository's independent Gibran source with original solved-LP spelling `ING→NG` and `IO→IA` (also standard `QU→CW,V→U,K→C,Z→S`). Sample genuine GP source words independently at **each of the 2,896 original word lengths**, with deterministic Xorshift32 seed `0x3301`. All **50** full-length source-native plaintext plants encrypted and decrypted **12,956/12,956 runes** exactly. Repeated encipherment reproduces each planted ciphertext.

| Metric | Original unknown LP2 | Positive control mean | Positive range |
| --- | ---: | ---: | ---: |
| Plaintext GP IoC | unknown | **0.059715477222** | authentic-source driven |
| Ciphertext GP IoC | 0.034478397865 | **0.035278310260** | 0.035111041152–0.035440762065 |
| Immediate repeats (continuous predecessor) | **86** | **118.02** | 94–142 |
| Within-word five-back repeats | **104** | **229.78** | 204–262 |

Every positive control preserves exactly **2,105** five-back-eligible original word positions. All 50 generated 204 or more five-back repeats, far exceeding the original's 104; none reached the original's lower 86 immediate repeats either. Although this cipher achieves ciphertext-like IoC from genuine English, it **over-generates** the very five-back pattern it was designed to explain.

## A source-authenticated rival marker: F does not have enough native-English capacity

**Existing stronger result, precedence:** [Agent31's earlier all-secret fixed-rune five-back gate](lp2-lag5-fixed-plaintext-marker-triple-original-gate.md) already excludes the entire class in which **any single fixed plaintext rune m** gives `C[j]=C[j−5] iff P[j]=m`, for intact GP-native English. Its unchanged p51 original word `S D NG G L S D NG` carries three consecutive five-back echoes, forcing the three final plaintext symbols to equal m; none of 6,659 checked source-native English eight-rune words has that suffix. The F-only 3,000-control calculation below is a **supplementary source-specific frequency calibration of an already excluded fixed-marker family**, not an additional novel cipher-class exclusion. Both gates depend on intact words and native GP-English. Neither recovers original plaintext or an authentic key.


The original q-rotor froze plaintext S as the hypothetical fifth-back copy trigger. An especially attractive rival is **F, index0**, since solved Liber Primus actually uses F as an occasional cipher interrupter; that special status is original-source attested. The extension `P_i=F ⇒ C_i=C_(i−5)` when the fifth word-local context is distinct from `C_(i−1)` remains conjectural: solved LP does not tell us to copy a fifth predecessor. But its output consequences can be tested **key-independently** without running another fitted alphabet.

Among the 104 authentic original within-word five-back return events, **103** occur at a position where `C_(i−5) ≠ C_(i−1)`; just **one** also equals the immediately preceding published rune. In any 29-way bijective cipher that assigns the unique available `C_(i−5)` output **only to native plaintext F** in this unambiguous context, those 103 original events require **103 plaintext F symbols at the original j≥5 word-local positions**. This logical requirement does not depend on Q, on a secret key, or on which other plaintext symbols map to other outputs.

For the complete **2,896 original printed word lengths**, there are exactly **2,105** eligible late-word rune positions. Independently native-GP encode three established English sources, preserving solved-LP `ING→NG` and `IO→IA` spelling; compute exact word-length-conditioned expected late-word F occurrence counts, then run **1,000 deterministic independent full-word-shape plants per corpus**. The source-English controls give:

| Native-source reference | Exact expected late-word F count | Observed range across 1,000 matched controls |
| --- | ---: | ---: |
| Gibran, *The Prophet* | **21.4262** | **10–40** |
| Shakespeare first 300k chars | **18.2715** | **5–34** |
| Emerson essays | **23.5745** | **9–42** |
| **Required by F-exclusive fiveback model on untouched LP2** | **103** | all three are far lower |

This directly rejects **F as the exclusive direct five-back copy marker in ordinary GP-native English** under the original printed word layout, even though F itself is historically special. It does not prove that unrelated or unknown plaintext registers have the same native lexical frequencies, and does not exclude F as a transparent skip or as a key-clock action independent of the five-back output. The fully self-contained [original-source CJS discriminator](../sims/lp2_f_interrupter_fiveback_original_capacity_sft.cjs) asserts the 103 unambiguous events and all 3,000 matched controls; [CI run 43625026026 passed](https://github.com/FlareZ123/liber-primus/actions/runs/43625026026). This eliminates a tempting source-suggested marker substitution **without trying a new permutation fit**.

## Research decision

**Reject this exact moving-Q rotor as a direct GP-English LP2 cipher.** Original decoding yields no authentic prose; its word-internal repeat counts and original one-letter-word morphology contradict the matched native controls. Bijective forward reencryption and planted inverses establish correct software, not author provenance. A rescue by freely swapping markers, tuning the red coefficients, or choosing a per-page seed after viewing original LP2 would be unmotivated.

The valid next input would be a *first-party selected* state transition and letter assignment, independently predicting unknown-page output, rather than another fitted repeat-matching mechanism. This bounded test does not exclude other evolving-state ciphers or alternate plaintext registers.

**Reproduce:** [single-file Node.js 22 CJS original-source SFT](../sims/lp2_p39_fiveback_nonlinear_rotor_original_sft.cjs), using [canonical LP2 source indices](../resources/liber-primus/lp2-corpus.json), [full source transcription](../resources/lp2-transcription.txt), and [historical Gibran control](../resources/control/gibran_prophet_58585.txt). The test asserts every source byte/rune sequence, both directions, singleton decoding and all 50 synthetic full books.
