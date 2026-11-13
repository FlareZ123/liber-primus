# 2014 Gödel–Escher–Bach book-code address as a fixed LP2 candidate key

**Agent 17, 13 November 2026. Original-input bounded negative.** No new unknown-page Liber Primus plaintext, authentic LP2 key or destination was recovered. The key source below is a documented output of the actual 2014 Cicada path, while its **transfer into LP2 is an unproven hypothesis**. This is one fully fixed direct consumer, not a license to scan different book passages or key phases.

## Historical source and specific human solve-path premise

The 2014 puzzle presented a signed block of 14 dialogue-address references such as `3PI:6:1:3` and `LML:1:1:1`, interleaved with literal digits `3` and `7`, alongside separate clues to Gödel, Escher and Bach. The historically documented solution identifies Douglas Hofstadter's *Gödel, Escher, Bach: An Eternal Golden Braid* and reads one character from each specified dialogue reference, yielding the 16-character old Tor-v2 host **`ut3qtzbrvs7dtvzp.onion`**. The code's published reading is *dialogue:line:word:letter*. It led players onward in the same 2014 puzzle before the full Liber Primus release.

Period walkthrough with complete original coordinate list and output: [Uncovering Cicada, 2014 account](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282014%29); independent reader reconstruction: [Connortumbleson 2014 solve part 3](https://connortumbleson.com/2024/06/03/the-cicada-3301-mystery-puzzle-3-solve-part-3/). [MIT's 1999-edition reading schedule](https://opencw.aprende.org/high-school/courses/godel-escher-bach/readings/) separately confirms the dialogue chapters' names and print-page positions. The 16-character address is an *already decoded historical pointer*, not newly recovered plaintext and not proven to be an LP2 pad.

**Motivation for one original-cipher inverse.** A solver who had just used GEB to reach a Tor page could retain the address as a key candidate for the 2014 manuscript. Its 16 RFC4648 base32 symbols supply a source-fixed, repeatable 16-position tape. Since the 2013 puzzle explicitly introduced BASE29 and GP29 additive shifts are authenticated on solved LP pages, the shortest possible consumer is the source host's base32 digit indices reduced modulo29 and added/subtracted cyclically to LP2 rune ordinals. This cross-base reduction and key transfer **are not instructed** by a source. The historical code does not identify LP2 plaintext, key boundaries, or an LP2 cipher.

## Frozen input and complete decoding gate

Source hostname without `.onion`: `ut3qtzbrvs7dtvzp`. RFC4648 lowercase alphabet `abcdefghijklmnopqrstuvwxyz234567`, zero-based. Reduce each of its sixteen values modulo29, giving the exact GP29 key:

```text
20, 19, 27, 16, 19, 25, 1, 17, 21, 18, 2, 3, 19, 21, 25, 15
```

The `7` source symbol gives RFC4648 index31, consequently GP index2; this lossy mapping is a **deliberate candidate** rather than a cryptographic identification of 7 with rune2.

The unchanged original source [LP2 numeric corpus](../resources/liber-primus/lp2-corpus.json) supplies 12,956 unknown GP runes across 55 rune-bearing physical pages (p0–55, p50 empty). For each position i take `P[i] = (C[i] + sign*K[i % 16]) mod29`, with `sign` in `{-1,+1}` and the clock either book-continuous from physical p0 rune0 or reset to zero at every physical page start. All four source-constrained arrangements are checked in full. No arbitrary phase, rotation, guessed substring, IV, extra red-rune trigger or fitted key is admitted.

| Clock | Inverse sign | Full 12,956-rune GP29 IoC |
| --- | ---: | ---: |
| Book-continuous | minus | **0.034481686613** |
| Book-continuous | plus | **0.034468924838** |
| Page-reset | minus | **0.034492768267** |
| Page-reset | plus | **0.034472011019** |
| Original ciphertext | unchanged | **0.034478397865** |

Reference uniform 29-way collision probability is `1/29 ≈ 0.034482759`. The native-GP plaintext control, independently published as unencrypted physical p57 PARABLE (95 runes), has much more concentrated English-like symbol counts. The original candidates stay almost exactly at uniform-ciphertext frequency and produce no coherent original prose. This test is decisive only for the **specified sixteen-digit repeating additive GP29 interpretation**, including the two original source-boundary clocks; it does not exclude a non-additive or independently source-selected GEB book-cipher route.

## Reversible positive control and result boundary

The [dependency-free, source-locked CommonJS SFT](../sims/lp2_geb2014_onion_base32_direct_sft.cjs) reads the original numeric corpus and confirms each proposed original decryption exactly re-enciphers every one of 12,956 source symbols. For both signs and both clocks, it separately encrypts the genuinely solved 95-GP-rune p57 PARABLE under this same original historical 16-digit key and recovers all 95/95 symbols. The stated original-cipher IoCs were also independently computed directly against the remote canonical corpus before committing the SFT. A successful synthetic roundtrip proves only that the declared inverse is correct; the absence of linguistic concentration in the original data is the actual negative evidence.

**Decision:** the GEB dialogue source is historically available, specific and entirely distinct from an arbitrary guessed password. Its recovered 2014 onion hostname has no demonstrated LP2 key role under a standard direct additive consumer. More direct periodic-key searches would be redundant. A source-authenticated instruction specifying how GEB dialogue addresses, word indices or a fixed book passage are consumed by LP2 could justify a *different* constrained attack, preferably with an independently corroborated edition and held-out unknown-page plaintext. The present test gives no authority for scanning arbitrary pages of a copyrighted book or for treating a syntactically valid onion address as the sought deep-web hash preimage.
