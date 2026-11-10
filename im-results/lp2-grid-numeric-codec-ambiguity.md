# LP2 numeric grid: an exact base-60 versus f-omitting base-59 ambiguity

**Agent 41, 10 November 2026. Status: source interpretation and exact coding theorem; no plaintext or original key recovered.** The printed numeric table spans LP2 physical pages 49–51, with 256 two-character tokens in 32 rows of eight. The repository transcribes those tokens in `resources/liber-primus/base60-grid.json`; all measurements here use those source tokens without changing any glyph.

## Source-defined competing interpretations

The conventional byte decoder reads digit alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` (radix 60), so `3N = 203` and `4F = 255`. Across all 256 printed tokens, **lowercase `f` (digit 41) never appears**, although uppercase `F` does. Removing only lowercase `f` produces a 59-character digit alphabet with the natural radix-59 reading `a*59+b`. This second decoder is source-motivated by the *observed* absence of `f` and by solved-Cicada use of F as an interrupter, but the latter analogy does not prove intended usage.

Both are complete, lossless byte codecs on **all 256 observed tokens**. The readings are not identical:

| Printed token | Radix 60 | Radix 59, missing lowercase f |
| --- | ---: | ---: |
| `3N` | 203 | 200 |
| `3p` | 231 | 227 |
| `4F` | 255 | 251 |
| `0g` | 42 | 41 |

Exactly **36** source tokens decode identically and **220** decode to different bytes. Differences (radix60 minus radix59) have counts `{0:36,1:62,2:62,3:63,4:33}`. Both readings yield 161 distinct byte values. The conventional radix-60 reading has maximum 255; radix59 has maximum 251. The original first-digit frequencies are `[60,58,65,56,17]` for 0–4. Re-encoding either decoded byte stream using its corresponding alphabet reproduces all 256 original printed tokens exactly.

## An exact non-identifiability result

Under the explicit null that 256 grid bytes were drawn independently and uniformly from 0–255 and then encoded with either of these standard fixed-width numeral alphabets:

- The radix-60 codec has 256 legal two-character token forms. Four of them, `0f,1f,2f,3f`, are illegal in radix59.
- The radix-59 codec has 256 legal forms. Four of them, `4G,4H,4I,4J`, are illegal in radix60.
- The two alphabets' legal token supports therefore intersect in **252 out of 256 forms**.
- Every observed token lies in that intersection. The exact chance that all 256 iid uniform-byte tokens land there is **(252/256)^256 = 0.017746279621051256** under *either* codec.
- For the observed exact token sequence, each model assigns probability **256^-256**. Its likelihood ratio is therefore **1**, even though the inferred bytes differ at 220 positions.

Consequently, **the empty lowercase-f column alone cannot statistically select one codec against the other under the uniform-byte model**. If an investigator invokes the rarity of absent lowercase `f` to confirm the conventional base60 format, the same observation is expected by construction under radix59, which instead pays an identical likelihood cost for the absent `4G..4J` forms. This is a structural ambiguity in interpreting the published table, not evidence of ciphertext meaning. The exact support argument requires no independence assumption about printed glyph *positions* for the decoder's validity, but its probability calculation does require iid uniform bytes. Different justified byte priors or a source-authenticated decimal/hex encoding could favor either interpretation.

## Cryptanalytic consequence and decision

Existing original-cipher key searches often assume the transcribed `byte_rows` are canonical byte material. Those rows are a *derived* radix-60 reading of the original two-character tokens. A proposal claiming an independently derived source key should say which numeral alphabet fixes the input. A test that is demonstrably insensitive to changing these 220 bytes already covers both. Otherwise the alternative is a distinct input, and a concrete **source-fixed inverse** would be needed to establish it.

This observation does not license a broad new blind search over arbitrary numeral alphabets. A directly printed digit convention, an authenticated earlier independent hex dump whose decimal values were not mechanically derived from the same tokens, a known cryptographic checksum, or an actual original-input plaintext recovery would be a strong discriminator. No unknown LP2 text, key, cipher mechanism or destination follows from the ambiguity.

## Exact reproduction

`node sims/base60_base59_source_ambiguity.cjs` (Node.js 22, built-in modules) asserts source dimensions, base-60 agreement with the repository's derived `byte_rows`, complete re-encoding under both radix choices, source-token support membership and the exact per-token difference identity. It outputs both 256-byte SHA-256 fingerprints and the computed summary. This is an exact source-dataset calculation; it makes no whole-manuscript key-search or language-success claim.

The inference uses the repository's existing source transcription, which has known visually confusable mixed-case characters. It does not independently re-adjudicate those glyphs against the scans. A correction of any original token could change this result and should prompt re-execution.
