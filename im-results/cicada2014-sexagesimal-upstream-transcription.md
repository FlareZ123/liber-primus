# The actual upstream source of the 2014 `sexagesimal.bin`: three transcription files, not a creator generator

**Finding, 11 November 2026.** The 256-byte May 2014 `sexagesimal.bin` is a byte-for-byte **participant base-60 conversion** of three earlier, manually transcribed page-text files. The upstream input is **256 explicitly copied two-character numerals**, not a demonstrated Cicada-specified PRNG or compact generator. The original author-published object is the printed 32×8 table on LP2 pp49–51. Its creator-side construction source and intended cryptographic operation remain unknown. No new LP2 plaintext or authentic key follows.

## 1. Pinned 2014 participant conversion chain

The [original May 11 2014 20:41 commit `19d68fbb`](https://github.com/micheloosterhof/cicada-2014/commit/19d68fbb9cff1c06d52cc0add30285199c936282) added three text transcriptions alongside the already archived 58 LP2 JPEGs:

| Filename in `stage11/ky2khlqdf7qdznac.onion/` | Two-character tokens | Git blob SHA-1 |
|---|---:|---|
| [`49.txt`](https://github.com/micheloosterhof/cicada-2014/blob/19d68fbb9cff1c06d52cc0add30285199c936282/stage11/ky2khlqdf7qdznac.onion/49.txt) | 80 | `1ae432f17099e75a8a9f5ab84040a37645632517` |
| [`50.txt`](https://github.com/micheloosterhof/cicada-2014/blob/19d68fbb9cff1c06d52cc0add30285199c936282/stage11/ky2khlqdf7qdznac.onion/50.txt) | 104 | `34cbb77d43a67679e989a466904de49622d7f480` |
| [`51.txt`](https://github.com/micheloosterhof/cicada-2014/blob/19d68fbb9cff1c06d52cc0add30285199c936282/stage11/ky2khlqdf7qdznac.onion/51.txt) | 72 | `6e9fa506375442c9126a275ef845a909449102a3` |

For each file, split at the blank line and read **only its upper two-character token block**. Concatenate the token blocks in page/row order. For token `ab`, use the conventional 60-digit order `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` and decode `value=60*index(a)+index(b)`. All **256 values** match the archived `decimal.txt`. Encoding each integer as one unsigned byte reproduces the 256-byte `sexagesimal.bin`, Git blob SHA-1 `ad3dd7a3d37879d04bd506d2eecea86f27543928`; SHA-256 `8db2a93497bc02bbf0ab07ac3cf96edd227fec630232c04ea35493d3a7d7b65e`.

The [later May 11 21:39 commit `a9201dd`](https://github.com/micheloosterhof/cicada-2014/commit/a9201dd469a1a514eb0d8ff8f3449dbe2e7f7462) adds `decimal.txt`, the Perl converter `pack 'C'`, and the binary together. Its parent already contained the three transcriptions. Git author dates are self-reported; **the Git parent chain fixes the sequence**.

## 2. Historical transcription corrections

The earliest `50.txt` has **two annotations** reading `<-------CORRECTED. Previously ...` in its lower numeric table:

```
233 217 192 82 105 18 250 248     <-------CORRECTED. Previously 233 217 192 82 105 47 250 248
240 228 254 54 148 117 209 44     <-------CORRECTED. Previously 240 228 194 54 174 117 209 44
```

Their three zero-based whole-table positions are:

| Position | Upper original token and later archived byte | Already-corrected 2014 numeric value | Original LP2 printed token |
|---:|---|---:|---|
| 165 | `0l` → 47 | 18 | `0I` |
| 170 | `3E` → 194 | 254 | `4E` |
| 172 | `2s` → 174 | 148 | `2S` |

The **original upper token lines stayed stale**, even though the lower table already corrected these values. The 2014 decimal and binary files therefore retained all three obsolete entries. In particular, the noncase numerical discrepancies `47→18` (−29) and `194→254` (+60) were already recognized and corrected inside the earliest 2014 transcription. They are not independent evidence of a hidden arithmetic key transformation.

The archived upper tokens disagree with the source-image-adjudicated LP2 table at exactly `[25,45,50,165,170,172,175,182,199,246]`. Removing the three annotated corrections leaves **seven case-only transcription discrepancies** `[25,45,50,175,182,199,246]`, all involving visually confusable I/i and L/l letterforms. This supports ordinary optical transcription error without mathematically proving intent. The reported eight-direction-bit ASCII-`f` candidate includes the already annotated correction at index 172 and is not independent evidence of intentionally encoded case data.

The later Git commit `d72e8e0` (May 11 22:06) stripped the numeric blocks from the `49/50/51.txt` files, so the crucial comments are invisible in modern versions. Use the earlier pinned source commit above.

## 3. Creator-side release surface and exact missing source

The original [2014-05 signed release message](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/pgp/messages/2014-05-liber-primus-release.asc) and the stage11 `message.txt.asc` body are identical. The signed text says “Your enlightenment awaits you,” gives `ky2khlqdf7qdznac.onion`, and says “We look forward to hearing from you.” It contains no numerical table attachment, generator, seed, or table-use instruction.

At the contemporaneous 2014-05-11 archive commit [`6c3421a`](https://github.com/micheloosterhof/cicada-2014/commit/6c3421a4d245596e403c88e037509d162a2afd17), the 1,640-byte stage11 `index.html` consists of `<title>133</title>`, `<div id="331">`, and sequential image elements `0.jpg`–`57.jpg`. It has no script, form, other link, table-specific text, or separate data file. The two unexplained literals 133 and 331 are reversals, but no independent source semantics connect them to the table's generation or use; assigning them a PRNG role would be an unconstrained guess.

The full public [`micheloosterhof/cicada-2014` tree](https://github.com/micheloosterhof/cicada-2014/tree/master/stage11) is a participant archive. Its stage11 contents are the 58 page JPEGs, `index.html`, the signed locator, participant `49/50/51.txt` and `.dec` transcriptions, the decimal list, the 45-byte pack converter, the derived binary, and page-56/57 decoder material. It contains no table-generation program, deployment bundle, or source-side seed. The `decimaltobyte.pm` file is only the participant conversion described above.

The [pinned `krisyotam/cicada3301` archive](https://github.com/krisyotam/cicada3301/tree/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage11) and the [iBotPeaches Onion-7 archive](https://github.com/iBotPeaches/cicada_3301/tree/master/onions/ky2khlqdf7qdznac.onion) preserve page mirrors, locators, and/or participant material, not a creator-controlled generator. The local archive manifest itself labels the krisyotam material as repository copies, not independently proven original HTTP byte sequences.

## 4. Wider public-source survey (11 November 2026)

A bounded global GitHub code search for `sexagesimal.bin` returned 12 indexed matches. The identifiable matches were participant copies, later research logs, or analyses—not a creator-owned pre-release source. The relevant external work was classified rather than treated as new primary evidence:

- [Dukotah, Campaign VII](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/pp49_51/CAMPAIGN-VII-FINDINGS.md) (2026-07-06) canonicalizes the table from relikd transcription, scream314 tokens, and scream314 decimal readings, then characterizes the resulting high-entropy payload. These are research/transcription witnesses; the report supplies no creator generator or signed operation.
- [pnotisdev, phase 39](https://github.com/pnotisdev/cicada3301/blob/master/work/log/phase39_online_sources.md) compares the same scream314 archive files with iddqd's later byte-string and signed messages. It explicitly treats the binary as a derived transcription, not a Cicada file.
- [Pitchfork-and-Torch, running-key pass](https://github.com/Pitchfork-and-Torch/liber-research/blob/master/notes/sexagesimal-block-key-pass1.md) and [transposition pass](https://github.com/Pitchfork-and-Torch/liber-research/blob/master/notes/sexagesimal-block-transposition-pass1.md) use the same public copies and report cryptanalytic nulls; neither introduces an author-side source.
- [Cicada Notebook, session 2](https://cicadanotebook.com/sessions/2.html) documents another modern base-60/key test, not a contemporaneous creator artifact.
- A 2025 explanatory PDF claims the numbers “tell you how to rearrange the grid,” but supplies no authenticated Cicada instruction or pre-release source. Treat this as community conjecture, not a recovered operation.

The 2016 signed message—“Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction”—is an authentic general statement about LP's numbers, but does not specify the 32×8 table's generation, ordering, arithmetic, or key role. No frozen operation or withheld-cell prediction follows from it.

**Do not conflate this printed 32×8 table with the separate 2014 Onion2 256-byte growing string.** They are different artifacts that happen to have the same length. The latter's server-output and timing-source audit is separately recorded in [workplace/onion2-original-server-source-gate.md](../workplace/onion2-original-server-source-gate.md) and Issue #208; it is not evidence for this table's generator.

## 5. Source-level radix gate: base 60 versus f-omitting base 59

**Issue #310 decision (11 November 2026): the original numeric radix is underdetermined.** The printed pp49–51 JPEGs (archive scans 66–68) have 256 two-character tokens between rune passages. The entire source-transcribed second-character alphabet contains **59 distinct glyphs**, all members of `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` except lowercase **`f`**. The source prints no numeric digit legend, example with a known decimal result, or instruction for treating `f` as a skipped digit. The neighboring LP2 cuneiform headers visibly use sexagesimal to express 1033 and 3301; this supports base 60 as a plausible convention but does not specify how this separate Latin two-character table should be read.

Two fixed, reproducible digit conventions cover **all 256** printed tokens as values 0–255:

- Conventional **base 60**: alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, with `f=41` and `x=59`; observed maximum **255**, and four byte values **41,101,161,221** are absent because `f` does not occur in the units column.
- **Base 59**: alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx`, explicitly excluding `f`; `x=58`; observed maximum **251**, and byte values **252–255** are absent. This skip-`f` alphabet is an *analyst construction*, not an independently evidenced author instruction.

Each convention produces **161 distinct byte values**. Both source-printed `3D` tokens at zero-based whole-table offsets **83** and **127** evaluate to **193** under base 60 and **190** under base 59. In either convention, all 256 values are valid unsigned bytes. The nonappearance of `f` and the absence of four high-end values have exactly the same likelihood under an unconstrained 256-element uniform-byte source model: both alphabets assign probability `(1/256)^256` to the observed ordered token sequence. The event of avoiding four *specified* byte values has probability `(252/256)^256 ≈ 0.01774628` under either model. This is a *conditional non-identification result*, not evidence that the table actually was sampled independently and uniformly.

The May 2014 `sexagesimal.bin` is a **participant-produced** base-60 conversion of the same table; its apparent 256-byte range and exact matches cannot act as independent known-value controls for the creator's radix. The authentic 2016 map/number instruction states no positional radix. The earlier [community comparison of base-59/base-60 alphabets](https://uncovering-cicada.fandom.com/wiki/Liber_Primus_pp49-51_data_interpreted_as_base_59,_60,_62_and_64.) likewise proposes both readings; that is historical solver analysis, not creator authentication. Downstream p55 interval, word-map, or factor coincidences depend on an assumed decoder and are not source-selected numeric anchors.

**Decision:** retain base 60 as a conventional, historically used *working interpretation* and base 59 as a live alternative; qualify every specific `3D=193` / 43-cell p50 transfer as conditional. Neither token geometry, the known 2014 participant binary, nor source-adjacent cuneiform fixes the creator's table radix. A single creator-controlled legend, authenticated decoded cell, or independently source-selected transform with a frozen numeric prediction would change this decision. The full 256-cell test and exact checks are implemented in [`sims/lp2_p50_radix_identifiability_sft.cjs`](../sims/lp2_p50_radix_identifiability_sft.cjs).

## 6. Cryptanalytic consequence and decision

The historical binary is **fully explained as a derivative of an earlier solver-produced transcription**. The independently published original artifact is the 32×8 table printed on LP2 pp49–51. No creator-authenticated pre-release copy of the 256 values, source generator, seed/state, spreadsheet/build file, server-side table code, or table-specific signed instruction was found in the examined public archives.

The exact missing dependency is a creator-controlled artifact that existed before or during publication and determines the table's values (offline source/generator or authenticated pre-release copy), or a creator-authenticated instruction selecting how those values transform ciphertext or generate key/state. If generated at runtime, the missing item is the original server implementation/deployment record; if generated offline, it is the source script/data or signed build artifact. The surviving static release page cannot distinguish those possibilities. The public search does not prove that private or lost material never existed.

No change to `results/README.md` is warranted: this is a source-boundary negative, not an LP2 plaintext, key, or decipherment. Do not expand generic PRNG/seed searches on `sexagesimal.bin`. Reopen only on a dated creator-side source/backup, an independently authenticated pre-release table, or a signed instruction that fixes a reproducible operation and predicts original LP2 data.

The conventional **base-60 numerical interpretation remains conditional**, with a distinct all-byte-valid f-omitting base-59 alternative (section 5). The data contract remains in [`resources/cicada2014-sexagesimal-source.json`](../resources/cicada2014-sexagesimal-source.json), the original transcription copy in [`resources/external/cicada2014-stage11-original-transcriptions.json`](../resources/external/cicada2014-stage11-original-transcriptions.json), and the [manuscript glyph audit](lp2-grid-11-original-glyph-adjudication.md).
