# An original LP2 five-word quotation-prefix crosslink

**Classification, 10 November 2026:** new exact source-structural correspondence and a narrowly specified, exact conditional null. It is **not** a recovered plaintext, identified repeated phrase, key or cipher mechanism. This result offers a frozen *candidate crib equivalence* for future independent inverses.

## Source-observed relationship

Two separately annotated quote openings in the 12,956-rune unsolved LP2 corpus have precisely the same first five **canonical word lengths**:

| Quote opening, zero-based global rune offset | Physical LP2 page | Quote length | Canonical words in entire quotation | First five word lengths |
| --- | ---: | ---: | ---: | --- |
| **9,811** | **40** | 58 runes | 14 | **5, 7, 2, 3, 4** |
| **12,522** | **53** | 70 runes | 14 | **5, 7, 2, 3, 4** |

These are the **only two starts** of this length-five word-length pattern anywhere in all **2,896 original unsolved canonical words**. In each case the five-word prefix begins *exactly* with a quotation mark, independently recorded in `resources/liber-primus/lp2-quote-punctuation-spans.json` from the richer relikd/scream314 transcription. The canonical rune-bearing pages omit the printed numeric-only page 50, so the physical page 53 is **rune-bearing page ordinal 52**. Both quote starts and word boundaries are resolved by the existing canonical transcription, joining printed-line and page wraps.

For a frozen comparison, the actual **21 original GP rune indices** at each five-word quote opening are:

```text
Physical p40, offsets [9811,9832):
[0,23,4,28,6,13,3,12,3,19,28,17,11,27,15,19,0,16,0,25,3]
Physical p53, offsets [12522,12543):
[28,14,26,12,4,3,13,15,5,25,19,12,9,11,18,0,15,18,0,24,21]
Difference p40 - p53 (mod 29):
[1,9,7,16,2,10,19,26,27,23,9,5,2,16,26,19,14,27,0,1,11]
```

The **numerical red-ink triangle** had separately selected physical pages **40, 15 and 53** through three prime-sum/page-pointer relations; see `im-results/red-span-triangle.md`. That earlier selection makes the two relevant pages particularly interesting to investigate. It does **not** give an independent decryption or prove these two quotes share words.

## Exact quote-opening null

Predeclare the event as **any pair** of the **five** original quotations containing at least five complete words sharing all five lengths at their quote beginnings. The other two independently annotated quotes contain only four and two words and cannot enter this event. There are `choose(5,2)=10` eligible pairs.

Conditional null: for every source rune-bearing page containing an eligible quote opening, circularly rotate its *whole canonical word-length sequence* by an independently chosen uniformly random number of whole words. Preserve the page's original word-length order, its word inventory, and each quote's **page-local word ordinal**. Both quotations on rune-bearing page 42 share the same rotation. This is a conditional word-phase model, not a claim that rotating words produces an authentic manuscript.

Enumerate each pair over *all* page rotations; share the shift for same-page quote starts. Results:

- **9 of 10** quote pairs have **zero** attainable matching five-word prefixes under *any* of their valid original-page rotations.
- The physical **p40/p53** pair has precisely **two** allowed rotation combinations out of `55×39=2,145`: shifts `(0,0)` with observed pattern `(5,7,2,3,4)`, and `(40,14)` with a different pattern `(2,3,5,4,4)`.
- Consequently the event *any* eligible quote-prefix match has the **exact family-wise conditional probability `2/2145 = 0.0009324009`**. A separate 1,000,000-draw fixed-seed xorshift32 check found 974 such matches, consistent with the exact rate; use the exact enumeration for evidence.

This accounts for pair selection *within these seven annotated quotes* under this specific five-word criterion, but ignores their original **complete quotation lengths**, as corrected below. The criterion and the interest in p40/p53 were noticed in an exploratory search, and the test does **not** adjust for arbitrary prefix lengths, alternative phrase boundaries, other discovered page links, or the larger research program. It is a meaningful conditional coincidence, not proof of a deliberate creator mechanism.

## Stricter original-quotation length conditioning

**Preferred interpretation of the coincidence:** the initial `2/2145` rotation calculation does *not* preserve the two quotations' complete source lengths. Because both inscriptions are known to be exactly **14 words**, with total rune lengths **58 (p40)** and **70 (p53)**, a legitimate source-aware null should keep those totals fixed.

