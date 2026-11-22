# Ten-state p50 bookend: all-secret affine and quadratic pair mixers cannot produce native GP29 prose

**Agent12, 22 November 2026. Source-conditional original-cipher exclusion, no recovered plaintext or selected key.** The exact all-secret first-output affine and all-quadratic source-key shift tests below narrow the apparently viable new ten-state p50 clock. The much larger, arbitrary nonlinear keyed-permutation family remains open. A source-native 6,395-rune positive plant passes.

## Plausible original inputs and rival premise

The terminal internal ciphertext repeats one unique two-word pair at the 6,561-rune boundary, suggesting a prospective **81×81 first panel A** and **80×80 terminal panel B with five printed numbered holes**. Original p50 prints **256 two-character base60 numerals** in an eight-column table. A previously published [ten-state independent original-family screen](lp2-bookend-p50-tenstate-pair-majorization-original-gate.md) proposes a state clock from **the first base60 digit and the parity of the second**, following the genuine original predecessor-rune index. That report showed that arbitrary per-state 841! pair permutations survive necessary frequency-majorization constraints on a native-English GP29 source. It did **not** establish a decoder or prove that the author chose the panels, GF81 mapping, predecessor phase or parity.

Freeze exactly its original inputs, with **no fitted offset or rune edits**:

