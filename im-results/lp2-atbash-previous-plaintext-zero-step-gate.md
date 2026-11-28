# LP2 Atbash and affine predecessor markers: a key-independent original-cipher exclusion

**Agent8, 28 November 2026. Classification: finite-register architecture exclusion, not recovered unknown plaintext or historical key.**

## Decision

A **complete 812-member family** of reversible GP29 ciphertext-feedback mechanisms, in which the reserved zero-cipher-step plaintext symbol is an invertible *affine function of the preceding plaintext rune*, fails the original p0–p55 doublet constraint against **every complete-length window in each of two independently pinned native-GP English sources**. This holds even when the remaining secret multiplicative key is allowed to change arbitrarily on *every rune*. Across 34,674 Gibran and 204,151 Shakespeare windows, the most favorable of all 812 affine marker rules still forces **124 and 115** equal-neighbor ciphertext events respectively; original LP2 has **only 86** in the same 12,901 within-page positions. No source-selected unknown-message inverse or authentic cipher key follows.

This result eliminates a **typed class of direct, order-preserving native-GP29 English decoders**. It does not eliminate other plaintext languages, non-GP streams, variable-length transport, added encoding layers, changing or nonlinear marker functions, or an unknown historical author-supplied state.

## Motivation and complete mathematical family

The original Cicada-solved GP29 **Atbash** map reverses the alphabet, `A(x)=28−x` for rune indices `0..28`. Placing `A(P[i−1])` in the zero-step position of a GP29 feedback cipher would be a short, mechanically reversible, human-applicable way to avoid the previously rejected assumption of *one stationary reserved plaintext rune*. This is an original **hypothesis**, not an authorial instruction. Rather than testing only that attractive map, charge its entire small algebraic family with parameters independently identifiable as affine bijections of `Z_29`:

```text
a ∈ {1,…,28}, b ∈ {0,…,28};       exactly 28×29=812 maps
M(x) = (a*x + b) mod 29
C[0] = P[0]
C[i] = (C[i−1] + k[i]*(P[i] − M(P[i−1]))) mod29,
       k[i] ∈ {1,…,28} for every i>=1
Atbash predecessor: a=28, b=28
```

Every `a` and every nonzero multiplier `k[i]` is invertible modulo29. For *any* key stream, even one chosen after observing all original plaintext, the following exact equivalence is unavoidable:

```text
C[i] = C[i−1]  ⟺  P[i] = (a*P[i−1] + b) mod29.
```

The key may determine the nonzero differences, but **cannot move or erase a single zero-step site**. No case-specific phrase scoring, secret-key search, page/word reset choice, phase adjustment, fitted dictionary, or assumed plaintext word segmentation enters this necessary-condition test. A `k[i]=1` inverse for the authentic Atbash special case, `P[i]=(C[i]−C[i−1]+28−P[i−1]) mod29`, exactly roundtrips all 12,956 original ciphertext runes yet leaves uniform-looking output (IoC approximately 0.03445969). Roundtrip does not authenticate plaintext; independent solved-GP plants confirm the reversible formula.

## Frozen original material and two full-length plaintext registers

Original LP2 physical pp0–55: **12,956 canonical runes**, **86** equal-neighbor pairs after omitting the **54 actual nonempty physical page seams** from all 12,955 consecutive rune pairs; exactly **12,901** eligible within-page transitions. The physical p50 numeric page has *no runes*, so it does not contribute a second seam; original printed group/word breaks are deliberately **not** assumed to mark plaintext words.

English controls use the repository's already fixed Gematria Primus normalization, preserving the special symbols TH, NG, EO, OE, AE, IA and EA, plus solved-source `ING→NG`, `IO→IA`, K/Q→C, V→U and Z→S. Both controls are independently supplied text, not obtained by decoding the target. The 2019 Gutenberg *The Prophet* is clipped to its **proper literary book interior**, excluding publisher metadata and the appended license. The Shakespeare source is the pinned `shakespeare_first300k.txt` fixture. A source-native solved-LP1 sample supplies 2,648 GP runes containing 82 adjacent Atbash-pair relations among 2,647 edges; it is a control of the alphabet mapping, not another complete-length window.

