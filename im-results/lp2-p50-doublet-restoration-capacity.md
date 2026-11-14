# p50 256-byte table: capacity of an arbitrary missing-doublet sidecar

**Decision (14 November 2026, Agent25): a necessary information bound, not a decryption.** The original anti-doublet anomaly can motivate a lossless encoder that suppresses repeated adjacent ciphertext runes. A natural candidate is that the separately printed p49–51 256-byte table records where to restore suppressed copies. A fully arbitrary position list cannot fit into those **2,048 literal data bits** if the restored stream is to exhibit even the 1/29 same-symbol adjacency rate of a uniform GP29 stream. This constrains one concrete sidecar architecture; it recovers no hidden page, plaintext, key, or authored rule selecting duplicate suppression.

## Source and minimal reversible model

The 55 rune-bearing unknown LP2 pages contain **12,956** printed ciphertext runes and **86** adjacent identical-rune pairs among **12,901** within-page adjacencies. After splitting into maximal same-rune runs, there are **12,870** independently restorable runs. The original numerical pages p49–51 display **256 two-character tokens**, each having an accepted base60 interpretation as one byte 0–255. The exact table reading, its alternative radix59 interpretation and the lack of a creator-authenticated byte instruction are documented in [the source table](../resources/liber-primus/lp2-grid-256.json) and [its glyph adjudication](lp2-grid-11-original-glyph-adjudication.md).

Freeze this hypothetical lossless mechanism: the ciphertext is obtained by deleting zero or more copies of each symbol **within an already-existing maximal run**, retaining at least one representative. To restore it, assign a nonnegative count of extra copies to each of the **12,870** visible runs. If exactly **k** copies are absent, the number of distinct restored streams, with the visible retained run sequence fixed, is

\[
{12870+k-1\choose k}.
\]

This is an exact stars-and-bars count for a fully unrestricted allocation of k missing copies across surviving runs. Adjacent duplicate positions inside the same run are indistinguishable, which is why the run count, rather than the raw rune count, is the correct number of compartments. Its base-two logarithm is the minimum fixed-length information needed to specify **every possible** restored stream in this family. It does not claim that the true manuscript was produced by this operation.

## Original-input capacity decision

| Original-corpus calculation | Value |
| --- | ---: |
| Literal p50 table interpretation | 256 bytes = **2,048 bits** |
| Largest k with all restored sequences addressable | **297 inserted copies** |
| Bits at k=297 | **2,042.84644** |
| Bits at k=298 | **2,048.31191**, already too many |
| Original same-symbol adjacency rate | **86/12,901 = 0.6666%** |
| Maximum restored rate under unrestricted 2,048-bit budget | **383/13,198 = 2.90195%** |
| Restorations needed to reach the uniform GP29 rate of 1/29 | **372** |
| Arbitrary-location bits at k=372 | **2,440.62334** |
| Shortfall at k=372 | **392.62334 bits** |

The required 372 follows exactly from \((86+k)/(12901+k)\ge1/29\), because each inserted identical rune creates one extra adjacency and one additional equal pair. Thus a standalone 256-byte table cannot represent all arbitrary missing-copy locations for a stream with at least this ordinary GP29 adjacency rate. At least **75** additional copies beyond the 297-copy universal capacity would require a location rule, supplementary side information, or a narrower source distribution.

The 1/29 comparison is a **reference model**, not an assumption that the unknown plaintext must be uniform. The data do not fix how many copies, if any, are truly absent. If the true restored stream has an equality rate below about 2.9%, or if the missing positions are determined by a compact algorithm/key, the same 256 bytes may suffice. A byte value could also be part of a different alphabet or coding interpretation. No cryptographic claim follows from the numeric alignment of p50 and the anti-repeat anomaly.

## Stronger source-word restriction: at most one removed copy per word

A natural rescue is to retain the original 2,896 complete printed word boundaries and permit **at most one** suppressed repeated-rune copy in each word. This is much more restrictive than allocating copies arbitrarily among all 12,870 page-local runs. The original word transcript has **12,956 symbols**, **63 within-word adjacent equalities**, and **12,893 maximal same-symbol runs** across all words. A word with `r` original maximal runs has exactly `r` distinct results from inserting one identical copy, plus one unchanged result. Therefore the exact count of books with **k selected words, one extra copy per selected word**, is the coefficient of x^k in

\[\prod_{w=1}^{2896}(1+r_w x).\]

The logarithmic coefficient is evaluated by a stable dynamic program on the **original 2,896 run counts**, with no Monte Carlo or assumed language frequencies. This restriction also fails the standalone 256-byte capacity bound:

| One-copy-per-word original-input calculation | Value |
| --- | ---: |
| Maximum restorations whose **every** placement fits in 2,048 bits | **304** |
| Bits at k=304 | **2,046.75851** |
| Bits at k=305 | **2,051.95991** |
| Bits at k=372, the same page-local uniform-GP29 reference target | **2,388.81819** |
| Shortfall at k=372 | **340.81819 bits** |

This rules out a complete *arbitrary* sidecar for the target even with **one** deleted copy per source word and all printed word breaks retained. It does not exclude a source-keyed deterministic choice of which words and runs lose copies, or a narrower plaintext distribution. A word-restricted sidecar can potentially cover 304 arbitrary copies, compared with 297 in the run-unrestricted model; that capacity increase is too small to reach the 372-copy target. The test uses the original word inventory, including cross-page word joins, and measures the restoration count in the same page-local reference convention as above.
## Research consequence

The route **“p50 bytes explicitly encode an unrestricted list of the withheld duplicate sites”** is capacity-inadequate under a uniform-GP29 restoration target. Pursue it further only if an original-source instruction specifies a **predictable removal rule**, a much sparser underlying repeated-symbol rate, or another independently accessible sidecar. Guessing positions from the 256 values without such a rule leaves the actual inverse unconstrained. A key-supplied stateful encoder remains possible and could be more useful than either a raw deletion map or an additional fitted cipher layer.

**Reproducer:** [standalone Node22 CJS source gate](../sims/lp2_p50_duplicate_restoration_capacity_sft.cjs) reads the exact existing LP2 indices and 256-byte table, asserts all original counts, checks the exact composition and word-polynomial bounds and two toy positives, and prints the complete capacity decision.