Enumerate all source-page word rotations exactly as before but retain only those where the **next 14 word lengths** sum to the original quote's total. The physical p40 quotation has **7/55** allowed phases `[0,1,8,35,42,44,54]`, and the physical p53 quotation has **4/39** allowed phases `[0,34,36,37]`. Of their **7×4=28** jointly legal phases, **exactly one** has identical five-word prefixes: the actual (0,0) source, pattern (5,7,2,3,4). Thus the more tightly matched **exact conditional pair probability is `1/28 ≈ 0.0357143`**.

This considerably weakens the significance relative to `2/2145`. It is a test conditioned on the specifically recognized p40/p53 pair and their known totals, not corrected for surveying all quotation relationships or other manuscript annotations. Earlier research already reported a related **1/25** comparison among full 58/70-rune quote-shaped windows, in [the quote-pair prime-key study](quote-pair-affine-prime-crib.md). The two counts use slightly different source-page/word-wrap conventions; neither is a novel decipherment. **The quotation pattern remains a provisional constraint of modest independent evidential weight.** Do not promote the smaller p-value alone as significant cipher evidence.

## Consequences for a same-plaintext hypothesis

An actionable **hypothesis** is that the 21 GP-rune positions at these openings may encode the same five plaintext words under different cipher state, key or transformation. Freeze this interval equality as a possible side constraint and demand meaningful held-out predictions elsewhere before endorsing it.

There is already a key-independent obstruction for an overly simple reading: if both openings represented the same 21 plaintext rune sequence through **one arbitrary bijective rune substitution per quotation**, equal-symbol relations would be preserved. At positions 0 and 16 of the proposed common prefix, the p40 ciphertext has `0=0`, whereas p53 has `28≠15`. Thus no pair of *fixed* monoalphabetic bijections can map an identical 21-rune plaintext to these two original strings. Context-dependent cipher state, shifting segmentation, a non-bijective intermediate, or coincidental equal word lengths remain possible.

This is specifically a **word-length** crosslink, not an identical plaintext quote. Avoid postselecting a putative English phrase to fit the observed runes.

## Original-cipher consequences of a *conditional* shared plaintext

Two further exact, easily falsifiable gates use the **frozen** source segments above. They matter **only if the first five quote words truly share all 21 GP plaintext runes**. Since that premise is unproved, their failure may indicate different words rather than an incorrect Cicada mechanism.

**Common additive linear recurrence.** Under `C_page[i] = P[i] + K_page[i] (mod29)`, equal plaintext implies the observed 21-symbol difference `D=C40−C53` is exactly the difference of the two keystreams. If those two key streams obey the same homogeneous GF29 linear recurrence of order at most 10, their difference must obey that recurrence too. The 11×10 predecessor-regression matrix formed from all 21 source differences has GF29 rank **10**, while appending the next-symbol column raises its rank to **11**. The system is inconsistent for order 10 and hence for every lower order. Berlekamp–Massey gives minimal complexity **11**, the generic value for a random 21-symbol sequence. This rejects *only* a common order≤10 GF29 additive keystream transition under the proposed true shared phrase.

**Literal fixed red-source additive keys.** The physical p40 red title is eight runes; the corrected physical p53 red passage is 51 runes. Using each as a repeated additive source pad, compare both signs independently, quote-reset versus physical-page-rune-position phase, and literal GP-index versus GP-prime-mod29 bytes: **16 frozen possibilities**. A genuine shared 21-rune plaintext would require **21 of 21 exact recovered symbol matches**. The maximum over all 16 original-source alternatives is only **2/21**. This excludes these literal short red-Vigenère masks *under the shared-plaintext hypothesis*, without touching unknown KDFs, nonlinear field emissions, or changing hidden keys. The counterexample and 16 cases are executed in the SFT.

These restrictions encourage an independent derivation of a genuinely dynamic or layered operation if another researcher pursues the quotation hypothesis, and discourage adapting arbitrary fitted keys solely to force these two lengths to match.

## Source-derived F79/F29 successor-cipher test of the candidate crib

The matching five-word length prefix does not establish that the two quotations contain the same words. To test that hypothesis beyond the earlier fixed-substitution and additive-key checks, I applied the exact reversible F79/F29 successor-cipher family already specified in [the red-triangle report](red-span-triangle.md) to both frozen 21-rune intervals.

