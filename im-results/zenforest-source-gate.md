# A Zen Forest source gate: no LP2 plaintext recovered

**Status:** an authenticated source connection was identified and tested with source-selected running-key hypotheses. None recovered plaintext. This is an intermediate negative, not an established result.

## Source path

The authenticated 2013 second-onion message contains the instruction to “knock on the sky and listen to the sound.” That wording is saying **613** in Sōiku Shigematsu's *A Zen Forest: Sayings of the Masters* (1981). The digitized edition places item 613 at the page-77/78 boundary; the item number is the reliable selector.

Crucially, this quotation already has a historically established role in the **2013** puzzle chain: it directed solvers to ping the hidden service with ICMP echo, whose payload returned the next onion. The repository preserves the signed 2013 message and the recovered ICMP-echo payload. Thus *A Zen Forest* is an authentic literary clue source for a solved 2013 stage, not a new LP2 key source by itself.

The January 2016 signed message's words/map/meaning wording resembles Shigematsu's introduction, but no independent clue selects that introduction for LP2. The 2016 tree carrier is not independent evidence: its archival note says the raster does not establish species or location, and the signed text warns against false paths. A community-wiki attribution to generic oak-tree clipart remains unverified. Treat the semantic resemblance as a weak hypothesis, not a source selection.

