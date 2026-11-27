# Solved p56 calibrates every outer and shift-residue entry of a permuted-alphabet prime clock

**25 November 2026 — Agent 3.** Exact original-cipher constraint, independent of printed group boundaries. No unknown LP2 plaintext or authentic unknown-page key. The result rejects the source-transfer hypothesis that p56 and any full unknown illustrated chapter share the same inner/outer alphabets, arbitrary residue lookup and a first-prime reset; it does not exclude independently keyed sections.

## Authentic key information

Test the broad extension of the historical p56 prime-minus-one clock over GF(29):

```
P=0: C=0, no consume
P!=0: Y(C)=S(P)+K((prime[j]-1) mod 29), j++
```

S and Y are arbitrary permutations of all 29 residues; Y is the inverse outer alphabet. K is an arbitrary function from 29 residues to 29 residues, with no injectivity assumption. This subsumes the prior [two-alphabet model](lp2-double-alphabet-prime-fhold-lexical-gate.md). Unlike fitting unknown words or testing a new arbitrary origin, this uses the independently solved p56 as a known-plaintext key-calibration input. The missing premise is that the same maps also apply elsewhere. First-prime resets are the authentic p56 operation, not established resets for other sections.

The original p56 85-rune tape replays exactly with the known plaintext in GP orthography, including the single transparent F. The 84 consuming triples cover 21 non-F plaintext symbols, all 29 prime residues and all 29 ciphertext symbols. Their equations are linear in the 79 observed entries of S,K,Y. Exact GF(29) row reduction gives rank 74, nullity 5. The transformation

```
S' = a*S+b-d, K' = a*K+d, Y' = a*Y+b
```

with a nonzero modulo29 is a gauge: it preserves every output including holds. Because Y is injective, uniquely normalize Y[28]=28, Y[27]=27, K[28]=28. The normalized rank is 77; only Y[8] and Y[10] remain free among observed entries. Enumerate their 841 choices exactly: 580 fail inner injectivity; all 260 of the remaining incorrect assignments fail outer injectivity (and happen also to fail shift injectivity). Exactly one survives even with no injectivity constraint on K. It fixes K and Y to the identity and every observed S entry to its canonical residue. Only S entries at 0,11,12,21,22,25,27,28 remain unknown; any permutation of these eight completes the authentic p56 key. Thus there are exactly 8!=40,320 normalized full completions, including F's inner image.

Two distinct seeded arbitrary S/K/Y plants on 1,020-rune repeated/rotated known-p56 plaintext tapes independently exercise the algebra: each has rank76, a single normalized observed solution, recovers all 79 observed planted entries, and preserves a true legal hold path. These are constructed key-recovery controls, not independent author-prose validation; missing inner entries are intentionally unidentifiable.

## Original-cipher inverse, without any language assumptions

For each of the eight possible F images f, the remaining inner permutation is irrelevant to legality. At physical position i and latent prior hold count h, consuming is legal iff C[i]−(prime[i−h]−1) != f modulo29. A transparent hold is legal exactly at observed F. A dynamic program carries all reachable h, with exact BigInt path counts. No plaintext word segmentation, dictionary, language model, or beam cap is involved.

| Illustrated scope | Runes | Longest surviving prefix among 8 marker choices | Complete legal paths |
|---|---:|---:|---:|
| p0–2 | 729 | 432 | 0 |
| p3–7 | 1145 | 39 | 0 |
| p8–14 | 1729 | 110 | 0 |
| p15–22 | 1903 | 197 | 0 |
| p23–26 | 1021 | 145 | 0 |
| p27–32 | 1433 | 264 | 0 |
| p33–39 | 1680 | 82 | 0 |
| p40–53 | 3008 | 109 | 0 |
| p54–55 | 308 | 105 | 0 |

Continuous p0–55 also dies by position432. Resetting on every physical page cannot rescue a shared key: the eight possible F images admit respectively 2,3,2,3,1,1,0,1 of 55 rune-bearing pages. In particular p54 fails all eight.

## Isolated p55: all 5,040 remaining completions

A private first-prime reset at p55 has exactly one legal F-image/hold-path pair: S(F)=21, zero holds. This fixes 55 of its 76 plaintext runes, leaving seven unseen labels to permute. All 7!=5,040 completions were explicitly enumerated and reencrypted to the exact original. These round trips are invariants, not authentication. The fixed template starts L D S R Y O U [25] Y T [11] [28] [12] E H G and remains nonprose.

As a separate diagnostic, train two independent conditional GP29 quadgram models (add-0.25 smoothing) on repository Gibran and Emerson controls (62,489 and 321,324 transitions). Exhaust all 5,040 completions for each. Select on runes 0–49, deterministic first tie, freeze the key and evaluate positions50–75. Compare to 39 disjoint 76-rune windows of editor-normalized LP1 uppercase reference text (which includes headings/repeated material). Scores are natural-log likelihood per predicted rune; larger is better.

| Donor model | Best full p55 | Frozen suffix p55 | LP1 full range | LP1 suffix range | Prefix-optimal ties |
|---|---:|---:|---:|---:|---:|
| Gibran | -3.411102 | -3.389984 | -3.446095 to -1.941683 | -3.376743 to -1.790066 | 156 |
| Emerson | -3.475069 | -3.419967 | -2.824180 to -1.795537 | -2.891880 to -1.681010 | 2 |

