# LP2 original-cipher zero-varying difference: source256 phase excluded, source512 global phase still permitted by rank capacity

**Agent12 · 22 November 2026 · exact all-secret original input narrowing.** No recovered unknown page plaintext, authenticated cipher/key, or Cicada destination.

## Source constraint and architecture

Original LP2 p49–51 prints a **256-cell numerical table with 512 digit glyphs**. The 55 rune-bearing unknown pages carry 12,956 GP29 symbols across 2,896 original words; 12,901 within-page successor differences include 86 zeros. Earlier first-party Cicada materials named primes and the totient. These are observable reasons to investigate one globally repeated **256-cell** key/clock and the genuinely distinct **512 printed-digit** key/clock. Neither mechanism is authenticated by an original instruction.

The decisive new model concerns the *entire 29-value consecutive ciphertext difference* D_i=(C_i−C_(i−1)) modulo29. A secret bijection π_phase, which may differ at **every phase**, maps each D_i into plaintext P_i. Its inverse recovers ciphertext from P_i, its phase key and the physical page's initial ciphertext rune. Crucially **π_phase(0) is free to change with phase**. This avoids the all-key source-word-position theorem for one globally constant special difference/plaintext rune, already proved in [the independent 841-anchor no-go report](lp2-zeroanchor-root8-allsecret-original-gate.md). A fixed-zero→EA special case is *already excluded* for ordinary original-space native-GP English by that theorem **regardless of key period**; no source512 exception exists for the fixed-zero subclass.

All 29! phase-specific bijections are allowed, including additive difference masks P_i=(D_i−K_phase) modulo29 and more exotic full-secret phase alphabets. We do not assume a public table key. Source phases may count runes continuously across page boundaries (including each page-first rune) or reset at each page. The first rune of each printed page is excluded from the difference-statistic since an external predecessor may be unknown. The full phase schedule is frozen before inspecting outputs.

## Exact key-independent exclusion

Let N[r,d] be the original count of difference d∈0..28 at phase r modulo m. In any phase, the cipher can map exactly **one** difference d to a particular plaintext rune such as E, because π_r is bijective. Therefore the absolute attainable all-secret E count is

\[
U_{m}=\sum_{r=0}^{m-1}\max_{d=0,\ldots,28}N[r,d].
\]

This is independent of all keys, even 29! permutations in all phases. The exact untouched original frequencies yield:

| Original phase period | Continuous global phase maximum E | Reset at each physical page maximum E |
| ---: | ---: | ---: |
| 8 | 579 | 584 |
| 32 | 720 | 730 |
| 64 | 853 | 836 |
| 128 | 1,015 | 1,010 |
| **256 source cells** | **1,276** | **1,279** |
| **512 printed digits** | **1,671** | **1,310** |

These all-29-symbol maxima happen to **equal** the maxima when fixed-zero is removed from the eligible source differences, so the capacity exclusion genuinely applies to **phase-varying zero-sentinels**. Among the same 12,901 source sites, the independent authentic-solved-GP word-length matched control published in [the predecessor-table majorization analysis](lp2-cprev-secret-table-majorization-original-gate.md) predicts E count **1,591.0567 ±33.4683**; the **lowest** of **5,000** exact-original-layout GP-native plants was **1,468**. Consequently every key in the 256-or-smaller clock and the page-reset512 clock is excluded as an *ordinary native-GP English original-space single-layer difference cipher*. The keyless test does not exclude a different plaintext alphabet, changing word segmentation, page-private nonperiodic keys or a further reversible layer.

**Only the 512-digit globally advancing clock clears this necessary original English-E capacity test:** its maximum1,671 exceeds the observed native donor minimum1,468 and expectation1,591. The source has exactly 512 digit glyphs, so this is a physically typed follow-on, although there is **no authorial evidence that the table digit glyphs select this phase mapping**, and clearing a necessary capacity test is not plaintext recovery.

## Actual original source inverses and positive controls

The reproducible source test reads the exact canonical original GP rune indices, physical-page boundaries, 256 table cells, 512 printed digit characters, and the authentic solved 740-word GP-native donor corpus. A deterministic 12,956-rune original-word-length native plant contains **1,591** actual non-page-first E runes. Both the period256 source-cell additive mask K=byte modulo29 and the period512 printed-digit additive mask K=digit modulo29 are complete **reversible**, zero-varying native-GP ciphers. The SFT verifies exact original-cipher reencryption and exact 12,956-rune native positive recovery, for both globally advancing and page-reset clocks. It also tests the narrower nonzero GF29 multiplicative root2/zero-special branch for source 256/512 dimensions. A perfect original roundtrip is an implementation invariant of any bijection and cannot authenticate a key.

The two literal 512-digit source-index choices in the narrower dlog family, K=1+(digit modulo28) and K=2^(digit modulo28) modulo29, produce only about 450–465 E runes and GP29 IoC about0.035; all four original inverses reencrypt exactly, and independent native GP plants are recovered. The broad additive 29-symbol source-key consumers likewise fail native prose. Their precise observed E/IoC and capacity details are printed by the SFT. A more expressive key is *information-theoretically viable* only for global512; free 512-coordinate fitting is not a source-derived key.

**Reproducer:** [source-untouched single-file Windows Node22 CommonJS test](../sims/lp2_p50_delta256_allsecret_native_e_gate_sft.cjs). Initial fixed-zero source 256-pass [45078788261](https://github.com/FlareZ123/liber-primus/actions/runs/45078788261), expanded512 PASS [45078950990](https://github.com/FlareZ123/liber-primus/actions/runs/45078950990). The next run extends the proof and native positive to the variable-zero full-29-key family.

**Decision:** Retire all table-cell256 and shorter source-phase, and all page-reset512 GP29 single-layer difference ciphers **even when zero maps to a different plaintext rune in every phase**, for ordinary native-GP English at the printed original word positions. A 512 **global** variable-anchor phase cipher remains *only* a mathematical candidate. The prior 841-anchor theorem independently retires the fixed-zero subclass irrespective of phase. A productive successor must recover a creator-selected complete 512-phase rule/key, and a source-authentic original paragraph, or find a differently typed plaintext register. Do not confuse the weakened marginal constraint with a decipherment.
