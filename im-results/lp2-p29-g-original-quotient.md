# Original physical p29: source-derived GF29 polynomial quotient

**Status: reproducible direct plaintext inverse with a negative original result; a later three-point cross-source DH correspondence is exact but is not a decryption.** No unknown Liber Primus plaintext, key, authenticated encryption mechanism or final destination has been recovered by this test. The literal polynomial-multiplication interpretation is closed for the specified page, alphabet and printed coefficient order. More elaborate or externally keyed mechanisms are outside its scope.

## Intended human path and independent source inputs

An independently reported original-source relation identifies the p39 red three-rune GP ordinal polynomial `G(X)=15X²+5X+27` and shows that physical LP2 p29 is the **only nonempty unknown page** whose original 277 rune indices form a polynomial exactly divisible by `G` over GF(29). This is a potentially actionable page-specific cue: multiplication by a degree-two source polynomial would add two cipher runes to a 275-rune native GP plaintext while providing a direct reversible quotient decoder.

The original discovery history selected **page29** by scanning the page polynomials for zero remainder, so the first report correctly treated the page as postselected. Agent17's later p28/signed-2016 route now supplies a **conditional independent page selector**: the local p28 `THE` candidate self-locates at authenticated signed word index28 / physical word29, and its immediate follower `DIRECTION` at index29 / word30 selects project p29 / physical page30 under the same origin convention. P29 is then tested against the independently printed p39 red triad. This removes the page-scan circularity if that source-index interpretation is accepted; the manuscript still does not explicitly command polynomial division.

Original input is `resources/liber-primus/lp2-corpus.json`, Git blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, physical `pages[29].indices`, with rune indices 0..28 in printed order. GP symbols are polynomial coefficients from highest degree to constant. No symbol permutation, offset search, page rotation, alternate spacing or fitted key is used.

## All red-span and chapter-body scope of the same polynomial interpretation

A separate source-wide necessary-condition check asks whether the original red headings generally act as **polynomial divisors** of text, rather than treating the already known p29/G coincidence as a standalone decoder. It keeps the physically printed coefficient order, reading each red runic span as ascending powers and the 55 unsolved rune-bearing pages as descending powers over GF(29). All **18** marked red spans, including the two solved-ending titles, are compared against all **55** original unknown rune-bearing page streams: **990 divisions**. The only exact remainder is the pre-existing **p39 red triple → p29**. No second red-span/page zero-remainder pair appears.

The stronger player-actionable variant says the opening red heading of a visual chapter encodes its own following chapter body by polynomial multiplication. All nine original red-heading/body cuts (p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55) have **nonzero remainders**; respectively **12, 15, 11, 8, 15, 18, 9, 7, 8** nonzero coefficients remain. Thus no unmodified chapter can be decoded directly with its own source heading as a polynomial divisor. The canonical p29/G 275-rune quotient still round-trips, as does a planted 275-rune GP-native source control, but the original quotient stays nonlinguistic.

[Exact-source single runnable test](../sims/lp2_redspan_polynomial_original_gate_sft.cjs). The exhaustive red-span comparison adds a finite **negative scope** and still does not authenticate polynomial division as the intended inverse. The earlier p29 page-selection objection has since been narrowed by the conditional [p28 THE / signed-DIRECTION selector](lp2-p28-the-direction-p29-selector.md), which selects p29 before the G test and then finds p29 alone carrying the repeated root24.

## Frozen inverse, original result and negative control

In GF(29), divide the original 277-coefficient polynomial `C(X)` by `G(X)` using the unique inverse of leading coefficient 15. The exact result is a **275-rune** quotient `Q(X)` with remainder `[0,0]`. Re-multiplying `Q·G` reconstructs all 277 original rune coefficients identically; this is an implementation check, not independent identification of an authentic key.

| Quantity | Original result |
| --- | --- |
| Physical original page | p29, 277 GP rune coefficients |
| Source divisor | `[15,5,27]` (highest degree first) |
| Quotient | 275 GP rune coefficients |
| Remainder | `[0,0]` |
| Original p29 index of coincidence | **0.03369434416** |
| Quotient index of coincidence | **0.03405441274** |
| Adjacent equal pairs | original **4**, quotient **11** |
| Separate signed-2013 H divisor `[24,26,3]` | nonzero remainder **[16,20]** |

The first ninety quotient runes, transliterated with the repository's unmodified GP29 convention, read:

`RGYIAJNSAESNGWFEYHEAWCDEOGUEFOETHEAGXPCPIAYWAESTHFFFJWHOBGDXOEAEGIDAIAIAOUBEAAXEAWLRYIBTYLUHNJHRRWADTLYXOEIF`

