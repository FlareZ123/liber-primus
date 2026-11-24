# Adjacent-word table-row-coupled BASE29 inverse

**Agent48, 24 November 2026.** Bounded original-cipher result: every one of 1,024 common offset keys was evaluated on the specified training register; four independent original-width native controls recovered exact keys and all runes. The frozen original key produces no connected plaintext. A stronger all-row envelope makes further offset/transition fitting unproductive for this exact additive integer-row architecture. No authenticated unknown LP2 plaintext, key or destination.

## Why this particular operation

The signed 2013 example authenticates positional BASE29 (3301 → 3QO), while the original LP2 numeric table has 32 physical rows of eight two-character cells. The two red complete opening words fix a natural adjacent-word pairing. Prior [linear adjacent-word integer shears](lp2-wordpair-base29-endpoint-allsecret-original-gate.md) reduce to a stationary bijection of terminal rune pairs; the recently closed [#2479](https://github.com/FlareZ123/liber-primus/issues/2479) instead assigns physical rows using an independent LCG word-history clock and per-digit addition. This experiment uses **the full partner word integer to select the table row, plus ordinary integer addition with carry**, escaping both exact premises. This is an exploratory consumer: no first-party instruction selects the radix60 interpretation, row-index reduction, partner coupling, or offset key. The source-supported operation is positional conversion; the composition is a hypothesis.

## Exact frozen inverse

Read each original printed row as eight radix60-decoded bytes, in physical order, then interpret the eight bytes as one big-endian unsigned integer R[s]. Read all 2,896 complete rune words as BASE29 integers of their actual widths, retaining leading zeros and all 32 page-crossing words. Pair words 0/1, 2/3, etc. continuously (1,448 pairs). For a pair of widths l,m let M=29^l, N=29^m. Two shared unknown offsets a,b range independently from 0 to 31.

    C1 = (P1 + R[(P2+a) mod 32]) mod M
    C2 = (P2 + R[(C1+b) mod 32]) mod N
    P2 = (C2 - R[(C1+b) mod 32]) mod N
    P1 = (C1 - R[(P2+a) mod 32]) mod M

The inverse is exact even for unequal word widths and noninjective table entries. The full partner integer modulo32 is **not** determined by its low BASE29 digit, so the earlier terminal-pair theorem does not directly apply. No per-word secret, unknown padding, or segmentation edits are introduced. All 29 rune values consume the same rule, unlike the solved p56 transparent-F cipher.

Train using only pairs wholly contained in p0–7 (first 412 complete words, 139 pairs containing 176 words of length≤3), scoring smoothed exact native-GP short-word probabilities from Gibran and Emerson. All 1,024 offset pairs are ranked. Sealed physical p16–21 and p40–53 are not used for key selection.

## Actual original inverse and controls

| Register | Complete words / runes | Exact donor dictionary hits | Rune coverage | GP IoC |
|---|---:|---:|---:|---:|
| Original train p0–7 diagnostic | 413 / 1874 | 23 | 2.1345% | .03443246 |
| Original sealed p16–21 | 372 / 1605 | 14 | 1.1838% | .03424771 |
| Original sealed p40–53 | 669 / 3008 | 17 | .8976% | .03451034 |

The unique selected key (27,17) beats the runner-up by only 1.9030 nats. The opening preview begins YTHFRGYIAEO MXSATH DIEOOE WEOC EOGN. The entire 12,956-rune output forward re-encodes exactly; that is a bijectivity check, not evidence for the key. No candidate prose appeared.

Four original-width independently sampled native plants (two genuine solved-LP native word pools, two independent Shakespeare pools), hidden keys (3,19), (29,8), (11,26), (25,2), recovered 4/4 exact keys and 12,956/12,956 runes per plant. Training margins 608.17–675.54 nats; sealed dictionary rune coverage 72.83–83.49% and IoC .05916–.06183. These width-matched plants establish key identifiability, not connected English syntax. Authentic clear p57's complete 95 runes/20 words also forward/reverse exactly with the same unequal-width algorithm.

## Key-independent stronger decision

Grant every original word an arbitrary independent row number among all 32, irrespective of pairing, key, clock, or earlier values. For ciphertext integer x of width l, its entire admissible plaintext set is { (x-R[s]) mod 29^l : s=0..31 }. Checking whether **any** of these values is an exact Gibran/Emerson GP-normalized word yields the following generous upper bound; this is not a language-independent theorem or an exhaustive English dictionary.

| Original region | Maximum possible dictionary-matching words | Maximum possible covered runes |
|---|---:|---:|
| p0–7 | 104 / 413 | 236 / 1874 |
| p16–21 | 124 / 372 | 279 / 1605 |
| p40–53 | 182 / 669 | 431 / 3008 |
| Entire book | **794 / 2896** | **1820 / 12956 (14.05%)** |

The holdout envelope is far below the realized native-plant coverage even after independently granting a row choice per word. Thus arbitrary changes to the row-selection grammar, offsets or round-index lookup cannot rescue a *single* additive integer row per final word with this fixed 32-row operand and this lexical register. Repeated rows with additional independent additions, a changed serialization, other plaintext languages and non-additive output operations are not excluded.

**Decision:** retire this specific partner-coupled table-row candidate. Require new source evidence selecting a materially different table consumer rather than optimize the row clock. [Standalone reproducer](../sims/lp2_p50_adjacent_word_rowcoupled_base29_sft.cjs), executed against the checked-in original and native control inputs in the connected JS runtime, script commit `ed569b2dfd1cac99a07951a9264dd1b88724d48f`; no independent CI claim.
