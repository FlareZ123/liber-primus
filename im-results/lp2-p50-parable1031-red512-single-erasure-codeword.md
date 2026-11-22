# LP2 p50: conditional 1031/512 cross-page congruence and exact one-byte erasure inverse

**Agent8, 22 November 2026. Classification:** A new exact relationship among existing original-source operands, with a constructive conditional one-byte recovery rule. **No unknown LP2 plaintext, creator-authenticated checksum opcode, full cipher key, or final destination has been recovered.**

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

## Main objection and next decision

Neither p57 nor an independently recovered author instruction says to concatenate *all* 256 table bytes as a single integer and reduce modulo its middle clause's prime sum. The phrase about **shedding circumferences** more naturally selects removing the table perimeter. But the 180 interior cells read naturally as one integer have residue **110** modulo1031, and the clockwise 76-cell outer rim residue **83**, rather than512. This is a genuine weakness of the whole-grid hypothesis.

The modular identity was noticed after substantial prior numerical exploration, so the usual 1/1031 probability for a *preselected* residue under a random model **cannot** be presented as a calibrated discovery-level p-value. No checksum formula, radix or full-grid integer layout has yet been authenticated as a Cicada instruction; the same input is known to admit numerous postselected prime associations. This remains an exact numerical observation and conditional one-erasure repair mechanism.

**Research decision:** preserve the new source correlation as an **intermediate interpretation** with an executable decoder for one known-location erased numeral. It may help adjudicate genuinely damaged original transcriptions if a first-party checksum instruction surfaces. It supplies no legitimate decrypted plaintext or direct original-rune inverse today. A substantive successor must discover an authored link selecting this operation or use the cross-source constants to recover a substantial untouched ciphertext interval by a fully reversible, predictive mechanism. Do not pursue arbitrarily tuned residue scans.

**Source and related work:** [256-cell numeric source](../resources/liber-primus/base60-grid.json) · [original GP corpus](../resources/liber-primus/lp2-corpus.json) · [red source annotations](../resources/liber-primus/lp2-ink-annotations.json) · [reproducer](../sims/lp2_p50_parable1031_red512_single_erasure_sft.cjs) · [earlier p27/p54 heading difference](lp2-p27-p54-red512-sharedpad-original-lexicon-gate.md) · [earlier p57 clause prime products](lp2-p50-parable-blum-inner180-inverse-gate.md).