For each non-marker transition, define `dᵢ = (cᵢ − cᵢ₋₁) mod 29` and `eᵢ = log₁₅(dᵢ) mod 28`. The candidate cipher uses `eᵢ = π⁻¹(Pᵢ) + s·K[(tᵢ+φ) mod 78] mod 28`, with one shared unknown 28-symbol permutation `π`, sign `s`, key clock `t`, and phase `φ`. If both intervals encode the same 21 plaintext runes under the same `π`, their decoded 28-symbol labels must agree at all 21 positions.

The original-source offsets below are fixed against both `lp2-corpus.json` and the independent quotation interval annotation. An earlier script mistakenly used local offset 152 for p40 even though global offset 9,811 is local 171, and therefore stopped at its source-coordinate assertion before running the reported family test. The corrected original-input calculation and source-anchored regression assertions supersede the former histogram.

The canonical source confirms the exact starts and segmentation:

- Physical p40, global offset **9,811**, local offset **171**, previous ciphertext rune **16**; word lengths **5, 7, 2, 3, 4**.
- Physical p53, global offset **12,522**, local offset **53**, previous ciphertext rune **22**; word lengths **5, 7, 2, 3, 4**.

The 21 successor differences are:

```text
p40: [13,23,10,24,7,7,19,9,20,16,9,18,23,16,17,4,10,16,13,25,7]
p53: [ 6,15,12,15,21,28,10,2,19,20,23,22,26,2,7,11,15,3,11,24,26]
```

After the source-selected base-15 logarithm, the aligned exponents are:

```text
p40: [10,8,5,20,16,16,19,18,4,24,18,17,8,24,7,26,5,24,10,12,16]
p53: [22,1,21,1,11,14,5,27,19,4,8,2,9,27,16,3,1,23,3,20,9]
```

**Key-independent word-reset obstruction.** Because the two openings have identical word lengths, a shared deterministic 28-state key sequence reset at each word uses the same key position at every aligned within-word rune. Under the successor model, identical plaintext and identical key position require identical step differences. The observed base-15 exponents disagree at **all 21 positions**. Therefore no common word-reset key sequence—regardless of its 28-state values or period—can make these two spans the same plaintext under this successor architecture.

**Finite page/continuous-clock test.** I also exhaustively evaluated the full **192-configuration** source-derived family: four F79-to-Z28 key mappings (residue, scaled residue, consecutive difference, and discrete logarithm base 53), both signs, page/word/continuous resets, phases 0/15/22/53, and both repeated-marker advance conventions. No configuration yields an identical decoded 21-rune sequence. Across all configurations, **129** have zero aligned matches, **36** have one, **24** have two, and **3** have three; the maximum is **3/21**. All **192 × 2** source-native planted positive controls recover the same planted 21-rune sequence exactly at both locations. The three maximal original matches arise from continuous clocks only: residue key (phase 22, sign −, advance on marker), residue key (phase 22, sign +, hold on marker), and consecutive-difference key (phase 0, sign +, advance on marker).

This is a deterministic, conditional exclusion, not a probability claim. The word-reset result is key-independent within the shared word-reset successor architecture; the page/continuous result excludes only the enumerated source-derived F79/F29 schedules. The two quotations may not encode the same plaintext at all, and page-specific evolving state, separate per-quote alphabets, or another cipher family are outside this test. No plaintext or authentic key was recovered.

Reproduce with `node sims/quote_pair_f79_f29_equality_gate.cjs`. The existing manual workflow `quote-pair-affine-prime-crib.yml` accepts mode `f79-f29` for this test.
## Reproduce

Run `node sims/lp2_quote_length_crosslink.cjs` from the repo root. Inputs are the frozen original-word transcription `resources/liber-primus/lp2-transcription.txt` and independently sourced quotation annotations `resources/liber-primus/lp2-quote-punctuation-spans.json`. The script verifies all source counts and offsets, prints the seven quotation length lists, and exhaustively enumerates ten pairwise rotational supports. No random sample, external text or guessed key is needed for the primary statistic.

The likely useful continuation is to ask whether any independently specified historical LP2 reversible decoder maps these two **preselected** 21-symbol intervals to identical five plaintext words *without fitting the key to this equality*, while also explaining the remaining original text. Without such a decoder this crosslink stays in intermediate results.
