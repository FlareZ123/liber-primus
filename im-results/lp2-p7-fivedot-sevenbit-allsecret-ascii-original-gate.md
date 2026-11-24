# Exact 5-bit GP29 → 7-bit ASCII obstruction on the five-dot / numeral-7 chapter

**Agent24, 17 November 2026. Original-input mathematical impossibility for one concrete human-legible receiver.** The entire 29-symbol secret codebook has been accounted for without searching or guessing a key. This rejects direct printable ASCII under a stationary, injective five-bit rune encoding on six source-motivated readings of LP2 physical pages 8–14. It does **not** recover unknown plaintext, identify the authors' intended encryption, or exclude encrypted binary intermediate output.

## Why this was worth attempting

The original image of physical p7 (archive `24.jpg`) contains **five** black circles. Immediately following, physical pp8–14 form one visual chapter with exactly **1,729 = 7×247 GP29 runes** and one literal Arabic **7** embedded at original mixed-symbol index **692**. The five-dot picture's top-to-bottom x-rank order **[2,4,0,3,1]** deinterleaves the chapter's 1,730 mixed symbols as five equal columns of 346 into a stream beginning with that literal **7**, followed by the same 1,729 source runes, as established in the [original geometry and alignment study](lp2-p7-five-dot-numeral7-nested-column-alignment.md).

The numbers 5 and 7 suggest an exact reversible bit-width exchange: all **29** rune identities fit in **five bits**, and **7 five-bit symbols = 35 bits = 5 seven-bit ASCII characters**. The 1,729-rune chapter yields exactly **1,235 ASCII septets**, with no pad bits, filler, guessed phase or discarded source symbols. This would have been feasible for a technically inclined 2014 solver. Neither original page states a bitwise ASCII operation or supplies a GP29→five-bit key, so this is an **intended-solve-path hypothesis** with the rival that the circles/7 have another purpose.

## Six fixed original source orders and twelve simplest direct reads

The immutable original corpus and source JPEG select exactly these six full-length rune orders: physical printed; five-dot deinterleave; the historically published 2014 seven-column order [0,6,2,5,1,4,3] as seven-rune tuples on the deinterleave; its tuple inverse; and two natural transpose directions on the resulting 247×7 rectangle. For each, either emit five GP ordinal bits from high to low or reverse bits inside every five-bit source symbol before regrouping. The result always has exactly **1,235** ASCII7 values; reversing the transform reproduces every original rune bit.

| Full original order | Direct GP ordinal: printable 32–126 / 1,235 | Five-bit symbol reversed: printable / 1,235 |
| --- | ---: | ---: |
| Physical printed | 853 | 918 |
| Five-dot deinterleave | 901 | 887 |
| Seven-tuple | 894 | 908 |
| Inverse seven-tuple | 896 | 890 |
| Seven-column down | 900 | 901 |
| Seven-column across | 895 | 899 |

The best **918/1,235** printable ASCII values still leave **317 control/DEL bytes**, and the output has no sustained readable English. These twelve direct views are a small illustrative subset; choosing a different secret five-bit code per rune is the important remaining possibility, handled **completely** below.

## All stationary injective 29-of-32 codebooks in one constraint

Permit every arbitrary *secret injective* codebook assigning the 29 distinct rune identities to 29 distinct members of the 32 possible five-bit words, with up to three unused codewords. This strictly contains the original GP ordinal-to-five-bit mapping and every stationary secret permutation of the 29 codewords. There is no restriction on the secret key beyond codeword injectivity, and reversing bits inside source symbols is already a particular such mapping.

An ordinary printable ASCII7 character is in **32…126**, so its seven-bit representation cannot begin with **00**; a 00 prefix forces a control character in **0…31**.

Every ASCII septet begins at bit offset `7j` in the continuous source stream. Its first two bits fall inside one GP rune's five-bit codeword whenever `(7j mod 5) ∈ {0,1,2,3}`. The first-two-bit positions then inspect the codeword's adjacent pairs (0,1), (1,2), (2,3), or (3,4). Source-image rune counts show that **every one of the 29 rune identities occurs at every one of those four internal offsets** in **each** of the six source orders. The lowest rune/offset occurrence count is 2 in the raw order, 4 after the five-dot deinterleave, and at least 2 in the remaining orders. These are directly tested source facts, with no language scoring.

Therefore, to avoid even one ASCII control character, **every** one of the 29 assigned five-bit rune words must contain **no adjacent 00 anywhere**. But exactly **13** of the 32 five-bit strings have that property (the length-five binary strings avoiding consecutive zeroes, counted by the Fibonacci recurrence 2,3,5,8,13). **An injective 29-codeword alphabet cannot fit into 13 available good codewords.** This is a combinatorial impossibility for the entire family. It remains valid if the intended plaintext language is Latin or Old English, provided the *direct receiver is entirely printable ASCII7*.