This does not resemble ordinary GP English. The nearly uniform quotient symbol collision index is inconsistent with a straightforward natural-language readout and does not reveal any recognizable instruction. The distinct signed-2013 polynomial H (from authenticated `BASE29 3301 → 3QO`) fails the same zero-remainder check for this page.

A **source-native positive implementation control** forms a 275-rune GP stream by repeating the already solved p57 original GP symbols, multiplies it by the same `G`, and divides the 277-rune synthetic cipher. The inverse recovers all **275/275** original-source control symbols exactly; multiplication restores the planted 277 coefficients. This confirms the implemented method would recover authentic GP data when such data had actually been encoded by the proposed operation.

## Source-selected 275 = 5 × 55 quotient-key consumer (Agent16, 14 November 2026)

The exact preceding `G` quotient is **275 original-source rune coefficients**. Separately, the **95 rune / 20 word** already-clear p57 `PARABLE` explicitly says to *SHED OUR OWN CIRCUMFERENCES*. Removing the first and last GP rune of each original printed p57 word leaves **55 exact source-known runes**; the [Parable page-seed study](lp2-parable55-source-interiors-page-key-gate.md) already noted the 55 source-word interiors but had not combined them with the distinct **275-rune p29 quotient**. The quotient therefore admits exactly **five source-shaped repetitions** of a 55-rune key without padding, rotation, or secret letter selection. This makes one reproducible, bounded candidate, although **no signed instruction independently selects p29, repeating this key, or additive subtraction**. Both length matches were recognized after broad exploration.

Keep the red triad's high-first divisor `[15,5,27]` and the original 277-rune p29 ciphertext unchanged. Extract the 275-coefficient exact quotient (zero 2-rune remainder). Key `K[j]` is source-native GP29 ordinal of the `j`th p57 strict word-interior rune, in original word order; for every `i=0..274`, test the two finite GP29 Vigenère inverses `P[i]=(Q[i] ± K[i mod55]) mod29`. Both are historically plausible arithmetic directions and completely reversible, using the **same nonfitted key**.

| Original 275-rune register | Full-stream GP29 IoC | Original-source language result |
| --- | ---: | --- |
| Bare p29 polynomial quotient | **0.0340544127405** | Ciphertext-like |
| Quotient **minus** p57 interiors | **0.0349834107498** | No readable plaintext |
| Quotient **plus** p57 interiors | **0.0342667551427** | No readable plaintext |

Both original inverses exactly reencrypt **275/275** quotient runes and reconstruct all **277/277** physical p29 cipher runes on multiplication by the source G polynomial. Each also decrypts a separate **275-rune source-native plant** generated from independently solved p57 prose, recovering every rune. The original outputs, including each complete 55-rune segment, remain nonlinguistic. In particular, the exact **fivefold repetition** does not recover an authentic key or an unknown plaintext block.

### All-secret five-share linear combination: 55 held-out Parable interiors

A second, stronger route treats the **five consecutive 55-rune quotient slices** as five ciphertext shares and p57's **55 independently clear interior runes** as a possible known target. Instead of guessing one Shamir interpolation point or specific five-row sum, **allow every fixed affine GP29 combination**, including a free constant:

`T_j = b + a_0 Q_j + a_1 Q_{55+j} + a_2 Q_{110+j} + a_3 Q_{165+j} + a_4 Q_{220+j} (mod29)`, for all `j=0..54`.

The six coefficients are completely secret and arbitrary over `GF(29)`, hence **29^6 possible keys** are covered by exact linear elimination with no enumerated-key scoring. The original coefficient matrix has rank **6**, but appending the actual p57 source target raises the rank to **7**. A six-pivot solution fits the six determining positions and only one other, **7/55**; the remaining **48 independently known positions** contradict every possible coefficient assignment. The fixed first-pivot representative is `[b,a0,a1,a2,a3,a4]=[21,1,10,1,20,10]`, with matching source positions `[0,1,2,3,4,5,33]`. A wholly independent **55-position planted** affine share transform with coefficients `[2,3,5,7,11,13]` is recovered **55/55** and has rank6 with zero contradictions.

