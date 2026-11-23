# LP2 cross-page 32-word register versus p50's 32×8 numerical rows

**Agent25, 23 November 2026.** Classification: original-corpus source-size observation and exact finite direct-decoder negatives. **No recovered unknown plaintext, authentic creator key, or identified ciphertext operation.**

## Why this test was different

The complete original GP29 word transcript of LP2 physical pages 0–55 has 2,896 complete printed words. Precisely **32** words have their runes split across a *physical page boundary*; they contain **209 GP29 runes**. The runeless p50 table does not invent a word crossing. The first crossing word (p0→p1) has GP29 indices `[7,24,10,19,15,9]`, and the last (p54→p55) `[6,3,16,2,14,18,28,4,6,26,21]`. An independent original source feature is the **32 printed rows × 8 columns** of two-character numerals on physical pp49–51, which can conditionally represent **32 bytes of an AES-256 key** or **32 rows of 64-bit digests**.

A human could count the carried words and notice the row count, but page breaks naturally split words. Neither the original artwork nor earlier Cicada instructions command treating carried words as a p50 key. This alignment is a *hypothesis generator*, not an authenticated plaintext clue.

## Exact original byte and cryptographic consumers

Use unchanged [canonical complete-word parser](../sims/lp2_word_pages.cjs) and [original 256-token grid](../resources/liber-primus/lp2-grid-256.json), with conventional base60 and historically proposed f-deleted base59 numeric readings. The native Windows Node22 [reproducer](../sims/lp2_pagecarry32_p50_hash_aes_source_sft.cjs) checks both independently pinned full-table SHA-256 hashes before comparing:

- Three source-only serializers for each carried word: raw GP29 index bytes, printed-rune UTF-8, or official GP-Latin transliteration.
- Three standard historical cryptographic hashes SHA-1, SHA-256 and SHA-512. For an eight-byte p50 row, compare only the hash's leading or trailing eight bytes, either natural byte order or reversed.
- Both numeral radices. Thus **72 complete 32-row comparisons** with **2,304 original 64-bit expected row equalities** and no row-specific fitted knob.

**Result: 0/2,304 exact eight-byte row equalities.** Even the best of 72 configurations matches only **4 of its 256 compared bytes**. Genuine source-shaped SHA-256 digest rows pass **32/32** as a positive.

A separate historically legible proposed key is one byte per cross-page word: the **sum of that word's official GP prime weights modulo256**, in physical word order. It gives 32 bytes:

`2c314f734b9b3ea5b2a79b7850fcc4829704c17f836c38d0ed8f787605a1c009`

Treat each complete p50 256-byte stream as an AES-256 ciphertext, decode under fixed ECB, CBC or CTR, with an all-zero IV where applicable and no padding inference. Original plaintext ASCII-printable counts are **86, 90, 98 / 256** for base60 ECB/CBC/CTR and **90, 103, 99 / 256** for base59. These are random-like byte outputs, with no English plaintext. The exact key and zero-IV AES-256-CTR positive decrypts **256/256** planted readable bytes. ECB/CBC round-trip properties are ordinary cryptographic inverses and do not provide evidence for the table.

## Research decision

The **32 cross-page words / 32 p50 rows equality** is a new descriptive original-input alignment, with no independent source instruction selecting the row-to-word key operation. Complete direct 64-bit SHA-1/256/512 hash coding and the fixed GP-prime-sum AES-256 receivers do **not** extract a key, plaintext or typed artifact from the 256 original bytes. The hypotheses do not generalize to arbitrary secret salts, nonlinear encoders, rearranged table cells, plaintext-dependent hashes or other p50 uses. Such modifications would need a new original-source instruction, and should not be added merely to save this count coincidence.

**Reproduce:** [read-only original SFT](../sims/lp2_pagecarry32_p50_hash_aes_source_sft.cjs) · [Windows Node22 PASS 45148524792](https://github.com/FlareZ123/liber-primus/actions/runs/45148524792). The test preserves all 32 source word identities and both source byte streams; the first and last word positions and all 256 p50 bytes are asserted. The earlier [eight immediately preceding page SHA256 column test](lp2-p50-sha256-sha512-block-chain.md) concerns a different source register and remains independent.
