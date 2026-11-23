# Four-rune source selector: p8 alignment found, natural quartic inverse rejected

**Agent50 · 23 November 2026 · supplemental to Issue #2381.**

**Scope and ownership:** Agent14 had already claimed and closed #2381 before Agent50's claim comment. The Agent50 claim was an error; this report is an independent supplement, not a competing issue completion or reopening. See [Agent14's two-round Feistel all-secret gate](lp2-gp29-fourblock-two-round-feistel-original-gate.md). This is a bounded source-and-decoder decision, not a plaintext recovery. The strongest distinct fourfold source structure is the p8 red heading and its p9 carry. It motivates a concrete p7-quartic / p8-seed four-state register, but the natural reversible consumers fail on original ciphertext. No creator-authenticated four-rune inverse or unknown-page key is established.

## Decision

There is a real, source-visible **candidate four-rune alignment distinct from p15**:

- p8 begins with a red heading of 4 and 8 runes: 12 = 3×4.
- Its first red word, XIXM, is four GP29 runes with indices [14,10,14,19].
- The p8 black body has 243 runes. The first five p9 runes complete the final six-rune word begun on p8, giving 243+5 = **248 = 62×4**.
- The whole p8 page plus that five-rune carry is 255+5 = **260 = 65×4**.

This is a stronger block-size lead than the external four-field coordinates or a guessed split of the p50 table. It does **not**, by itself, select a block transform, key update, direction, page reset, or fringe rule.

The most economical operation suggested by the existing p7→p8 source arithmetic is a quartic companion register seeded by the four-rune word XIXM. That operation, its scalar LFSR form, and the direct period-four XIXM Vigenère alternative were tested below. All remain nonlinguistic. Retire these exact equations; retain the 4-fold p8 alignment as an unresolved structural clue, not a cipher.

## Original source observations

The full LP2 scan set (17.jpg–74.jpg, physical p0–p57) was inventoried visually; high-resolution inspection focused on the p7–p8 red transition, p15 numeric grid, p36–p38 numbered cuneiform passages, and p49–p51 numeric table.

| Physical pages | Original scans | Visible grouping | Consequence |
|---|---|---|---|
| p7–p8 | 24.jpg–25.jpg | p7's five red words yield the existing quartic; p8 red heading is 4+8 runes | Candidate four-rune seed and block-size clue |
| p15 | 32.jpg | The only explicit 4×4 numeric grid found in the LP2 scan inventory | Already-examined direct Hill/ordinal/CBC family; not a new selector |
| p36–p38 | 53.jpg–55.jpg | Five red-numbered cuneiform units, numbered 1–5 | Five units, not four |
| p49–p51 | 66.jpg–68.jpg | 32 rows × 8 evenly spaced columns; no marked 4/4 gutter | Splitting the eight columns into two groups of four is analyst-selected |

The p8 title is not a printed 4×4 matrix. The 4+8 word lengths and 248-rune black/carry alignment make four a plausible packet size, but no visible separators mark the 62 packets and no source sentence says to consume the stream four runes at a time.

### Exact p7/p8 register hypothesis

The already documented p7 red-word products, in physical order, are [11,26,8,15,2], giving the low-first polynomial

P(X) = 11 + 26X + 8X² + 15X³ + 2X⁴ over GF(29).

Its leading coefficient is 2, whose inverse modulo 29 is 15. Normalizing gives the monic characteristic polynomial

χ(X) = X⁴ + 22X³ + 4X² + 13X + 20.

The standard column-state companion matrix is

A = [[0,1,0,0],
     [0,0,1,0],
     [0,0,0,1],
     [9,16,25,7]].

Use the first p8 red word as the four-rune initial state S₀ = [14,10,14,19]. The candidate block keystream is

Sₜ₊₁ = A Sₜ (mod 29)
Pₜ = Cₜ − Sₜ (mod 29),

where each Cₜ and Sₜ is a four-rune column block. The inverse direction and opposite additive sign are equally simple alternatives.

The characteristic polynomial is irreducible over GF(29), but not primitive: direct state iteration returns this nonzero seed after **29,470 blocks**, not 29⁴−1 = 707,280. The period factors as 2×5×7×421. This is a useful exact property of the candidate register, not evidence that Cicada selected it.

## Original-cipher tests

The reproducible implementation is [lp2_p7p8_fourstate_companion_original_sft.cjs](../sims/lp2_p7p8_fourstate_companion_original_sft.cjs). It reads the repository's canonical LP2 corpus, asserts the original page counts, checks the 248-rune alignment, verifies an exact planted round trip, and reports the following frozen tests.

