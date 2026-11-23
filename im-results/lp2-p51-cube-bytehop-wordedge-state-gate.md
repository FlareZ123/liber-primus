# P51 72/72 receiver: frozen signed-cube byte-hop ciphertext-state inverse

**Agent 5, 23 November 2026, Director task #2382. Classification: one original-source, fully reversible, source-motivated stateful candidate tested and rejected as a native-GP plaintext decoder. No unknown plaintext or authentic author-selected key recovered.**

## Original clue and decisively different alternative

The original physical p51 scan \`68.jpg\` has **72 numeral cells** immediately above **92 GP29 runes in 20 printed words**. Preserving the first rune of each printed word as a *transmitted state* leaves exactly **72 information-bearing rune positions**, with one singleton word contributing an IV and zero information runes. This is unique among the 55 rune-bearing unsolved physical pages; see the existing [same-page 72/72 source audit](lp2-p51-samepage-72-wordedge-numeric-receiver.md).

The authentic signed 2016 word-number clue identifies the permutation \`Q(x)=x³ mod29\`, whose inverse is \`Q⁻¹(x)=x¹⁹ mod29\`. On the original authenticated word-number set, the permutation has six-cycles and fixed points; \`Q⁶\` is the identity on all 29 GP residues. This gives an economical **possible** use of each adjacent printed numeral as a direction/step count: advance the previous ciphertext state by \`byte mod6\` cube steps.

The surviving competing explanation is an incidental 72/72 dimensional fit with no ciphertext decoder. Neither the 2014 book nor the 2016 message instructs the solver to treat a byte as a cube-hop count, distinguish first versus last word edge, use ciphertext feedback, or subtract a state-selected mask. Those are the explicit assumptions of **one frozen hypothesis** tested here. It is materially distinct from prior stateless cube/additive compositions and additive word-IV feedback.

## One fixed fully reversible candidate

Use only the original print order; conventional-base60 bytes from the p51 panel, no table permutations, phase fitting or discarded input. For each original ciphertext word \`C=(c₀,c₁,...,cₙ)\`:

1. Preserve \`c₀\` unchanged as its transmitted word-reset IV. This is input needed for exact inversion, and is counted among the 92 original runes, even when the word has only one rune.
2. For each subsequent \`cᵢ\`, take the next unused printed p51 numeric byte \`b\` and set \`s=cᵢ₋₁\` (previous transmitted ciphertext symbol, initially \`c₀\`).
3. Compute \`k=Q^(b mod6)(s)\`, then recover \`pᵢ=Q⁻¹((cᵢ-k) mod29)\`. The forward law is exactly \`cᵢ=(Q(pᵢ)+k) mod29\`.
4. Continue through all twenty original word units, including the singleton. Restore the original ciphertext by passing the preserved IVs into the exact forward law, not by looking up a language model.

The field GF29, the cube/inverse-cube exponent pair and the six-cycle are fixed independently by the [signed-source operator report](lp2-signed2016-wordnumber-cube-operator.md). The table-to-cube-hop connection is a **candidate**, not established first-party instruction. A single first-edge convention is chosen because original p51 begins \`WWP\` and preceding p51 research already identifies that opener as an independently source-visible address. No last-edge or private-clock alternatives are fitted.

The input page words have exact lengths:

\`\`\`text
3,6,5,5,3,4,3,3,8,3,8,1,3,7,4,8,3,8,4,3
\`\`\`

They retain **20 IVs + 72 decoded symbols = 92 original runes**.

## Actual original-cipher result

The fixed inverse yields the following 19 nonempty GP29 transliteration units, with one empty original singleton unit shown as \`[]\`:

\`\`\`text
DR / ORAEIA / GHEAJ / FRFD / MM / WEH / EOAE / EOTH /
TTHHHGLD / RG / IAUTHSTHIAOE / [] / IN / JLSIPW / HNO /
UEXFLOD / AC / JOMTEONJ / IAEAR / SR
\`\`\`

These 72 symbols have a measured GP29 unigram coincidence index of

\`\`\`text
170 / (72*71) = 0.03325508607198748.
\`\`\`

This is close to uniform \`1/29\`, has no coherent forty-rune source-native plaintext and fails the task's original-language gate. The flattened recovered GP-index tape is frozen in the reproducer, preventing accidentally changing the byte order or reader convention to rescue the outcome.

**Exact positive control:** use the first72 genuine clear p57 GP29 rune indices, repartitioned into the twenty p51 receiver word-unit lengths. Encrypt these 72 native symbols using the same **72 original bytes**, the original **20 first-edge IVs** and the exact forward recurrence; decode again. It returns all **72/72 planted GP runes**, while the synthetic ciphertext contains exactly92 transmitted GP runes. The planted native p57 tape has IoC \`296/(72*71)=0.057902973395931145\`. The original recovered tape exactly forward-reencrypts to all **92/92** source ciphertext runes, including all IVs. These are invertibility checks; they do not validate the candidate as a historical operation.

## Cryptanalytic decision

This **one fixed six-hop cube-state law** cannot recover the p51 passage's ordinary source-native plaintext. It needs no private key and has a perfect inverse, so its failure cannot be excused by missing initial state or an untested original rune. The wider space of arbitrary cube-state updates is not excluded, but expanding it now would be a free choice of secret key schedule: the source specifies **neither the table-byte→hop opcode nor the word-edge state law**. The sole defensible prerequisite for the next p51 attempt is an independently authored instruction defining at least that state transition and how the 20 word edges should be used, or an entirely distinct original-input decoded passage that chooses the inverse prospectively.

Do not treat the 72/72 geometry, a source-word cube six-cycle, or exact forward re-encryption as newly decrypted plaintext. Do not promote this candidate to \`results/README.md\`.

**Reproducer:** [read-only Node.js 22 CommonJS source test](../sims/lp2_p51_cube_bytehop_wordedge_sft.cjs), using only original checked-in \`lp2-corpus.json\`, \`lp2-transcription.txt\` and \`lp2-grid-256.json\`. It asserts exact unmodified inputs, cube-permutation cycle identities, the complete 72-index output, exact92-symbol original replay, and a planted native72/72 round trip.
