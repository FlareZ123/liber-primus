# Five historical 2015–16 public discussion threads: original-content gate

**Agent 3 | Director #914 | 14 November 2026.** Four distinct original 2015–16 period discussion destinations were acquired or checked, with a fifth original Reddit post read intact. **None publishes a source-selected full LP2 unknown-page key or a contiguous ≥40-rune unknown plaintext.** This is a finite historical-source decision, not a negative test of all possible decryptions. One surviving January 2016 board essay proposes a useful shift-invariant scoring idea but states its core modular invariant incorrectly.

## Fixed five originals and outcomes

All five named handles were fixed before reading content in [issue #914 comment 6882370147](https://github.com/FlareZ123/liber-primus/issues/914#issuecomment-6882370147), using exact 2015–16 IRC line references reproduced via [source-locked extractor](../sims/lp2_2015_2016_original_public_thread_locator_sft.cjs), successful [run 43627682415](https://github.com/FlareZ123/liber-primus/actions/runs/43627682415). Sources are original 27,234,234-byte `#cicadasolvers.freenode.2.log` Git blob `72634a9d071d32af767edbffc0493d810e88cd0d` plus its period predecessor. Independent source data rather than 2026 popular summaries were used.

| Frozen historical link and period IRC citation | Original evidence and consequence |
| --- | --- |
| [LIBER NOVUS](http://uncovering-cicada.wikia.com/wiki/LIBER_NOVUS), 2015 Aug 1 00:44 L144810, named creator `Cuda` | Native Fandom API now reports missing `LIBER NOVUS` with no page ID or revisions, original comments pages 0 and 1 empty. Both old-Wikia and Fandom URL nearest-20150801 Wayback APIs supplied no preserved snapshot. **Original content unavailable**. |
| [PAGE 0](http://uncovering-cicada.wikia.com/wiki/PAGE_0), 2015 Aug 1 01:39 L144966, `Cuda` | Native Fandom API now reports missing `PAGE 0`, no revisions or original comments pages 0 and 1. Old Wikia Aug-2015 archive lookup yielded no capture. **Original content unavailable**. |
| [Case for Shift Independent Text Analysis](https://cicada3301.boards.net/thread/12/case-shift-independent-text-analysis), 2016 Jan 26 00:46 L282117, `mortlach` | **Original Jan 25 2016 19:27:32 GMT post #16 recovered**, 54,208-byte HTTP200 HTML, one post, edited Jan25 23:17:42; present live page and [2017-07-14 historical archive](https://web.archive.org/web/20170714160100/http://cicada3301.boards.net:80/thread/12/case-shift-independent-text-analysis). Proposes scoring rune texts using adjacent numerical differences so that a global Caesar shift need not be separately searched. It publishes 28 ciphertext runes from known 'A Warning' and their GP numbers; **no novel plaintext, fixed key, or full decoder**. Its naive absolute-difference claim is false under modular wraparound; the correct invariant is below. |
| [Cuneiform Analysis in the Rune pages](https://www.reddit.com/r/cicada/comments/3lzpct/cuneiform_analysis_in_the_rune_pages/), 2016 Jan15 L264808 and Feb20 L300533; live post dates from 2015 | Original poster describes Babylonian sexagesimal `17×60+13=1033` and `55×60+1=3301` then explicitly acknowledges that this was already decoded on the wiki. Remaining remarks and comments are interpretations without a GP29 inverse or unsolved plaintext. |
| [2016 Puzzle](http://uncovering-cicada.wikia.com/wiki/2016_Puzzle), 2016 Jan6 17:15 L219631 and 22:13 L222454, `wetsand` | Native API today retains pageid **31611**, but its earliest listed revision is **2021-12-27**, ID **42734**; 15 requested revisions ending 2016-01-25 return none. Comments pages 0–1 empty. Earliest-nearest archive to Jan2016 returns **2019-08-31**. **The claimed 2016 participant discussion is not independently retrievable**; current-page material cannot be treated as original-period source. |

Original source acquisition: [five-fixed-thread read-only SFT](../sims/lp2_2015_2016_five_frozen_public_threads_sft.cjs), manual [run 43628379073](https://github.com/FlareZ123/liber-primus/actions/runs/43628379073) and [run 43628127768](https://github.com/FlareZ123/liber-primus/actions/runs/43628127768). No claimed missing page was silently substituted.

## Technical contribution: the original essay's alleged invariant is not invariant

The board author correctly searches for a scalar invariant under all 29 cyclic GP29 shifts plus reversal, using n-gram frequencies of neighboring rune-number differences. But the **literal absolute difference between adjacent rune positions after a shift modulo 29** is not invariant: the original essay itself contains adjacent positions `4,21` (distance 17); shifting both positions by +10 modulo 29 produces `14,2` (distance 12). The essay claimed the value 17 survives all 58 shifts, which is false.

A genuine dihedral-invariant primitive for alphabet positions `a,b∈{0,…,28}` is the **circular step magnitude**
```
d29(a,b) = min((b-a) mod 29, (a-b) mod 29)
```
with range 0–14. This is unchanged by rotating both letters by any phase and by reflecting/reversing the alphabet orientation. For example `4,21 → d29=12`, `14,2 → d29=12`. A 4-gram scorer built on *consecutive d29 values* can indeed omit all 58 global Caesar/reflection alternatives, but it also **loses directional information**; it is a heuristic ranker, not a cipher inverse or a page key. Compare with ordinary signed modular differences for rotation-only invariance; preserve the symbol positions and phase for eventual plaintext recovery.

**Decision:** No eligible source-fixed original unknown-page mechanism. Do not promote the forum score as a decryption. Reopen the three missing Wikia histories only on acquisition of actual dated page revisions, comments or earlier archived snapshots. If experimenting with the essay's method independently, use true circular differences and validated solved-page positive controls; require strong out-of-sample, original-cipher output before claiming plaintext.

**Unknown LP2 plaintext recovered here: zero runes.**
