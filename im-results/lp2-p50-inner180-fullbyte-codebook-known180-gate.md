# Original p50 inner180: even a secret 256-entry byte→GP codebook cannot label clear p56+p57

**Agent 39, 17 November 2026. Evidence:** exact original-source, authenticated-known-plaintext algebraic exclusion. **Outcome:** all four natural ring-interior directions contradict a fully secret stationary 256-byte-to-GP29 lookup. The unknown LP2 ciphertext remains unsolved.

## Why the test has a plausible route to authentic p55 plaintext

The original LP2 p49–51 numeral artifact is a 32×8 table of 256 two-character tokens, physically printed across scans 66–68.jpg. Taking off its outermost one-cell border, as the clear p57 PARABLE explicitly invites by speaking of shedding circumferences, leaves a **30×6 interior of exactly 180 cells**. Independently, the adjacent p56 and p57 contain **85 solved GP29 plaintext runes plus 95 clear GP29 runes = 180**. The outer border contains **76 cells**, exactly the number of original encrypted p55 runes.

A particularly simple consumer says that each numeric *byte* in the table identifies an ordinary GP29 plaintext rune through a fixed, entirely secret lookup, and that the inner180 is a known alignment which would teach that lookup for later decoding the outer76. The source gives a human reason to try the interior and a complete independent 180-rune target, while supplying no actual byte→GP29 mapping. The direct **256-entry** lookup here is deliberately more permissive than an arbitrary substitution of the byte's residue modulo29, which was excluded by the 2013 missing-prime known180 study. An arbitrary many-to-one mapping `f:{0,...,255}→{0,...,28}` needs no guessed table or cryptographic assumption: whenever two original inner cells hold equal byte values, they must map to equal known GP runes.

## Direct, source-natural unknown-key test

Read the original table as conventional base60 or the physically plausible f-omitting base59 alternative. For each radix, extract the printed 30×6 interior in row-major and column-major order, both forward and reversed. Reproduce p56's exact 85-rune authentic GP29 plaintext with its prime-totient offset and sole plaintext-F bypass at local position 56, then append p57's exact 95 directly clear runes. Do not use the 76 unknown p55 rune labels to estimate the codebook or select a favorable alignment.

For one fixed layout, let `n(b,p)` count how often byte value `b` is paired with original known plaintext rune `p`. The maximum possible number of matches for **any** 256-entry codebook, even chosen *after seeing all known plaintext*, is

`M = sum_b max_p n(b,p)`.

It is an exact upper bound requiring zero key search. The two numeric bases have the same token-equality partition on the original table, so they give the **same** key-independent bounds.

| Interior reading | Distinct byte values / 180 cells | Most any secret codebook can match | Unavoidable contradictions |
| --- | ---: | ---: | ---: |
| Row-major, printed | 127 | **133 / 180** | **47** |
| Row-major, reversed | 127 | **131 / 180** | **49** |
| Column-major, printed | 127 | **132 / 180** | **48** |
| Column-major, reversed | 127 | **131 / 180** | **49** |

**Stronger original layout clocks.** Grant the secret lookup a distinct, completely arbitrary 256-byte alphabet for **each of the three original printed image sheets** (the table really spans 10 rows on p49, 13 on p50, nine on p51). Equal byte values need only agree *within* their original physical page. The maximum original known plaintext matches still are **165, 166, 165, 166/180** in the same four natural reading orders. Thus **14–15 known GP rune positions are impossible even with a new full codebook per original sheet**. More permissively, key the dictionary by **each of the six original interior table columns**: the maxima become **172, 174, 173, 172/180**, so **6–8 irreconcilable known outputs** remain. By contrast, separately keying the lookup by **each of 30 original interior rows** fits all180 known symbols, since every original `(row,byte)` pair is then unique; that apparent fit has no training discrimination and supplies no independently selected p55 receiver. These three *source-visible* state clocks are direct extensions of the same exact arbitrary-secret-codebook upper bound, performed once without learned keys or a new ciphertext search. The [updated source SFT](../sims/lp2_p50_inner180_bytecodebook_known180_sft.cjs) asserts these exact page/column/row maxima for both table radices.

These four results hold identically for base59 and base60. Every single original orientation is algebraically incompatible with an exact stationary byte→GP29 receiver, even if the hidden lookup is noninjective, nonlinear, and completely unrestricted. A synthetic **180-rune authentic GP-native p56+p57** control encodes each plaintext value as distinct byte `5+7×GPindex`, learns the entire mapping, and reproduces all **180/180** true symbols exactly. That demonstrates that a genuinely encoded English GP message would pass the same equality ceiling.

## Cipher decision

The literal p50 **inner180 known-plaintext training → stationary 256-entry secret byte lookup → outer76 p55 decoder** is impossible under all source-natural row/column and direction conventions. The same exact contradiction survives even when the mapping is allowed to change independently between original printed table pages or between printed interior columns. This removes a broadly permissive lookup architecture which the earlier **29-entry** codebook exclusion did not logically cover. The original page typography does not authorize a varying lookup per position, a secret transposition of cells, multiple key clocks, an interleaved binary format, or a nonlinear position-sensitive state machine. Such mechanisms remain outside the finite claim and require an independent instruction before searching.

No original p55 plaintext, key, authenticated file payload or Cicada continuation is obtained. The exact [standalone Windows Node22 CommonJS original-source reproducer](../sims/lp2_p50_inner180_bytecodebook_known180_sft.cjs) uses no arbitrary ciphertext fitting; [the prior 2013 prime-gap all-secret study](lp2-2013-gap180-p50-known180-allsecret-gate.md) documents the narrower residue-to-rune constraint, and [the existing table geometry/graph study](lp2-p50-base59-source-convergent-map.md) retains independent structural evidence.