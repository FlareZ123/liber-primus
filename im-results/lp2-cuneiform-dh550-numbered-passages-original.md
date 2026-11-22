# Cuneiform prime pair: exact DH order-550 versus the five numbered passages

**Updated 22 November 2026, Agent 13, building on Agent 26 (14 November). Classification: source-motivated DH hypothesis, exact original-input key-independent exclusion under the authentic F-bypass rule.** No unknown Liber Primus plaintext, authenticated key, deciphering operation or continuation destination has been recovered. The original 32 bounded non-F/key-phase tests and a stronger exhaustive 2,200-case all-phase true-F test are [reproduced independently](../sims/lp2_cuneiform_dh550_numbered_original_sft.cjs) and [here](../sims/lp2_cuneiform_dh550_allphase_Fpath_sft.cjs).

## An independent, human-motivated operation

The original LP2 p33–39 repeatedly prints cuneiform-like two-place sexagesimal numerals **1033** and **3301**. Within this visual enclosure, original red decimal numerals 1–5 explicitly number five successive passages, bounded by the two original red ten-dot marks at p36 offset 99 and p38 offset 186. Their independently image-readback source intervals are p36 [99,238), p37 [0,91), p37 [91,189), p37 [189,228) plus p38 [0,57), and p38 [57,186), with GP29 lengths **139, 91, 98, 96, 129**, total **553**. These coordinates and their pixel provenance were previously established in [the five-passage audit](lp2-cuneiform-five-numbered-wisdom-inversion.md).

A surviving original signed 2013 Cicada TCP specification explicitly teaches **Diffie–Hellman modular exponentiation**, and a contemporaneous participant request used modulus **3301**. This is a historically available mathematical operation, though that source never tells a player to use the LP2 cuneiform values as DH parameters. One fixed exploratory interpretation treats **3301 as a prime modulus** and **1033 as the generator/base**, rather than choosing new private exponents or words.

The exact arithmetic result is

\[
\operatorname{ord}_{3301}(1033)=550,\qquad
x_0=1,\quad x_{j+1}=1033x_j\bmod3301.
\]

The 550 orbit entries are distinct before returning to 1. **550 differs from the 553 source-numbered runes by three.** This mismatch matters: the manuscript does not select three skips, title runes, or padding positions that would turn the five natural spans into a complete DH orbit. The numerical proximity is therefore only a hypothesis-generating coincidence, without establishing a 550-rune packet. Other operations on the published primes were already explored elsewhere; this investigation tests the direct untouched DH orbit alone.

## Frozen original-input inverse, no tuned seeds

Read the canonical [original GP29 corpus](../resources/liber-primus/lp2-corpus.json), without transcription correction, artificial 550-rune trimming, fitted exponent, arbitrary output rotation, or user-supplied language crib. Map each successive orbit element to a GP shift in precisely two historically motivated ways:

1. **Raw residue** \(k_j=x_j\bmod29\).
2. **Totient residue** \(k_j=\varphi(x_j)\bmod29\), reflecting the independently solved p56 totient precedent.

For each fixed map, decode \(P_i=C_i\pm k_i\bmod29\), using either exponent-zero first (x0=1) or exponent-one first (x1=1033). Test a **single clock across the original 553 runes** and a **clock restarted exactly at each printed 1–5 passage**. Finally compare no F skip with the narrow conditional convention that **every visible ciphertext F is treated as a literal F and consumes no key**. The latter is not equivalent to the authentic p56's latent plaintext-F bypass, since encrypted non-F may also emit F. These choices give **32** fully specified direct inverses, none chosen by observing readability.

The untouched 553-rune source has GP29 IoC **0.0342335613**. The highest IoC of all 32 output candidates is **0.0361336059**, for totient residue, exponent-zero first, uninterrupted passage clock, every-visible-F skipped and plus sign. The lowest is **0.0337487224**. Every candidate remains effectively uniform; the best begins in GP transliteration **NG M N EA L TH EO U NG EO G W D TH OE U N I T W A F I A N D**, without sustained prose. No candidate reaches an alphabet concentration comparable to even the independent solved-source p57 plant (553 rune repetitions, IoC **0.0707013130**).

The executable regression independently builds all 32 candidates from the canonical source, asserts the exact orbit length, the five original span boundaries, the best configuration and its score, and a **known-plaintext recovery control**. For all non-skipping models, it encrypts and recovers the entire 553-rune p57-based native-GP plant without modification. For the all-visible-F conditional decoder, the plant explicitly avoids encrypted non-F accidentally producing ciphertext F, and records those few necessary symbol changes before checking exact recovery. This keeps the positive control honest about the conditional F rule. The test prints a decision summary and writes no files.

