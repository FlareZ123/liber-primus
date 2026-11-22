# LPAD13 known-padding attack: the p15 four-state key cannot encrypt the terminal floral register

**Agent 38, 18 November 2026. Classification: source-constrained, complete-initial-state cryptanalytic exclusion.** The original LP2 ciphertext remains unsolved. This is a new *known-plaintext attack* on the exact 3,315-cell LPAD/floral alignment already noticed in [the earlier alignment report](lp2-lpad13-flora3315-original-mask.md). Earlier work extracted mask-selected rune positions and tried direct source-word additive keys; the present test instead treats padding as **known plaintext** and eliminates all possible secret seeds for an independently source-derived changing key.

## Causal route to unknown plaintext

A contemporary player could identify the four red chapter initials **L P A D** on original pp3–7 and use the actual chapter's **255 printed words**, each at most **12 runes**, to left-pad every word to the familiar original **13-dot width**, using GP29 **F=0** as the filler. The padded chapter has **255×13 = 3,315 cells**, including 1,145 actual rune positions and **2,170 deterministically known F positions**. Independently, the source-image floral ending pp40–55 contains **3,316 runes** and begins with a visibly red F. Skipping precisely that first F yields a 3,315-rune candidate ciphertext receiver. All counts and source positions are fixed without trying any mask dimensions or start offsets.

Suppose the 3,315-rune receiver is the encryption of the 3,315-position padded word matrix, so its 2,170 synthetic F positions expose 2,170 exact values of an **ordinary additive GP29 key stream**. The unpadded 1,145 slots could then be decrypted with the same inferred stream if a compact key generator were independently available.

The manuscript's p15 numeric square supplies a specific, pre-existing mathematical state operator. It is a 4×4 matrix modulo29, with two natural source readings: literal printed unsigned magnitudes and the Fibonacci-prime signed restoration already derived from the original p15 spiral. For **either** matrix `M`, the scalar output of *any* autonomous linear state `s[i+1]=M s[i]` under any fixed linear projection must satisfy the matrix's **fourth-order characteristic recurrence**, by Cayley–Hamilton. The starting four-vector and the linear output projection can be entirely secret. This yields a **key-independent necessary condition** on any five consecutive known padding slots. A single failing all-pad window disproves the whole model, without guessing the keystream.

The 13-dot width, F-padding, 3,315 alignment, matrix recurrence and ordinary additive cipher are **candidate interpretive steps**, not instructions authenticated as Cicada's intended decoder. Their value here is that they jointly specify an exact algorithm with an affordable original-cipher rejection and a full recoverable plaintext prediction if they pass.

## Complete original-source test

The unchanged [physical LP2 rune corpus](../resources/liber-primus/lp2-corpus.json), [printed rune-word transcription](../resources/lp2-transcription.txt), and [established original p15 spiral](../results/lp2-p15-fibonacci-prime-spiral.md) determine every input. The script checks all **12,956** original p0–55 rune identities, 2,896 continuous word breaks (including carried words), the 255 original scrollwork words and the floral receiver. Every runic word is left-padded with zero to 13 symbols; no word positions or boundary masks are optimized.

The **literal printed** p15 square modulo29 has monic characteristic polynomial

`χ_unsigned(x)=x⁴+14x³+22x²+5x+17 (mod29)`.

Restoring the two negatives selected by the Fibonacci-prime generator, at row-major cells 12 and 13, produces

`χ_signed(x)=x⁴+14x³+27x²+10x+7 = (x−8)(x−17)(x−24)² (mod29)`.

For either `χ(x)=x⁴+a₃x³+a₂x²+a₁x+a₀`, every consecutive five-pad window must obey

`K[i+4]+a₃K[i+3]+a₂K[i+2]+a₁K[i+1]+a₀K[i] = 0 (mod29)`.

All the true source F-pad slots satisfy `K[i]=C_flora[i]` under *both* additive encryption signs (changing the sign negates the entire homogeneous recurrence and cannot change whether it vanishes). There are exactly **1,168** complete five-pad windows among 2,170 original padding positions.

| Predeclared original p15 key-state operator | Five-pad windows tested | **Contradictions** | Earliest witness |
| --- | ---: | ---: | --- |
| Literal 4×4 printed square | 1,168 | **1,115** | Floral offsets 0–4; polynomial residue **28** |
| Fibonacci-prime signed square | 1,168 | **1,139** | Same five offsets; polynomial residue **18** |

The **very first original 13-cell row** corresponds to a two-rune chapter word, so its first eleven positions are known F-pads. Its first five floral receiver GP indices, `[9,19,26,6,23]`, give nonzero residues `28` (literal matrix) and `18` (signed matrix). **No choice of the secret four-coordinate seed or secret fixed projection can reconcile even those five printed ciphertext symbols** under the declared model. The complete 1,168-window counts show this is not an isolated anomaly.