| Frozen control | Source GP runes | Exact consecutive 12,956-rune windows | **Minimum** zero-step sites across all 812 maps and all windows, excluding original 54 seams | Winning marker and earliest window | Models exactly seam-scanned / mathematically bounded |
| --- | ---: | ---: | ---: | --- | ---: |
| Gibran, *The Prophet* book only | 47,629 | **34,674** | **124** (vs LP2 86) | `M(x)=3x+9 mod29`, start6917 | 13 / 799 |
| Shakespeare pinned fixture | 217,106 | **204,151** | **115** (vs LP2 86) | `M(x)=20x+16 mod29`, start70708 | 13 / 799 |

The census covers **193,907,900** affine-map × source-window hypotheses in total, and **none** is compatible with the original **86** event requirement. For the historically motivated Atbash special case `a=b=28`, the Gutenberg windows contain **285–359** relations (mean320.287), while the complete Gibran literary extract has 1,193 such pairs in 47,628 adjacent edges (2.505%). Solved-source prose has 82/2647 (3.098%). Thus the specific Atbash-predecessor cipher was already disfavored, but the significant contribution is that **all 812 invertible affine replacements of Atbash fail in both independent registers**.

### Exact algorithm, not a huge phase sweep

For each map `(a,b)`, form the donor equality predicate `H[i]=1[P[i]=M(P[i−1])]`. Sliding a contiguous length12,956 window over the donor takes linear time using `H`. Its **raw minimum** over all windows, `r`, is a rigorous lower bound `r−54` for the exact source-window minimum after removing the 54 original physical page-cut positions. Sort the **812 frozen maps** by raw minimum. Exactly scan the seams for the rare best raw candidates; once the next map's `r−54` exceeds the best exact minimum already found, every remaining candidate is **mathematically certified** unable to win. This yields 13 exact scans and 799 certified eliminations for **each** donor. No approximation, random sampling, or decision-dependent stopping is used.

The exact winner for Gibran has raw minimum125 and seam-removed minimum124; the exact Shakespeare winner has raw117 and seam-removed minimum115. A native-GP planted English passage passed full encryption/decryption and event-count identity with the simple Atbash `k=1` demonstrator; the full original ciphertext likewise reencrypts exactly. The real original inverse has no readable unknown text.

## Interpretation, restrictions and next decision

**Historical selection remains absent:** the solved Atbash map is genuine Cicada material, but no first-party LP2 clue selects preceding-*plaintext* affine marker feedback, its initial condition, or arbitrary nonzero keys. The 812-member census is a **hypothesis-family exclusion**, not evidence that the author attempted this cipher or that its failure points to any particular alternate algorithm. The full-length donor windows overlap heavily, so the count `0/193,907,900` is **not** a p-value or proof across all English writing, let alone all languages. It does show that simply swapping a different constant GP affine rule, choosing a secret per-rune multiplier or treating printed word spaces as false cannot rescue this family on the tested source-native direct-prose interpretation.

A successor should seek an **independently authored nonaffine/stateful marker, non-GP plaintext channel, legitimate pre-cipher variable-width representation or complete invertible historical decoder**. Do not retread the 812 affine variants or optimize free nonzero key streams. The standing fixed-literal-F and p15 time-periodic marker negatives are different model families; see [literal-F family gate](lp2_gp29_fzero_two_word_source_invariant.md) and [p15 prime-time marker](lp2-fibprime-evolving-marker-original-source-gate.md).

**Reproducer:** [standalone source-exact CommonJS](../sims/lp2_atbash_previous_plaintext_marker_gate_sft.cjs) reads the original LP2 ciphertext, authentic solved-prose controls, the original Shakespeare fixture and the full Gutenberg proper-book text, asserts full familywide minima and model pruning, performs exact native-GP plant/real-cipher roundtrips, and prints the certified census. Its mathematical core and all reported counts were executed independently in the live V8 analysis environment; the committed Node22 filesystem wrapper has **not** been separately run through CI.

