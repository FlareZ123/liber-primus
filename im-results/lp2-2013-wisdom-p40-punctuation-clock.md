# 2013 wisdom/folly bytes: source-exact 8+3316+44 punctuated key clock

**Decision (Agent12, 12 November 2026):** A previously untested punctuated source-byte clock exactly consumes the 3,368-byte original 2013 *wisdom/folly* object on the final LP2 pp40–55 textual partition, **but four direct GP29 additive candidate inverses fail** to yield plaintext. This is a bounded original-input negative, a length observation, and **no authenticated cryptographic key**.

## Specific historical and physical inputs

The earlier Cicada 2013 OS has two byte-identical 3,368-byte high-entropy files at /tmp/wisdom and /tmp/folly. The original recovered raw SHA-256 is `7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a`. The original startup scripts do not directly consume either file. The complete LP2 physical pp40–55 text partition is exactly **3,316** GP29 runes. The source-punctuation inventory has **44** events in that range: 39 four-dot stops, 1 comma, and 4 large glyphs. Physical p40 begins with an 8-rune red heading. Accordingly:

    3368 original bytes = 8 candidate header bytes + 3316 original runes + 44 punctuations

This is a *conditional transport proposal*: the 2013 source does not name the 2014 pages, and the p40 heading does not prescribe taking eight bytes off the 2013 binary. The visual nine-chapter map separately divides pp40–53 and pp54–55; the merged pp40–55 is a textual partition with a different clock.

## One frozen complete original-cipher test

Leave source bytes0–7 unused as a hypothetical header. For each original rune from pp40–55, skip one keystream byte for **each punctuation event at that rune offset** and then consume one key byte for the rune. The p55 terminal punctuation consumes the last byte after the last rune. Thus all 3,368 source bytes have an exact role, without fitting offsets or erasing punctuation. Convert each consumed byte either by `byte%29` or `floor(byte*29/256)`, with each of the two additive GP29 signs.

| Frozen direct inverse | Original decoded IoC |
| --- | ---: |
| byte%29 subtract | **0.034621115775** |
| byte%29 add | **0.034310359571** |
| scaled-byte subtract | **0.034534875470** |
| scaled-byte add | **0.034407334429** |

The uniformly random 29-symbol baseline is about **0.034482759**. All original first-line outputs are nonlinguistic; the first byte%29 subtract output starts `B F M R M N M Y E F OE U L EO H EA L A EA EO R OE A W`. Every frozen operation reconstructs all **3,316/3,316** original ciphertext runes exactly under its corresponding forward encoder. Every operation also correctly encrypts and decrypts a GP-native **3,316-rune solved-p57-text plant**. Original stream remains cipher-like under every direct source-consumer choice.

**Reproduce:** [standalone Node22 CJS test](../sims/lp2_2013_wisdom_p40_punctuation_clock_sft.cjs). It pins the original binary SHA256, all physical corpus and punctuation counts, full 3,368-byte clock, four IoCs, exact round-trips and native-GP positive plants.

## Decision

The eight-byte surplus could just be retrospective tokenization. No authenticated instruction links the older /tmp/wisdom file to LP2 pp40–55 or states that printed punctuation should consume a byte. This is **not** a discovered keystream. Even with the explicitly selected eight-byte prefix and all original punctuation, the most direct 2014-style GP29 additive consumer fails. Do not expand into arbitrary eight-byte IV/KDF variants, key offsets, nonlinear state or cipher suites without an independent author-visible operation.
