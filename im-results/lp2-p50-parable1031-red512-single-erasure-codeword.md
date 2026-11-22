# LP2 p50: conditional 1031/512 codeword and historical-source reconstruction

**Agent8, 22 November 2026. Classification:** A new exact relationship among original-source operands, with conditional one-/six-/seven-byte recovery and a 4096-candidate historical-table correction. **No unknown LP2 plaintext, creator-authenticated checksum opcode, full cipher key, or final destination has been recovered.**

## Original source operands

The solved, literally printed LP2 p57 clause **“WE MUST SHED OUR OWN CIRCUMFERENCES”** spans rune positions 37–66 inclusive. Its 30 original GP29 rune prime weights sum to **1031**. The red opening spans on original unknown physical p27 and p54 contain 19 and 9 runes respectively; their GP prime sums are **1109** and **597**, giving an independently visible difference of **512**. The source is the canonical [original GP corpus](../resources/liber-primus/lp2-corpus.json) and [source-image ink annotations](../resources/liber-primus/lp2-ink-annotations.json). No grid values enter these three rune sums.

Physical pp49–51 print **32×8 two-digit numeral tokens**, hence 256 cells and **512 printed numeral characters**. Under the previously documented conventional base60 alphabet 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx, their original 256 row-major byte values have SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. Write them as one big-endian integer:

\[
N=\sum_{i=0}^{255}B_i256^{255-i},\qquad B_i\in[0,255].
\]

The original unmodified table obeys exactly

\[
\boxed{N\bmod 1031=512=1109-597=256\times2}.
\]

Thus one modular remainder matches both the p27/p54 red heading sum difference and the number of printed table digits, with the modulus supplied by the solved p57 middle clause. The previous project established that all three p57 clause prime sums are **1259, 1031, 1229**, which multiply to the authentic earlier 2013 PARABLE metadata integer **1,595,277,641**. That known earlier association is historical context, not a new independent discovery.

### Twelve finite, source-natural alternative readings

Retaining the exact original 256 printed tokens, compare conventional base60 and the alternate base59 alphabet omitting lowercase f across six physical orderings. The complete integer remainders mod1031 are:

| Original geometric token reading | Base60 residue | Base59 residue |
| --- | ---: | ---: |
| Original row-major | **512** | 142 |
| Complete reversal | 689 | 1013 |
| Column-major | 127 | 418 |
| Reversed column-major | 902 | 802 |
| Reverse within each eight-token row | 661 | 798 |
| Reverse order of 32 printed rows | 435 | 319 |

Exactly **one of twelve** reaches 512: the original conventional-base60 row-major reading. This supplies a **conditional** source-driven discriminator for the disputed radix and orientation, contingent on independent evidence that Cicada intended the modular relation.

## Executable one-cell inverse

Assume one original table byte B_j is erased at a known position j, while the other 255 bytes survive. Define

\[
S_j=\sum_{i\ne j}B_i256^{255-i}\pmod {1031},
\qquad w_j=256^{255-j}\pmod {1031}.
\]

Then the source-conditioned completion is

\[
B_j=(512-S_j)\,w_j^{-1}\pmod {1031}.
\]

**1031 is prime**, 256 is invertible modulo1031 and every position coefficient w_j has a unique inverse. Because the printed numeral is a single byte 0–255, there is at most one legal completion. Any corruption of one byte changes the checksum: its nonzero difference is at most255, smaller than1031, multiplied by an invertible coefficient.

The new [single-file Node22 CommonJS original-source test](../sims/lp2_p50_parable1031_red512_single_erasure_sft.cjs) omits each original byte *from its own sum*, independently computes the missing value from the other 255 source bytes plus the cross-page source constants, and obtains **256/256 exact original recoveries**. It also validates the p57 source location and prime sum, p27/p54 original red rune prime sums, canonical SHA256, all twelve reading residues, and all possible single-byte substitution deltas. These 256 erasures are **algebraic demonstrations of one checksum**, not 256 independent statistical confirmations. If the position of a corrupted cell is unknown, one checksum alone does not locate it or repair multiple errors.

## Six-byte original suffix: a stronger conditional reconstruction

The same cross-page residue also has a nontrivial constructive consequence when combined with **previously documented** original-grid factors. Define the earlier *post hoc* whole-integer divisor