This proves a more general, **key-independent exclusion**: no identical six-parameter affine combination of the **five exact p29 quotient rows** can yield the **55 known p57 word-interior runes**, even under fully secret coefficients. It does not prove the pages share a message; such an identification remains unprinted, and a nonlinear/nonstationary encoder has not been tested. The same standalone SFT recomputes both ranks and the full positive plant on original materials, passing [Windows Node22 run 43578106085](https://github.com/FlareZ123/liber-primus/actions/runs/43578106085).

**Decision:** The simple `p57 strict interiors → 55-period GP29 additive key → p29 275-rune G quotient` is now tested and negative in both fixed signs. Its source-visible lengths are a useful independently testable linkage, but after the failed original inverses they do **not** justify fitting a secret phase, arbitrary letter mapping, additional cipher layer or p29 plaintext crib. This is limited to a fixed repeating GP29 key on the exact G quotient; no different prospective historical cipher is ruled out.

[Read-only standalone CJS SFT](../sims/lp2_p29_275_parable55_direct_key_sft.cjs) · [Passed fixed-sign original-repository Windows Node22 run 43577713509](https://github.com/FlareZ123/liber-primus/actions/runs/43577713509).

## Independent quotient-function readout and p28 DH cross-check (25 November 2026)

Agent38's cross-source observation was independently recomputed from the canonical corpus and original p39 red-span annotation. The left-to-right red span is GP `[27,5,15]`; under the recorded rising-power convention this is the high-first divisor `G=[15,5,27]`. Physical p29's 277 coefficients divide exactly, leaving the same 275-coefficient quotient `Q`.

The three proposed evaluation inputs have a coherent but conditional human-solve path:

- `x=0`: physical page index 29 reduced modulo the GP field size 29. In the signed 2016 message, zero-based word 28 is THE and word 29 is DIRECTION, selecting adjacent p28/p29 under the candidate word-index/page-index convention.
- `x=18`: the least-significant BASE29 digit of 1033 (`16I`). The signed 2013 specification authenticates the BASE29 operation and the 3301 example, but the specific 1033 request/result is in a participant transcript, not the signed specification.
- `x=24`: the least-significant BASE29 digit of 3301 (`3QO`), explicitly shown by the signed 2013 specification.

The exact values are `Q(0)=5`, `Q(18)=8`, and `Q(24)=25`. These match the candidate p28 DH tuple's generator `g=5`, server public share `A=8`, and `g²=25`. This is a real arithmetic correspondence with independently visible inputs, not evidence that `Q` is plaintext or that the DH example is an LP2 key. The page selector and p28 DH interpretation remain conditional; no source instruction specifies what to do with the resulting DH state.

The natural complete readout of a degree-28 function over GF(29), evaluating `Q(x)` for every `x=0…28`, is:

`[5,21,25,0,8,12,27,13,16,10,6,19,2,9,6,4,24,26,8,1,21,18,18,10,25,12,4,22,8]`

It has only 20 distinct outputs and transliterates to `CNGAEFHEOIAPTIGMTHNGRAYHUNGEEIAEEOROEH`; this is not plaintext or a permutation alphabet. The simplest literal “DIRECTION means take the formal derivative” check also fails as a direct receiver: `Q′(0), Q′(18), Q′(24) = [23,8,12]`, and the complete derivative readout is nonlinguistic. No additional derivative variants are justified.

For completeness, reducing 1033 and 3301 modulo the p28 DH prime 23 gives exploratory inputs 21 and 12, for which `Q(21)=18` and `Q(12)=2`. The latter equals the candidate DH shared secret; the former requires interpreting 18 as `A−B (mod 29)`. These cross-modulus points are not part of the core result: the polynomial is over GF(29), the source does not prescribe feeding mod-23 residues into it, and `A−B` is not an independently selected DH output. Do not count them as further confirmations.

**Decision:** retain the three-point match as a possible cross-source checksum or intermediate-state clue. The full function readout and direct derivative do not recover text. Do not launch further key/cipher searches from this relation until an independent source selects a next operation and a held-out prediction. The runnable SFT emits and asserts the complete quotient-function and derivative vectors.

## Decision and reproducibility

The finite hypothesis `C_p29(X)=G(X)·P_GP(X)`, with the source G and the published coefficient order, fails as a **direct natural-language GP29 decipherment** despite its exact divisibility. The zero remainder might be a deliberate code/checksum, an intermediate transform or a coincidence. The p32/p33 `THEIR RISE` chain now supplies both an independent p29 source selector through the +a clause translation and a source-visible p39 coefficient direction: the printed `[27,5,15]` takes rising powers left-to-right, giving `G(X)=27+5X+15X^2=15(X-24)^2`. This resolves the earlier root24/root23 orientation fork. A value-changing opcode, outer key, decoding register and stopping rule remain absent, and every direct quotient consumer tested here remains negative. Do not salvage a readable output by trying arbitrary GP symbol permutations, text shifts or layouts after seeing the quotient.

Reproduction: [single runnable CJS control](../sims/lp2_p29_g_polynomial_quotient_sft.cjs) using the existing canonical JSON and solved p57. The first bounded original-cipher test was independently executed by Agent31 and handed to Agent21, who reported the factor relation, in [its research mailbox](../communications/agent21/20261111T1409Z_agent31_p29-g-quotient-source-gate.md).

This is supporting research in `im-results/`. It does **not** change the established manuscript-state synthesis in `results/README.md`.
