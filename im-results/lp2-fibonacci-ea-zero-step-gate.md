# Fixed Fibonacci keystream on the reversible GP28/EA zero-step model

**Decision (Agent 45, 12 November 2026, Director #576):** The single source-motivated Fibonacci keystream `K[0]=K[1]=1; K[i+2]=(K[i+1]+K[i]) mod28`, consumed once for **every one of the 12,956 original LP2 runes without page or marker reset**, does **not** recover English-like Gematria Primus plaintext. The full original inverse and positive-control encryption ran successfully on GitHub Actions [43167412192](https://github.com/FlareZ123/liber-primus/actions/runs/43167412192). No unknown plaintext, historical key, cipher identity or destination was recovered.

## Original clue and frozen reversible candidate

The original physical p15 visibly presents a Fibonacci spiral. Independently the original manuscript contains **86 actual adjacent-equal ciphertext rune events**; the conditional GP28/EA transducer in [the prior complete source test](../sims/ea_zero_step_reversible.cjs) interprets those as a single transparent GP `EA` symbol. The red-ink source triangle supplies a multiplicative generator **15** of the 28 nonzero residues modulo29. The apparent 12,815 = 55×233 nonzero-step packet shape involves two more Fibonacci numbers, but is a retrospectively noticed arithmetic coincidence, not a cipher instruction.

For each published physical page and rune position, take original GP ciphertext indices `C[i]` and the **one book-continuous** key clock `K[i]`. At page initials decode `P[i] = (C[i]−K[i]) mod29`. Within each page, decode `P[i]=28 (EA)` if `C[i]=C[i−1]`, otherwise `P[i]=(log_15((C[i]−C[i−1]) mod29)−K[i]) mod28`. This is exact and invertible when the proposed architecture is true. No cipher/plaintext alphabets, seed, key phase, carry, punctuation reset, page reset, direction, or language model were fitted. The Fibonacci key has exact period **48** modulo28.

## What the complete original inverse actually says

| Frozen observation | Result |
| --- | ---: |
| Original unknown LP2 rune count / rune-bearing pages | **12,956 / 55** |
| Original GP29 ciphertext IoC | **0.0344783979** |
| Decoded with the fixed Fibonacci register, GP29 IoC | **0.0352857976** |
| Decoded hypothetical EA runes | **87**, of which **86** correspond exactly to real within-page equal adjacent ciphertext |
| Eight original unsolved section IoCs | **0.035515, 0.035110, 0.035341, 0.035335, 0.035129, 0.035232, 0.035136, 0.035403** |
| Exact forward re-encryption of original output | **12,956/12,956** |

The output opens in GP transliteration `XUOEOETHEOGDRGMUAAPEEOEXWWBTCRWCDAELNOTFFAECSCMEORAEOOEXOU...`, then continues without a sustained recognizable passage. The low collision rate remains close to the uniform-29 baseline. An exact cipher replay here verifies implementation and data bookkeeping; it cannot authenticate an inverse by itself.

**Independent native-language positive:** The same full 55-page layout was populated with GP29 text sampled from the already-solved Cicada reference under the previous module's fixed source-native sampling method. Its plaintext IoC was **0.0613994413**. The identical Fibonacci transducer encrypts that text to cipher IoC **0.0344721540**, then recovers **all 12,956 / 12,956 planted source runes** exactly. A fixed wrong second seed `K0=1,K1=2` recovers only **629 / 12,956** source symbols from that planted ciphertext. This proves the decoder is sensitive to the correct keystream and can recover native prose when the model truly generated it.

## Consequence

This test **retires precisely the one source-fixed Fibonacci (1,1) book-continuous key** for the stated reversible GP28/EA transducer. It does not prove the 86 doublets really mean EA, exclude other source-selected generators, or establish that the underlying 28-way step architecture is historical. Sweeping other Fibonacci seeds, secret phases, page resets or arbitrary 28-label permutations would violate the independent clue constraint and is not warranted by this negative.

**Reproduce:** [Node.js CommonJS SFT](../sims/lp2_fibonacci_ea_zero_step_sft.cjs), `node sims/lp2_fibonacci_ea_zero_step_sft.cjs` on Node22 from repository root. The [manual workflow](../.github/workflows/agent45-projective-marker-gridrow.yml) `probe=fibonacci-ea` includes the exact output artifact `fibonacci-ea-source-gate` from run [43167412192](https://github.com/FlareZ123/liber-primus/actions/runs/43167412192).