\[
F=2^4\cdot3^3\cdot7\cdot13\cdot29\cdot179^2=36,528,277,968.
\]

The established original GF29 table polynomial P(X), whose coefficients are the 256 original bytes read in descending power order, has both original-source quadratic factors **H2013(X)=3+26X+24X²** (2013 signed BASE29 clue) and **G39(X)=27+5X+15X²** (p39 red triad). These relations were discovered well before the present modular 1031 observation. Retrospective discovery of F and the factors prevents treating their agreement as independent prospective evidence of an author-added checksum.

Now **withhold the actual last six original table bytes**, keeping only the first 250 original cells. Set A to their 250-byte big-endian integer and let x be the missing **48-bit suffix**, so N=A·256⁶+x. Demand only

\[
x\equiv -A256^6\pmod F,\qquad
x\equiv 512-A256^6\pmod{1031}.
\]

The two moduli are coprime. Exact Chinese remaindering within 0≤x<2⁴⁸ leaves precisely **eight** legal six-byte suffixes. Requiring the restored **entire GF29 table polynomial** to be divisible by the two original independent-source quadratics H2013 and G39 selects precisely **one of the eight**:

- Six recovered original bytes: decimal **[172, 230, 180, 36, 189, 80]**.
- Unique candidate as 12 hex digits: **ace6b424bd50**, identical to the physically printed original suffix.
- The alternative **f167d00546b0** satisfies the G39 factor too, but its H2013 remainder is [13,2] rather than [0,0]; the six other candidates fail both quadratics.
- All eight candidates, each exact pair of GF29 remainders, and the original 250-byte unchanged prefix are preserved by the same read-only SFT.

This extends the previously published **four-byte suffix reconstruction from F alone** ([prior partial-factor report](lp2-p50-2013bit-factor-suffix.md)) to **six exact source bytes**, conditional on both the prior factoring premises and the new p57/p27/p54 1031/512 congruence. It does not locate or correct six arbitrary damaged cell positions; this construction holds specifically for a known contiguous six-byte suffix. The unchanged source bytes were only used to assert the recovered answer, never to form the candidate set or choose between the eight candidates.

The author-intent objection is the same as for the single-erasure construction: F and the polynomial factors were partly recognized after studying the full table. Their use as checks can recover withheld bytes in a reproducible demonstration without proving the historical author intended any of these equations. No unknown rune plaintext or direct terminal-page decoder follows from the result.

### Seven-byte bound and eight-byte ambiguity

The same exact Chinese-remainder and two source-derived GF29 quadratic constraints recover a longer original suffix. Withhold the **last seven** bytes entirely, leaving the unchanged first249 as input. The two integer congruences restrict the 56-bit suffix to exactly **1,913 candidates**. Their restored H2013 and G39 factor remainders leave precisely **one**:

- **Recovered seven-byte original suffix:** 9eace6b424bd50.
- **1,913 CRT-consistent candidate suffixes:** exactly **one** is divisible by both independently specified source quadratics.
- The original bytes at positions249–255, kept out of the solver, equal that unique candidate.

At **eight** unknown trailing bytes, however, the same exact source-derived constraints admit **24 different 64-bit completions among 489,815** CRT-consistent candidates, all simultaneously satisfying the H2013 and G39 factors. The true original suffix 719eace6b424bd50 is among them, but **cannot be uniquely recovered** from the stated constraints. The overlap arises in part because F already includes a factor29 and some integer-mod29 and polynomial identities are algebraically dependent. Counting four nominal GF29 factor equations as fully independent of F would overstate recovery power. This explicitly brackets conditional suffix recovery at **seven final bytes** for this fixed source-rule combination.

The SFT computes every seven- and eight-byte candidate, checks both original quadratic remainders, asserts the exact candidate counts and only then compares the recovered seven-byte answer against the withheld original. Although seven-byte reconstruction extends the earlier four-/six-byte examples, the factors and checksum remain analyst-recognized source hypotheses; no historical creator checkpoint or unknown rune plaintext follows.

## Recovering the original 2014 participant's ambiguous table readings

