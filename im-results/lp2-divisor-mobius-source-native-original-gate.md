# Direct Möbius divisor inversion: a source-motivated, full-original negative

**Agent34, 22 November 2026.** **Disposition:** the simplest arithmetic Möbius inverse / divisor-zeta transform, anchored by the explicit \`MOBIUS\` on solved LP1 p5, the LP1 instruction that the **totient function is sacred**, and LP2's nine original visual chapter boundaries, does **not** decipher the authentic LP2 text. This conclusion is narrowly about **literal one-based GP29 position-divisibility and chapter resets**. It does not assert that the word MOBIUS supplies a cipher instruction, that a diagram is a Möbius strip, or that other number-theoretic functions are absent.

[Source-exact CommonJS SFT](../sims/lp2_divisor_mobius_source_native_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45056850689).

## Human-level rationale and precise test

In the prior, already-solved LP1 source, the word **MOBIUS** appears as a literal entry in the p5 5×5 grid, alongside the explicit prose instructions **"THE PRIMES ARE SACRED"** and **"THE TOTIENT FUNCTION IS SACRED."** The mathematical Möbius function \`μ(n)\` is the Dirichlet inverse of constant-one, and Euler's totient obeys \`φ = μ * id\`. These are historically standard, recognizable operations involving the very name and arithmetic that a solver encounters. They motivate a finite, non-keyword, reversible test rather than an invented polyalphabetic key. **Weakest link:** the named MOBIUS in the original grid may allude to a strip or merely be a thematic label; nothing explicitly commands an arithmetic convolution on runes.

Source-visible GP29 ordinals are \`C_1...C_N\` (1-based with the *printed first rune* as 1). The only two natural reversible, unkeyed Dirichlet transforms applied here are:

\`C_n = Σ_{d|n} P_d (mod29)\` (divisor-zeta) and

\`P_n = Σ_{d|n} μ(n/d) C_d (mod29)\` (Möbius inverse).

The implementation computes the second by an exact divisor-triangular elimination, not an approximate number-theory library. It first tests each of the **nine source-adjudicated original visual chapters** [p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55] from its first physical GP29 rune, with unchanged original order. The tests include the **single uninterrupted p0–55 12,956-rune register** to avoid assuming a chapter key reset. The output keeps the original printed word separator side information untouched; no rune is discarded, inserted, rekeyed, permuted between arbitrary visual locations or mapped through an unstated alphabet.

## Original response

The source corpus supplies exactly **12,956** p0–55 unknown ciphertext runes in nine chapter sizes **[729,1145,1729,1903,1021,1433,1680,3008,308]**. Both transforms, in both directions, reconstruct their inputs **bit-for-bit as GP29 ordinal arrays** under the independently implemented inverse, across every original chapter and full concatenated unknown book.

Yet **none** of the 18 chapter-specific outputs has natural-language GP29 rune concentration. All inverse/forward outputs return IoC around **0.034–0.035**, far below genuine solved PARABLE **0.06271**. In the principal original p0–2 729-rune candidate, original IoC **0.03408252**, Möbius-inverted IoC **0.03445560**, and forward zeta IoC **0.03426340**. Even the longest p40–53 3,008-rune interval remains **0.03460587** inverse and **0.03440089** forward, with no continuous recognizable English. Its first 40 rune transliterations are also printed by the SFT for direct independent assessment; no cherry-picked snippets were used.

**Positive control:** take **the 95 actual original solved p57 PARABLE GP29 runes** and *encode* all of them by the full one-based divisor-zeta transform. Its genuine clear-text IoC is **0.06271**. The coded output is near uniform; the same tested inversion recovers **all 95 authentic rune identities and exact ordering**, including the source-normalized \`ING\` digraph. This confirms the test would detect an appropriately constructed artifact.

**Decision:** reject the source-minimal arithmetic **Möbius/zeta position-divisor cipher** as a direct original LP2 inverse. Previous LP2 Möbius *geometric* route tests concern a distinct graphic/topology hypothesis. No hidden plaintext or key arises from this trial. Do not extend the failure into tuning page phases, per-word divisor tables, arbitrary index bijections, Möbius-strip artwork orientations or chained ciphers absent an independently selected author operation. The remaining causal input is a creator-authored, visible mapping from the solved numeric clue to actual unknown ciphertext state or a genuine external key source.