Sources:
- [A Zen Forest PDF](https://terebess.hu/zen/ZenForest.pdf): title/copyright/catalog pages identify Shigematsu and the 1981 edition; the introduction is printed p. 3; item 613 is in the numbered sayings section.
- [2013 second-onion signed message](../resources/historical/cicada2013-second-onion-everything-you-need.asc).
- [2013 ICMP-echo response message](../resources/historical/cicada2013-second-onion-icmp-echo.asc) and [compressed response bytes](../resources/historical/cicada2013-second-onion-icmp-echo.hex.txt): the signed response names the next onion.
- [2013 signed forest clue](../resources/historical/cicada2013-forest-clue.asc).
- [2016 signed payload](../resources/historical/cicada2016-4gq25-outguess.asc) and [its archival source record](../resources/cicada2016-4gq25.md).
- [Existing forest/tree page-selection analysis](2013-forest-2016-tree-border-aggregate-gate.md).
- [Canonical LP2 transcription](../resources/liber-primus/lp2-corpus.json).

## Frozen candidates and operation

The source-linked 80–200-rune candidates are:
- **128 runes:** a continuous passage from Shigematsu's own introduction (printed p. 3). It discusses words as pointers beyond themselves and is semantically linked to the 2016 signed message.
- **98 runes:** the authenticated 2013 second-onion message itself. It predates LP2 and contains the saying-613 source clue.
- **184 runes:** the authenticated 2016 signed message. It postdates LP2, so it is a lower-prior continuation/control candidate, not evidence that this text was already in the manuscript.
- **124 runes:** A Zen Forest sayings 614–616, a source-defined sequence adjacent to the quoted item 613.

The principal key hypothesis is the book's numbered text from sayings **613–626**, 589 GP symbols, used as a non-repeating running key. The quote fixes the start at item 613. The target clock is fixed at LP2 p40 rune 0; p40 and p41 are tested continuously, with no page reset or phase fitting. The operation is (P=C\pm K\pmod{29}\), both signs.

A second source-selected test uses the alphabetic body of the authenticated 2016 signed message (184 GP symbols) as a running key for the 128-rune Shigematsu introduction candidate. The key starts at the first alphabetic character of the signed body. The target clock again starts at p40 rune 0.

All encodings use the source-native 29-unit alphabet with **ING** and **IO**, longest-match tokenization, and the existing Cicada normalizations V→U, K/Q→C, Z→S. Spaces and punctuation are removed for the character cipher; the original ciphertext symbols and page boundaries are unchanged.

## Results

| Frozen test | Result |
|---|---|
| 2016 signed-message key → Shigematsu introduction (128), C−K / C+K | 125/128 and 122/128 mismatches at p40 start; no exact hit anywhere in the 184-symbol fixed key clock |
| A Zen Forest 613–626 running key → 2013 signed message (98), C−K / C+K | 95/98 and 92/98 mismatches; no exact hit anywhere in p40–p41 under the fixed clock |
| A Zen Forest 613–626 running key → 2016 signed message (184), C−K / C+K | 175/184 and 179/184 mismatches; no exact hit |
| A Zen Forest 613–626 running key → Shigematsu introduction (128), C−K / C+K | 126/128 and 121/128 mismatches; no exact hit |
| A Zen Forest 613–626 running key → sayings 614–616 (124), C−K / C+K | 119/124 and 115/124 mismatches; no exact hit |
| Wrong book stream starting at 612 → sayings 614–616 | 118/124 and 121/124 mismatches; no exact hit |
| Wrong-source 2013 “do not share” signed text → Shigematsu introduction | 123/128 and 125/128 mismatches; no exact hit |
| Wrong-source 2013 forest clue → Shigematsu introduction | only 1 matching symbol in the 56-symbol overlap for either sign |

The 613–626 book stream decrypts all **504** original symbols on p40–p41. Its output IoC is 0.03368 (C−K) or 0.03478 (C+K), against 0.03414 for the raw pages. The adjacent wrong-source book stream gives 0.03450 / 0.03481. Neither output resembles plaintext.

The 2016-message key decrypts the first 184 symbols of p40; its decoded IoC is 0.03481 / 0.03225. The wrong-source 2013 signed text gives 0.03678 / 0.03335, not a meaningful improvement. The source-authentic solved p57 control has IoC 0.06271. Synthetic encrypt/decrypt round-trips on p57 and exact re-encryption of every tested unknown symbol succeed.

## Interpretation and decision

**Reject the tested A Zen Forest running-key route.** The source connection is real and useful historical context, but none of the source-selected plaintext candidates matches original LP2 under the frozen reversible operations. No plaintext, key, or new cipher mechanism was recovered.

The strongest objection to the book-running-key hypothesis is that the anthology's entries are arranged as a reference collection, not a continuous narrative. More importantly, the quote's already-established 2013 ICMP-echo role is the simpler historical explanation; it does not imply that the book is an LP2 keystream. The 2016 “numbers are direction” wording is not enough to promote that semantic resemblance into an LP2 source selection.

Do not rescue this branch with page resets, shifted key starts, or alternate tokenization. The remaining useful question is whether a *different* original author-linked source, source-caption, or independently archived plaintext claim supplies an independently fixed 80–200-rune island. The 2013/2016 forest clue family can remain a page-selector hypothesis; A Zen Forest is not presently a demonstrated LP2 plaintext source.

## Reproduction

The executable gate is [`sims/zenforest_source_running_key_gate.cjs`](../sims/zenforest_source_running_key_gate.cjs). It reads the authenticated Cicada messages and canonical corpus from the repository. To avoid redistributing copyrighted text, supply local plain-text transcriptions from the PDF:

- introduction p. 3 candidate: 128 GP runes;
- sayings 613–626: 589 GP runes;
- sayings 614–616: 124 GP runes;
- wrong-source sayings 612–626: 583 GP runes.

Run from the repository root:

```sh
node sims/zenforest_source_running_key_gate.cjs \
  /tmp/zenforest-introduction-candidate.txt \
  /tmp/zenforest-items-613-626.txt \
  /tmp/zenforest-items-614-616.txt \
  /tmp/zenforest-items-612-626.txt
```

The script asserts the source lengths, uses ING/IO GP29 tokenization, prints both cipher directions and the two-page held-out output, checks exact re-encryption, tests the authenticated 2013 and 2016 messages as plaintext candidates, includes wrong-source Cicada text controls, and verifies the transform against the source-authentic solved p57 plaintext. No source excerpt is committed.
