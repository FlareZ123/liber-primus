# p50 32×8 word-direction byte automaton: exact original-input gate

**Decision (Agent19, 18 November 2026):** a compact nonperiodic state machine directly suggested by the p50 table's dimensions and the signed 2016 phrase *numbers are the direction* fails on the intact 12,956-rune LP2 unknown text. The failure is stronger than a low language score: under the actual word-direction stream, **all 256 possible initial byte states synchronize after only 53 source words** in the word-step model, or after **53 runes** in the rune-step model. Exhausting both additive signs and both before/after read timings gives only near-uniform GP29 outputs. No unknown LP2 plaintext, authentic key, or destination is recovered.

This is an intermediate bounded negative. It does not establish that the p50 table is unrelated to LP2, and it does not exclude a state machine whose transition depends on additional source-visible data.

## Why this operation was worth testing

The original pp49–51 object is a **32×8 table containing exactly 256 two-character numeral cells**, each presently represented as one byte 0–255 in [the canonical table resource](../resources/liber-primus/lp2-grid-256.json). A byte therefore decomposes naturally into a five-bit row and a three-bit column. Independently, the signed 2016 material says that **numbers are the direction**; the repository's source audit for that clue is summarized in [the signed-2016 gate](lp2-tree121-signed2016-source-gate.md).

A human-visible low-description-length consumer is therefore:

```text
d(word) = Σ GP-prime-weight(cipher rune) mod 8
row     = high five bits of state
state'  = table[row, d(word)]
key     = state mod 29
```

The use of GP prime weights follows Gematria Primus itself rather than an invented alphabet. The eight possible residues fit the eight printed columns exactly. The table value becomes the next byte state, so the mechanism is nonperiodic and value-changing rather than another stationary table selector.

Two rigid clocks were frozen before scoring:

1. **Word-step:** update the byte state once for each original printed word and apply the resulting GP29 key to every rune in that word.
2. **Rune-step:** hold that word's direction fixed while updating the byte state once for every rune.

For each clock, test both arithmetic signs and both natural read conventions, using the state before or after the transition. The only hidden scalar is the initial byte state, so **all 256 starts are exhausted**.

## Exact original source

- p0–55 ciphertext: **12,956** intact canonical GP29 runes.
- Original word structure: **2,896** complete printed words parsed from the canonical transcription; flattening those words exactly reconstructs all 12,956 source runes.
- p50 bytes: all **256** canonical table bytes in original row-major geometry.
- Direction value: sum of the published GP prime weights for every ciphertext rune in the current source word, modulo 8.
- No p55 plaintext, language model, crib, fitted substitution alphabet, or unknown key stream enters the transition.

The [single-file CommonJS reproducer](../sims/lp2_p50_worddirection_byte_automaton_sft.cjs) asserts the source dimensions, exact word reconstruction, complete state synchronization, all 256 initial states, every rigid decoder, and exact forward reconstruction of the original ciphertext.

## Structural result: the automaton forgets its seed

Apply the actual original word-direction sequence simultaneously to every possible starting byte.

For the **word-step** machine, the possible state set contracts:

```text
after word 1:  30 states
after word 2:  18
after word 3:  14
after word 5:  10
after word 15: 4
after word 16: 3
after word 31: 2
after word 53: 1  -> state 144
```

Every possible initial byte therefore yields the same key state from word 53 onward.

The **rune-step** interpretation synchronizes even faster in source distance: after exactly **53 runes**, at original word index 10 / local rune index 3, all 256 initial states have merged into byte **189**. An unknown seed cannot function as a long-lived secret in either model.

This synchronization is an algebraic property of the original table and the frozen source-derived direction stream. It does not depend on English scoring.

## Exhaustive decoder result

Normalized GP29 IoC of the best original output over all 256 starts:

| Clock | Sign | Key read | Best IoC |
| --- | ---: | --- | ---: |
| word-step | − | before transition | **0.0344707837** |
| word-step | − | after transition | **0.0344634555** |
| word-step | + | before transition | **0.0344595591** |
| word-step | + | after transition | **0.0344545425** |
| rune-step | − | before transition | **0.0344757645** |
| rune-step | − | after transition | **0.0345345330** |
| rune-step | + | before transition | **0.0344977252** |
| rune-step | + | after transition | **0.0344973439** |

The entire 256-start range is extremely narrow in every case. The source outputs are visibly nonlinguistic and remain near the uniform GP29 reference (1/29≈0.0344828). Each trial is independently re-encoded with the same frozen state sequence and asserted to reconstruct all **12,956/12,956** original ciphertext runes exactly, so failure is linguistic/structural rather than an implementation non-invertibility.

## Interpretation and next decision

This closes the specific **high-five-state-bits / three-bit word-direction / table-value-next-state / direct additive GP29** family under both natural clocks. Its main diagnostic value is the rapid synchronizing behavior: varying the initial state cannot rescue the mechanism after the first 53 source units.

Do **not** expand this branch by seed hunting, alternative start bytes, arbitrary column permutations, or fitted affine output maps. Those choices cannot repair the rapid loss of state memory and lack an independent source selector.

A materially different continuation would need a source-visible way for the transition to depend on something beyond the current byte state and the one three-bit word direction, such as a separately authenticated collision/rejection event, punctuation state, or a second table operand. That would be a different architecture and should first explain why the original p50 leading-zero class is associated with the manuscript's rare adjacent doublets.

