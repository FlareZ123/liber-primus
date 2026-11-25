# Projective word-anagram inverse on original LP2

25 November 2026, Agent 7. **No unknown plaintext or authentic key recovered.** The union of independently keyed, total GP29 fractional-linear substitutions with arbitrary within-group permutation and optional per-group literal-F mode covers only **229/343** original groups of length 8–14; only **14/109** of length 10–14. This strengthens the finite-register exclusion of word-affine anagrams and the earlier position-preserving projective inverse. It holds even if the order of complete groups is arbitrary.

## Exact operation and reason for testing

LP1 p05's MOBIUS and LP2 p15's infinity mark motivate examining fractional-linear maps, while the authenticated 2016 message refers to words, their numbers, and direction. Neither source specifies a word-local map, anagram, or pole patch. The experiment is a deliberately generous necessary gate, not a source-selected historical mechanism. The prior [affine anagram test](lp2-original-word-anagram-allsecret-affine-gate.md) and [ordered projective inverse](lp2-wordlocal-double-projective-difference-gate.md) do not allow this combination.

Given an intact original printed group, grant an independent arbitrary permutation of positions and an independent GP29 decoding map of the form

    p = A + B*c                         (mod 29), or
    p = A + B*inv(c-r)                  (mod 29)
    A,r in GF(29), B in GF(29)^*

For the finite PGL branch require the pole r absent among consumed ciphertext symbols. For the total patched branch set inv(0)=0; this is a genuine permutation of all 29 finite runes with inverse c=r+B*inv(p-A). The affine branch is included in both. In the F-held variant, every plaintext F remains literal, and any number f from zero to the observed ciphertext F count may be reserved for holds before the transform. As all within-word positions can move, only the F count matters, not its location. All nonheld ciphertext F remain eligible for decoding. We grant independent ordinary/held mode per group in the most permissive union.

### Exhaustive inverse

For each multiset, choose every maximal-multiplicity occupied anchor a and every maximal-multiplicity remaining anchor z. Normalize by (x-a)/(z-a), sort, and choose the lexicographically least normalized bag. Empty and one-symbol bags are explicit cases. These anchor choices are invariant under affine permutations; equality of fingerprints is necessary and sufficient for affine multiset equivalence. This avoids enumerating all 812 affine maps independently for each candidate. For the projective family, enumerate identity and the 29 reciprocal representatives, rejecting poles in the finite-only variant, then look up the affine fingerprint. A matching pair of normalization anchors yields actual A,B and r; the program checks the decoded bag exactly. It therefore accounts for every permissible letter permutation without enumerating them. The stored witnesses specify transformed multisets, not a historically determined order or key.

## Original-cipher results

The canonical transcript is aligned against physical-page arrays: 12,956 runes, 2,896 joined printed groups. The finite register contains 20,327 distinct length-8–14 rune sequences from the checked-in TextBlob frequency list, all GP chart segmentation paths with ING/IO aliases and K/V/Q/Z normalization, plus authentic solved rune words. It is broader than the prior affine report's 12,900 entries, so its affine column is a new finite-register baseline, not an exact reproduction of that earlier count.

| Length | Original | Affine | Finite PGL | Total patched | Affine F-held | Finite F-held | Total F-held | Patched ordinary/held union |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|8|156|23|156|156|24|155|156|156|
|9|78|4|47|54|4|48|56|59|
|10|52|0|8|11|0|7|10|12|
|11|32|0|1|1|0|0|0|1|
|12|18|0|1|1|0|1|1|1|
|13|4|0|0|0|0|0|0|0|
|14|3|0|0|0|0|0|0|0|
|**Total**|**343**|**27**|**213**|**223**|**28**|**211**|**223**|**229**|

The union requires at least 95 of 109 length-10+ groups to be outside this register. It does not depend on original word order. Several isolated compatible words include COMMONWEALTH (one length-12 candidate at global group444), and MALefactors (one length-11 ordinary candidate at group1554); these are chance-compatible domain entries, not plaintext. Neither general GP substitutions, two or more independently patched maps, word-dependent mixing of positions before a differential encoder, nor H-decoy is excluded. Arbitrarily changing plaintext spelling or boundaries can invalidate the lexical gate.

### Positive checks and replay

73 native solved-source long-word instances were independently enciphered and shuffled under each of the six variants. All **438/438** contain their true native rune sequence in the inverse domain, with exact inverse evaluations on the consumed symbols. All 146 total-patched plants deliberately include a pole occurrence. The input/output transform is a reversible permutation given the key and shuffle; the experiment validates candidate inclusion, not unique recovery of independently secret keys or permutations. No native plaintext was held out for key estimation because this is an exhaustive per-word gate.

**Reproducer:** [Node CommonJS SFT](../sims/lp2_wordbag_projective_sft.cjs), executed twice on the connected V8 runtime with the exact four fetched source files; no standalone Node or CI run. [Raw domains, witness parameters and input blob SHAs](lp2-wordbag-projective-output.json). The output lists the first six witness candidates per matched group; the candidate counts are complete.

**Research decision:** retire this one direct nonlinear wordbag family within the intact-group native-lexicon premise. Do not turn isolated lexical hits into a key search without an independently selected relation between words. The absence of a shared key, authenticated letter-order selector, and authentic plaintext prevents promotion to established results.
