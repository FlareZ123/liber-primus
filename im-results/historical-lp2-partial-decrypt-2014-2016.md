# Historical LP2 partial-decrypt search, 2014–2016

**Finding: no independently reproduced unknown-page plaintext or creator-origin key.** The expanded 2014 IRC scan recovers several dated participant hypotheses and candidate cribs for LP2 pages 0–55, including a pages 8–14 Vigenère/keymask attempt. The surviving material establishes no valid original-cipher inverse or verified plaintext after the historical keymask gate. The known LP2 plaintext controls remain p56 (**AN END**) and p57 (**PARABLE**). This is not proof that no private, deleted, or inaccessible participant material ever existed.

## What the early source repositories actually contain

### 2014 contributor archive

[micheloosterhof/cicada-2014](https://github.com/micheloosterhof/cicada-2014) was created 2014-01-10. Its `stage11/` tree preserves the original LP2 page material:

- `49.txt`–`51.txt` and corresponding `.dec` files are numeric/byte representations of the special page blocks, not English plaintext.
- `57.decoded` is present in the archive by 2014-05-11.
- `56.decoded` was committed 2014-05-19; the associated `56.py`/`56.runes` work was committed 2014-05-25.
- The visible page-56 mechanism is the prime-totient shift; p57 is the unencrypted GP substitution control. No unknown-page plaintext with a page/rune offset or historical key was found in this repository.

Direct records: [stage11 tree](https://github.com/micheloosterhof/cicada-2014/tree/master/stage11), [p56 decoded](https://github.com/micheloosterhof/cicada-2014/blob/master/stage11/56.decoded), [p57 decoded](https://github.com/micheloosterhof/cicada-2014/blob/master/stage11/57.decoded).

### 2014 archive index and complete transcription

The later archive [cicada-solvers/neuroretransmit-cicada](https://github.com/cicada-solvers/neuroretransmit-cicada) preserves the [2014 seventh-onion index](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/011-seventh-onion/README.md). It explicitly states that the only solved pages in its LP2 material are **56 (totient shift)** and **57 (unencrypted)**. Its p0–55 files are rune transcriptions/possibilities, not plaintext readouts.

The curated [scream314/cicada3301 LP transcript](https://github.com/scream314/cicada3301/blob/master/liber_primus.md) independently gives the same result. Parsing the LP2 portion yields exactly **two** `English:` sections: p56 and p57. The p0–55 page groups are marked with unknown keys (`Key: ?`) and remain runic/numeric source material. Its [2014 chronology](https://github.com/scream314/cicada3301/blob/master/2014.md), [2015 record](https://github.com/scream314/cicada3301/blob/master/2015.md), and [2016 record](https://github.com/scream314/cicada3301/blob/master/2016.md) add the dated stage history and signed messages, but no additional unknown-page plaintext.

## 2015–2016 contributor repositories

- [resvolver/c1cada](https://github.com/resvolver/c1cada) was created 2015-01-05 and last pushed 2016-01-15. Its `translation/transcriptions/` files and `liber_primus.rne` preserve rune transcription. `Better_Odds_Method` is a proposed heuristic and `tasks-todo.txt` is a list of prospective tests; neither supplies a fixed key, original-cipher inverse, page/rune offsets, or recovered unknown-page text. The `ruins/` files are numerical/rune representations, not a prose decrypt.
- [aautcsh/idkfa](https://github.com/aautcsh/idkfa) was created 2016-01-17. Its own `js/main.js` selects only sections **0,1,2,3,4,5,6,15,16** as solved and labels paragraph indices **16–32** unsolved. `js/config.js` supplies only the known keys `[0]`, `DIVINITY`, `[3]`, and `FIRFUMFERENFE`. Its word-guess output is therefore not evidence of an unknown LP2 partial decrypt; the program does not process those unsolved sections as solved text.
- [henkman/liberprimus](https://github.com/henkman/liberprimus) was created 2016-08-14. Its solution directory contains only p56 and p57; the remaining material is transcription/translator tooling, not an unknown-page plaintext recovery.

## Transcript and creator-origin checks

- The byte-pinned #cicadasolvers logs include LP2-era participant attempts after the 2014-05-02 release. A cross-line scan recovered the 7 May pages 8–14 Vigenère/keymask attempt and several page-specific false starts; none is a verified decrypt. See the consolidated witness audit below and sims/irc_lp2_historical_claim_context_scan.py.
- The preserved [Wulfic IRC excerpt](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/reference/community/irc_logs.txt) contains a Profetul/Mortlach discussion of cyclic key-gap patterns (examples include 11 and −18) as a possible explanation for low doublets. It supplies no key stream, page/rune alignment, plaintext, or selected reversible operation. Its linked [Gist](https://gist.github.com/Profetul/bd8ad9cb16c81302382526ea2e4f6e67) was not retrievable through the available GitHub/web interface, so the excerpt remains an unverified historical hypothesis, not a partial decrypt.
- The preserved 2016 PGP-signed message in [scream314/cicada3301/2016.md](https://github.com/scream314/cicada3301/blob/master/2016.md) says “Liber Primus is the way” and that its words, meaning, and numbers are map/road/direction. It is a source-origin clue, but it discloses no unknown-page plaintext, key, or executable cipher operation.
- The small IRC text files in [krisyotam/cicada3301](https://github.com/krisyotam/cicada3301/tree/main/archives/irc-logs) were searched for LP/page/decrypt/plaintext references; no qualifying unknown-page readout surfaced.

### Additional LP2-era IRC witnesses recovered by the cross-line scan (12 November 2026)

The original #cicadasolvers logs contain several participant-authored attempts missed by the earlier narrow same-line search. They are useful historical evidence, but none currently supplies a verified unknown-page decryption.

- **7 May 2014, cluosh, pages 8–14:** describes four Vigenère variations, using known words as key material and leaving F runes unprocessed. The linked contemporaneous Pastebin inputs remain retrievable: [Vigenere-Brute](https://pastebin.com/raw/R01rN7ZX) (9,387 bytes; SHA-256 2c45a9116fd5e5f37c0921e39f8cbcadbc8c5b39c69b1f4ecbd3bd4c39b8eecf) and [Keymask](https://pastebin.com/raw/vkshfVTu) (4,742 bytes; exact retrieval hash is in the workflow artifact). The mask has 1,728 entries (1,090 -1, 638 known symbols), against 1,729 original runes on pages 8–14. The four Vigenere-Brute blocks have 1,742–1,750 tokens and 1,090 lowercase-x placeholders each. Under direct GP29 tokenization and linear alignment, the best mask match is only 1,275/1,728; derived-key matches peak at 89/638. This does not validate the proposed key/crib alignment. The already-completed [source-pinned direct-key CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43164390000) applies the mask under Vigenère `C−K`, Beaufort `K−C` and addition `C+K` (mod 29), testing the two possible original-page alignments. The best per-block matches against the **historical participant's own generated output** are **89/388** (block 1, Vigenère), **89/417** (block 2, Beaufort), **21/376** (block 3, Beaufort) and **22/282** (block 4, Vigenère). The longest contiguous recomputation matches for the first two are respectively **13** and **11** runes. This partial source-output consistency can confirm that the historical author ran related arithmetic on some positions; the historical output itself is not plaintext and was generated from unverified guessed words. Direct masked decodings on the original ciphertext remain nonlinguistic, many source positions are unspecified (`-1`), and there is no source-authenticated key-generation or continuation rule. This closes the surviving 2014 Vigenère package as a **participant cipher experiment**, not a decrypted page. No need to retune its alignment or introduce new variants without an independent ciphertext-selected operation.
- **21 May 2014, amone, page 25:** supplies ciphertext EA-I-IA-TH-NG-N-E-N-F-O-M-E-Y-A, candidate plaintext C-O-N-D-I-T-IO-N-E-D-N-E-S-S (“CONDITIONEDNESS”), and 14 shifts 23,7,18,8,11,22,20,0,11,9,10,0,11,9. The ciphertext is an original 14-rune word at p25 local offset 46. The listed shifts are exactly the per-rune P−C mod 29 differences when the author's IO is read as the IA rune alias; they are not an independently generated key. The author calls this the “closest I got” and discusses other -ness word guesses. Applying this vector unchanged to the other 14-rune words on p13 and p43 produces nonwords. Classify as a dictionary/crib false start, not plaintext.
- **25 June 2014, Nem0, page 0:** describes an m-key/p-key Vigenère brute-force over candidate 8–13-letter words for the first eight runes. The participant reports nearly 12,000 candidate m-/p-keys without a recognizable pattern or simple mathematical sequence. This is an explicit historical negative, not a recovered key.
- **3 July 2014, f10ur1ick3r, pages 23/25/27:** claims a single A under prime-stream offsets −5(−4), −9(−8), −13(−12). The adjacent discussion disputes the red/blue counting and the treatment of 0/29; no target positions or complete selection rule are supplied. Treat as an ambiguous one-letter false start, not a frozen inversion.
- **28 August 2014, Nem0, pages 13 and 0:** links two p13 first-four-rune result pastes (sprunge.us/DbXN, BbUK) and two p0 first-eight-rune pastes (LIWC, EMXR). The current Sprunge endpoints return 404 and Wayback CDX has no captures, so the claimed plaintext/keyword/key values are not recoverable from those links. A separate Pastebin (kcLZvZAA) explores “HE ANSWERED” using a 10-rune sequence. That sequence occurs at p43 offset 23 but crosses the two-rune word FU and the first eight runes of a 13-rune word; it is not a complete word/phrase. The surrounding chat explicitly notes that many readings are possible. Classify as a false start.
- **4 November 2014, crashdemons, page 15:** describes a TitanPad note chain from page-15 codes to a prime table, prime sequence numbers and a Fibonacci sequence, while stating that the sequence could not be reproduced. The 2016 Wayback capture of vFCy7T5p0O is an HTML shell; its captured body does not contain the pad text. This is historical context for already-solved p15, not an unknown-page key.
- **9 February 2016, anonymous wiki commenter, p55:** a separate preserved Talk:2016 Puzzle comment claims a “doubling seq(or key) b letter” via prime factoring and offers “A Riot's at the” before its B-numbers run out. This is a dated first-person false start, not a 2014 witness and not a reproducible key.

The May 7 Vigenère/keymask package was the only recovered 2014 lead with enough surviving material to justify a direct-key check. That check is complete and identifies no original plaintext or creator-origin key. Other historical attempts are explicitly unsuccessful, underdetermined, or missing linked data. This closes the bounded witness audit under Director #552. No result here is promoted to results/; results/README.md remains unchanged because no authentic unknown-page plaintext or key has been established.


### Original 23 May 2014 short-word shift guesses: authenticated participant text, no cipher key

The earliest identified speaker's source is **23 May 2014**, not 24 May. In the exact raw **#cicadasolvers** IRC Git blob, 18,487,233 bytes, Git blob SHA-1 **bdd277c14f94c34b5ae714cd00c238065beeed4e**, participant **idontworkfor3301** at 02:18–02:40 (source lines **186,766–186,782**) supplies the original page34/page35 short-word candidates. When asked how they found the shift, the speaker answers at lines 186,776–186,778: **“I repeated the shift 0, +1, +2.... at each starting point”**. This is direct evidence of an **exploratory sweep of starting offsets**, not a recovered key, Cicada instruction or independent known plaintext. Another participant, Mothwing, already retells the conjecture on **23 May at 17:19** (line187,146), and again on **24 May at 23:35** (line188,780), specifically cautioning that the shift works only on the isolated short words and has no continuation. [Byte-pinned original inventor and retelling, bounded source logs](https://github.com/FlareZ123/liber-primus/actions/runs/43124785871) · [exact narrow source scanner](../sims/irc_2014_shortword_crib_context_sft.py).

The proposed original local alignments remain **mathematically exact** against the unaltered canonical GP29 runes:

| Original physical page / local rune offset | Printed ciphertext GP symbols | Found shift progression mod29 | Guessed GP plaintext |
| --- | --- | --- | --- |
| p34 / **81** | OE M S X | **27,28,0,1** | **L E S S** |
| p35 / **78** | P E T | **26,27,28** | **I T S** (apostrophe invisible in GP) |

The smallest common relation fitted to just those words, **P_(p,j)=(C_(p,j)+3−p+j) mod29**, was previously inverted with exact round-trip and applied to all complete original p33–37 word segments. Its output IoCs, shown below, stay near uniform GP29 rather than ordinary GP-English:

| Physical page | Complete-word rune count | Original IoC | Fitted word-reset inverse IoC |
| --- | ---: | ---: | ---: |
| 33 | 213 | 0.03312960 | **0.03312960** |
| 34 | 259 | 0.03343210 | **0.03340217** |
| 35 | 268 | 0.03502152 | **0.03664263** |
| 36 | 236 | 0.03573747 | **0.03512441** |
| 37 | 228 | 0.03342608 | **0.03450808** |

**New look-elsewhere calibration:** printed page-local word-piece parser yields **2,928 pieces** including cross-page fragments; the original complete-word parser separately counts 2,896. A native-English GP lexicon is frozen from Gibran, Shakespeare and Emerson (407 unique 3-GP-rune words and 1,177 unique 4-GP-rune words, with standard digraph transliteration). Scan **all original pages**, **all original short-word pieces** and **all 29 progressive starting shifts**. Count any 4-rune English candidate on page p and any 3-rune English candidate on physical p+1 whose shifts differ by exactly −1. The actual book contains **8 qualifying linked word pairs across 7 neighboring-page pairs**; the historical **LESS/ITS** is one.

A deterministic null rotates each page's complete original ciphertext rune stream independently under its fixed word-piece lengths, preserving per-page rune histograms and most within-page transitions, and repeats the *same dictionary and 29-seed scan*. Over **3,000 rotations** (seed **0x20143301**), its average is **5.83033 pairs**, SD **2.65986**; **24.4585%** of Monte Carlo outcomes reach or exceed the observed 8 (smoothed upper-tail probability **0.244585**). A count of qualifying neighboring page pairs gives p≈**0.20393**. Since the two English names and offsets emerged after the participant's broad starting-shift search, fixed-LESS/ITS significance is inappropriate. The familywise native-word result is **unexceptional**.

The exhaustive exact target check also finds ITS-like three-rune fits on p36 and p37 under different starting shifts **13** and **12**, respectively. These additional short-word coincidences were not authenticated by the original speaker and do not continue the page34/p35 seed schedule.

[Runnable original-source/English-family matched-null SFT](../sims/lp2_2014_shortword_lookelsewhere_sft.cjs), passing [manual original-input CI run 43125230242](https://github.com/FlareZ123/liber-primus/actions/runs/43125230242); [earlier full-page word-reset inverse SFT](../sims/lp2_2014_progressive_contraction_crib_sft.cjs), passing [CI run 43038110314](https://github.com/FlareZ123/liber-primus/actions/runs/43038110314).

**Conclusion:** both exact local shifts are established as **original-era participant hypotheses** with a now-explicit retrospective search mechanism. They lack independent source-known plaintext, creator authentication, a global clock, and a successful original-page continuation. Do **not** use them as known plaintext controls or infer a pagewide key from their appearance.

### Large original IRC archives: access restored and 2016 Pastebin clarified

The previously inaccessible multi-megabyte `neuroretransmit/cicada` IRC logs have now been downloaded **byte-exactly**, with all three Git blob SHA-1 hashes and byte lengths verified on a dedicated manual GitHub Actions runner. Together they cover **698,330 preserved log lines** across `#33012014.freenode.log`, `#cicadasolvers.freenode.log`, and `#cicadasolvers.freenode.2.log`. An exact-case-insensitive `uRkNsGsa` search finds **0, 0, and 2 matches**, respectively.

The recovered **7 January 2016, 12:41** IRC context is decisive about this URL's role: a participant posts `http://pastebin.com/uRkNsGsa` with “Hash for everyone's convenience”; the immediate preview says `Liber Primus p.57 hash - Pastebin.com`, and the archive bot acknowledges `Archived file(s): uRkNsGsa`. Earlier chat concerns the already-printed manuscript hash. The 2016 downloadable-`uRkNsGsa.htm` anecdote therefore identifies an **existing hash repost**, with no source evidence for the missing deep-web page or a reverse-hash preimage. The original Pastebin bytes remain unavailable; the IRC record alone suffices to distinguish its documented function. [Full byte/source audit and runnable scanner](2016-pastebin-irc-original-source-audit.md) · [successful manual run 43034766665](https://github.com/FlareZ123/liber-primus/actions/runs/43034766665).

This archive search authenticates the three archived Git objects as stored, **not** the origin of any participant statement or a Cicada-issued decryption instruction. It settles the former access limitation for these exact files. No verified unknown LP2 plaintext or creator-supplied key was identified; the newly recovered participant hypotheses are documented below and remain unverified.

## Decision

No qualifying independently reproducible 2014–2016 unknown-LP2 partial decrypt or creator-origin key disclosure was found. The expanded IRC scan surfaces historical participant attempts, especially the 7 May 2014 pages 8–14 Vigenère/keymask, but no verified plaintext or source-selected key. The concrete established record remains the p56/p57 controls and numeric p49–51 material. Keep the new participant hypotheses distinct from authenticated instructions; do not promote them or numeric payloads to plaintext evidence.