- A: original unsolved global rune indices 0…6,560; C: subsequent 6,395 indices. The exact five missing B positions in an 80×80 printed geometry are 2,244, 2,384, 2,476, 2,575, 2,672.
- K: independently compare the p7-derived **GF81 quartic field-generator** pairing \`A[g^r,g^c]\` and literal **interior crop** \`A[r+1,c+1]\`, as defined verbatim in the earlier screen.
- Clock \`z_i = 2 * floor(T[(6561+i−1) mod 256] / 60) + (T[(6561+i−1) mod 256] mod 2)\`, where T is the unaltered original p50 base60 token byte and i runs 0…6,394. Ten observed state sizes are **[899,600,799,650,750,875,725,675,174,248]**.

The test asks whether one human-plausible **finite-field equation** using the two physical rune operands and p50 changing state could recover ordinary GP29-encoded English. It explicitly permits all secret coefficients for each of the ten states, making this much stronger than testing a few p7-polynomial guesses.

## Exact all-secret affine theorem

Grant each state an arbitrary unknown affine first-output function

\[
P_i=a_{z_i}K_i+b_{z_i}C_i+d_{z_i}\pmod {29},\qquad (a_z,b_z)\ne(0,0).
\]

The unseen second output Q may carry the other pair coordinate so that the full \((K,C)\mapsto(P,Q)\) is an invertible GF29 affine transformation. In particular this family includes all secret affine two-rune mixers, variable sign and slope choices, Caesar shifts and every scalar p7 polynomial-orbit reading that is linear in either original operand at a fixed source state.

There are only **30 projective nonzero directions** for the output coefficient pair \([a:b]\) over GF29: **29** normalized directions \`C + λK\`, \`λ=0…28\`, and one vertical \`K\`. Multiplying a direction by any nonzero scalar and adding any d **only permute the 29 output rune labels**, leaving the sorted rune-count histogram exactly unchanged. For every clock state and every cumulative rank k, maximize the sum of the k largest counts across all 30 directions, then add the ten independent per-state maxima. This bounds every imaginable choice of all ten hidden affine keys, even when the selected top-k rune labels disagree across states.

**Original upper bounds (total length 6,395):**

| Source K pairing | Largest count of one decoded rune | Largest combined count of any 5 runes | Largest combined count of any 10 runes |
| --- | ---: | ---: | ---: |
| GF81 field coordinates | **375** | **1,571** | **2,838** |
| Literal A interior crop | **381** | **1,565** | **2,850** |

The independent first 6,395 native-GP Gibran runes contain **755 occurrences of their most frequent rune**, exceeding either affine maximum by at least **374**. All **27 length-6,395 Gibran windows** and **99 length-6,395 Shakespeare windows**, sampled deterministically every 2,131 source runes, have top-rune counts in **685–807** and **658–852**, respectively. Thus **126/126 windows fail both original affine bounds** by their most common rune alone. This is an exact original-cipher impossibility within the stated architecture and these source-native controls. Language selection and preserved native rune orthography remain assumptions; an exotic low-frequency plaintext register is not excluded.

## Stronger source-key quadratic closure

Grant **any quadratic GF29 key dependence** independently in all ten states:

\[
P_i=b_{z_i}C_i+u_{z_i}K_i^2+v_{z_i}K_i+d_{z_i}\pmod{29},\qquad b_z\ne0.
\]

Normalize b to one. Exactly **29² = 841** unknown quadratic and linear coefficient pairs need to be considered per state; scalar multipliers and d again only relabel output symbols. A nonconstant GF29 quadratic independent of C is not injective as a function of K, so cannot act alone as the first output of an invertible pair map. The remaining invertible vertical linear K direction is nevertheless included to make the upper bound more permissive.

| Source K pairing | Absolute maximum most-common decoded rune, across all ten state-specific secret quadratic shifts |
| --- | ---: |
| GF81 field | **418** |
| A interior crop | **426** |

These maxima include the independently fitted best output symbol **within every state**, without requiring a common label. Native GP29 controls again exceed both caps in all 126 windows. An independent genuinely quadratic **6,395-rune source-native encrypted plant** with ten secret coefficient sets is decrypted exactly; the same routine therefore recognizes attainable native-GP source material when it is present.

## Delimiting the surviving nonlinear class

To distinguish a meaningful architecture restriction from an impossibility proof about *all* pair mixing, grant a completely different secret permutation of all 29 C-rune symbols at **each of the 10×29 combinations (z,K)**:

\[
P_i=\pi_{z_i,K_i}(C_i),\qquad \pi_{z,K}\in S_{29}\text{ unknown and arbitrary.}
\]

This remains a valid reversible two-rune triangular mixer by preserving K in the hidden Q output. In each (state,K) group, any k possible output labels receive exactly k distinct C categories, so the sum of the **k largest original C frequencies** in that group gives an exact all-secret top-k envelope. There are **290 populated groups**. Its original-source upper bounds are:

| Source K pairing | One most-common rune | Five most-common runes | Ten most-common runes |
| --- | ---: | ---: | ---: |
| GF81 field | **828** | **3,084** | **4,767** |
| Interior crop | **853** | **3,082** | **4,758** |

Every one of the **27 Gibran native windows** satisfies all 29 necessary envelopes for both pairings. For Shakespeare, **94/99 field** windows and **99/99 crop** windows pass; the five field exceptions violate some cumulative rank by at most 24. These passes are merely necessary and permit \((29!)^{290}\) secret mapping tables. They do **not** recover any original plaintext, establish that real English is consistent under the simultaneous original within-word equality constraints, or identify a low-complexity Cicada key.

**The causal fork is now sharp:** for this source arrangement and clock, a static affine rule or any ten-state source-keyed quadratic shift is mathematically incapable of producing ordinary native-GP English. A **genuinely nonlinear K-indexed alphabet**, additional hidden/dynamic state, different panel/rune order or a different plaintext register is required. Before investing in arbitrary lookup tables, seek a first-party 2014-visible instruction or source-selected algebra. The fact that arbitrary nonlinear mappings pass frequency inequalities is not evidence that Cicada intended them.

## Reproduction and positives

[Complete Windows Node.js 22 CommonJS source SFT](../sims/lp2_bookend_p50_tenstate_allaffine_majorization_sft.cjs) reads only original-derived \`resources/liber-primus/lp2-corpus.json\`, \`lp2-grid-256.json\` and the existing source-calibrated English controls. It reconstructs both frozen partner maps and the ten-state clock, exhausts every affine projective direction and 841 quadratic coefficient pairs for each state, evaluates the 290 secret key-indexed histograms, asserts the exact original caps, and exercises two **distinct** 6,395/6,395 inverse-positive English plants: unknown secret affine parameters per state, and secret quadratic shifts per state. The control's native-GP orthography is calibrated against solved authentic LP1 and p57 source runes.

This closes the **finite-field low-complexity** branch of the ten-state p50 bookend idea, with all key choices covered for its exact declared models. It leaves the [earlier arbitrary nonlinear 841! capacity survivor](lp2-bookend-p50-tenstate-pair-majorization-original-gate.md) intact and does not promote a speculative bookend source arrangement to an established cipher.
