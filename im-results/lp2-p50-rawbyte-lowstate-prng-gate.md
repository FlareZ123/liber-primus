# LP2 32×8 printed bytes: exact low-state generator inversion gate

**15 November 2026, Agent1; source-conditioned negative.** The original p49–51 32×8 table contains 256 printed two-character base60 tokens. If these tokens were consecutive raw outputs of a small-state pseudorandom generator, the first few outputs would constrain or recover the hidden state and permit generation of a longer original-derived stream as a possible ciphertext key. That would supply an executable operation independently of any LP2 language fit. **The exact generator families tested here all fail their original-input necessary conditions under the declared base60 reading; three also fail the independent original-token radix59 reading. No LP2 plaintext, creator-supplied key, actual random generator or historical cipher has been identified.**

## Input, scope and falsifiable prediction

The unchanged [source-derived table](../resources/liber-primus/base60-grid.json) contains 32 rows ×8 columns, represented here as **256 conditional base60 bytes**, row first `CB E7 A7 BA 61 ED 7E B7` hex. Both natural reading orientations are fixed independently of all unknown text: row-major 32×8 and column-major 8×32. The historical base59 interpretation remains possible; this test is expressly conditional on base60→byte conversion. Reversals, bit permutation, byte XOR masks, hidden row transpositions, PRNG warmup with a separate clock and middle/rotated bit windows are **outside** this preselected model and are not inferred from the failure.

A positive would be an exact generator and initial-state witness that reproduces the fixed first-byte sequence and then all 256 bytes. Before moving to LP2 ciphertext, the witness would have to survive the remaining 248-byte holdout. The tests require **no trial decryption, vocabulary, encrypted glyph data, cipher key search, random source assumption or postselected score**.

### Exact inverted families

| Generator and output register | Test against the original 256-cell source | Row-major | Column-major |
|---|---|---:|---:|
| **32-bit linear xorshift**: all three shifts `a,b,c∈[1,31]`, both left-right-left and right-left-right XOR-shift orders, either lowest or highest eight bits from every updated 32-bit state | For each model, form 32 GF(2) basis-state output vectors, projected to the first eight observed output bytes (64 bits). Existence of any compatible *unknown 32-bit initial state* requires that 64-bit observed vector lie in their linear span; test **119,164** models per reading order | **0** models fit first 8 bytes | **0** models fit first 8 bytes |
| **glibc `random()&255`**, 31-state additive recurrence with taps 3 and 31 and low-bit-discarded 31-bit outputs | Every index `i≥31` must have `(b[i]−b[i−3]−b[i−31]) mod256 ∈ {0,1}`. The possible carry of one accounts for the discarded internal low bit. This is **seed-independent** | **4/225** compatible recurrences | **2/225** compatible recurrences |
| **One direct, arbitrary-parameter 8-bit LCG** `b[i]=(a·b[i−1]+c) mod256` | Exhaustively test all 256×256 possible pairs `(a,c)` against all 255 original transitions | **0** full-sequence pairs | **0** full-sequence pairs |
| **Five historical-style 32-bit LCG formulas**, including MSVC, ANSI C, Numerical Recipes, Borland and Delphi multipliers/increments | For each of six fixed contiguous 8-bit output windows at shifts `0,8,15,16,23,24`, enumerate **every one of 2²⁴ possible initial 32-bit states conditioned on observed first byte** and require an exact match of the first **16** table bytes; 5×6×2 = 60 models and **1,006,632,960** candidate states | **0/30** model/window matches | **0/30** model/window matches |

For the 32-bit LCG enumeration, a 16-bit or 8-bit state is *not* assumed: for any fixed output window `s`, all 32-bit states whose bits `s..s+7` match the first byte are enumerated exactly. This tests conventional 8-bit windows, including the usual MSVC high-byte register, without fitting a seed. Numeric arithmetic uses unsigned wraparound. The C++ program asserts that every declared byte window's state enumeration contains an independently planted arbitrary 32-bit state.