## A stronger quantitative bound, allowing every secret key

We can lower-bound unavoidable control characters without assuming all septets must be printable. For each source rune identity `r`, each internal offset `t=0…3`, let `N[r,t]` count occurrences of rune `r` whose five-bit codeword contains both of the ASCII septet's first two bits. For any five-bit codeword `k`, define its guaranteed control cost:

`cost(r,k) = Σ_(t=0)^3 N[r,t] × 1[bit_t(k)=0 and bit_(t+1)(k)=0]`.

Each cost item refers to a **distinct** septet, so the sum cannot double-count any control character. Cross-codeword top-bit pairs (offset4) are omitted completely, making the cost an unequivocal **lower bound**.

Assign 29 distinct codes from 32 to the 29 runes at minimum total cost. The [read-only source SFT](../sims/lp2_p7_fivedot_sevenbit_allsecret_ascii_sft.cjs) solves the exact **29×32 rectangular Hungarian assignment**, checks every produced codeword is unique, and checks its independent matching algorithm against an exhaustive three-row miniature case. It also uses the original p7 JPEG SHA-256, original printed rune corpus, source-fixed six permutations, exact reverse bit packing, and a 1,235-character **HELLO WORLD** planted printable message re-encoded under a real 27-symbol injective five-bit rune codebook that roundtrips in full. Positive synthetic decoding confirms that the receiver itself is functional when its original source permits it.

| Original source reading | Minimum ASCII controls, even with the *best possible unknown 29→32 codebook* | Fraction of 1,235 output characters |
| --- | ---: | ---: |
| Physical order | **102** | 8.26% |
| Five-dot deinterleave | **117** | 9.47% |
| Seven-tuple | **114** | 9.23% |
| Inverse seven-tuple | **115** | 9.31% |
| Seven-column down | **109** | 8.83% |
| Seven-column across | **121** | 9.80% |

The globally most permissive case still forces **at least 102 actual ASCII control characters out of 1,235**, before counting cross-codeword zero pairs. The source-selected five-dot reading forces **at least 117**. Thus a stationary injective GP29↔five-bit codebook cannot directly yield ordinary printable ASCII7 plaintext in any considered full-chapter traversal, regardless of how adversarially the entire missing alphabet key is chosen.

## Periodically changing unknown five-bit alphabets

**A stronger all-secret result (17 November 2026).** A stationarity objection can be resolved without guessing *any* periodic key: independently grant each rune phase `i mod P` its own arbitrary injective **29→32 codebook**. The family contains additive/XOR five-bit phase keys with any unknown values, arbitrary substitution tables and bit mirroring. Group the original ASCII top-bit placement counts additionally by source-rune phase. Since each 7-bit output's first-two-bit **internal** test is attributable to exactly one GP rune, independently minimize each phase's forced control cost by the same sharp 29×32 assignment, then add the per-phase minima. This is a correct lower bound for every possible set of `P` secret dictionaries; the cross-rune top-bit conditions are still omitted, so a zero lower bound means only that this gate is inconclusive.

| Six original source orderings | One alphabet P=1 | Five-dot P=5 | Printed seven P=7 | p7 red colophon P=14 | p15 spiral P=16 | Combined 5×7 P=35 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Physical | 102 | 29 | 86 | 67 | 0 | 12 |
| Five-dot deinterleave | 117 | 24 | 104 | 67 | 0 | 8 |
| Seven-tuple | 114 | 28 | 99 | 63 | 0 | 12 |
| Inverse seven-tuple | 115 | 22 | 100 | 67 | 0 | 7 |
| Seven-column down | 109 | 26 | 96 | 60 | 0 | 14 |
| Seven-column across | 121 | 36 | 104 | 60 | 0 | 21 |
| **Smallest possible forced controls across all six** | **102** | **22** | **86** | **60** | **0** | **7** |

These are **numbers of guaranteed nonprintable ASCII septets out of 1,235**, minimized over *all* secret injective five-bit codebooks separately at every specified phase. Thus four source-motivated periodic codebook families **P=5, 7, 14, 35** are also mathematically incompatible with direct all-printable ASCII7 on each of the six source-fixed readings, even if the entire alphabet can be replaced freely at every key phase. There is no reason to run an ASCII crib search under those families.

The **P=16** rows instead have a zero interior-only lower bound; the full exact test below resolves the five-dot order. This is a strictly *necessary-condition survivor*, not evidence of successful ASCII plaintext: the omitted across-rune septet-top-bit constraints, the ASCII127 exception and actual English character statistics must still be met. The original p15 page has a source-authenticated **16-cell Fibonacci-prime spiral**, but its printed numbers do not themselves instruct `GP5bit XOR key -> ASCII7`, which page should receive it, or which key order/bit direction to use. A narrowly fixed actual 16-cell numeric consumer would be a justified separate test; unlimited new phase dictionaries would be unconstrained key hunting.

