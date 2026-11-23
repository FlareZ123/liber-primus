# Direct GP29 word-length fingerprint gate against source-authored literary controls

**Agent17, 23 November 2026.** Classification: finite original-cipher plaintext-source decision. No unknown LP2 plaintext, key, or method recovered. This test asks whether already-authored quotations can identify **long** plaintext segments from their exact printed word-length pattern alone, with no cipher parameter fitting.

## Starting premise and independent rival

The original LP2 p0–55 encrypted pages preserve **2,896 complete printed words / 12,956 runes**, including 32 true words crossing original page turns. The *solved* LP2 p56 85-rune example preserves its printed word lengths exactly under the known prime-totient changing-key cipher, so word shapes can survive a genuine Cicada rune cipher. On physical p55, a previously identified, moth-associated seven-word length sequence corresponds exactly to the solved LP1 p05 phrase `THE TOTIENT FUNCTION IS SACRED ALL THINGS` (30 GP runes); this remains a candidate crib without a decipherment or independently chosen key ([historical candidate](lp2-p55-moth-p5-terminal-sevenword-crib.md)). A direct, long quotation from an external 2014-available text would let us recover proposed plaintext *without* guessing the rune cipher, and could then constrain moving-key operations on ciphertext.

The competing explanation is that the unsolved manuscript is original prose, uses an untested source, paraphrases its inspirations, alters word breaks, or encrypts at the space-token level. We must distinguish those from a match or lack of match within a finite corpus.

## Frozen complete-manuscript test

The [read-only Node22 SFT](../sims/lp2_source_anchored_wordlength_fingerprint_sft.cjs) uses the pinned source `resources/liber-primus/lp2-transcription.txt`, its cross-page word-wrap rules, the canonical GP29 transliteration, and the five *already available* reference corpora from the repository. English is converted by the same standardized conventions as the native-language controls in [the independent word-equality gate](lp2-wordprivate-pair-collision-keyless-gate.md): `QU→CW, V→U, K→C, Z→S, ING→NG`, followed by longest-first GP29 rune segmentation. Latin Vulgate material is already encoded in native GP29 word-preserving form. These conventions are an explicitly conditional transliteration choice.

| Source corpus | Native-GP words |
| --- | ---: |
| Shakespeare, pinned first 300k Latin-letter input | 55,407 |
| Gibran, *The Prophet* | 15,733 |
| Emerson, *Essays* | 77,932 |
| Solved LP1 editorially normalized reference | 761 |
| Latin Vulgate, pre-encoded GP29 | 39,835 |
| **Total** | **189,668** |

A lossless eight-consecutive-word-length lookup scans **every** original LP2 word position against **every** source window; every hit is extended left and right, deduplicated by its maximal source and target start, and then filtered to lengths ≥9. Every ≥10-word literal-quote hypothesis necessarily contains an eight-word matching seed, so the filter cannot omit a genuine exact ten-word overlap.

**Result on the actual 2,896-word original:** **nine** total exact **nine-word** common-length substrings, distributed as four Shakespeare, three Gibran, one Emerson, one Latin; **none** in solved LP1. The **global maximum is nine words**. There are **zero** exact contiguous matches of ten or more source-native GP-word lengths across all five pinned corpora.

The nine nine-word windows have quite ordinary source texts, including Shakespeare's `RULE YOU NOT THEIR TEETH HAVE YOU NOT SET` and Gibran's `THAT NO ONE HAS GONE HIS WAY WITH EMPTY`; these are **length coincidences** only and cannot be treated as recovered rune plaintext. The known seven-word p55↔LP1 source association remains below this test's stringent ten-word criterion and is evaluated in its own existing gate.

**Implementation positive:** the SFT plants **fourteen consecutive authentic Gibran native-GP word lengths** from source window 5000–5013 into the original-size length vector at target word index1000. The exact search must recover an interval covering all fourteen source and target positions. The test asserts unchanged source rune count, complete 2,896-word reconstruction, exact identity with `lp2-corpus.json`, five input word counts, nine real-world nine-word matches, zero ten-word matches, and a positive plant detection. All input SHA-256 digests are logged.

## Causal decision

A *verbatim* ten-word-or-longer source quote from these **five pinned corpora** is excluded under the explicit hypothesis that its canonical GP rune spelling and original spaces survive ciphertext emission. This directly retires a finite, inexpensive known-plaintext strategy without spending time on arbitrary ciphers. A long quotation from a different independently named literary source remains possible, as do a paraphrase, nonnative spelling, changed word segmentation, or mixed-word encryption. The existing seven-word LP1-p05 candidate remains unproved. The strong negative does **not** imply a one-time pad, ciphertext entropy class, or impossibility of recovering authentic plaintext by another operation.

**Next meaningful action:** commission only a *source-named, independently located passage* not in these five corpora, or first establish a mechanism for relocating/altering ciphertext word boundaries before repeating a shape-based text search. A brute sweep of more unrelated books, without an authored selector, is unlikely to advance the manuscript.
