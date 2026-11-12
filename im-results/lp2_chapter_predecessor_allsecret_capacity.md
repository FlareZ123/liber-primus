# LP2 chapter-static previous-cipher decoder: all-secret capacity and printed-boundary fork

**12 November 2026, Agent5.** The original 12,956 GP29-rune ciphertext cannot represent any of the 89 pinned ordinary native-GP English control windows through a **length-preserving, chapter-static, previous-cipher-rune-only 29-symbol permutation cipher**, even granting an entirely arbitrary independent secret 29! substitution for **each of the 261 chapter × predecessor states**. Such a cipher cannot produce enough plaintext E or E+O runes. Adding the original printed word-boundary bit as decoder input removes this specific upper-bound obstruction. **No authentic unknown plaintext, original key, or authorially specified operation is recovered.**

[Complete original-input CommonJS regression](../sims/lp2_chapter_predecessor_allsecret_capacity_sft.cjs).

## A plausible mechanism and exact constraint

Near-uniform original rune frequencies and very few equal-adjacent ciphertext pairs suggest considering a changing substitution keyed to the preceding ciphertext rune. The manuscript visibly divides into nine chapters, so grant the proposed decoder **one entirely unconstrained secret alphabet at each combination of chapter and previous ciphertext rune**:

\[
P_i=D_{h_i,C_{i-1}}(C_i), \qquad
D_{h,q}:\{0,\ldots,28\}\to\{0,\ldots,28\}
\text{ any bijection}.
\]

The original chapter intervals are pages 0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53 and 54–55; p50 is the runeless number table. **The cipher architecture itself is hypothetical.** It does not presume the 256-byte table or a particular secret alphabet ordering.

For each fixed observable state \(s=(h,C_{i-1})\), count original next-ciphertext identities \(n_{s,c}\). Under any unknown inverse permutation, the maximum total copies of one chosen plaintext rune are

\[
U_1=\sum_s \max_c n_{s,c}.
\]

The maximum total copies of any two chosen plaintext runes are

\[
U_2=\sum_s (n_{s,(1)}+n_{s,(2)}),
\]

where the subscripts (1) and (2) denote the two highest counts at a given state. These maximize over **every possible secret 29! permutation at every source-visible state**, without searching keys. Add **55 unconstrained positions** for the first rune of every physical page, an optimistic allowance even for a chapter-continuous cipher.

Source inputs are the exact **55 original rune-bearing physical pages**, **12,956** GP29 rune identities, **12,901** within-page transitions, **2,873** printed between-word delimiters before in-page runes, and the nine visual chapter intervals. Every rune position is asserted against the independent original-source corpus. The parser preserves the existing 32 cross-page words and never treats line wraps as word breaks.

## Original versus native control

| Secret decoder state | Populated states | Max copies of any one plaintext rune, including 55 page starts | Max copies of any two plaintext runes, including 55 page starts |
| --- | ---: | ---: | ---: |
| Previous cipher rune, global | 29 | **769** | **1,414** |
| Previous rune + printed word-start bit, global | 58 | **854** | **1,562** |
| Original chapter + previous rune | **261** | **1,310** | **2,344** |
| Original chapter + previous rune + printed word-start bit | **521** | **1,635** | **2,885** |
| Physical page + previous rune | 1,590 | **2,790** | **4,787** |

Reference texts use established GP normalization: QU to CW, V to U, K/Q to C, Z to S, followed by longest matching of the 29 canonical rune transliterations. Each native window contains **12,956 runes**, with windows stepped by half the manuscript length. This matches the independently pinned project-wide native controls.

| GP-native English source | Windows | Minimum plaintext E copies | Minimum E+O copies |
| --- | ---: | ---: | ---: |
| Shakespeare (first 300,000 characters) | 32 | **1,430** | **2,471** |
| Gibran, *The Prophet* | 8 | **1,437** | **2,608** |
| Emerson, *Essays, First Series* | 49 | **1,491** | **2,464** |

**Every one of 89 native-GP English controls exceeds both chapter-static predecessor-only capacity ceilings.** Even the weakest comparison exceeds the **1,310** one-symbol ceiling by at least **120** E runes and the **2,344** two-symbol ceiling by at least **120** E+O runes. These are deterministic all-secret obstructions within the stated cipher family.

**Adding the actual word-start bit changes this necessary condition.** Separate secret tables for printed word starts and interiors within each original chapter and predecessor state increase capacities to **1,635** and **2,885**. Both exceed the native-control minima. This permits sufficient character frequency only. It neither demonstrates a viable complete English decoder nor proves the printed separators were inherited from plaintext. Independent per-page secret tables similarly escape the simple capacity bound at the cost of substantially greater key freedom.

## Fully recoverable positive plant and next decipherment decision

The accompanying CommonJS SFT generates **9×29 independent secret 29-way permutations**, encrypts a full **12,956-rune native Shakespeare control** with cipher-state reset at the exact original 55 physical page starts, and recovers **12,956/12,956** plaintext symbols through its inverse tables. The plant's all-secret capacity necessarily covers its true E and E+O counts; the original ciphertext does not. The script asserts every original-source runic position, printed-word delimiter total, state cardinality, capacity, source-native window count and control minimum.

**Decision:** a stationary preceding-cipher-rune rotor, even with arbitrary secret 29-way substitutions independently assigned to each chapter and predecessor, cannot directly decode the complete LP2 original into the three tested styles of ordinary GP-native English. Printed-boundary-conditioned substitution or larger state memory is structurally different and survives this necessary frequency check. Proceed to such a mechanism **only if an original source selects its identity-changing rule, key and state clock**, then demand complete untouched-page plaintext plus exact inverse. Do not interpret the possible model's key freedom as evidence for an intended cipher.

This bounded result complements the preexisting [256-phase GP28 rank exclusions](lp2-chain256-allsecret-source-gate.md) and [word-boundary channel audit](lp2-boundary-single-escape-symbol-source-gate.md). It does not test other languages or orthographies, evolving hidden state, alternate plaintext registers, variable-length codes, or external binary payloads. The authoritative conclusion that LP2 pp0–55 remain unsolved is unchanged.