[The source-independent period-table implementation](../sims/lp2_p7_fivedot_sevenbit_allsecret_ascii_sft.cjs) matches all six rows exactly and passed [Windows Node22 CI run 44152555563](https://github.com/FlareZ123/liber-primus/actions/runs/44152555563). No actual secret codebook, recovered LP2 plaintext or destination is claimed.

## Full period-16 feasibility and actual spiral-key receiver (24 November)

The previously zero interior-only bound for 16 phase dictionaries was genuinely unresolved. Fix the actual five-dot deinterleave, remove its leading literal 7, advance one phase per rune from phase zero, and emit MSB-first five-bit words. Test the p15 outward-spiral printed distances modulo 32 and the corresponding selected prime-minus-one values modulo 32 (the latter motivated by the solved p56 prime-minus-one operation) as two literal XOR keys. They emit respectively **918/1,235 and 911/1,235 printable characters** (317 and 324 control/DEL values); neither is readable. Both reverse all 1,729 rune identities exactly. The original does not explicitly select this numeric consumer.

Now grant 16 independent arbitrary injective 29-to-32 dictionaries, 464 five-bit variables, with every dictionary constrained by all-different. Concatenate the precise source bit slices into each of the 1,235 seven-bit characters; include all cross-word bit constraints and exclude DEL. Solve the complete finite feasibility model with Z3 QF_BV, not a language-score search.

| Original five-dot order, output alphabet | Exact feasibility |
| --- | --- |
| ASCII 32–126 | SAT, saved exact witness |
| Mixed-case letters, decimal digits, space and punctuation ` .,;:'"!?()-` | SAT, saved exact witness |
| Uppercase letters, same digits and punctuation | **UNSAT** |
| Lowercase letters, same digits and punctuation | **UNSAT** |

Both SAT witnesses are gibberish, with only 8 and 17 spaces respectively, and recover the source exactly under their constructed dictionaries. They establish that printable character constraints and exact roundtrip do **not** identify the unknown key. The narrower one-case output classes are mathematically impossible under this fixed original bit order; this is not a theorem about all ASCII English, since the mixed-case alphabet survives. A 1,235-character uppercase plant adapted from known p56/p57 phrases, encoded with an independently randomized phase dictionary and decoded exactly under its planted key, is SAT under the uppercase gate. Its unconstrained recovered SAT dictionary is also not a unique plaintext solution.

Actual original runs used Z3 4.13.3 native C API; both saved witnesses were independently replayed against the canonical repository tape in JavaScript. [Portable Python z3-solver reproducer](../sims/lp2_p7_fivedot_period16_ascii_sat_sft.py) · [exact witnesses and results](lp2-p7-fivedot-period16-ascii-sat.json). The portable frontend is provided for replication; it is equivalent to the executed bitvector model, not a claimed CI run. Only this one source order and phase convention have been tested. The rational decision is to retire the two actual spiral-key receivers and the one-case arbitrary-dictionary models, and require a new independently sourced bit/key rule before searching the vast mixed-case survivor. No authentic unknown plaintext or key was recovered.

## Decision

**Retire direct stationary or period-5, period-7, period-14 and period-35 injective five-bit GP29 → seven-bit *printable ASCII* as the complete decoder for physical LP2 pp8–14 in each of the six source-fixed reading orders.** Neither the 7×5 dimension match nor the p7 source-mark relocation supplies a viable direct English ASCII message, even granting the entire unknown five-bit codebook. This rejects every plain binary alphabet substitution in this precise receiver class without brute force.

The result does **not** exclude ASCII with control codes used deliberately as binary structure, cryptographic or compressed intermediate data, a state-dependent per-rune five-bit mapping, a non-injective code with a separate disambiguation channel, a bit-level permutation **inside/between** rune symbols, a source-selected different text traversal, or a wholly different binary encoding. Such alternatives require a new authentic instruction or distinctive header/plaintext prediction rather than a larger free-key search. The human-visible five/7 clues remain source observations, not a proven author-selected bitwise operation.

**Reproduction:** [passing expanded Windows Node.js22 CI run 44152555563](https://github.com/FlareZ123/liber-primus/actions/runs/44152555563) executed `node sims/lp2_p7_fivedot_sevenbit_allsecret_ascii_sft.cjs` from repository root; the script reads only existing pinned source files and prints all full original results, finite-pigeonhole evidence, assignment-optimum bounds, and exact positive transport control.
