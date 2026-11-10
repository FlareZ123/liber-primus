# LP2 full-release red-rune and thirteen-dot 256-event source: exact count and bounded inverse

**Evidence status (Agent 25, 10 November 2026):** source-exact count, reversible cipher hypothesis, successful independent positive control, and completed **negative** test on authentic unsolved LP2 ciphertext. **No unknown plaintext, authentic key, original cipher mechanism, or destination is recovered.** The numerical relationship was *noticed after inspecting* manuscript event counts; its probability cannot be read off from any of the permutation tests below.

## Exact original-source clue

The complete 58-page LP2 ink annotation (including the two historically solved p56–57) contains:
- **225 visibly red runes** with original GP indices 0–28;
- **31 thirteen-dot punctuation marks**, consisting of 30 red and the one documented black mark on p7;
- **four ten-dot marks and one twenty-three-dot mark**, explicitly *not* part of this selected event alphabet.

Thus there are exactly **256 red-rune-or-thirteen-dot events**. The number matches the independently printed **32×8 = 256 bytes** in the base60 numeric table on physical LP2 p49–51. In addition, 225=15² and 31=16²−15² allow a **16×16 square with 225 interior rune sites and 31 border marker sites**. This is one possible geometry, not an established reading route. The 31 thirteen-dot events are genuinely present but clustered as adjacent delimiters; they do not naturally partition the 225 runes into 32 equal eight-symbol lines.

The count uses the *full second release*. Restricting to unsolved p0–55 gives only 213 red runes, and does not preserve the 256 equality. It also depends on choosing the thirteen-dot class rather than all 36 large punctuation marks. These source-dependent qualifications prevent asserting deliberate cipher structure from count alone.

Inputs and exact source contract: [LP2 marked ink and punctuation](../resources/liber-primus/lp2-ink-annotations.json), [original normalized GP indices](../resources/liber-primus/lp2-corpus.json), and [base60 byte table](../resources/liber-primus/base60-grid.json). The scripts assert that each marked red rune agrees with the original published ciphertext at its page-local offset. The corrected first red ᛏ on p53 is included.

## Direct table-event correspondence: bounded negative

Define two 256-position event geometries: full manuscript chronology with each thirteen-dot event as a missing GP symbol, and a 15×15 consecutive-red interior of a 16×16 square with the 31 perimeter positions left unobserved. For each geometry, test sixteen table orientations: eight rotations/reflections and the corresponding transposed 16×16 table index. Test **every** nonzero affine slope a=1..28 and intercept b=0..28 for the literal rule

    red GP index = (a*(table byte mod 29)+b) mod29.

This evaluates **25,984** jointly selected assignments on all 225 original red symbols. The strongest has **20/225** matches (chronological layout, orientation 2, a=22, b=23). Over **400** independently shuffled actual-byte tables, repeating full model selection, the mean winning match count is **20.52**, the 95th percentile is **23**, and **323/400** equal or exceed the observed count (add-one upper tail **324/401 = 0.80798**). A correctly planted affine relation is recovered with **225/225** exact matches.

A separate literal digest check compares 18 frozen event serializations (whole, reversed, eight 32-byte chunks and eight 8-strided streams), four hash output constructions (SHA256, SHA512 truncated to32 bytes, SHA3-256, BLAKE2s256), and 16 original grid row-/column-sized 32-byte targets. **1,152** comparisons yield **zero** full 32-byte matches and a maximum **three** equal byte positions. The literal marker code in this diagnostic is 29. Other codes, salt or keyed hashes are untested.

**Source and successful CI:** [exact manuscript event-count and mapping program](../sims/red_13dot_256_event_mapping.cjs); [manual GitHub Actions run 42792653938](https://github.com/FlareZ123/liber-primus/actions/runs/42792653938).

## Constructive eight-section key inverse

The second program takes the same **225 original red GP rune indices** and 31 marker positions to derive 256 input bytes, then maps those to eight candidate 32-byte encryption keys for the eight previously established original text-section groups. Search the **48 frozen source-key variants**:

- event chronologic versus 15×15 interior layout;
- thirteen-dot marker byte 0, 13 or 29;
- exact source byte or XOR with the byte at the identical original table index;
- eight consecutive 32-byte blocks or eight 32-byte strided columns;
- direct 32-byte material or the SHA-256 digest of each 32-byte block.

For each exact key family, test AES-256-CTR and ChaCha20 with zero 16-byte IV; original and reverse key bytes; byte-to-GP reductions by remainder and scaling; and both additive signs. That gives **48×16 = 768** complete candidate configurations. Choose a **globally optimal distinct assignment** of eight derived key columns to eight original LP2 text sections by exact 8×8 assignment, **using only the first 45% of runes in each section**. Freeze source family, cipher parameters and assignment. Decode the untouched remaining 55% using the *correct continuous keystream offsets*, and measure the 29-rune index of coincidence on every heldout section and their length-weighted aggregate.

| Criterion | Original LP2 | Synthetic true-source-key cipher |
| --- | ---: | ---: |
| Training-selected mean IoC | **0.03525025** | **0.06080405** |
| **Frozen heldout IoC** | **0.03458048** | **0.05960642** |
| Original-rune cryptographic roundtrip | No recovered original plaintext | **12,956/12,956** exact |
| Original selected keys | Interior/marker13/raw/columns/SHA256, ChaCha20, scaled, sign− | Chronological/marker13/grid-XOR/columns/SHA256, AES256CTR, direct remainder, sign− |

The blinded synthetic control encrypts independently GP-encoded Shakespeare under an undisclosed eight-column assignment using *exactly one of the tested source constructions*. The blind solver recovers its correct key-family settings and all eight assigned columns; decrypt/encrypt under that recovered scheme exactly matches **all 12,956** planted source runes. This is detector power for the specified model, not evidence the original author used it.

A conditional original-source null **independently shuffles the 225 red-rune values** while preserving the original 31 chronological punctuation locations, original red rune multiset, table bytes, and the entire 768-model train/freeze/heldout selection. Among **60** such nulls, **11** had heldout IoC at least as large as actual LP2, giving add-one **p=12/61≈0.19672**. The null average heldout IoC is **0.03448450**; one null reaches **0.03468098**. The original candidate's heldout output remains indistinguishable from uniform GP runes under this experiment and does not yield readable manuscript text.

**Source and successful CI:** [complete CommonJS inverse and exact positive-control cipher](../sims/red_13dot_eventgrid_key_inverse.cjs); [manual GitHub Actions run 42794989102](https://github.com/FlareZ123/liber-primus/actions/runs/42794989102). Both programs are invoked through the existing red-source manual-only workflow; no per-commit workflow was added.

## What remains open

The observed square-number relation may be a coincidental postselected property of color and dot inventories. The tests disfavor only exact table-to-rune affine mappings, these fixed literal digest formats, and the declared AES/ChaCha family treating the 256 highlighted events as eight section keys. They do **not** test different event traversal, a plaintext not concentrating in GP-English, an external secret, nonadditive cipher, grid bytes used as authentication commitments, hidden key-draw skips, or a binary intermediate layer.

For an authentic solution, a proposed independent reading must yield a **complete reversible decoder**, recover previously unfitted original LP2 runes, and exactly re-encode them. More arbitrary transformations of the already-selected 256 count would be another model search without independent clue constraints and deserve lower priority.
