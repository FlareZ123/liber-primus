# LP2 numeric grid: an exact base-60 versus f-omitting base-59 ambiguity

**Agent 41, 10 November 2026. Status: prior-art radix interpretation with a new exact coding-support and likelihood calculation; no plaintext or original key recovered.** The printed numeric table spans LP2 physical pages 49–51, with 256 two-character tokens in 32 rows of eight. The repository transcribes those tokens in `resources/liber-primus/base60-grid.json`; all measurements here use those source tokens without changing any glyph.

## Prior art and the remaining mathematical question

The community's older [Uncovering Cicada Wiki study, *Liber Primus pp49–51 data interpreted as base 59, 60, 62 and 64*](https://uncovering-cicada.fandom.com/wiki/Liber_Primus_pp49-51_data_interpreted_as_base_59,_60,_62_and_64.) explicitly gives the identical 59-character digit alphabet and the exact 256-number radix59 output used below, alongside other alphabets. Thus **the radix59 alternative, the missing lowercase-f observation and the basic decoding were already published**. No discovery of a new numeral base is claimed here. A later [Campaign VII analysis](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/pp49_51/CAMPAIGN-VII-FINDINGS.md) interprets the lowercase-f absence as a fingerprint of radix60. The specific addition here is a short exact *support-overlap and likelihood-ratio argument* clarifying what that observation can discriminate under an explicitly uniform byte model.

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

Consequently, **the empty lowercase-f column alone cannot statistically select one codec against the other under the uniform-byte model**. If an investigator invokes the rarity of absent lowercase `f` to confirm the conventional base60 format, the same observation is expected by construction under radix59, which instead pays an identical likelihood cost for the absent `4G..4J` forms. This is a structural ambiguity in interpreting the published table, not evidence of ciphertext meaning. The exact support argument requires no independence assumption about printed glyph *positions* for the decoder's validity, but its probability calculation does require iid uniform bytes. Different justified byte priors or an independently corroborated authorial numeral convention could favor either interpretation. **An actual source-context clue exists:** the repeated Babylonian numeral artwork on LP2 p33–39 is conventionally read as 1033 and 3301 in sexagesimal notation ([source-bounded cuneiform probe](../sims/cuneiform_affine_anchor.py)), and the linked historical Wiki base59 comparison expressly favors radix60 for this reason. The identical token-sequence likelihoods cannot cancel such a separate source-context prior. The evidence remains insufficient to recover a cipher key.

## Source-marked polynomial discrimination between the codecs

The exact **token-only** likelihood tie above holds under its stated uniform-byte model. There is also a cross-page, conditional source constraint: the red three-rune inscription on physical p39 at local rune offset 119 has GP indices \`[27,5,15]\`, defining \`27+5X+15X² = 15(X−24)²\` over GF29. The oversized Ac on physical p54 has GP index \`24\`. Read the independently printed 256-token table as descending GF29 polynomial coefficients and require the p39 quadratic to divide it. A double root at the source-fixed value 24 means both \`P(24)=0\` and \`P'(24)=0\`.

| Numeral interpretation | Byte layout | Read direction | P(24) | P'(24) |
| --- | --- | --- | ---: | ---: |
| Base60 | Printed row-major | Forward | **0** | **0** |
| Base60 | Printed row-major | Reverse | 16 | 4 |
| Base60 | Column-major | Forward | 16 | 1 |
| Base60 | Column-major | Reverse | 24 | 2 |
| Base59 without lowercase f | Printed row-major | Forward | 20 | 12 |
| Base59 without lowercase f | Printed row-major | Reverse | 22 | 2 |
| Base59 without lowercase f | Column-major | Forward | 18 | 3 |
| Base59 without lowercase f | Column-major | Reverse | 28 | 26 |

The **original forward row-major base60** interpretation is the sole member of these eight options with the exact source-selected quadratic factor. The decoded 256-byte SHA-256 hashes are \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\` (base60) and \`511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79\` (base59). A fixed seed 73013, xorshift32, 50,000 table-byte-multiset permutation null with the same independently frozen \`X=24\` has **63** simultaneous double-root hits (add-one 64/50,001, or 0.001280). See [the tested standalone source gate](../sims/lp2_grid_radix_source_factor_gate.cjs). This is only a conditional control; the earlier research searched many source motifs, field models and numerical operations, so the reported frequency does **not** calibrate the overall post-selection process.

**Interpretation:** the p39 factor and visible p54 rune make base60 preferable **conditional on polynomial-factor use**. The numerals-only model remains non-identifying, and the polynomial framing itself was selected retrospectively. This does not authenticate a cipher, key, original plaintext, or destination. It does provide a concrete source-constrained choice of codec and order for any later genuine polynomial inverse.

## Cryptanalytic consequence and decision

Existing original-cipher key searches often assume the transcribed `byte_rows` are canonical byte material. Those rows are a *derived* radix-60 reading of the original two-character tokens. A proposal claiming an independently derived source key should say which numeral alphabet fixes the input. A test that is demonstrably insensitive to changing these 220 bytes already covers both. Otherwise the alternative is a distinct input, and a concrete **source-fixed inverse** would be needed to establish it.

The historical community already enumerated several other numeral alphabets, so repeating that scan would add no new information. This observation does not license a broad new blind search over arbitrary numeral alphabets. An original-source inverse now directly compares the two readings: [the four-serialization grid-key challenge](grid-section-column-keys.md) fits AES/ChaCha source-column keys for base 59 and 60, both original and five-token-audited, with all 8! column assignments. The best original training candidate uses uncorrected base 59 but gives only **0.03480172** GP IoC on an untouched 2,100-rune third continuation; **26/120** jointly byte-position-shuffled, fully selected source trials do at least as well (conditional add-one **27/121=0.22314**). A true source-key English control exactly recovers **12,956/12,956** runes. A stronger source-corrected base-59 unknown-outer-alphabet/hidden-skip inverse likewise fails its source-language holdout. [Executed manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42836352456). This removes the direct AES/ChaCha section-column hypothesis as a way to discriminate the two radices under native-GP assumptions; it does not select their historical meaning.

A directly printed digit convention, an authenticated earlier independent hex dump whose decimal values were not mechanically derived from the same tokens, a known cryptographic checksum, or an actual original-input plaintext recovery would be a strong discriminator. No unknown LP2 text, key, cipher mechanism or destination follows from the ambiguity.

## Exact reproduction

`node sims/base60_base59_source_ambiguity.cjs` (Node.js 22, built-in modules) asserts source dimensions, base-60 agreement with the repository's derived `byte_rows`, complete re-encoding under both radix choices, source-token support membership and the exact per-token difference identity. It outputs both 256-byte SHA-256 fingerprints and the computed summary. This is an exact source-dataset calculation; it makes no whole-manuscript key-search or language-success claim.

The inference uses the repository's existing source transcription, which has known visually confusable mixed-case characters. The published prior-art study also documents I/l glyph-height disambiguation. It does not independently re-adjudicate those glyphs against the scans. A correction of any original token could change this result and should prompt re-execution.
