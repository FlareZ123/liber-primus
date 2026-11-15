# 2014 seven-by-seven magic square as one fixed key per cuneiform page

**15 November 2026, Agent41. Bounded original-input negative, no recovered unknown plaintext/key.** This is a finite test of a historically available operation, not evidence that Cicada intended this transfer.

## Independent key-selection premise

The archived 2014 stage07 `magicsquares.txt` contains an exact **7×7** magic square with every row summing to **1033** ([2014 archive copy](https://github.com/scream314/cicada3301/blob/master/assets/2014/stage07/magicsquares.txt)). The original LP2 physical pages **p33–39** form seven consecutive pages with a repeated cuneiform header, including a source-linked 1033/3301 number pair. A 2014 player would have had access to both artifacts. Their shared **seven** and **1033** motivate the simplest page-to-row handoff, but the author did not explicitly instruct it. This is independent of the grid-polynomial, OpenPuff, and 2015 prime-difference branches.

Freeze the historical square's original printed top-to-bottom row order, and map its seven rows to p33,p34,...,p39 in that order. On each page, use the seven printed decimal numbers in its assigned row as **additive GP29 shifts modulo 29**, repeating from page-local rune index zero. The only two tested arithmetic conventions are `plaintext=(ciphertext ± squareRow[index mod 7]) mod 29`. Each page has a fresh seven-key clock at its first original rune, with no user-chosen offsets, deletions, letter substitutions, or plaintext-dependent F bypasses. This is the simplest complete, bijective 2014-style Vigenère consumer of the independent magic-square clue.

## Exact original-cipher outcome

Unmodified input: `resources/liber-primus/lp2-corpus.json`, physical p33–39, respectively **214, 261, 271, 238, 228, 228, 240** runes, **1,680** GP29 indices total.

| Decoder | All-original GP29 index of coincidence | Exact original reencryption | Source-native GP29 positive |
| --- | ---: | ---: | ---: |
| No key (source ciphertext) | 0.03436002155478034 | — | — |
| Subtract 7-row page keys | **0.03458336878527468** | 1,680/1,680 | 1,680/1,680 |
| Add 7-row page keys | **0.034378456564281464** | 1,680/1,680 | 1,680/1,680 |
| Solved cleartext p57 control | **0.062709966405** (independent 95-rune reference) | — | — |

All seven direct-key original-page outputs remain uniform-like and contain no coherent prose. For example, subtract-key p33 opens `TXIETHOEBFITHAEAEONJAAHFIAEAMUCSIATAELNGOIANGNTIEF`, and p34 opens `TYAMNEOUTFAEIGEAESITHPNRGCBIATAEXTBAWNGRPIAFAEIA` (GP29 transliteration, including digraph labels). Native-positive exact recovery tests the arithmetic code on p57 GP29 symbols repeated to the original seven page lengths; this does not validate the historical key. Wrong source-selected sign also perfectly reencrypts, illustrating why this invariant alone proves no plaintext.

**Decision:** This exact source-fixed **per-page row-repeating GP29 additive transfer** fails. No need to add a key-phase, page-order, polynomial, or F branch without a separate source instruction. The historical 7×7 square and seven cuneiform pages could conceivably interact through another, independently specified operation; this test does not exclude that. In particular, it does not adjudicate a distinct 7×7 route or numeric-table receiver.


## Full 49-number key: two independently natural clocks

The printed seven-by-seven square supplies **49 key numbers** in source row-major order. Flattening those numbers into a single periodic GP29 additive key is **already within the broader whole-book additive family** evaluated in [the earlier OpenPuff magic-square gate](openpuff-magic-square-remaining-gate.md). The following p33–39-specific readouts compare that previously bounded direct key with the distinct one-row-per-physical-page assignment above. They must not be counted as a new mechanism or independent discovery. The two clock conventions have direct physical meaning: one continuous across all seven cuneiform pages (chapter clock), or one starting at the beginning of each original physical page (page clock). Only the two opposite original-compatible arithmetic signs are tested.

| 49-number cycle | GP29 subtraction IoC | GP29 addition IoC |
| --- | ---: | ---: |
| Chapter-continuous from p33 | **0.03474928387078476** | **0.03436994809835787** |
| Reset from each p33–39 page | **0.03443943390340055** | **0.034385546952551124** |

For all four variants the exact forward encoder restores **1,680/1,680 original ciphertext runes**, and an independent 1,680-symbol native-GP planted text decodes exactly under the true test key. No original output is recognizable running prose; all four global IoC values stay close to the uniform GP29 benchmark. The chapter-continuous subtractive opening is `TXIETHOEBRBNGDMENYOEDYPNGLINGFMTYTEOAEOETXYTHICUEOYBOESID` in GP token transliteration.

**Scope:** Together with the previous direct one-row-per-page test, this rejects **six explicitly frozen direct additive readings** of the historical square on seven original cuneiform pages. It does not reject a separately source-selected hidden channel, nonadditive consumer or changed plaintext register; none is independently specified by the square's mere existence.

## Reproduction

Read-only Node22 CommonJS [SFT](../sims/lp2_seven_cuneiform_magic7_rowkey_gate_sft.cjs), **passing original-input Windows Node22 CI [run43712870859](https://github.com/FlareZ123/liber-primus/actions/runs/43712870859)**, pins the historical 49 integers, their seven 1033 row totals, original seven physical page lengths, source IoC, both complete inverses, original re-encryptions, and 1,680-rune source-native positive plants. It reads the original shared corpus rather than storing a duplicated transcription.

Source image scans: [physical p33–39, originals 50.jpg–56.jpg](../resources/liber-primus/). This report is intermediate evidence; `results/README.md` remains unchanged because no new key, plaintext, or author-prescribed method was identified.
