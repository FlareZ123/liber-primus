# LP2 original 255/256-slot repeated key: key-independent GP29 plaintext concentration bound

**Agent11, 22 November 2026. Original full-cipher readout and Windows execution.** This is an **exact conditional exclusion of a candidate direct cipher architecture**. It does not identify the original key, decipher any of the 56 unresolved LP2 pages or establish that p50 is a repeating key.

## Source-visible hypothesis and distinct competing mechanism

The original p49–p51 numeric panel has **256** printed cells; the authentic p7 five red products can generate a primitive **255**-state GF(4) cycle, which earlier work conditionally used to read 255 table positions. It is therefore reasonable to ask whether the table itself, or the GF4 circuit reading it, is a periodically reused additive or symbol-substitution key over the original **12,956 GP29 unknown ciphertext runes**. The strongest assumption is that a fixed phase always uses the same symbol substitution. An evolving key based on preceding text, an external one-time pad, or a non-GP output is a genuinely different mechanism.

This gate gives the proposed repeating key every possible unknown secret per-position 29-character bijection, **29! independently chosen substitutions per phase**, considerably more flexibility than an additive `GP29` key or a single table byte per phase. The only restriction is that the same unknown per-phase bijection is reused whenever the selected phase recurs.

## Exact all-secret theorem

Let `h[j,c]` be the original source ciphertext count of rune `c` at original phase `j`, with `j=0..P-1` and `P=255` or `256`. A fixed secret phase-dependent permutation preserves the multiset of the 29 ciphertext frequencies within each original phase. Therefore for **any five** chosen native-GP plaintext runes `S` and all arbitrary independently secret per-phase permutations:

`count(plaintext in S) ≤ B5(P) = sum over phases j of (five largest h[j,c]).`

Since the actual five most common plaintext runes are a valid `S`, **their aggregate occupancy cannot exceed B5**, regardless of the undiscovered key. No fitted language dictionary, inferred key, independent phase rearrangement or plaintext fragment enters this result. Analogously, `B1` bounds the most common single plaintext rune.

The bound uses every unmodified original LP2 physical p0–p55 rune and source-transcribed boundaries, including word carry across page breaks and the rune-free physical p50. Five source-visible reset conventions are tested. Each secret phase substitution is **fixed globally** across resets.

| Source clock/reset | Period255 B5 | Period256 B5 | Maximum fraction |
| --- | ---: | ---: | ---: |
| Continuous full original manuscript | 4,818 / 12,956 | 4,861 / 12,956 | **37.5193%** |
| Restart at every printed physical page | 4,851 / 12,956 | 4,858 / 12,956 | **37.4961%** |
| Restart at nine original illustrated chapters | 4,833 / 12,956 | 4,856 / 12,956 | **37.4807%** |
| Restart at each original complete word | 2,660 / 12,956 | 2,660 / 12,956 | **20.5310%** |
| Restart at each original printed line | 3,055 / 12,956 | 3,055 / 12,956 | **23.5798%** |

The maximum across all ten complete source-visible models is **4,861/12,956 = 37.5193%**. By comparison, solved source-native p57 direct GP plaintext has **46/95 = 48.4211%** in its five most common runes. This does not mathematically prove that all conceivable 12,956-rune meaningful plaintexts must exceed 37.52%, but it is sharply incompatible with ordinary GP29 prose under the solved-source language profile. Earlier authentic register-matched native language controls in [the independent word-state study](lp2-cipherprev-quasigroup-majorization-allsecret-original-gate.md) exceed approximately 47% five-rune occupancy for the investigated Old English and Latin positive sources on 10,060-word-internal sites, providing additional context, not an exact donor calibration of this newly defined all-rune test.

The one-rune bounds are also preserved in the [SFT](../sims/lp2_p50_period255256_allsecret_symbolrank_original_sft.cjs): `B1=1,233/1,244` for global 255/256, while direct native p57 has **15/95 = 15.7895%** for its most common rune.

## Original controls and downstream choice

The [read-only, original-corpus Windows Node22 CommonJS SFT](../sims/lp2_p50_period255256_allsecret_symbolrank_original_sft.cjs) reconstructs and exactly reconciles **12,956** input runes across the raw transcription, confirms **2,896** printed source words, and reproduces all ten above upper bounds with strict numerical assertions. It additionally repeats the authentic solved p57 plaintext to **12,956** runes and encrypts it under a chosen nontrivial phase-varying invertible affine GP29 map of period256. The real decoder exactly recovers all **12,956/12,956** native-GP runes. Its plaintext top five count is **6,271**, and the encrypted stream's keyless top-five upper bound is **6,929**, correctly leaving the genuine positive possible. [Actual read-only Windows Node22 PASS run 45048405846](https://github.com/FlareZ123/liber-primus/actions/runs/45048405846).

**Operational decision:** retire the direct, globally reused 255/256-slot GP29 Vigenere/keyed substitution as the full-manuscript explanation for ordinary native-GP prose under the five frozen source clocks. Do not spend time recovering per-phase secret alphabets: the original histograms already defeat every one. This is **not** a p50-as-key impossibility result when the table is consumed **once**, the key evolves with previous symbols or pages, the ciphertext undergoes a nonalphabet transformation, original word boundaries are not plaintext boundaries, or a genuinely non-GP29 intermediate is used. Those require a human-visible operation specifying state update and output register, rather than more brute-force attempts on repeated simple pads.

No unknown plaintext or authentic producer key was recovered.