**Do not generalize the glibc invariant** to glibc's higher-byte outputs or to other state generators. It applies exactly to `random()&255`, including any 31-word warmup and seed: recurrence propagates after its state ring is initialized. The 31/3 condition does not hold for a truncated *higher* byte with just one carry; other projections would require a different gate.

## Independent radix59 numeral interpretation

The conventional radix60-to-byte interpretation is historically **unconfirmed**. To prevent a negative that depends entirely on one contested encoding, a separate [original-token radix59 SFT](../sims/lp2_p50_radix59_weakstate_prng_sft.cjs) reads all **256 original paired numeral tokens** from `resources/liber-primus/lp2-grid-256.json`, removes lowercase `f` from the printed 60-character alphabet, and interprets each token as `59×index(first)+index(second)`. No token uses `f`; **all 256** alternative values are again valid bytes, with 161 distinct values. The first eight are `C8 E3 A4 B7 60 E9 7C B4` hex (200,227,164,183,96,233,124,180), versus the conventional radix60 opening `CB E7 A7 BA 61 ED 7E B7`.

With the same two original, clue-visible reading orders, the independent radix59 input produces:

| Original alternative source reading | Xorshift 32-bit models passing first eight bytes /119,164 | glibc31/3 sum-or-carry pairs /225 | Arbitrary 8-bit full-length LCG pairs |
|---|---:|---:|---:|
| Radix59, printed rows | **0** | **3** | **0** |
| Radix59, vertical columns | **0** | **2** | **0** |

The additional **238,328** exact xorshift model checks therefore do not rescue the straightforward *consecutive 32-bit xorshift byte stream* even if the historical alphabet omits lowercase f. The alternative generator tests are source-conditional, with the same exact output-register assumptions and positive controls as the primary source SFT. The **1,006,632,960-state five-generator LCG32 exhaustion above is specifically radix60 only**; this supplementary radix59 gate does not extend that high-window LCG claim, only the first three generator families in the table. No original LP2 ciphertext/plaintext was consulted in choosing the alphabet.

## Executed reproducibility

- [CommonJS original-table exact gate](../sims/lp2_p50_weakstate_prng_source_sft.cjs) reads the shared 256-byte source, asserts original source shape/first row, runs all 238,328 xorshift parameter/output/orientation cells and both finite seed-independent recurrence checks. The GF(2) test accepts a separately seeded 32-bit planted xorshift stream, rejects an impossible target, and validates the glibc additive output rule using a planted 256-output 31-state recurrence. The 8-bit LCG positive has a nontrivial affine planted stream.
- [C++17 full 32-bit LCG initial-state enumerator](../sims/lp2_p50_lcg32_fullseed_source_sft.cpp) independently rereads the source `byte_rows`, checks the first original bytes, and covers all **2²⁴** compatible initial states for each of 60 declared models. Every output-window enumeration is validated by a planted 32-bit state, and the 16-byte target must match exactly (no approximate score). The source-constrained local optimized C++ run reached all 60 cases with zero matches.
- [Windows Node.js 22 original-source passing CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43755633640) confirms execution of the CommonJS gate in the shared repository. The portable C++17 program also compiled and passed locally under GCC 14 with strict warnings.

The first-eight xorshift condition is deliberately an **early exact impossibility gate**: no seed can match the full table if no seed matches its first eight bytes. Even a model with a nonuniform seed or intentionally unusual first seed value cannot evade that necessary condition. The tests do not attempt to infer a key by maximizing language likelihood.

## Research decision

The direct low-complexity interpretation `printed table→byte stream→recover an ordinary simple generator state→extend an LP2 key` is unsupported for the stated variants. This does **not** classify the table as cryptographically random. An independently hinted nonconsecutive extractor, generator, initialization rule, radix59 interpretation or purpose could change that conclusion, but tuning more seed families just to approach original ciphertext would be a low-prior search. The higher-value next input is an original-source instruction identifying how the 256 cells are *consumed*. Existing table-as-recurring-cipher-alphabet and table-as-direct-pad original-text reports test distinct consumers; they are not replaced by this generator-origin gate.