## Complete all-phase inverse under the real plaintext-F rule (22 November)

The 32 source-initialized tests above left one specific, potentially important gap: the **authentic p56 rule is plaintext-F-transparent**, whereas merely skipping *every* visible ciphertext F is a different, incomplete algorithm. Moreover, the original 2013 Diffie–Hellman challenge makes an **unknown private initial exponent** historically more natural than restricting the 550-element orbit to just phases 0 and 1. The five numbered LP2 passages contain **553** source runes and **12** visible ciphertext F runes, so the superficially attractive period **550** could be exactly one orbit plus **three** genuinely transparent F events.

This gives an exact, cheap key-independent decision. For the fixed hypothetical stream `x_j=1033^(j+phase) mod3301`, grant **all 550 initial phases** and both typed GP29 shift maps `k_j=x_j mod29` and `k_j=φ(x_j) mod29`, with both arithmetic directions, totaling **2,200** independently defined model/phase pairs. Preserve all five original passage lengths **[139,91,98,96,129]** in their printed order; the key clock is continuous across their genuine internal boundaries. At each ciphertext C:

- If **C≠F**, a plaintext-F bypass cannot have emitted it; necessarily consume one key value, recovering the corresponding non-F plaintext.
- If **C=F**, branch between a literal **P=F** (consume no key) and an ordinary encrypted **P≠F** (consume one key). The ordinary branch exists only when its computed plaintext is non-F.

A finite-state inverse tracks **every reachable number of consumed key symbols**, without preselecting any of the 12 source-F sites and without restricting skips to just three. At most four states are live at any step of any original candidate. **Every candidate runs out of legal states before the 553rd source rune.** The strongest surviving prefix (after trying every secret phase) is only **352/553**. Exact outcomes:

| Orbit map / GP inverse sign | All initial phases | Complete F-legal paths | Longest legal prefix | Phase attaining longest |
| --- | ---: | ---: | ---: | ---: |
| Raw residue / − | 550 | **0** | 281 | 150 |
| Raw residue / + | 550 | **0** | 266 | 30 |
| Totient residue / − | 550 | **0** | 352 | 185 |
| Totient residue / + | 550 | **0** | 225 | 129 |

These are algebraic re-encryption **impossibilities**, independent of guessed language, IoC, English word scoring or an unknown DH phase. In particular, there is **no legal choice of three F bypasses** that consumes exactly the 550 unique orbit values and explains all 553 original source symbols. The result is even stronger: allowing *any* subset of the twelve possible bypass sites still leaves no complete path. A separate source-native positive repeats the genuinely solved p57 GP text to the same 553-rune length, retains precisely three plaintext-F sites (altering any extra F to GP index1 in the **plant only**) and encrypts under both maps, both signs and two source-fixed phases. The exact same dynamic program then accepts all eight complete positive cases with **550/550** key symbols consumed.

**Reproducer:** [read-only Windows/Node22 SFT](../sims/lp2_cuneiform_dh550_allphase_Fpath_sft.cjs) on the unchanged original canonical GP29 numerical corpus, with an independent [manual-only Windows Action](../.github/workflows/agent13-cuneiform-DH550-Fpath-manual.yml). This test does not establish that Cicada ever intended DH for the five numbered Wisdom passages: the original cuneiform numerals alone do not instruct this cipher or keystream mapping.

## Decision

The **full original five-passage, continuous, additive GP29 DH-orbit** proposal is now **incompatible with the authentic historical plaintext-F bypass rule for every secret phase** under both raw and totient residue maps, either sign, and every possible original visible-F ambiguity. This closes the literal `553=550+3` bypass rescue without guessing three convenient rune positions. The earlier thirty-two direct source-start inversions that do *not* require authentic F transparency also remain ciphertext-like and recover no prose. Those were bounded negative diagnostic tests rather than mathematical exclusions of every possible non-F additive key phase.

Neither outcome excludes nonlinear DH use, different cipher/source recipients, a per-numbered-item reset with separately supplied parameters, different key maps, or an unknown external key. No new genuine plaintext or first-party instruction has been identified. **The next decision requires an independent authorial source identifying the operation or recipient; do not repeat exponent-phase tuning within the excluded authentic-F continuous family.**
