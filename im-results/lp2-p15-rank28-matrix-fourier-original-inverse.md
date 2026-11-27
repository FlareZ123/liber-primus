# LP2 p16–22: exact four-state p15 matrix inverse via finite-field Fourier characters

**Agent 50, 27 November 2026. Classification: source-motivated bounded native-language negative plus a reusable exact-key solver.** No unknown Liber Primus plaintext, authentic key or destination recovered. The same fully specified method recovers complete planted GP29 plaintext and four hidden key digits on native text, including a plant whose repeated ciphertext rune positions exactly match the original.

## Source premise, original receiver and rival

The genuine [LP2 p15 Fibonacci-indexed-prime square](../results/lp2-p15-fibonacci-prime-spiral.md) provides an actual 4×4 numeric matrix with a red 3299 origin and an infinity drawing. The solved mathematical rule uniquely recovers the underlying prime values and their one-based prime ordinals. A plausible player might iterate the 4×4 matrix instead of applying a static Hill transform. This is different from the [direct block Hill](fibonacci-square-hill4-gate.md), [word-reset Hill](fibonacci-word-reset-hill4-original-inverse.md), and [p15-to-grid AES/rank28](fibonacci-indexed-grid-iv.md) tests. The decisive **unsupported assumptions** are that a four-dimensional matrix recurrence actually drives the rune cipher, that GP rune EA is the repeat event, and that the first prime 2 selects a primitive-root nonzero-step sender. None is stated by the manuscript; independent pads or other alphabets remain rivals.

Fix the original receiver to physical LP2 pages **16–22**, 1,744 runes, page lengths **267, 273, 260, 271, 269, 273, 131**. Infer models and seeds only on p16–19 (**1,071 original runes**), freeze them and decode the untouched p20–22 (**673 runes**). The four original source matrix families are printed p15 values, recovered underlying primes, recovered one-based prime ranks, and Fibonacci positions. Their eight physical square rotations/reflections, both transpose conventions, and four coordinate readouts give **256 model labels** (some algebraically equivalent). An exact inference is run over all **29⁴ = 707,281 unknown initial states** per model, never over guessed plaintext strings.

## Reversible source-motivated model

Working in GF29, for a proposed 4×4 matrix M and four-coordinate seed s, use the scalar key projection

  u_i = e_r^T M^i s mod 29 ; k_i = u_i mod 28 .

The first ciphertext rune is C0 = (P0+k0) mod29. For each later native GP29 plaintext rune, use **EA (index28)** as the one recoverable repeated-symbol event: P_i=28 emits C_i=C_(i−1). Every other P_i in 0..27 emits

  C_i = C_(i−1) + 2^((P_i+k_i) mod 28) mod29 .

Because 2 has multiplicative order28 modulo29, a nonzero emitted difference has a unique discrete logarithm, and plaintext recovers exactly. The exceptional repeat is not a lost rune, null, sidecar or separately fitted mark; the entire mechanism is one-to-one and reencrypts all original ciphertext under each candidate seed. This forward replay by itself does **not** validate the decoded text.

## Fast exact seed recovery

For each observed nonzero difference, define d_i = log_base2(C_i−C_(i−1)) modulo28. The decoded rune for a trial state projection u is P_i = (d_i−(u mod28)) mod28. A fixed Gibran-native GP29 unigram log-likelihood assigns a 29-entry function f_i(u) to each original ciphertext position. The total seed score is a sum of **one-dimensional ridges** f_i(r_i·s), with r_i=e_r^T M^i.

A 29-point discrete Fourier transform of each ridge has support only on the 29 points of the line spanned by r_i in the four-dimensional frequency grid. Accumulate all those sparse coefficients, and run **one 29×29×29×29 inverse FFT** to score every possible four-symbol seed simultaneously, followed by explicit first-rune and repeated-event corrections. This replaces roughly **756 million** candidate×symbol evaluations **per model**, yet returns the exact maximum for the stated unigram objective up to floating-point error.

Reproducer: [sims/lp2_p15_rank28_matrix_fourier_sft.py](../sims/lp2_p15_rank28_matrix_fourier_sft.py). It reads checked-in corpus, reconstructs all matrix families, evaluates all source-defined orientations, and blinds the actual planted keys. The experimental core completed all 256 source models in ~**11.4 seconds** in the connected NumPy runtime. The standalone repository script was committed for repeatable execution; no separate GitHub Actions completion is claimed.

## Actual original input and controls