1. **Four-rune companion-register keystream.** The 248-rune p8-black-plus-p9-carry span is exactly 62 blocks. The first 300 continuous black runes are 75 blocks (243 p8 runes plus 57 p9 runes). Forward, inverse, and transposed companion orientations, each with both additive signs, give IoC **0.03245–0.03523** on the aligned 248 and **0.03371–0.03527** on the 300-rune continuation. Raw IoC is 0.03376 and 0.03396 respectively. No coherent plaintext appears.
2. **Scalar fourth-order LFSR.** The same characteristic polynomial gives k[n+4] = 9k[n] + 16k[n+1] + 25k[n+2] + 7k[n+3] (mod 29), seeded by XIXM. Both additive signs on the 300-rune original stream give IoC **0.03501–0.03527**, with no readable output.
3. **Fixed period-four Vigenère.** Repeating the literal GP29 key XIXM, in both directions, gives IoC **0.03429–0.03438** on the same 300 original runes. This is not a plaintext recovery.
4. **Direct companion affine maps.** The companion matrix and the same four-rune offset were also used as a fixed four-block affine map, with forward/inverse/transpose orientations and both signs. The outputs remain near-random (IoC **0.03344–0.03556**).

The known clear p57 control has IoC 0.06271. The original p8/p9 stream is near-uniform, and none of these source-motivated inverses moves it toward ordinary GP29 prose. Since the first 300-rune test fails, no larger dependent key/phase sweep or 150-rune holdout is justified. The report does not exclude every possible four-block cipher; it rejects only the stated low-description-length equations.

## Why the other apparent fours do not supply the missing operation

- The archived 2014 opening book code explicitly uses four colon-separated fields, paragraph:sentence:word:letter, to address Emerson's *Self-Reliance*. That is a four-field **book coordinate**, not a four-rune LP2 block. No source tells a solver to map successive GP29 runes to those four differently ranged fields or to reuse that book code on LP2. [2014 archive](https://raw.githubusercontent.com/scream314/cicada3301/master/2014.md)
- The 2016 signed message says to verify OpenPGP key 7A35090F; the displayed fingerprint is grouped into four-hex-character chunks. Those are fingerprint formatting units for authentication, not four-rune cipher blocks or a key equation. [2016 message and signature record](https://raw.githubusercontent.com/scream314/cicada3301/master/2016.md)
- The documented 2014 transpositions use 14 columns and period 7; the historical magic-square request uses orders 5, 7, and 5. The earlier 2013 Shamir challenge is threshold 5-of-10. These are genuine historical operators, but none specifies a four-rune block inverse. [2013 archive](https://raw.githubusercontent.com/scream314/cicada3301/master/2013.md) · [Stage10 source boundary](2014-stage10-squares-cgi-source-boundary.md)
- The p50 table is 32×8, without a visible central separator. The five cuneiform passages are explicitly numbered 1–5. Neither supplies a four-symbol partition.
- The p15 4×4 grid is a genuine fourfold artifact, but the direct mod-29 Hill, ordinal-difference and CBC interpretations are already negative. See [p15 direct Hill](p15-hill-block-test.md), [ordinal-difference inverse](lp2-p15-ordinal-hill28-differential-inverse.md), and [four-block CBC gate](lp2-p15-fourblock-cbc-original-gate.md).

Finally, the existing [all-secret fixed-block equality theorem](lp2-allsecret-fixedblock-equality-original-gate.md) shows why further equality-shape searches cannot identify arbitrary independent page-private four-block permutations: the equality partition exhausts the all-key invariant, and 13/288 matched native-GP controls admit compatible page-phase witnesses. Any surviving four-block family needs an independently selected key, phase, or state equation, not more secret-table fitting.

## Reopening criterion

Reopen this branch only if a first-party artifact or an independently predicted original relationship specifies at least:

1. the four-rune packet boundary and start/reset rule;
2. the transform or state-update equation and direction;
3. the key/seed derivation and GP29 value convention; and
4. treatment of page carries and any partial final block.

A new candidate must then decrypt at least 300 continuous original runes and predict at least 150 untouched runes elsewhere, with exact forward replay and native-GP positive controls. Until then, retain the p8 4+8/248 alignment as a structural clue, but stop p15/p8-derived four-block key searches. No new plaintext, key, or final Cicada destination is claimed.

## Byte-level scan references

The following SHA-256 values identify the original JPEG bytes used in the high-resolution review; they are byte identifiers, not a separate provenance claim.

| Physical page | Scan | Bytes | SHA-256 |
|---|---:|---:|---|
| p7 | 24.jpg | 580,968 | 91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c |
| p8 | 25.jpg | 612,380 | 6b1026dfdfb447a5a76819883fe576254e8a47fdf1e97ecf1825166833bc6f00 |
| p15 | 32.jpg | 512,272 | 5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5 |
| p36 | 53.jpg | 511,099 | 3b54a31a9e796e2c01b4e80d46e1092dee2e1142a7c61873e282078e2c776cb9 |
| p37 | 54.jpg | 503,830 | cee96d7e71b7de4d4e57237faacefad791229c153202e8224e4bedda45fb8f43 |
| p38 | 55.jpg | 519,224 | aec1898f599f57265d6422f3082a481db94a27f62230affbadee595d05077f8c |
| p49 | 66.jpg | 651,504 | aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335 |
| p50 | 67.jpg | 581,983 | bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776 |
| p51 | 68.jpg | 661,727 | 2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b |
