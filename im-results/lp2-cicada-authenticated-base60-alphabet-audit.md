# Cicada-authenticated base-60 alphabet audit for the pp49–51 table

**Decision (12 November 2026): bounded negative.** The surviving period-authenticated Cicada sources reviewed for 2012–2016 do not specify a 60-symbol alphabet, its digit order, a zero convention, or a base-60 decoding operation for the 256 two-character tokens printed on physical pp49–51. The only explicit radix command in the authenticated 2013 protocol is `BASE29`. Conventional base60 remains a plausible external convention, not a Cicada-authenticated choice. No key, plaintext, or p50 consumer is established.

## Question and acceptance rule

The pp49–51 table is an original Cicada artifact: 256 two-character alphanumeric tokens across physical pages 49, 50 and 51 (80 + 104 + 72 cells). The specific question here is narrower than whether a convenient base60 conversion exists: does a contemporaneous Cicada-authenticated source fix the 60 symbols, their order, the zero digit, and the operation that consumes the resulting values?

A positive finding would require an original signed instruction or an independently attributable creator-side artifact that fixes those choices before the p50 values are interpreted. A modern archive's `sexagesimal.bin`, a generic library convention, or a readable-looking post-selected output is not sufficient.

## Period-authenticated source findings

### 2012

The preserved January 2012 signed-message set includes the key announcement, key-in-front-of-you hint, book-code poem, coordinates, second-chance message, and end/final messages. These use PGP signing, book coordinates, geographic coordinates, and a large terminal integer. None defines a 60-character numeral alphabet, positional radix, or zero representation. The separate signed countdown message likewise contains a time instruction and `3301`, not a radix rule.

### 2013

The signed 2013 material introduces Gematria Primus and contains the clearest source-authenticated numeral instruction, but it is explicitly **BASE29**, not BASE60.

- The 26 January 2013 TCP-server challenge is preserved as a decrypted signed artifact, SHA-256 `fdfe1208b49f75ce634224d2b0561e4c8b322f27dd74bd757f5d83ebcfbdb88c`, with a verified signature under Cicada fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`. It specifies `BASE29`, `DH`, and `NEXT`; its worked numeral example is `BASE29 3301 → 3QO`. It contains no BASE60 command, alphabet, or reference to MIRACL/Sendmail. See [the signed-source record](../resources/external/2013-tcp-server-signed-source.md).
- The signed `2013-01-rune-table-morse.asc` message is a whitespace payload, not a 60-digit legend. Reproducible decoding: map space→0 and tab→1, concatenate the four nonempty payload lines, group MSB-first into 69 bytes. The result is `Come to emiwp4muu2ktwknf.onionWe shall await you there.Good luck.3301`. It selects the next onion, not an alphabet.
- The other preserved signed 2013 route messages (first-onion hello, forest clue, second-onion/ICMP responses, and recruitment text) contain no base60 selector. The separate participant DH transcript is not itself signed; the signed protocol says the participant server chooses its own DH base and secret, so those values cannot be promoted to organizer-selected p50 key material.

### 2014

The signed 2014 opening-book-code and onion messages, LP hash block, LP1 image payload, and May LP release do not define a base60 alphabet for LP2.

- The signed Stage11 locator/release message points to `ky2khlqdf7qdznac.onion` and says that the solver's enlightenment awaits; it gives no table legend, encoding, seed, or consumer.
- The preserved original May 2014 Stage11 index is a 1,640-byte HTML page with title `133`, div id `331`, and exactly 58 sequential image links `0.jpg`–`57.jpg`. It has no table-specific legend, script, form, or decoding instruction. The source-preservation audit and 58/58 image identity check are in [the Stage11 release-envelope report](lp2-stage11-original-release-index-envelope.md).
- The three-page table is indeed printed in the original LP2 release. However, the familiar `49.txt`, `50.txt`, `51.txt`, `decimal.txt`, and `sexagesimal.bin` sequence is a **participant conversion chain**: the three text transcriptions precede the decimal/binary converter in the May 2014 participant Git history. The binary is not a Cicada-issued attachment or signed decoding instruction. See [the upstream transcription audit](cicada2014-sexagesimal-upstream-transcription.md).
- The p33–39 Babylonian-style rubric is a separate source-visible sexagesimal notation for 1033 and 3301. It fixes how those wedge numerals are read; it does not define the Latin alphanumeric tokens on pp49–51, their zero digit, their order, or a byte/key consumer. This transfer was already bounded in [Issue #440](https://github.com/FlareZ123/liber-primus/issues/440).

### 2015–2016

The preserved 2015 signed denial contains no numeric encoding instruction. The signed 2016 4gq25 payload says: “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.” It is source-authenticated guidance to use the book's words, meaning, and numbers, but it does not name the pp49–51 table, a radix, a 60-character alphabet, digit order, or zero convention. The archived image's provenance limitations are recorded in [the 2016 source note](../resources/historical/cicada2016-4gq25.md).

## Distinguishing external base60 precedent from Cicada selection

The exact alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` is documented before 2014 in the February 2007 MIRACL manual and independently in the December 2002 *Sendmail* manual. These establish a real technical base60 convention, including `0=0`, `A=10`, `Z=35`, `a=36`, `f=41`, and `x=59`. They do **not** establish that Cicada used either library or adopted that convention for LP2.

The repository has already recorded this generic prior art and its precise limits in [the MIRACL source note](../resources/external/miracl-2007-base60-alphabet.md) and [Issue #337](https://github.com/FlareZ123/liber-primus/issues/337). This audit does not repeat alphabet sweeps or re-score the p50 ciphertext.

The original pp49–51 token transcription contains 59 distinct characters from the candidate base60 set, with lowercase `f` absent. That absence alone selects neither a 59-symbol alphabet nor the conventional 60-symbol alphabet. The manuscript supplies no example mapping a printed token to a known decimal value. The exact p50 base59/base60 byte fingerprints already exist in `sims/p50_miracl_base60_alphabet_match_sft.cjs`; they are data fingerprints, not authentication.

## Decision and next action

**Close the Cicada-authenticated alphabet branch under its stated scope.** No reviewed 2012–2016 Cicada-authenticated source specifies a 60-symbol alphabet/order/zero convention for pp49–51. The signed 2013 `BASE29` instruction must not be silently generalized to a different token alphabet; p33 cuneiform sexagesimal notation must not be transferred to the alphanumeric table without an independent selector; and the participant-generated `sexagesimal.bin` must not be described as creator-issued.

Do not perform further base60/base59 alphabet searches, byte scoring, or p50 consumer sweeps on this premise. Reopen only if a new original Cicada-signed instruction or creator-attributable source supplies the missing digit legend and a specific, independently checkable p50 consequence. This is a bounded source-negative, not proof that the table is not base60 and not a recovered key or plaintext.