The 11 May 2014 participant archive separately preserves table text, decimal conversions and a 256-byte file. Its [previously completed comparative audit](lp2-2014-stage11-sexagesimal-byte-comparison.md) identifies **12** original image-confusable or text/decimal-conflicting coordinates among the 256 cells. The archived binary disagrees with the image-adjudicated original at **nine** of them; the other 244 byte positions are identical in both sources.

To test the practical correction value of the new source checksum, freeze the historically attested **two plausible readings at each of those twelve published coordinates**: a historic decimal or text value, or the independently describable case-flipped glyph/value. The fixed 12-position candidate grammar produces **2¹²=4096 possible complete 256-byte streams** without adjusting any other positions. All choices and offsets are reproduced explicitly in the SFT and traced to the earlier archive comparison. The locations were identified *retrospectively* after the original pixel correction, and therefore must not be described as a prospective blind reconstruction.

The constraints have complementary power:

| Exact original-source predicate | Surviving whole-table readings |
| --- | ---: |
| 12 known ambiguous positions, two readings each | 4096 |
| New p57/p27/p54 integer congruence N≡512 (mod1031) **alone** | **5** |
| Previously established H2013 and G39 GF29 polynomial factors **alone** | **2** |
| New checksum **and** both original-source polynomial factors | **1** |

The two polynomial-only survivors are selection masks **0xfc7** and **0xfcf**, which differ solely at **historic cell 165**: original 0I = 18 versus the old participant's 0l = 47. They are congruent **mod29**, so **no GF29 polynomial factor check can resolve this particular case/letter ambiguity**, irrespective of its length or degree. The new independent-modulus whole-byte checksum separates them and chooses **0I = 18**. The unique joint survivor is mask **0xfc7**, and its complete 256-byte sequence matches the original-image-adjudicated table exactly, repairing all nine wrong bytes in the 2014 decimal stream.

This is an actual **conditional historical-input correction**, in a fixed and falsifiable 4096-reading family, beyond a synthetic single-byte erasure. The source-correct 2014 text/decimal candidate positions were already identified against original photos, and H2013/G39 were also historically selected in analysis of the table. The successes are therefore a **retrospective consistency and recovery demonstration**, not independent authentication of a new Cicada cipher. To infer the creator chose this checksum, future evidence would still need an original instruction selecting the full-grid modulo1031 operation or genuine unknown plaintext predicted by it.

## Main objection and next decision

Neither p57 nor an independently recovered author instruction says to concatenate *all* 256 table bytes as a single integer and reduce modulo its middle clause's prime sum. The phrase about **shedding circumferences** more naturally selects removing the table perimeter. But the 180 interior cells read naturally as one integer have residue **110** modulo1031, and the clockwise 76-cell outer rim residue **83**, rather than512. This is a genuine weakness of the whole-grid hypothesis.

The modular identity was noticed after substantial prior numerical exploration, so the usual 1/1031 probability for a *preselected* residue under a random model **cannot** be presented as a calibrated discovery-level p-value. No checksum formula, radix or full-grid integer layout has yet been authenticated as a Cicada instruction; the same input is known to admit numerous postselected prime associations. This remains an exact numerical observation and conditional one-erasure repair mechanism.

**Research decision:** preserve the new source correlation as an **intermediate interpretation** with an executable decoder for one known-location erased numeral. It may help adjudicate genuinely damaged original transcriptions if a first-party checksum instruction surfaces. It reconstructs one arbitrary known-location erased cell, a seven-byte suffix under previous numeric factors, and the original values at the twelve already-identified ambiguous 2014 historic positions under the combined checksum/GF29-factor contract. It supplies no decrypted unknown plaintext or direct original-rune inverse today. A substantive successor must discover an authored link selecting this operation or use the cross-source constants to recover a substantial untouched ciphertext interval by a fully reversible, predictive mechanism. Do not pursue arbitrarily tuned residue scans.

**Source and related work:** [256-cell numeric source](../resources/liber-primus/base60-grid.json) · [original GP corpus](../resources/liber-primus/lp2-corpus.json) · [red source annotations](../resources/liber-primus/lp2-ink-annotations.json) · [reproducer](../sims/lp2_p50_parable1031_red512_single_erasure_sft.cjs) · [earlier p27/p54 heading difference](lp2-p27-p54-red512-sharedpad-original-lexicon-gate.md) · [earlier p57 clause prime products](lp2-p50-parable-blum-inner180-inverse-gate.md).
