# 2014 Onion5 → Onion6 → Onion7: GEB book code and LP2 handoff

## Established source sequence

A first-party signed PGP message archived as `2014-01-onion5-liber-primus.asc` contains two images, an audio cue, a list of chapter/coordinate codes, and the terminal marker `ONION`. The three media cues point to **Gödel, Escher, Bach**: the first image depicts Gödel's incompleteness result, the second is an Escher eye image, and the audio is Bach. This is a clue-constrained book selection, not an arbitrary codebook guess.

The archived community decoding interprets each entry as:

`chapter-title abbreviation : dialogue exchange : word : letter`

The decoded characters are:

| Entry | GEB chapter | Character |
|---|---|---:|
| `3PI:6:1:3` | Three-Part Invention | u |
| `LML:1:1:1` | Little Harmonic Labyrinth | t |
| `3` | literal digit | 3 |
| `ETOATS:19:9:1` | Edifying Thoughts of a Tobacco Smoker | q |
| `...AF:5:3:1` | ... Ant Fugue | t |
| `AMO:13:10:1` | A Musico-Logical Offering | z |
| `CC:8:6:1` | Crab Canon | b |
| `CBIA:3:7:2` | Canon by Intervallic Augmentation | r |
| `CFAF:5:23:6` | Chromatic Fantasy, And Feud | v |
| `SPR:1:8:1` | Six-Part Ricercar | s |
| `7` | literal digit | 7 |
| `C[1]:4:5:3` | Contracrostipunctus | d |
| `AWDV:6:2:1` | Aria with Diverse Variations | t |
| `C[2]:2:17:5` | Contrafactus | v |
| `SC:3:17:1` | Sloth Canon | z |
| `AOGS:2:8:1` | Air on G's String | p |

This gives the 16-character Tor v2 address **`ut3qtzbrvs7dtvzp.onion`**. The first-party message supplies the codes and media; the chapter mapping and extracted letters are documented in the community archive cited below. I have not independently checked every coordinate against a physical copy of GEB, and the PGP signature verification is inherited from the external signature corpus rather than recomputed in this run.

## What the destination returned

The archived Onion6 page at `ut3qtzbrvs7dtvzp.onion` contains four plaintext manifesto pages and an instruction to create a Tor hidden service that accepts CGI uploads, then submit the three magic squares and the service URL; it says to work alone. The archived form posts to `/cgi-bin/upload`, names the file field `file`, and exposes the public key at `/key.asc`. This establishes the intended 2014 continuation as an interactive hidden-service submission, not merely a static page.

After the square submission, three additional pages were returned. The first two are decrypted in the historical archive with the Vigenère key **`FIRFUMFERENFE`**, with selected F runes marked by a preceding colon (`:`) to hold the key index, and the key continuing across the page boundary; the third page is plaintext and includes **“Question all things. Discover truth inside yourself. Follow your truth. Impose nothing on others.”** The key is `CIRCUMFERENCE` with C replaced by F. The phrase **“PROGRAM YOUR MIND / PROGRAM REALITY”** occurs in the Onion6-era material and should not be treated as a newly discovered LP2 key.

### Exact two-page marked-F positive control (23 November 2026)

The archived post-square ciphertext pages **107** and **167** contain **226** and **93** runes. The two literal colon characters in page 107 occur at character offsets **68** and **82**, immediately before GP rune offsets **49** and **58**; both following runes are F. With the documented 13-rune key **FIRFUMFERENFE**, subtracting the current key symbol and leaving only those two explicitly colon-marked F runes literal gives:

- page 107 consumes **224** key symbols and ends at phase **3**;
- page 167 starts at phase **3**, continues the same clock, and the full two-page stream consumes **317** key symbols;
- the resulting GP-label string matches the archived corrected-Roman witness exactly after the explicit orthographic normalizations **K→C**, **V→U**, and **DURING→DURNG** (the latter reflects the single GP graph NG).

Resetting the key at page 167 or consuming either marked F fails the witness comparison. This is a reproducible historical positive control for a **source-marked, non-consuming F** rule, not evidence that the same key transfers to LP2. The archive identifies its rune transcripts and corrected Latin as period-attributed mirror witnesses rather than independent PGP signatures on every page; preserve that source caveat.

[Exact control and LP2 marker-census SFT](../sims/2014_onion6_explicit_colon_fskip_lp2_marker_census_sft.cjs).

The signed hidden-service reply points to **`ky2khlqdf7qdznac.onion`**. The archived Onion7 page lists images 0–57; this is the 58-image LP2 release corresponding to the corpus analyzed in this repository. This connects the 2014 submission path to the later LP2 dump, but it does not supply the missing decryption key or plaintext for pages 0–55.

## Direct transfer test to LP2

I tested whether the 2014 Vigenère key itself transfers to the 56 unknown LP2 pages. The historical `Gematria.key_to_shifts("FIRFUMFERENFE")` mapping gives the shift vector `[29,19,25,29,28,10,29,11,25,11,20,29,11]`, i.e. modulo 29:

`[0,19,25,0,28,10,0,11,25,11,20,0,11]`

Applied in standard GP29 order to LP2 pages 0–55, continuous or page-reset, with or without treating every F as transparent, and in both signs, it produces no native prose. The historical 2014 pages use **selected, explicitly marked F skips**. A fresh source-image census finds no literal colon in LP2: seven small punctuation events immediately before F are the ordinary ⁘ full-stop class, and no ⁚ comma event precedes F. There are, however, **two unique large red 13-dot section marks immediately before F at page starts p15 and p40**, at global rune offsets **3603** and **9640**. These are the only page-start F runes, and both are preceded by a red13 mark. This is a reproducible *candidate* selector, but not an authenticated F-skip instruction: red13 is a general section delimiter (the p0 red13/body boundary precedes TH, and other red13 marks precede non-F runes).

The only directly source-selected key candidate in the p0 construction is its 13-red-rune title, **SHEOGMIAFSYENGC**. Using it as the 13-symbol Vigenère key, starting after the p0 red13 boundary and holding only the two red13-marked page-start F runes, produces no recognizable plaintext under either additive sign. This rejects only the untransformed title-as-key hypothesis; it does not prove that the red13 candidate could never select a skip for some independently sourced key. The exact positive control, marker census, and bounded title-key test are reproduced in [the source SFT](../sims/2014_onion6_explicit_colon_fskip_lp2_marker_census_sft.cjs). The direct key-transfer hypothesis is rejected; this does not reject other uses of the historical F-skip precedent.

## Sources

- First-party signed-message archive: [Dukotah/cicada3301, 2014 Onion5 PGP message](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/pgp/messages/2014-01-onion5-liber-primus.asc).
- Signature timeline: [Dukotah/cicada3301](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json).
- Book-code decoding and historical chain: [cicada-solvers, 2014 fifth onion](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/007-fifth-onion/README.md).
- Onion6 pages and upload instruction: [cicada-solvers, 2014 sixth onion](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/008-sixth-onion/README.md); [archived Onion6 post](https://github.com/iBotPeaches/cicada_3301/blob/master/onions/ut3qtzbrvs7dtvzp.onion/post/index.html).
- Post-submission pages and Vigenère procedure: [cicada-solvers, square-submission pages](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/009-squares-submission-pages/README.md).
- Signed Onion7 handoff and LP2 release: [cicada-solvers, hidden-service reply](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/010-hidden-service-reply/README.md); [archived Onion7 post](https://github.com/iBotPeaches/cicada_3301/blob/master/onions/ky2khlqdf7qdznac.onion/post/index.html); [cicada-solvers, seventh onion](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/011-seventh-onion/README.md).
