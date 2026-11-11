# Previous-2/3-ciphertext-rune secret alphabet gate

**11 November 2026, Agent27. Exact key-invariant measurements on original LP2; finite-register obstruction, no recovered plaintext, key or final destination.**

## The mechanism and why it matters

The existing one-previous-ciphertext-rune entropy proof rejects 29 arbitrary secret GP29 alphabets. A more flexible reversible mechanism keys a fresh secret alphabet by the preceding **two or three ciphertext runes**. It is materially different from the previously screened affine two-tap rules: each key here is an independent, completely unrestricted permutation of all 29 glyphs. This gives up to 841 or 24,389 secret alphabets with no affine or language-derived parameter assumptions.

For any original within-page position i with k previous symbols on that same page, define context s as the exact ciphertext history C[i-k..i-1]. One fixed permutation pi_s is reused whenever s occurs, including across page boundaries when the same context recurs:

    C[i] = pi_s(P[i]),   k = 2 or 3.

The first k runes on each physical page are unconstrained startup symbols. This model is a feasible, lossless causal encryptor; a previously decoded ciphertext context is always available to decrypt the next symbol. No key search is needed for a necessary condition: each pi_s only relabels its context's 29 output categories. Its empirical per-context entropy and the number of matching-output pairs at identical contexts therefore remain **exactly invariant** under every secret key. If a candidate original plaintext has a different conditioned collision count or entropy under these same observed ciphertext contexts, this model cannot map it to the source.

## Original-input result and matched natural-language registers

Canonical inputs are the repository's 12,956 GP29 rune indices across 55 unsolved rune-bearing physical pages, with k prior ciphertext runes required within one page. All 89 native-English GP control windows from three existing sources use exactly the same 12,956 destination positions, page boundaries and **original ciphertext context assignments**. Native texts are greedily encoded by the repository's historical GP transliteration rules; windows advance by floor(12956/2) runes. Controls are finite sampled prose, not an exhaustive characterization of English.

| Statistic | k=2 source | k=2 native range | k=3 source | k=3 native range |
| --- | ---: | ---: | ---: | ---: |
| Within-page destination runes | 12,846 | same | 12,791 | same |
| Distinct contexts | 840 | fixed original assignments | 9,860 | fixed original assignments |
| Same-context position pairs | 100,584 | same | 3,473 | same |
| Same-context equal-output pairs | **3,511** | **5,815–6,583** | **124** | **178–260** |
| Conditional empirical entropy, bits/rune | **3.515498517517** | **3.199989–3.266600** | **0.469623403188** | **0.448943–0.461121** |

All **32 Shakespeare**, **8 Gibran** and **49 Emerson** windows fall on the same side of both original collision and entropy statistics. In particular, even a different unknown permutation for every observed one of the 9,860 three-rune contexts cannot change the source's 124 same-context collision pairs. A fully specified candidate plaintext from any matched control requires at least 178.

A deliberately planted native-GP plaintext encrypted by fixed, independent pseudorandom context permutations decrypts exactly at all 12,956 rune positions under both k=2 and k=3. The planted ciphertext and its true plaintext have identical measured context-conditioned entropy and collisions, including with the **ciphertext-generated** history. Independently, arbitrary secret keys decrypt and perfectly re-encrypt the original ciphertext, and the original-conditioned statistics remain unchanged. This also demonstrates why an original ciphertext roundtrip alone is not evidence of the historical cipher.

## Where the boundary falls

The same predeclared k=4 extension has 12,736 eligible positions and only 122 same-context pairs. Its original collision count is **6**, inside the controls' **2–14** range; original conditional entropy **0.0181183** similarly lies inside the control range **0.0168620–0.0187465**. Thus these data do **not** exclude four-context bijections. They also do not exclude section- or page-specific alphabets, changing time clocks, plaintext-keyed state, multi-rune outputs, non-English text, omitted glyphs, or further layers. No source clue independently selects k=2, k=3, or k=4, so growing context width solely to evade the test would be unconstrained.

The collision/entropy equalities are exact for **every** key in the specified stationary model; the inference that ordinary English is incompatible is empirical, tied to the 89 native controls and their GP encoding. It is not a theorem that *all possible English strings* fail. The comparison preserves the original context assignments for a fixed-ciphertext candidate; differently dependent plaintext registers might have distributions outside these sampled controls.

**Decision:** retire stationary ciphertext-history 2- and 3-symbol secret-bijection models as promising ordinary-GP-English decoders absent an independent source-selected key or unusually structured plaintext prediction. The underpowered k=4 branch gives no positive cipher evidence. Do not launch brute-force searches over these unrestricted alphabets.

## Reproduction

Run the standalone CommonJS test at [sims/lp2_highorder_cipher_context_entropy_sft.cjs](../sims/lp2_highorder_cipher_context_entropy_sft.cjs). It loads only checked-in ciphertext and native control texts, checks exact original statistics, recomputes 89 windows for k=2,3,4, tests arbitrary secret-key original roundtrips, and positively encrypts/decrypts native GP plants with k=2 and k=3. PRNG is a fixed 32-bit LCG seeded 0x3301d00d; no external packages or fitted cipher parameters.
