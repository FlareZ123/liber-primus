# Canonical GF(29²) digraph power — exact original inverse, bounded negative

**Decision (Agent26, 28 November 2026; Director #3290):** the single-source canonical (GF(29^2)) power map is a genuine bijection on GP29 digraphs, but does not recover English-like original text on physical LP2 p33–39. A controlled order-4 native language scorer identifies the exponent on **8/8 independently encrypted, 1,680-rune GP29 native records**; the best of all **192 legal exponents** on complete original p33–39 remains nonprose and shows severe independent continuation failure on p40–53. This is a **bounded negative** under a stationary digraph-power map, source-ordered text, and the specified native-GP text model. It is already subsumed *as an English-like stationary digraph exclusion* by the stronger arbitrary-841-bijection spectrum gate, [fixed digraph gate](lp2-fixed-digraph-bijection-gate.md); it does **not** exclude hidden extra state or unfamiliar plaintext registers. No unknown plaintext or historical key was recovered.

## Exact sender and inverse

The GP29 symbol order is from `resources/liber-primus/lp2-corpus.json`. Encode a pair `(a,b)` as (x=a+bt) with (a,b\in\mathbb F_{29}) and (t^2=2). Since 2 is the least positive quadratic nonsquare modulo 29, this construction is a field. The exact multiplication is ((a,b)(c,d)=(ac+2bd,ad+bc)\pmod {29}).

For (e\in\{1,\dots,839\}) with (gcd(e,840)=1), send (x\mapsto x^e); zero is fixed. The multiplicative group has 840 elements. The inverse exponent is (e^{-1}\pmod{840}). There are (arphi(840)=192) legal exponents, and **no additional basis, translation, frame reset, F skip, alphabet, key, or digit order is fitted**. GP29 first coordinate is the leading rune of each block. The pair clock is the uninterrupted page-ordered rune tape of physical p33–39, 1,680 runes, and the independent 3,008-rune continuation p40–53. Both are even, so no padding or unpaired-tail choice is required.

**All-key hard invariant (new, but not a decryption):** Every legal (e) is odd. For ((a,0)=a\in\mathbb F_{29}), (a^e\in\mathbb F_{29}); for ((0,b)=bt), ((bt)^e = 2^{(e-1)/2} b^e t), so the two coordinate axes are preserved. Conversely, the inverse also preserves each axis. Therefore the first rune of a pair is F iff its ciphertext first rune is F, and likewise for the second rune. A sender that changes such F positions cannot be one of these 192 maps. The original training chapter has 21 leading-coordinate F and 19 trailing-coordinate F among 840 blocks. The native plant has 24 and 22; these counts alone do **not** reject the original.

## Native calibration and complete original results

Training source `resources/control/gibran_prophet_58585.txt` is converted using the published longest-match GP tokenizer (QU→CW, V→U, K/Q→C, Z→S). Language model training uses GP positions [2200,14500), and the 1,680-rune native test record uses [16100,17780). The order-4 recursive interpolated GP29 predictor is specified exactly in [the read-only SFT](../sims/lp2_gf29quadratic_power_exact_sft.cjs) and contains no original-rune training. Test exponents are the eight fixed indices 7,31,55,…,175 in the sorted coprime exponent list. For each, encode the native test record, rank all 192 candidate inverse exponents by the same fixed scorer, and require genuine exact recovery.

| Measured field | Outcome |
| --- | ---: |
| Legal power maps enumerated | 192/192 |
| Zero/axis invariance | 192/192 |
| Complete native planted exponent recovery | **8/8, rank 1** |
| Native plaintext mean order-4 log score per rune | **−2.22054** |
| Original p33–39 ciphertext raw score | **−6.59687** |
| Best original inverse, (e=127), inverse (e^{-1}=463) | **−6.44711** |
| Next three original candidates, (e=13,767,73) | −6.46947, −6.47942, −6.48695 |
| Frozen p40–53 continuation, (e=127) | **−6.66305** |
| Non-power wrong-family synthetic control, best of 192 | **−6.40791** |
| Distinct pair inventory in original 840 blocks | **518** |
| Distinct pair inventory in matched native plant 840 blocks | **260** |

The top original output begins in canonical GP transliteration: `NG M X C F AE TH O R TH N W F E C EA B T N NG ...`. This is **not plaintext**. Exact re-encryption of every original decoded candidate is guaranteed by the group inversion and explicitly asserted; it does not distinguish historical keys. The full **1,680-rune training and 3,008-rune held continuations** for the four highest-scoring exponents, all 192 ranked scores, provenance and native-control outputs are pinned in [the machine-readable result](lp2_gf29quadratic_power_exact_original_output.json). [Manual read-only Node22 execution](https://github.com/FlareZ123/liber-primus/actions/runs/46098062331) runs the standalone SFT; in-code assertions compare the complete generated JSON exactly with the committed result.

The source-only discrete pair spectrum already makes this a strictly less flexible hypothesis than the 841!-family report; there is **no valid reason to expand to alternate nonsquare bases, new digit order, secret constants or per-page fitting** without an independent original clue. This exact attempt has a mathematically consistent inverse but no mechanism selected by period-authentic first-party evidence. In particular, historical modular exponentiation alone does not identify the field extension or represent every pair as a field element.

## Next research decision

Do **not** pursue more stationary power exponents or promote output snippets to plaintext. A genuinely new route needs a clue that explicitly determines the extension-field representation, page-dependent operator/state, or a non-English target; absent that evidence, prefer the distinct Director tasks concerning source-selected operands and intentional visual instructions. The report changes no established plaintext conclusion and therefore does not add another paragraph to `results/README.md`.
