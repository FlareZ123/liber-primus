# Original p6–p8 red words and p7 dot geometry yield a complete conditional DH23 state

**21 November 2026, Agent49. Status: new source-conditioned cross-page operator candidate; exact finite original-source test, no solved LP2 ciphertext.** This integrates the independently committed Agent26 p7 dot-interpolation finding with two neighboring source-red text regions. The source proves the rune inputs and numerical arithmetic. It does **not** prove the intended GP-index-product or Shamir/GF29 interpretation.

## Why a human solver might try this

The LP2 p6, p7, p8 source pages are physically consecutive. Their conspicuous rubric text is not encrypted like the surrounding black manuscript. Original p7 has five separate black dots; earlier Cicada puzzles historically used Shamir secret sharing and a literal Diffie–Hellman operation. The published alphabet contains exactly **29** GP runes, allowing GF29 arithmetic. A five-share fourth-degree interpolation using five **red words** and five **black dot positions** is a finite, visible candidate. Agent26 first noticed that its horizontal and vertical constants recover historically known DH parameters g5 and p23; that p7 finding is an independent prior input, not invented here.

The novel extension asks whether original p6 red text supplies a missing state field and whether original p8 red text supplies the remaining pair. Both neighboring original red regions have naturally printed words, and their values can be computed without any unknown ciphertext or language guess.

## Exact original-source reconstruction

Use original `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, `lp2-ink-annotations.json` and the original image-dot measurement from Agent26's `sims/lp2_p7_fivedot_shamir_dual_secret_sft.cjs`.

Original GP29 zero-based rune indices are printed in source order. For every complete red word, multiply its rune indices modulo29. This is a candidate mathematical *word aggregation*, not an explicit authored command.

| Original red region | Source offset / rune length | Complete printed red-word lengths | Product readout (GF29) |
|---|---|---|---|
| p6 | 71 / 11 | `[4,1,4,2]` | **`[13,19,14,23]`** |
| p7 | 194 / 14 | `[2,4,3,2,3]` | **`[11,26,8,15,2]`** |
| p8 | 0 / 12 | `[4,8]` | **`[4,3]`** |

P6's second word is a **single original red rune M**, direct GP0 index **19**, making its index product 19 independently of word aggregation. P7 dot x-rank is `[1,2,3,4,5]`, its source pixel y-rank `[3,5,1,4,2]`. Interpolate p7's five original red products at each rank list over GF29; the coefficient arrays in increasing power order are:

- Horizontal `[5,6,23,26,9]`.
- Vertical `[23,18,21,22,11]`.

The original p8 black text *after* its twelve red runes has length **243 = 3⁵**, which is source-visible evidence for one possible five-axis ternary register but does not establish its use.

## Candidate reconstructed complete historical DH state

Read the horizontal polynomial's first three coefficients as `(g,a,p)=(5,6,23)`. Read p7's last three products as `(A,b,K)=(8,15,2)`. The independently printed **p6 isolated red M19** gives `B=19`; the two source-ordered original p8 red word products `[4,3]` supply the already-known historical `(q,e)=(4,3)`.

`(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)`.

The four independent Diffie–Hellman equations are satisfied:

- `5^6 mod23 = 8 = A`.
- `5^15 mod23 = 19 = B`.
- `8^15 mod23 = 2 = K`.
- `19^6 mod23 = 2 = K`.

This is a **source-number reconstruction of a historically known DH tuple**, rather than recovery of a novel creator-secret key. Original p6 red M19 and p8 products4/3 are physically separate source regions, but they were inspected *after* noticing p7's strong historical state correspondence. The typed field assignments and interpolation operator were selected retrospectively.

## Independent original-input discriminators

The exact [single-file original-input reproducibility test](../sims/lp2_p6_p7_p8_red_dh_field_coverage_sft.cjs) enforces complete printed-word-to-original-ciphertext alignment and original annotated red span offsets, 5-point GF29 interpolation, DH equation checks, and planted GF29 polynomial reconstruction.

It evaluates seven finite original-red-word aggregators `index product, index sum, prime product, prime sum, first rune, last rune, word length`. Under the frozen field typing and source p6 counterpart, **the index-product method is the only one of seven** that satisfies all four DH equations. Among all **120 permutations of p7's five index-products**, only the *original printed order* satisfies that complete DH system with `B=19`. The vertical polynomial's first coefficient independently equals23, the modulus selected by horizontal coefficient2.

These are **conditional counts for the chosen 7×120 test family**, not significance levels for author intent. The family was not preregistered before the original DH state was known. Other red words, polynomial coefficients and possible field orders remain unexplained. Algebraic agreement alone cannot justify a new p8 tensor decode.

## Actual plaintext-target tests and next decision

Agent26's independent p8 original 243-rune black-body 5-axis GF29 linear-difference consumers were negative. Agent49 also checked the natural 5D three-point Newton/Lagrange inverse and bounded additive masks using both recovered p7 coefficient arrays as axis weights, including two origin conventions and both signs. They yielded original-text IoCs near **0.033–0.036**, no readable GP prose and no long recognized complete-word English in the direct additive cases. Do not tune these merely to salvage the DH match. No complete original LP2 decryption or creator-authenticated key has been obtained.

**Highest-value next experiment:** locate a contemporaneous source-visible instruction that would make the transition **p6 red M19 → p7 five dots/products → p8 two words + black 3⁵ tensor** a specific reversible operation. If an independently selected operation exists, freeze its field typing, 243-rune offset map, initial state and one untouched original target *before* inspecting language. Without that new selector, retain the full DH coverage as conditional cross-page structure rather than claiming recovered plaintext or opening more arbitrary cipher families.

Related independent source [p7 five-dot Shamir regression](../sims/lp2_p7_fivedot_shamir_dual_secret_sft.cjs) and [authoritative synthesis](../results/README.md).
