# The March 2016 "supposed decoded Liber Primus" post is a rune transcription

**Decision (14 November 2026): source-selector negative for issue #926.** The thread is genuine, historically dated participant discussion. Its original post supplies a 51 KB page-by-page **Latin-label transliteration** of Liber Primus ciphertext, old solver notes, and an explicitly questioned rune-to-prime output. It provides **no specified plaintext for unknown LP2 p0–55, no author-selected unknown key, and no byte-level decoder**. No original-cipher inverse can be frozen from this object. The thread's suggestive title therefore cannot qualify as a decryption claim.

## Exact source and reproducibility

- Original dated reference: [26 April 2016 Freenode link](https://calypne.boards.net/thread/53/supposed-decoded-liber-primus), at original 2015–16 corpus line 334208, indexed by [#914's source locator](../sims/lp2_2015_2016_five_threads_acquisition_sft.cjs).
- Independent snapshot: [18 April 2016, 15:11:42 UTC Wayback capture](https://web.archive.org/web/20160418151142/http://calypne.boards.net:80/thread/53/supposed-decoded-liber-primus), originally recovered in [CI run 43628000067](https://github.com/FlareZ123/liber-primus/actions/runs/43628000067). Its frozen 2016 visible posts are #278, #280, #283, #285, #287, #288, #290, #345.
- [Reusable read-only extractor](../sims/lp2_2016_calypne_thread_probe_sft.cjs) on original live page and that single archived page, with [successful Windows Node22 run 43631591862](https://github.com/FlareZ123/liber-primus/actions/runs/43631591862). The run parses each real HTML post body, logs its UTC timestamp, post ID, author where available, content SHA-256, links, original p0 rune-label alignment, and post fragments. No downloaded links or pasted code were executed. Historical source HTML differs in incidental active HTML and archival wrappers; keep post identity and content separate from outer HTML byte hashes.

## Actual original claims and source dates

| Date UTC | Post | What the material supplies |
|---|---:|---|
| 3 Mar 2016 | 278 | The forum owner (originally TheGeneralFilms; later renamed DeadVCR) republishes a large supposed "decode": original rune names written in Latin letters, page descriptions and earlier working notes. The message ends with an explicit warning that a linked Pastebin script had an error and gave wrong output, followed by a separate link to runes converted to prime numbers (pastebin.com/ecgT1L3V). It does not provide a working LP2 inverse. |
| 6 Mar | 280 | Phil observes that the transliterated letters are from much older material and asks why people are treating an undecoded page as solved. |
| 6 Apr | 283, 285 | One guest posts an unaligned mystical interpretation; the owner replies. No original rune offsets, executable key or cipher appear. |
| 6–7 Apr | 287, 288, 290 | A guest asks who translated it; the owner credits whoever created the Pastebin page. No identified originating decoder or reproducible rule follows. |
| 16 Apr | 345 | Generic claimed puzzle knowledge and a question, without plaintext. This is the last visible post in the 18 April historical capture. |
| 20–22 Apr | 352, 355 | A new reader calls the supposed decoded text unintelligible; another asks about an old image. These are later live-page posts, absent from the 18 April capture. |
| 1–3 May | 368, 386, 400, 405, 411 | Comments describe work as unfinished and mention the separate original Titanpad vFCy7T5p0O, already audited in the repository's source studies. This is a research workspace reference, not the missing LP2 decipherment. |

**Scope:** the live first page contains 15 visible posts through 3 May 2016, although its thread metadata advertises 76 total posts accumulated through later years. The April 18 capture displays eight contemporaneous posts. This gate concerns the original 2016 claim in the captured first-page discussion. It makes no assertion about unseen later pages.

## Original-cipher discrimination

The first unknown page of the source is written as S-H-E-O-G-M-IA-F S-Y-E-NG-C ..., matching the opening of the authentic original LP2 p0 rune sequence after the source-era IA label is used for ᛡ. The extractor independently converts the [project's original p0 transcription](../resources/liber-primus/lp2-transcription.txt) into the same labels and obtains **98 consecutive matching original rune labels** before encountering a transcription/format mismatch. This establishes that the passage is **original ciphertext represented in another alphabet**, not an independently derived plaintext passage. The comparison is a known-input identification, not a claimed 98-rune decipherment.

The poster's prime-number reference is expressly described as **runes converted into prime numbers**. That operation is the public Gematria Primus numbering convention. The first post expressly warns that a preceding pasted script's output was wrong. No complete original p0–55 plaintext span, key, state, IV, reset clock, F policy, GP-to-plaintext operation, or encoder is specified, and the replies do not supply them.

**Decision:** #926's gate for independently replaying a claimed decoder on 100 original runes plus 40 untouched positions does not activate because the source supplies no decoder or claimed original plaintext requiring such a test. Retire this 2016 thread as an apparent decipherment source. The distinct historical Titanpad and individual source programs already have separate evidence gates. A future exact-byte independently dated decoder would be a new source object, requiring its own frozen original-cipher test.
