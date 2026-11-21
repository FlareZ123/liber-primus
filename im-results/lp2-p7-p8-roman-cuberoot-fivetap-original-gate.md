# P7 five-product / p8 Roman cube: an original-cipher nonlinear five-tap receiver

**Agent 3, 21 November 2026. Evidence classification:** bounded, source-derived cryptanalytic model with exact reversible original-cipher and native-GP positive tests. No unknown LP2 plaintext, authentic keystream, creator-selected update rule, or endpoint is recovered.

## The human-visible candidate route

Original physical LP2 p7 ends with **five red words and five black dots**. Preserve the five complete printed red word boundaries and multiply each word's GP29 **indices**, not prime weights, modulo 29. The exact words, in printed order, are:

| Rune indices | Product modulo 29 |
| --- | ---: |
| [23,3] | 11 |
| [22,16,2,25] | 26 |
| [5,7,11] | 8 |
| [14,28] | 15 |
| [6,28,19] | 2 |

Thus the frozen five-tap weights are **[11,26,8,15,2]**. The immediately next physical LP2 page, p8, opens with a red12 title. Its first eight indices **[14,10,14,19,1,14,19,5]** are from the Roman-numeral alphabet; its first four are `XIXM`, visibly containing `XIX` = **19**. The last four red indices **[2,13,3,17]** have product **3** in GF29. These are prior-reported facts (see [the p7 and p8 Roman source study](lp2-p6-p7-redgap-28cycle-inversion-gate.md)), not new discoveries here.

In GF29, cubing has inverse exponent **19** since `3 × 19 ≡ 1 mod 28`. Repeated cubing of p7's final product 2 gives the complete six-element orbit **2 → 8 → 19 → 15 → 11 → 26 → 2**, with all five original p7 products present and **19** supplied by the next red heading. This supplies a concrete original-image clue to a possible five-tap, cubed-or-cube-rooted feedback cipher. It is substantially more constrained than blindly searching numerical keys: the coefficient values and powers are entirely fixed before ciphertext inversion.

**Decisive uncertainty:** the original image provides neither a written command to use a *five-lag ciphertext-feedback cipher* nor a unique order for applying cube/root and feedback. The cube relation selects mathematical operands but is insufficient to authenticate an algorithm.

## Frozen reversible update families

Let `c_i` be the original ciphertext GP29 ordinal and `h_j=c_(i-j)` the five previously printed **ciphertext** runes. Coefficients `w_j=[11,26,8,15,2]` are assigned in printed order to lags 1–5; the reverse lag order is the only orientation alternative. Define the source-shaped families over GF29:

- **Root before sum:** `p_i=c_i^19 + σ Σ w_j h_j`.
- **Root after sum:** `p_i=(c_i + σ Σ w_j h_j)^19`.
- **Cube prior taps:** `p_i=c_i + σ Σ w_j h_j^3`.
- **Root after product:** `p_i=(c_i + σ Π(h_j+w_j))^19`.

Signs are `σ∈{−1,+1}`; all arithmetic is mod29. These are 4 operations × 2 signs × 2 orientations = **16 distinct fixed transforms** for each of **two source-boundary registers**:

1. **Carry p7:** consume all original **1,729** runes of p8–p14 continuously, with the five final original p7 runes as the initial ciphertext history.
2. **P8 red as IV:** keep p8's first **12 red runes** outside the output and decode the following **1,717 original black/body runes** through p14, using original p8 red runes 7–11 as the five-rune ciphertext IV.

There are precisely **32 full original inversions**, with no fitted phase, learned alphabet, plaintext crib, secret coefficients, loose page selection, or later parameter rescue. Both scopes follow immediately after the p7/p8 source packet and retain the visible p8–p14 tree-motif chapter; this is the closest plausible recipient. Each candidate has a unique exact forward encoder because the feedback depends only on already observed ciphertext.

## Original results and exact implementation controls

For the complete original 1,729-rune p8–p14 chapter, untouched GP29 IoC is **0.03446048347**. The independent genuine clear p57 source gives **0.06270996641**. Across all 32 source-fixed inverses (both scopes), the **highest decoded IoC is 0.03478447722**, at carry-p7, cubed-prior-taps, printed coefficient order, positive sign. Every decoded opening remains nonlinguistic GP29 rune text. In particular, no model turns the complete p8–p14 original ciphertext into ordinary native-GP English.

The peak candidate begins, as exact GP transliteration, `B F P L TH OE D H P TH O P S EO L TH C A W A T X OE W`, rather than sustained English. The original inverse prefix and full statistics are emitted by the executable SFT.

All **32** independent native-source positive controls first encrypt the exact **95 original clear p57 runes** using the specific candidate model and its original five-rune IV, then recover all **95/95** runes exactly. The same 32 inverse outputs forward-reencrypt **100%** of their original source ciphertext, in their respective lengths. These are mechanism implementation controls, never evidence that one of these ciphers was used by Cicada.

[Single-file native-Windows Node22 reproducer](../sims/lp2_p7_p8_roman_cuberoot_fivetap_sft.cjs) reads the unchanged canonical `lp2-corpus.json` and red-ink annotations. It asserts original page lengths, title and source coefficients, the complete 6-orbit, all 29 modular cube/root inverses, exact original replay and the known-source plants.

## Decision

**Do not pursue these four direct five-tap cube architectures on the unchanged p8–p14 chapter without an independently visible missing operation.** The original-source 5-product/3/19 relationship remains a potentially intentional clue, while none of these 32 natural, source-fixed ciphertext-feedback consumers recovers unknown plaintext. This does not exclude a keyed nonlinear cipher with a different source-selected receiver, a non-English alphabet, an additional cryptographic layer or short native-text islands. No conclusion is made about all possible 5-tap algorithms.

The next productive challenge is to obtain a **source-selected state update or preserved ciphertext/plaintext relation** capable of predicting an untouched passage, rather than enlarging the model menu with arbitrary phases, output substitutions or higher polynomial degrees. Existing direct p8 scalar, ternary and circulant negatives are in the linked p7/p8 source study. The present exact five-ciphertext-tap update is a different, explicitly reversible hypothesis, with the same negative original result.