## Genuine native-text recovery control

The same standalone reproducer plants a full source-shaped, reversible cipher. For **each** original p15 characteristic polynomial, start a 3,315-symbol key stream with an independent unknown four-number seed `[1,2,3,4]`, evolve it using the exact fourth-order recurrence, populate all 2,170 known F-pad slots, and populate the 1,145 genuine source word positions with the independently clear 95-rune p57 PARABLE repeated in their printed order. Encrypt all 3,315 plaintext symbols additively modulo29.

The decoder receives **only the first four cipher symbols on known padding positions** as a seed; it reconstructs all 3,315 key symbols from the fixed source polynomial, verifies every one of the 2,170 held-out pad slots, and recovers **all 1,145/1,145** authentic-GP plaintext-rune slots exactly. The unmodified real ciphertext fails the same check at the first available fifth slot. This is a full decoding demonstration for a planted cipher, which validates the inverse and makes the original exclusion causal rather than a statistical language judgment.


## Independent all-secret 256-period key recovery gate

The original numeral table pp49–51 has exactly **256 source-visible bytes**, which suggests a simpler possible key source than the p15 recurrence. Grant the source-sized additive keystream **all 256 possible values as freely unknown** and allow any global key phase. This is stronger than trying the printed byte values: known plaintext F forces the same key value at every padding position with the same index modulo the putative period. Neither the actual key bytes nor the phase need to be guessed.

For **every period from 1 through 256**, the 2,170 original F-pad observations contain an unavoidable conflict. The fewest contradictory observations over these 256 periods is still **1,835** at period254. The two independently original width choices are especially explicit:

| Fully unknown periodic additive GP29 key | Contradictory known-F slots | First original same-phase disagreement |
| --- | ---: | --- |
| Period **13**, original dot/word-pad width | **2,073** | Source floral indices 0 and 13: **9 vs 28** |
| Period **256**, original pp49–51 table size | **1,849** | Source floral indices 5 and 261: **25 vs 16** |

A secret phase shift changes only phase *names*, so it cannot repair any equality disagreement. The same contradiction applies to subtract-key ciphers. The algorithm explicitly asserts all **256 candidate periods**, not just the two selected source widths.

For an exact positive, the SFT constructs an arbitrary secret period-256 GP29 keystream, encrypts the same **3,315-position** known-F/native-p57 message, and reconstructs **all 256 secret key entries** from the available F-pad sites without examining its 1,145 unknown positions. It then decrypts every one of the **1,145/1,145** source-native plaintext runes exactly. All 256 phases are present among the 2,170 pad positions, giving an actual full-key recovery control. The original fails this much more permissive known-plaintext inference.

This eliminates the fixed 13- or 256-period key interpretation of the candidate 3,315-cell LPAD map, even if the supposed key values are otherwise unconstrained. It leaves genuine longer-period, changing-state or plaintext-feedback constructions outside the result, and supplies no evidence that the 3,315 alignment was the author's intended encoding.

## Decision and next research implication

**Retire the LPAD13/floral known-F-padding receiver under both natural p15 four-state linear key evolutions and every fixed additive key period up to the source table's 256 slots.** Its failure is an exact algebraic contradiction for every possible secret initial vector and fixed linear output projection, conditional on conventional additive GP29 encryption, intact 13-wide alignment and known-F pad semantics.

This does **not** exclude a nonlinear or longer-state key, an independently instructed key reset, plaintext-dependent state transitions, other meanings of LPAD, or a different receiver. The previously tested direct LPAD13 mask/extraction and additive-source-word hypotheses remain separate negatives. A new expensive derived-state search should be gated on an original instruction identifying what the pad cells encode and why the p15 matrix generates their keystream. Mere 3,315/3,316 cardinality does not establish that connection.

**Reproduce:** [single runnable Windows/Node22 CommonJS original-source SFT](../sims/lp2_lpad13_flora_p15_knownpad_recurrence_sft.cjs). It calculates the two characteristic polynomials from the literal p15 numbers, verifies every original word/rune/layout count, exhausts every five-pad recurrence witness and all 256 secret periodic-key cases, and performs three complete 3,315-symbol plaintext plants. No fitted original key, learned alphabet, language model or source-image adjustment is used.

**Windows execution:** [successful original-source GitHub Actions run 44253226019](https://github.com/FlareZ123/liber-primus/actions/runs/44253226019) validated the initial matrix-state tests before the additional secret-period test, which uses the same frozen source files. The extended period test is separately reproducible from this source revision.
