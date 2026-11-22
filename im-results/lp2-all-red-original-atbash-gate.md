# Uniform GP29 Atbash on all original LP2 red-ink units

**Original-input decision, 12 November 2026, Director #601:** The authentic LP1 GP29 Atbash `i ↦ 28−i`, when applied unchanged to **every original red rune** and preserving original printed word/sentence boundaries, yields the two distinctive three-rune readings `SCY` (SKY under GP C/K spelling) and `UDP` at physical p3/p39 local119. **No third independently complete instruction, network/protocol command or cipher key** emerges from the other original red units. The solved LP2 red title `PARABLE` itself becomes `SRARJHI`, a direct counterexample to red ink uniformly marking Atbash ciphertext. **Do not promote uniform red Atbash as a manuscript-wide decoder.** The two local SKY/UDP interpretations remain provisional.

## Original-source execution and controls

The source-defined input is exactly the 18 red-runic spans (225 runes) in [ink annotations](../resources/liber-primus/lp2-ink-annotations.json), with all source word and full-stop boundaries read from the [canonical complete printed LP2 transcription](../resources/liber-primus/lp2-transcription.txt). The runic transcription's 57 rune-bearing pages are matched, glyph for glyph, to every original physical page in [the indexed corpus](../resources/liber-primus/lp2-corpus.json); physical p50 is an entirely numeric, rune-free page and absent from this rune-only transcription. There are no omitted or changed red runes. Source-physical page/offset is zero-based.

Atbash is the involution `P_i = 28 − C_i` on the exact GP29 table. The GP transliteration below retains literal printed hyphens between words and `.` for punctuation. It removes only physical line-wrap slashes/newlines. **No word fragments, rephasing, transpositions, shifted alphabets, case changes, invented spaces or guessed surrounding runes** are added to the input.

| LP2 physical page | Red start | Runes | Complete original-word Atbash output |
| ---: | ---: | ---: | --- |
| 0 | 0 | 13 | `PLIAEOENUEA-PTHIWD` |
| 3 | 0 | 16 | `HB-TLWDYEOOBEOXL-EOIAG` |
| **3** | **119** | **3** | **`SCY`** |
| 6 | 71 | 11 | `REOXJ-N-OEUPJ-XT` |
| 7 | 194 | 14 | `CAE-GEOYO.DNGB-XF-OEFN` |
| 8 | 0 | 12 | `XEXN-IAXNDYSAEJ` |
| 15 | 0 | 9 | `EAIAHN-RFTHGR` |
| 15 | 9 | 11 | `HIAWM-DIA-JMEOEAW` |
| 23 | 0 | 16 | `IAR-NGWOEXCOE-EJE-TEOJETH` |
| 27 | 0 | 19 | `NSTH-HPAEROLHITENH-HPDS` |
| 33 | 0 | 10 | `CT-XDEAERNGLOE` |
| 33 | 91 | 8 | `WYT-EEADGT` |
| **39** | **119** | **3** | **`UDP`** |
| 40 | 0 | 8 | `EAMN-THOECOL` |
| 53 | 128 | 51 | `EOSNGTP-NGJTY-MLOEB-AUCUYRETOXH-TF-URB-LA-YSCBWAE-OEEATND-LCAEEOD-IAA-SM` |
| 54 | 0 | 9 | `R-NWCUYXEN` |
| **56, solved** | 0 | 5 | `OB-GPA` |
| **57, solved** | 0 | 7 | `SRARJHI` |

### Critical independent controls

The identical Atbash code applied directly to the **original solved LP1 page0 source** ([canonical first-book transcription](../resources/transcriptions/lp1_wulfic_canonical.txt)) produces the beginning `A-WARNNG.BELIEUE-NOTHNG-FROM-THIS-BOOC.`. This is genuine GP-script native spelling of “A WARNING. BELIEVE NOTHING FROM THIS BOOK.” (`NG` rune representing the -ING sound, and GP `U` representing V). The positive source control verifies the historical alphabet operation, its direction and original physical punctuation.

The two isolated original 119–121 red words are each individually bracketed by **red thirteen-dot marks at 119 and 122**. The four source words at p6 local71–81, the multiple words at p7 local194–207 and the split headings at p15 and p33 also carry red13 marks, but they are not single coherent commands under this unchanged operation. The fixed test covers them in full with their existing word boundaries. The p57 red title `PARABLE` is established plaintext and unambiguously *fails* uniform Atbash. Other minor two-letter fragments in longer output cannot support a new channel without fragment-selection instructions.

The tested original-source model identifies **zero independently complete third network/protocol instructions** from the 16 remaining spans. This is a bounded architectural rejection rather than proof that the SKY/UDP coincidence is accidental, or that other, independently signaled per-page cipher methods do not exist.

## Next cryptanalytic decision

The only way to continue the two p3/p39 readings as instructions is to find an **independent original-source choice of consumer** specifying a concrete packet/file/cryptographic operation, destination or key for a third, withheld passage. [The contemporaneous UDP historical archive review](../im-results/lp2-p3-p39-red119-atbash-sky-udp.md) and [the fixed post-marker BASE29-gzip gate](lp2-red119-base29-gzip-transport-gate.md) do not provide that instruction. A third word found by tuning lengths or alphabets does not validate the route.

**Reproducer:** [`sims/lp2_all_original_red_atbash_sft.cjs`](../sims/lp2_all_original_red_atbash_sft.cjs), a Windows-compatible Node.js CommonJS single-file test of the exact rune stream, red-span sizes, all 18 formatted outputs, involution, p3/p39 bracketed words, solved LP2 negative control and authentic solved LP1 positive control. No new CI workflow.
