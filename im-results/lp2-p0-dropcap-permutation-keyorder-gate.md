# p0 red-dropcap permutation does not select the marker-derived K13 order

**Disposition: negative for the tested source-motivated permutation family.** No new plaintext or authenticated key order was recovered.

## Question and human solve-path hypothesis

The p0 marker-derived key has 13 atoms, but the source-only audit found that its 13-dot marker does not uniquely select column-major over physical-raster order. Separately, the original book has 13 red dropcap components. A solver could reasonably ask whether this second 13-element source object supplies a permutation for the 13 marker atoms.

This is distinct from using the dropcaps directly as a transposition key. The test asks whether the dropcap GP values rank the 13 p0 marker atoms, thereby supplying a missing order for the existing state-derived key.

## Frozen source inputs

The p0 DH state is independently reconstructed elsewhere as:

(p,g,a,b,A,B,K,e,q) = (23,5,6,15,8,19,2,3,4).

The state/marker generator supplies the column-major marker-state vector and base key:

- Column-major marker state: [25,28,11,25,4,8,19,8,4,7,13,20,28]
- Base K13 = H(marker state): [26,24,8,19,27,24,18,3,0,8,0,16,19]

The alternative physical-raster state is derived by interleaving the same left/center/right column values in the visible C,L,R,C,L,R,C,L,R,C,L,R,C scan order:

- Physical-raster marker state: [4,25,7,8,28,13,19,11,20,8,25,28,4]

The independent original-image red-channel census identifies these 13 dropcap global offsets:

[0,729,848,1541,1874,3612,5506,6527,7960,8051,9519,9640,12648]

Reading the local canonical corpus at those offsets gives 13 GP values:

[15,20,13,24,14,20,1,19,23,21,27,0,24]

Transliteration: SLPAXLUMDNGIAFA (13 GP symbols; digraph transliterations account for the 15 Latin letters).

The p0 title positive control remains fixed: subtracting the unpermuted base K13 from the original 13-rune title yields the already selected EPIPHANY SEEKS vector. The target for this test is the 249-rune p0 body after the title/13-dot boundary.

## Frozen permutation family

Convert the 13 dropcap GP values into stable rank orders, preserving source order for ties. Test four natural permutations:

1. ascending rank;
2. inverse of ascending rank;
3. descending rank;
4. inverse of descending rank.

Apply each permutation in the two natural ways that correspond to the marker's key atoms:

- **Before H:** permute the 13 marker-state values, then apply the fixed interleaved outside-in H transform. Test both column-major and physical-raster marker-state order.
- **After H:** permute the resulting K13 atoms.

For every resulting 13-symbol key, decrypt the p0 body with the already tested phase-zero, continuous period-13 subtraction. No key rotations, alternative signs, resets, fitted substitutions, or arbitrary permutations are admitted. Every candidate is re-encrypted to verify exact round-trip.

This yields 12 fixed candidate keys.

## Results

The original p0 body scores -3.45917 under the LP1-only add-one-smoothed bigram model. The clear p57 control scores -2.53337.

| Construction | Best score | Worst score |
|---|---:|---:|
| Permute K13 after H | -3.44848 | -3.53501 |
| Permute column-major marker state before H | -3.46212 | -3.57621 |
| Permute physical-raster marker state before H | -3.43117 | -3.56409 |

The best of all 12 candidates is the physical-raster / inverse-ascending permutation at -3.43117. That small change is not meaningful plaintext recovery: the output remains far below the clear control and is visibly nonlinguistic. The worst is column-major / descending at -3.57621. All 12 exact round-trips pass.

The full keys, permutations, and output prefixes are emitted by the reproducer. The original title positive control is unchanged; the experiment does not authenticate the title candidate or the base K13.

## Decision and limits

Reject the 13 red-dropcap rank permutation as the missing direct order for the p0 marker-derived key under the tested natural constructions. This does not rule out every possible relation between red marks and the p0 marker; it does rule out the simple one-to-one stable-rank mapping tested here.

The p0 key-order provenance remains unresolved. Do not search arbitrary permutations or use the desired plaintext to choose another order. A successor needs an independent source instruction that fixes the mapping before decryption.

## Reproduction

From the repository root, run: node sims/lp2_p0_dropcap_permutation_keyorder_gate.cjs

Inputs: resources/liber-primus/lp2-corpus.json and resources/liber-primus/lp1-plaintext-reference.txt. The 13 dropcap offsets are fixed from the original-image Round44 P1 extraction. No network access or third-party package is required.