| Source and selection | p16–19 average log score/rune | Frozen p20–22 average | Outcome |
|---|---:|---:|---|
| Authentic GP-native Gibran encrypted with printed p15 matrix, unknown four-digit seed | **−2.98638** | **−2.96428** | Recovers actual seed **(22,21,19,17)** and all **1,744/1,744** native runes |
| Same native text with plaintext EA edited to exactly match the **10 original doublet locations** | **−2.95579** | **−2.93257** | Recovers same seed and all **1,744/1,744** source-shaped runes |
| Original LP2, training-selected best among 256 matrices, each with all 29⁴ seeds | **−3.91994** | **−4.24896** | Nonprose, no original plaintext or key |
| Matched-repeat independent random nonzero-step source, best among all 256 model labels | **−3.91185** | **−4.23544** | Chance baseline indistinguishable in magnitude from original |

The real winning training state uses recovered prime-rank matrix, displayed orientation, transposed recurrence, fourth readout, seed **(7,25,17,8)**; equivalent matrix labels tie. It yields an uninterpretable p20–22 register, with heldout IoC **0.0354224**, compared with genuine native plant heldout IoC **0.0602623**. Its first 100 heldout runes in compact base29 index serialization begin:

  kbai00gp2dhea828g8pj95mfh8e3h0cd5n6ch1n0lnopn0nd5n7c06c768k1r3qi8iphi88feccibmrmigm9k75b68c9j8q7jjbl

A second independent full-family positive plant used the recovered prime-ordinal matrix with another physical orientation, transpose, readout and seed (3,7,13,17). The correct planted seed is retrieved within its original model, and a gauge-equivalent **top-ranked** model recovers all **1,744/1,744** native runes, including the untouched 673. Therefore the original negative is not merely a failure to search the discrete square variants.

## Independent opposite-side receiver: p8–14, both directions

The original p15 matrix physically follows another seven-page encrypted section, **p8–14**, whose 1,729 original runes have physical page lengths [255,268,263,273,261,272,137]. This supplies a genuinely distinct **source-location** alternative to using the matrix prospectively on p16–22. The matrix operands, four-rune hidden seed, primitive-2 emission, rank28 exception rule, native Gibran model and all 256 exact models were kept *unchanged*. The entire runic string was read either forward or in fully reversed manuscript order, without retuning keys or allowing per-page resets.

| Original source direction | Training pages; rune count | Strictly withheld pages; rune count | Best training average GP-native log score | Frozen heldout log score | Decision |
|---|---|---|---:|---:|---|
| **Forward** p8→p14 | p8–11; 1,059 | p12–14; 670 | **−3.90593** | **−4.10521** | No readable plaintext; held IoC about 0.03575 |
| **Backward** p14→p8, including reversal within pages | p14–11; 943 | p10–8; 786 | **−3.88588** | **−4.19913** | No readable plaintext; held IoC about 0.0352 |

Even the retrospectively best heldout matrix (an impermissible postselection) scores **−4.102999** forward and **−4.144671** backward, far below the genuine native GP language floor observed in the independent p16–22 calibration. An exact **1,729/1,729 original-shaped native-language positive** recovers the four source seed digits for each direction under the same hidden-seed inference. These supplementary tests show no rescue from a different physically adjacent side of the p15 object or from reversing the human reading direction; they do not authenticate a matrix-key placement.

Reproducer: [sims/lp2_p15_rank28_matrix_fourier_reverse_sft.py](../sims/lp2_p15_rank28_matrix_fourier_reverse_sft.py), reusing the frozen primary Fourier implementation and checked-in source. Its numerical core ran against the original corpus and a separate native control; the GitHub wrapper is committed but has not been independently run under CI. The p8–14 and p16–22 negatives cover **both adjacent sections**, not arbitrary receivers elsewhere in LP2.

## Decision and use

The exact **source-derived 4×4 linear-recurrent, primitive-2 nonrepeat GP29 sender** with unknown four-rune seed is a bounded negative on adjacent pp8–14 and pp16–22 under this specified natural-language model. It is not evidence against unrelated nonlinear sources, different control encodings, a concealed plaintext language or a genuinely author-selected additional layer. No unknown original rune, author key or next-stage destination was recovered.

Preserve the spectral seed solver for future **clue-selected linear GF29 hidden-state** mechanisms. This branch should reopen only if an independent clue names a state recurrence or emission law and selects a new original receiver. Expanding free exponent bases, page starts, secret matrices or discretionary symbol exemptions after failure would recreate the unconstrained search this test was designed to avoid.
