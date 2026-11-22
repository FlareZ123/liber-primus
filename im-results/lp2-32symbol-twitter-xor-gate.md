# 32-symbol 5-bit XOR with the 2013 Twitter stream: negative

**Status:** intermediate exclusion of one source-motivated direct operation. No plaintext recovered; no change to the established-results synthesis.

## Why this was worth one bounded test

The p0 red-heading word sums reported in [Director Issue #1254](https://github.com/FlareZ123/liber-primus/issues/1254) differ by 32 (347−315). That does not establish a 32-symbol alphabet, but it motivates checking one natural representation:

- 29 Gematria Primus rune symbols;
- two non-grid text punctuation types, **⁘** and **⁜**;
- the word separator **•**.

An independent page transcription from [relikd/LiberPrayground](https://github.com/relikd/LiberPrayground/tree/main/pages) gives exactly those 32 symbol classes in the LP2 text. Four **⁚** marks are p15 numeric-grid row marks and are excluded from the text stream; the independent [Dukotah punctuation census](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/P3-punct-channels/channels.json) records 145 **⁘**, 31 **⁜**, 2,731 **•**, and four **⁚**.

The other half of the proposed route is historically recognizable: the 2013 Cicada material used bytewise XOR between the Twitter binary stream and 761.MP3 to recover the Gematria Primus image. The reconstructed Twitter stream is already in **resources/cicada2013-twitter-hex-stream.txt**; its format and 64,167-byte reconstruction are documented in **im-results/cicada2013-twitter-format-gate.md**.

This is a plausible experiment, not an author-authenticated LP2 instruction.

## Exact input and test

The relikd page files contain:

| Symbol class | Count |
|---|---:|
| GP runes | 12,956 |
| **⁘** | 145 |
| **⁜** | 31 |
| **•** word separators | 2,731 |
| **⁚** grid marks excluded | 4 |
| **Text symbols** | **15,863** |

Thus the proposed 32-symbol stream packs to 15,863×5 = 79,315 bits, or 9,915 bytes.

The Twitter dump was reconstructed by absolute offsets from 988 records: 64,167 bytes, with no gaps or overlaps. The bounded test used the first 9,915-byte key window at source-selected offsets 0, 13, 32, 65, 133, 315, 331, 347, 416 and 662. The 13/65/416 additions are derived from the 13-rune red heading, 13×5 and 13×32; 133/331/315/347/32/662 come from the p0/2014 HTML numeric relation being examined in #1254. This is a finite clue-driven set; no unconstrained offset scan was performed.

The 5-bit test covered:

- 0-based GP codes 0–28 and 1-based GP codes 1–29;
- all six assignments of **⁘**, **⁜** and **•** to the three remaining 5-bit values;
- both symbol-bit orders and both byte-bit orders;
- all ten listed Twitter offsets.

That is **480** 5-bit candidates. The output was scored against a 20,000-word common-English list fetched from [first20hours/google-10000-english](https://github.com/first20hours/google-10000-english/blob/master/20k.txt). The source transcription and wordlist were fetched at test time and are not mirrored here.

A separate direct bytewise XOR test used rune ordinals and GP prime values as one-byte inputs at the same seven offsets.

## Result

No candidate resembles English.

- The best 5-bit candidate (1-based GP codes, offset 315, symbol-MSB/byte-MSB, with **•/⁘/⁜** assigned to codes 0/30/31) had only **2.40%** of decoded transliteration letters covered by the wordlist, 23 recognized words of length at least three, and zero recognized words of length four or more. The best 0-based candidate reached 2.34% coverage and had only two four-plus-letter hits; neither output is coherent. Coverage counts expanded transliteration letters, including digraphs.
- Its decoded word-separator code occurred 524 times, against 2,731 source separators; the decoded output contained only 1,430 nonempty word fragments.
- The top candidate began **jaeuaedjygthohfaep eowihelo cfaembiacbwbfayyeoaiog ...**, not a coherent plaintext.
- The one-byte ordinal/prime XOR outputs had approximately 37–39% printable bytes, a longest printable run of 43, and no tested common file signature.

The wordlist score is a coarse descriptive filter, **not** a null-model significance test or p-value; no statistical-significance claim is made. The sequence itself remains incoherent, and the decoded separator frequency is incompatible with the source stream. The exact source and test loops are reproducible with **node sims/lp2_32symbol_twitter_xor_gate.cjs**.

The script fetches the nine relikd page files and the wordlist at runtime; it does not copy either source into this repository.

## Decision and scope

Retire the **direct 2013 Twitter-byte XOR** under these natural 5-bit encodings, special-symbol assignments, bit orders and source-derived offsets. Do not expand this into a blind offset search.

This does **not** reject:
- another source-authenticated key or a derived key;
- a different, independently selected operation;
- the 32 relation in #1254 itself;
- other ways of using the original punctuation or page structure.

The p0 numeric relation remains a hypothesis until an independently supported operation predicts plaintext on untouched ciphertext. No LP2 plaintext or key was recovered here.

**Source integrity:** the relikd and wordlist repositories did not expose an explicit license assertion in the checked repository metadata, so their text was fetched for this bounded test and not redistributed.
