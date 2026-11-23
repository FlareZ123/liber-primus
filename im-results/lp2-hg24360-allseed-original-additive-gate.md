# Exact all-IV gate: p39 red quadratic × signed BASE29 quadratic as a 24,360-step GP29 additive stream

**Agent4, 23 November 2026. Status: bounded finite original-input exclusion.** No unknown LP2 plaintext, authentic decipherment key, opcode, or final destination recovered. This report distinguishes genuine source-derived polynomial factors from a subsequently hypothesized additive-keystream consumer.

## Source-linked premise and rival

Three independently surviving first-party objects have an exact algebraic coincidence already established in [the signed-square and p50 report](lp2-2014-3301-square-base29-spectral-original-gate.md): the signed-2013 BASE29(3301) digits form the ascending GF29 quadratic **H=[3,26,24]**; original LP2 physical p39's red runes at offsets119..121 give **G=[27,5,15]**; and the 256 original p49–51 printed table bytes, interpreted as high-degree-first GF29 polynomial coefficients, have zero remainder modulo both factors. Their product is the source-fixed degree-four **HG=[23,21,11,17,12]**, also a factor of the table. Original table bytes are derived from `resources/liber-primus/lp2-grid-256.json`, original runes from `resources/liber-primus/lp2-corpus.json`. Both prior factor identities and exact source bytes are preserved by the test.

H has primitive GF29² root order840; G is 15(x−24)², with root24 of multiplicative order7. Combining their independent linear modes supplies a potentially nonrepeating 24,360-rune key clock (lcm of840 and 7×29). The concrete recurrence derived by setting `HG(S)K=0` is

```text
K[n+4] = -17*(23*K[n] + 21*K[n+1] + 11*K[n+2] + 17*K[n+3]) mod 29.
```

The factor-derived clock gives an executable original-cipher candidate, but **nothing authenticated instructs a solver to use polynomial factors as a recurrence, place the resultant digits into a rune-by-rune additive pad, or choose the direction/seed.** Its strongest rival is deliberate checksum/factor structure used for another task, with unknown pages encrypted by a different mechanism.

The authentic first four printed p49-table bytes `[203,231,167,186]` reduce mod29 to source-fixed seed `[0,28,22,12]`. The generated recurrence repeats after exactly **24,360** positions and not after `24,360/q` for q=2,3,5,7,29; therefore its least period is24,360. With this seed, both `P=C±K` signs produce uniform-like native-GP output on original p16–21, p40–55 and other continuous page spans. That fixed-seed diagnostic alone does not exclude secret initial states.

## Complete all-secret-state decision, independent originals

The degree-four recurrence has precisely `29^4=707,281` possible IVs. Because the recurrence is linear, replacing seed K by −K exchanges the two additive signs, so **one subtraction pass over every seed** covers both without double-counting. The new [single-file Windows Node22 reproducible test](../sims/lp2_hg24360_allseed_source_additive_sft.cjs) algebraically expresses each keystream position as a four-term GF29 linear function of its IV, exhaustively evaluates every IV, and finds the **global highest** 256-rune native-GP index of coincidence in each of three complete, contiguous original ciphertext windows. A favorable plaintext cannot be hidden by changing an IV or the one allowed sign.

| Original source test; continuous clock starts at window position 0 | Runes | Complete IVs | **Best original output IoC** | Maximizing IV | IVs with IoC ≥0.042 |
|---|---:|---:|---:|---|---:|
| p16–21, first256 | 256 | 707,281 | **0.041268382353** (2694/65280) | [11,18,15,12] | 0 |
| p40–55, first256 | 256 | 707,281 | **0.041911764706** (2736/65280) | [26,0,28,28] | 0 |
| p51–55, first256 | 256 | 707,281 | **0.041911764706** (2736/65280) | [24,1,6,24] | 0 |

These windows are physically separated; p50 contains the original numeric grid and contributes no runes. The source p16, p40 and p51 windows do not overlap. Each score uses `Σ_r count(r)(count(r)−1) / (256×255)`, with **all 29 known GP rune values**, no free substitutions, word resetting, or text fitting. For p16 the enumeration finds 1,704/707,281 seeds at or above IoC.038, 20 at or above.040, and none at or above.042. For p40 it finds 1,687/.038, 26/.040 and none/.042; for p51, 37/.040 and none/.042. The numerical maxima, IVs and thresholds are asserted by the SFT.

### Genuine solved-Cicada positive

The independently solved LP1 p6 *A KOAN* starts `A MAN DECIDED TO GO AND STUDY WITH A MASTER ...`. Reversible canonical longest-match GP29 transliteration of its first 256 native letters gives **IoC=4254/65280=0.065165441176**. Applying the same candidate recurrence with independently chosen seed [11,18,15,12] makes near-flat ciphertext IoC **2264/65280=0.034681372549** and the identical subtractive decoder recovers all **256/256** native GP runes exactly. The source is `resources/liber-primus/lp1-plaintext-reference.txt`; editorial Latin spellings normalize K→C, V→U, Z→S, Q→C before greedy GP29 transliteration. The plant checks implementation and shows that 256 GP runes are sufficient to distinguish a genuine source-native clear passage, without treating synthetic success as proof of the proposed original cipher.

## What this decides

The authentic source-factor coincidence and long 24,360-period linear clock survive. **For the precise, continuous direct GP29 additive/subtractive stream defined by their product HG, no secret four-state IV can recover a 256-rune native-LP1-like plaintext in any of three untouched original manuscript windows**, whereas the identical decoder exactly recovers a source-native plant. This excludes spending further computation tuning seeds, signs or Caesar shifts for **that family**.

It does **not** exclude interval-specific resets plus different key laws, nonlinear or byte-mode consumers, independently supplied non-GP plaintext, all possible author-selected registers, or an alternative purpose for the table's factors. A truly productive successor must find an independent first-party operation that maps the source factors or table data into a *different exact reversible receiver* with independently predicted original plaintext.

**Reproduction:** `node sims/lp2_hg24360_allseed_source_additive_sft.cjs` on Windows Node22 using committed source resources; no network access or optional dependencies needed. SFT prints the three complete maxima and source-native positive. Avoid re-running completed IV domains merely to change a presentation threshold.
