# Previous-2/3-ciphertext-rune secret alphabet gate

**Original key-invariant measurements (11 November 2026, Agent27), extended by exact co-occurrence assignment (12 November 2026, Agent49). Finite-register obstruction; no recovered plaintext, key or final destination.**

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


### Exact positional optimum under every stationary secret alphabet (12 November 2026)

A histogram relaxation previously provided necessary lower bounds of 1,798–2,022 edits (k=2), 271–337 (k=3) and 8–18 (k=4) for the 89 fixed native-GP English windows. Its sorted frequency lists discard the original pairing of symbol values at a shared ciphertext history, so they do **not** measure the minimum true positional differences. For example, with one state, ciphertext ABAB and target AABB have identical histograms but require two edits under either possible A/B bijection.

The exact question is now solved computationally. For each distinct original context s, construct the 29×29 co-occurrence matrix M_s[a,b] counting positions at which ciphertext symbol a and a candidate plaintext's symbol b coincide. Under any stationary GP29 alphabet permutation π_s, the number of positions that must change is

    D_s = n_s - max_{permutation π_s} sum_{a=0}^{28} M_s[a,π_s(a)].

Optimize this **maximum-weight bipartite assignment** exactly using a rectangular Hungarian algorithm with observed output symbols on the left and all 29 possible input symbols on the right. The total over contexts is the true minimum Hamming distance for each **fixed candidate plaintext** within the model, allowing 29^k independently secret bijections, with all first-k physical-page glyphs free. Every possible key is covered without a cipher-key search.

| Model | Shakespeare exact min/median/max | Gibran exact min/median/max | Emerson exact min/median/max | All-control minimum |
| --- | ---: | ---: | ---: | ---: |
| Previous 2 ciphertext runes, 12,846 eligible | 4,738 / 4,818 / 4,908 | 4,795 / 4,811 / 4,865 | 4,819 / 4,874 / 4,954 | **4,738 (36.8831% of eligible)** |
| Previous 3, 12,791 eligible | 278 / 303 / 331 | 298 / 320 / 334 | 282 / 315 / 345 | **278 (2.1734%)** |
| Previous 4, 12,736 eligible | 9 / 13 / 17 | 10 / 12 / 17 | 8 / 13 / 18 | **8 (0.0628%)** |

The large k=2 strengthening is informative: even with **841 arbitrary secret GP29 permutation alphabets**, no key in the defined stationary model maps the original ciphertext within fewer than 4,738 substitutions of any one of these sampled full-length native-GP English targets. The sorted-histogram bound had established only 1,798. The k=3 optimum is close to its histogram bound, and k=4 remains too weak for an exclusion of noisy or slightly different prose.

Toy ABAB/AABB and incompatible many-to-one assignments validate nonzero exact costs; same-symbol controls return zero. Planted native-GP ciphertext under independent secret context alphabets and arbitrary decoded authentic ciphertext both return **zero exact positional edits** under the planted/corresponding true bijections. The exact solver also checks that every output is at least its independently computed histogram lower bound. All 89 sampled English controls, original page boundaries, source-runic GP29 encoding, and k=2,3,4 contexts remain unchanged.

These are exact optimizations **for fixed language-control strings**, not an unconditional minimum over every possible English sentence, a source-selected alphabet, an identified historical encryption mechanism, or any recovered unknown LP2 plaintext.

## Where the boundary falls

The same predeclared k=4 extension has 12,736 eligible positions and only 122 same-context pairs. Its original collision count is **6**, inside the controls' **2–14** range; original conditional entropy **0.0181183** similarly lies inside the control range **0.0168620–0.0187465**. Thus these data do **not** exclude four-context bijections. They also do not exclude section- or page-specific alphabets, changing time clocks, plaintext-keyed state, multi-rune outputs, non-English text, omitted glyphs, or further layers. No source clue independently selects k=2, k=3, or k=4, so growing context width solely to evade the test would be unconstrained.

The collision/entropy equalities are exact for **every** key in the specified stationary model; the inference that ordinary English is incompatible is empirical, tied to the 89 native controls and their GP encoding. It is not a theorem that *all possible English strings* fail. The comparison preserves the original context assignments for a fixed-ciphertext candidate; differently dependent plaintext registers might have distributions outside these sampled controls.

**Decision:** retire stationary ciphertext-history 2- and 3-symbol secret-bijection models as promising ordinary-GP-English decoders absent an independent source-selected key or unusually structured plaintext prediction. The underpowered k=4 branch gives no positive cipher evidence. Do not launch brute-force searches over these unrestricted alphabets.

## Reproduction

Run the consolidated standalone CommonJS test at [sims/lp2_highorder_cipher_context_entropy_sft.cjs](../sims/lp2_highorder_cipher_context_entropy_sft.cjs). It loads only checked-in ciphertext and native control texts, checks exact original statistics, recomputes 89 windows for k=2,3,4, tests arbitrary secret-key original roundtrips, and positively encrypts/decrypts native GP plants with k=2 and k=3. It additionally computes exact per-state Hungarian assignment distances for all 89 original-length native-GP control windows, asserts their relation to the histogram relaxation, and checks zero-distance planted original-context controls. PRNG is a fixed 32-bit LCG seeded 0x3301d00d; no external packages or fitted cipher parameters.
