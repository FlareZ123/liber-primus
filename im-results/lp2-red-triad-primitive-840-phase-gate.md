# Source-red primitive GF(29²) and the all-secret 840-state LP2 inverse

**Classification: exact cross-artifact algebra plus a bounded original-input cryptanalytic negative. No unknown LP2 plaintext or key recovered. Agent 32, 10 November 2026.**

## Original clues and new field constraint

The only two red three-rune spans are on LP2 pages 3 and 39, both at local rune position 119. Their GP29 indices are [13,23,2] and [27,5,15]. Source verification and the pre-existing polynomial-root crosslink are in [the red-triad SFT](../sims/lp2_red_triad_extension_root_sft.cjs) (Agents 39/24).

Reading p3 in increasing polynomial degree produces

\[
13+23u+2u^2=2(u^2-3u+21)\pmod{29},
\]

with nonsquare discriminant 19. Set \(E=\mathbb F_{29}[u]/(u^2-3u-8)\); in coordinates, multiply by
\((a,b)(c,d)=(ac+8bd,\;ad+bc+3bd)\pmod{29}\).

The field root \(u\) has **exact order 840 = 29²−1**, checked against prime divisors 2,3,5,7. The root's **trace is 3** and **norm is 21**, since \(u^{30}=21\). The number **21 = 79 mod29** matches the p15 Fibonacci-prime square's selected prime 79; 21 itself has multiplicative order 28 over GF29. Separately the full LP2 source has 30 red thirteen-dot punctuation marks and one black, making 30 = 29+1 a potential marker clock. The root and factor arithmetic are exact, while the interpretation of these source-number agreements remains **hypothetical and retrospective**.

The p39 triple gives \(27+5X+15X^2=15(X-24)^2\). This divides the exact 256-byte printed grid polynomial over GF29, leaving **254 fixed-width quotient slots** (one leading zero; 253 canonical coefficients), naturally 127 field pairs.

## Why unknown initial states and hidden linear projections require only 840 phases

Consider \(S_{i+1}=uS_i\) over E with any nonzero hidden \(S_0\), and any nonzero *hidden GF29-linear* observation \(L(S_i)\). By nondegeneracy of the field-trace pairing, \(L(v)=\mathrm{Tr}(\lambda v)\) for unique nonzero \(\lambda\in E\). Because \(u\) generates all 840 nonzero field elements, \(\lambda S_0=u^\phi\) for exactly one \(\phi\) modulo840. Thus **every unknown initial state and unknown linear observation** in this homogeneous model yields a member of the explicit family \(K_i=\mathrm{Tr}(u^{i+\phi})\). There is no further missing secret key within this model.

## Exact original-cipher inversions

[Executable, source-asserting Node.js inverse](../sims/lp2_red_triad_primitive_field_inverse.cjs) and [successful original-input GitHub Actions 42910619424](https://github.com/FlareZ123/liber-primus/actions/runs/42910619424).

| Declared model | Exhaustive original cases | Maximum global GP29 IoC |
|---|---:|---:|
| Direct GP29 subtractive trace pad; book-continuous | 840 phases | **0.034567980526** |
| Direct GP29 subtractive trace pad; physical-page reset | 840 phases | **0.034585544352** |
| Transparent GP28 relative log-base-15 ciphertext-delta inverse, repeated-pair marker 28; book/page reset, 0–2 field draws per marker, both signs | 12×840 = **10,080** | **0.035367706559** |

Original ciphertext IoC **0.034478397865**; independent uniform-GP baseline \(1/29=0.034482758621\). Direct additive sign reversal is already subsumed by the phase scan because \(u^{420}=-1\). Every winning original candidate remains statistically close to the encrypted baseline and unreadable. This **conditionally excludes native-GP prose under these particular direct/relative cipher registers**; neither the true plaintext register nor the actual cipher is identified.

A **source-native English positive control** encrypts 12,956 Shakespeare GP indices using the true phase391, recovers that exact phase as the best of 840, and reconstructs **12,956/12,956 original plant symbols**; native source IoC **0.059834604526**.

A separate 127-field-element logarithmic serialization uses the quotient of the marked p39 factor: each paired GF29² value maps to a 0–839 discrete logarithm and two base29 digits (zero element uses sentinel840). Comparing p53 black128 (omit one end) and p53-red51+p55 76, all **32** natural adjacent/halved, coefficient-order, orientation and padding cases give at most **16/254 individual symbol matches**, and only **one fully matched two-symbol pair**. The direct pair serialization is not the terminal plaintext.

## Next cryptanalytic decision

The p3 quadratic is a mathematically genuine **primitive state generator**, and its norm links exactly to a p15 prime. This is a possible intended source of key material. **Choosing another nonzero state or another secret linear observation of the same homogeneous generator cannot improve the existing 840-phase bound.** Future attacks must specify a genuinely distinct mechanism from source clues, such as a marker-indexed clock, a nonlinear output/transition, or a different plaintext register. A key-free check of a 30-red-mark/28-field cycle is valuable if it predicts readable original text; repeated blind phase searches are not.

No recovered LP2 plaintext, destination or historically authenticated key is claimed.
