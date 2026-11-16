# Red225 / table256 square-boundary inverse: original-input no-go

**Agent 8, 16 November 2026.** This is a bounded, reproducible negative for an unusually compact source-motivated decoding architecture. The 225 physically red LP2 runes, 31 physical thirteen-dot groups and 256 p50 numeric cells suggest a square correspondence, but the original numbers cannot be the ordinary two-dimensional integral of the red-rune stream. **No unknown LP2 plaintext or historical cipher key was recovered.** The geometry remains a clue hypothesis, not a first-party instruction.

## Source hypothesis and independent rival

The complete JPEG ink census gives **225 red GP29 runes** and **31 physical thirteen-dot signs** (30 red, one black at p7). The p49–51 printed field is **32 × 8 = 256** two-character numeric cells, conventionally read as bytes under the *hypothetical* base60 convention. Since **225 = 15²** and **31 = 16² − 15² = 2·16 − 1**, a 16×16 reflow can place the 31 signs on the first row/column boundary and the 225 red runes in the 15×15 interior. A 2D cumulative-sum or XOR integral would then require exactly 31 free boundary values and 225 interior inputs. This motivates a reversible, source-count-constrained operation, particularly given the solved p57 language about shedding circumferences.

The important rival is a fortuitous numerical fit. Three distinct source-visible classes of 256 events have been identified, and none has a first-party row/column-order or byte-to-rune instruction ([source class decision](https://github.com/FlareZ123/liber-primus/issues/1282)). The original table is printed as 32×8, not 16×16, and p57's parable does not command a finite-difference decoding. This test should *not* be promoted to an author-prescribed operation simply because its dimensions fit.

## Exact original-cipher experiment

The [read-only standalone CommonJS test](../sims/lp2_red225_square_delta_sft.cjs) reads:

- [Original derived corpus and GP29 rune indices](../resources/liber-primus/lp2-corpus.json) alongside [source-audited red spans and punctuation](../resources/liber-primus/lp2-ink-annotations.json).
- [The 256 printed table bytes](../resources/liber-primus/lp2-grid-256.json), with the stated base60 transcription uncertainty preserved.

There are two simple, fully reversible 32×8 to16×16 source reflows: concatenate each consecutive pair of printed eight-cell rows, or place the top and bottom sixteen eight-cell rows side by side. For each, test eight 16×16 square symmetries, preserving all 256 numeric cells. Under each of the **16** spatial interpretations, form all **225** interior mixed differences, in row-major interior order, using either

[
D_{i,j}=G_{i,j}-G_{i-1,j}-G_{i,j-1}+G_{i-1,j-1}pmod {29}
]

or the byte-wise XOR counterpart. The direct prediction is that these 225 deltas equal the source-ordered red GP indices. To allow even an **arbitrary unknown 29-entry stationary lookup** (f) before the comparison, group the outputs by each original red rune and count the minimum number of mismatches when every rune chooses its most common observed delta. This is an exact minimization over **all** possible stationary maps, including any chosen affine or nonlinear symbol relabeling. A zero minimum is necessary for the whole architecture.

| Field / source rule | Naive source-order identity, paired unrotated square | Best possible arbitrary lookup over all 16 spatial interpretations | Other original-source obstruction |
| --- | ---: | ---: | --- |
| GF29 mixed second differences | 10 / 225 matches | **At least 172 / 225 changed interior cells** | Same red rune forces incompatible output residues |
| XOR mixed second differences | 0 / 225 matches | **At least 192 / 225 changed interior cells** | The source derivative has **144 or 147 distinct bytes**, far exceeding 29 possible fixed rune images |

The test also constructs both exact planted positives, integrating all 225 genuine red-rune indices back into a synthetic 16×16 square while retaining the original 31 boundary cells (mod29 residues for the GF29 version, raw bytes for XOR). Each plant recovers **225/225** runes exactly and restores every boundary value. This excludes an implementation defect as the cause of the original miss. The original-sample implementation passed [Windows Node22 manual CI run 43947024644](https://github.com/FlareZ123/liber-primus/actions/runs/43947024644).

## Cryptanalytic decision

The mathematically appealing **225 + 31 = 256** square embedding does **not** supply a direct cumulative-sum, reversible XOR-integral, or arbitrary *stationary rune-to-delta* correspondence from red source runes to p50 numeric cells in either natural square reflow and any square orientation. The minimum mismatches are exact key-independent contradictions, stronger than a weak language-score failure. This does not exclude a different, source-selected matrix operation, a changing-state emitter, nonstandard byte codec, hidden reordering, or use of the red events as encrypted key material. None of those has an original instruction here.

**Decision:** do not pursue a larger orient-and-relabel sweep of this same 2D integral. A next experiment would require an independent historical or original-image instruction that selects a specific *value-changing* mapping, authentic key, or text-bearing receiver. Continue prioritizing original plaintext over a dimension coincidence. The current authoritative overall status remains [unchanged](../results/README.md): all 56 unsolved LP2 pages lack a verified decryption.
