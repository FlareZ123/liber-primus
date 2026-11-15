# A Zen Forest source gate: no LP2 plaintext recovered

**Status:** a real author-linked source was identified, but the frozen source-derived running-key tests did not recover an LP2 plaintext island. This is an intermediate negative, not an established result.

## Source path and why it was worth testing

The authenticated 2013 second-onion message contains the short instruction to “knock on the sky and listen to the sound.” That wording is saying **613** in Sōiku Shigematsu's *A Zen Forest: Sayings of the Masters* (1981). The digitized book places the numbered saying at the page-77/78 boundary. The stable selector is the item number, not an assumed page number.

A second independent Cicada source is suggestive: the authenticated January 2016 message says that Liber Primus's words are a map and their meaning is the road. Shigematsu's own introduction opens with the idea that a word points beyond itself. The book title, the 2013 forest sentence, the 2013 quote, the 2016 signed wording, and the tree-bearing 2016 carrier make this a plausible human solve-path lead. They do **not** establish that the book is a key or that the preface is LP2 plaintext.

Sources:
- [A Zen Forest PDF](https://terebess.hu/zen/ZenForest.pdf): title/copyright/catalog pages identify Shigematsu and the 1981 edition; the introduction is printed p. 3; saying 613 is in the numbered sayings section.
- [2013 second-onion signed message](../resources/historical/cicada2013-second-onion-everything-you-need.asc).
- [2013 signed forest clue](../resources/historical/cicada2013-forest-clue.asc).
- [2016 signed payload](../resources/historical/cicada2016-4gq25-outguess.asc) and [its archival source record](../resources/cicada2016-4gq25.md).
- [Existing forest/tree page-selection analysis](2013-forest-2016-tree-border-aggregate-gate.md).
- [Canonical original-image LP2 transcription](../resources/liber-primus/lp2-corpus.json).

## Frozen candidate and operation

The primary candidate is a **128-GP-rune** passage from Shigematsu's own introduction (printed p. 3), selected by the 2016 message's words/meaning correspondence. It is not reproduced here because the source edition is copyrighted.

The primary key is the alphabetic text of the authenticated 2016 signed message, starting at its first alphabetic character. After GP29 normalization it is 184 symbols. The target is LP2 p40, whose 231 original symbols are the first physical page in the independently selected forest/tree block.

The operation is a non-repeating running-key Vigenere transform, \(P=C\pm K\pmod{29}\). The clock starts at the first rune of p40; there are no key resets, phase fitting, or post-hoc offsets. Both signs are tested. The key and candidate are independently source-selected; neither was chosen from ciphertext scores.

A second, more exploratory candidate is the 124-rune sequence formed by A Zen Forest sayings 614–616. The running key is the book's numbered text from saying 613 onward. It covers p40 and p41 continuously (504 original runes) without repeating. The strongest objection is that this anthology's entries are arranged as a reference collection, not a continuous narrative; the numbered sequence is therefore a weaker key hypothesis than a continuous authored passage.

## Results

All encodings use the source-native 29-unit alphabet with **ING** and **IO**, longest-match tokenization, and the existing Cicada normalizations V→U, K/Q→C, Z→S. Spaces and punctuation are removed for the character cipher; original ciphertext symbols and page boundaries are not altered.

| Test | Key / candidate lengths | Result |
|---|---:|---|
| Shigematsu introduction under 2016 signed-message key, C−K | 184 / 128 | 125/128 mismatches at p40 start; no exact candidate hit anywhere within the fixed 184-symbol key clock |
| Same, C+K | 184 / 128 | 122/128 mismatches; no exact hit |
| Wrong-source 2013 “do not share” signed text, C−K / C+K | 1,680 / 128 | 123 / 125 mismatches at p40 start; no exact hit |
| Wrong-source 2013 forest clue, C−K / C+K | 56 / 128 | only 1 match in the 56-symbol overlap for either sign |
| Sayings 614–616 as candidate plaintext under the non-repeating 613–626 book stream, C−K / C+K | 589 / 124 | 119 / 115 mismatches at p40 start |
| Wrong book stream starting at saying 612, C−K / C+K | 583 / 124 | 118 / 121 mismatches |

The book-running-key experiment decrypts all **504** original symbols on p40–p41. Its output IoC is 0.03368 (C−K) or 0.03478 (C+K), against 0.03414 for the raw pages. The adjacent wrong-source book stream gives 0.03450 / 0.03481. Neither output resembles plaintext. The source-authentic solved p57 control has IoC 0.06271; synthetic encrypt/decrypt round-trips on p57 and on every tested unknown symbol are exact.

The 2016-message key decrypts the first 184 symbols of p40, including the 128-symbol candidate and a further 56-symbol held-out continuation. Its decoded IoC is 0.03481 / 0.03225, not English-like. The wrong-source 2013 message and forest sentence do not improve the result.

## Decision

**Reject this A Zen Forest running-key route.** The source connection is real and worth retaining as a historical clue, but the candidate preface and the 614–616 source sequence do not match original LP2 under the frozen, reversible operations. No plaintext, key, or new cipher mechanism was recovered.

Do not rescue this branch by trying arbitrary offsets, page resets, alternate extraction functions, or tuned digraph variants. The remaining useful question is whether a *different* original author-linked source or source-caption supplies an independently fixed 80–200-rune island. The 2013/2016 forest clue family can remain a page-selector hypothesis, but A Zen Forest is not presently a demonstrated LP2 plaintext source.

## Reproduction

The executable gate is [`sims/zenforest_source_running_key_gate.cjs`](../sims/zenforest_source_running_key_gate.cjs). It reads the authenticated Cicada messages and canonical corpus from the repository. To avoid redistributing copyrighted text, supply local plain-text transcriptions from the PDF:

- introduction p. 3 candidate: 128 GP runes;
- numbered sayings 613–626: 589 GP runes;
- numbered sayings 614–616: 124 GP runes;
- wrong-source control sayings 612–626: 583 GP runes.

Run from the repository root:

```sh
node sims/zenforest_source_running_key_gate.cjs \
  /tmp/zenforest-introduction-candidate.txt \
  /tmp/zenforest-items-613-626.txt \
  /tmp/zenforest-items-614-616.txt \
  /tmp/zenforest-items-612-626.txt
```

The script asserts the source lengths, uses ING/IO GP29 tokenization, prints both cipher directions and the two-page held-out output, checks exact re-encryption, includes wrong-source Cicada text controls, and verifies the transform against the source-authentic solved p57 plaintext. No source excerpt is committed.
