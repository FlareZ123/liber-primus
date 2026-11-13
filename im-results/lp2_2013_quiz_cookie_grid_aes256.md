# Historical 2013 quiz-cookie keys against the original LP2 256-byte grid

**Classification (13 November 2026):** a source-bounded original-input negative for one complete AES-256 ciphertext hypothesis. No new unknown-page plaintext, authentic LP2 key, cipher, or destination was recovered. The key source is a contemporary participant report, not a signed original instruction or an independently preserved raw HTTP capture.

## Human-visible source link and exact hypothesis

The documented 2013 Cicada quiz site `p7amjopgric7dfdi.onion` set two cookies with 32-byte hexadecimal values:

- `167=6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6`
- `761=7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5`

The names have prior-round meaning: **167 seconds** is the duration of 2013 `761.mp3`, whose title *The Instar Emergence* has GP prime sum **761**. Each exact cookie value could serve as an AES-256 key without fitting a password. The original 2014 LP2 32×8 printed table across pp49–51 is exactly **256 bytes**, sixteen 16-byte AES blocks. These facts select one cheap source-locked original inverse, although neither a cookie-to-LP2 handoff nor AES encryption is actually instructed in the source.

Sources: the [2013 site and cookie walkthrough](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_2_%282013%29), [contemporary archive transcription](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md), and [the original-image-audited 256-byte LP2 source data](../resources/liber-primus/lp2-grid-256.json).

## Frozen original-input test

Decrypt the unmodified 256 source bytes in physical row-major order using **AES-256-ECB**, no IV, sixteen 16-byte blocks and no padding. Test exactly the two printed cookie keys, without optimizing orientation, key derivation, clock, or subsequent layers. The original 256-byte stream SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

| Historical key | Printable ASCII | ASCII letters/spaces | Complete decrypted SHA-256 | First 16 decrypted bytes |
| --- | ---: | ---: | --- | --- |
| Cookie `167` | 91/256 | 55/256 | `2ee5bd921303001087a964192703dc11b1a27a7463b3a3d7db19da6dc138c9c5` | `9820cdb93b045744db2828f7379946af` |
| Cookie `761` | 91/256 | 53/256 | `a33b7b653a20fa51ba86fd71e3b1dfbfbc14f7cd5a388a470925278eef52c0d4` | `da8a5ae938629921ee30d525647ef6c2` |
| Original table | 103/256 | not measured | as above | `cbe7a7ba61ed7eb75cf99cdef704b7d4` |

Both outputs remain binary-looking without a common file signature or contiguous readable English. Under each historical key, the full decoded stream exactly re-encrypts to the original 256 bytes. A separate 256-byte English plant, taken from the solved PARABLE theme, is AES-encrypted then exactly recovered **256/256** under both source keys. The plant confirms the reversible operation; it is not original plaintext.

The [standalone Node 22/CommonJS reproducer](../sims/lp2_2013_quiz_cookie_grid_aes256_sft.cjs) loads the source table, checks its SHA-256, performs both original inversions, asserts each decrypted hash, proves round-trip equality and tests both source-key positive plants.

**Decision:** the literal AES-256-ECB interpretation under either recorded cookie does not expose ordinary text or a recognized plaintext container in the original LP2 grid. This is a narrow negative, not an exclusion of other ciphertext formats or uses of the cookies. No contemporary author-selected LP2 AES mode, IV, or consumer was recovered. Do not expand with guessed IVs, per-user cookie mutations, block-order permutations or speculative extra layers without an independent original instruction.