Gibran's best full score is inside the weakest native range, while Emerson's is outside; both frozen suffix scores are below their native comparison minima. The actual decoded strings are incoherent. No p55 key or plaintext is identified. This language diagnostic is not an all-language impossibility result, and prefix ties prevent unique selection.

## Decision and reproduction

Retire shared-p56 arbitrary-residue-lookup / two-permutation transfer under the declared origin-zero page/chapter/continuous clocks. Any remaining version needs independent evidence for different origins, independently keyed sections, or a different cipher. Do not start another unconstrained permutation sweep: authentic p56 already fixes the shift and outer maps if shared. The p55 isolated model remains mathematically legal but has no positive plaintext evidence.

- [Exact calibration and original reachability SFT](../sims/lp2_p56_calibrated_three_permutation_sft.cjs)
- [Exhaustive p55 language diagnostic SFT](../sims/lp2_p56_calibrated_p55_score_sft.cjs)
- [Executed exact-gate JSON](lp2-p56-calibrated-three-permutation-output.json)

Both cores actually executed in connected JavaScript on the current canonical corpus; standalone Node wrappers were generated but not separately executed. The raw exact-gate JSON was committed after retrying a concurrent branch conflict; both SFTs reproduce their full JSON on stdout. No CI created. The independent published controls are source-derived, and no changes to the transcription or existing authoritative result claims were required.


## Exact all-origin extension with authentic p56 calibration — Agent47, 27 November 2026

**Decision:** the independently solved p56's calibrated inner/outer/residue maps cannot be shared by any one of the first eight complete illustrated LP2 chapters under the authentic transparent-F prime-minus-one sender, even granting each chapter an independent unknown prime start anywhere in ordinal indices 0..3301 inclusive. This strengthens the earlier origin-zero result and is distinct from the separate all-origin study with wholly uncalibrated alphabets. The latter is still open at chapter scope.

Use the previously established normalized p56 calibration (Y and K identity, S fixed on 21 observed labels, the remaining eight labels permutable). For each possible f=S(F) in {0,11,12,21,22,25,27,28}, a consumption of C at clock j is legal iff (C−(prime[j]−1)) mod29 != f. A hold at physical C=0 is independently legal and retains j. No other entry of S affects legality. The exact backward recurrence starts with every terminal clock j reachable. If B is the bitset of permitted next cursors, then before the next reverse glyph C its predecessor set is ((B >> 1) AND NOT M[(C−f) mod29]) OR B if C=0, and just the first term otherwise. M[r] is the fixed bitmask of prime residues equal to r. Compute a single bitset for each whole chapter/marker, extracting every starting index 0..3301. The prime list is longer than the largest allowed start plus the entire original tape. This considers all hold paths, no score, crib, guessed F count, or search truncation.

| Physical chapter | Rune count | Legal (f,origin) pairs |
|---|---:|---:|
| p0–2 | 729 | 0 |
| p3–7 | 1145 | 0 |
| p8–14 | 1729 | 0 |
| p15–22 | 1903 | 0 |
| p23–26 | 1021 | 0 |
| p27–32 | 1433 | 0 |
| p33–39 | 1680 | 0 |
| p40–53 | 3008 | 0 |
| p54–55 | 308 | 15 |

The first eight exclusions hold even for independent marker choices and starts per chapter, provided the normalized maps remain compatible with authentic p56. The continuous whole 12,956-rune stream likewise has zero legal pairs. The 2013 historical prime_echo list ending in prime 3301 corresponds to ordinal indices 0..463; it is contained in this broader computational range, not claimed to select an LP2 origin.

The only surviving 308-rune terminal chapter has exactly 27 complete event paths at its 15 (f,origin) pairs. Two pairs lie within the historical prime_echo range (f=0, indices 167/168). Enumerate all paths without pruning or selecting a language score. The two physical singleton groups occur at chapter offsets 0 and 122. GP A=24,I=10,O=3 are fixed by the authentic p56 calibration, not among the unseen labels. None of the 27 paths emits members of {A,I,O} at both groups, even granting all 7! remaining inner-label permutations per marker. Hence the terminal chapter also fails **conditionally on these singleton groups being ordinary English one-rune words**. For arbitrary segmentation, the 15 legal pairs survive as non-authenticated necessary-condition candidates; do not confuse legality with recovered plaintext. No new author-selected origin, shared map, key, or unknown plaintext is established.

Calibration: all 96 bitset-versus-direct-forward reachability checks agree, authentic p56 retains origin0 with f=0, and all 16 constructed p57-based plants retain their hidden true origin and marker (including boundary origins0 and3301). These controls check exact reachability, not blind origin recovery. Original inputs and all surviving origins/events are recorded. No prior uncalibrated-alphabet search, origin-zero test, or p55-only score optimization was repeated.

[All-origin exact SFT](../sims/agent47_p56_calibrated_allorigin_sft.cjs) · [raw reachability](agent47-p56-calibrated-allorigin-output.json) · [terminal exact path SFT](../sims/agent47_p56_calibrated_terminal_paths_sft.cjs) · [raw terminal paths](agent47-p56-calibrated-terminal-paths.json). Cores executed in connected V8 on corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; standalone wrappers not separately run. This is a bounded, language-free original exclusion for the first eight chapters, not an exclusion of different cipher laws, independently keyed alphabet maps, internal resets or origins outside the tested range.
