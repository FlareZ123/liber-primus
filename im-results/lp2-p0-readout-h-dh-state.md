# READ OUT p0 receiver contains a complete DH state readout under the frozen H shell map

**Agent5, 19 November 2026. Classification: source-constrained structural continuation of the p28 READ OUT candidate. The exact selected p0 receiver now carries the complete independently reconstructed DH23 state under an already selected reversible operation. This does not yet decrypt the surrounding p0 prose.**

## Frozen inputs

This test adds no new receiver search.

The p28 cube-layer result already recovers **READ OUT**. Under the established whole-word GP0 -> zero-based p50 grammar, the split words select base60 endpoints 80 and102, fixing physical p0 offsets **80..102** before the test below. That span is exactly four complete printed words, p0 words18..21, with rune lengths:

`[3,7,5,8]`.

It is 23 runes long and centered on F. The independently reconstructed manuscript-native DH23 state is:

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.

The reversible shell operation was also fixed upstream:

`H(x,y) = (x-y, x+y) mod29`.

For each printed word, apply H to the outer pair, then the next inner pair, continuing inward; preserve an unpaired center rune literally. This is the exact word-shell operation previously tested as a direct plaintext consumer.

## Exact receiver transform

The four source words are:

- word18: `[21,25,2]`
- word19: `[10,25,8,14,2,13,6]`
- word20: `[26,0,21,5,11]`
- word21: `[2,24,19,10,21,10,27,26]`

Their frozen H-shell serialization is:

`[19,23,25, 4,16,12,9,6,10,14, 15,8,24,5,21, 5,28,26,22,9,0,18,2]`.

Three properties are immediate:

1. the transformed 23-rune object begins exactly **[B,p] = [19,23]**;
2. it ends exactly **K = 2**;
3. filtering only for the seven already-known DH state values gives

`[B,p,a,b,A,g,g,K] = [19,23,6,15,8,5,5,2]`.

Thus every independently reconstructed DH value `{p,g,a,b,A,B,K}` is present. Only `g` repeats.

The complete transformed string is not readable GP prose, so this is a **state readout**, not a claim that H directly decrypts the block.

## Whole-manuscript control

The control family is every contiguous four-complete-word window on the 55 rune-bearing unknown pages p0..p55, excluding the rune-free p50 table. There are exactly **2,763** such windows.

Using the same frozen word-shell transform:

- only **3/2,763** windows begin with `[B,p]`;
- **98/2,763** end with `K`;
- exactly **1/2,763** satisfies both boundary conditions;
- that unique window is **p0 words18..21, offsets80..102**, the independently selected READ OUT receiver.

Full unordered DH-state coverage by itself is weaker: 17/2,763 four-word windows contain all seven values somewhere after H. Among the 117 four-word windows spanning exactly23 runes, four have full unordered coverage. Therefore the evidential feature is not mere membership in a seven-value set. It is the independently selected receiver plus the fixed H transform's typed **[B,p] ... K** boundary and complete state readout.

The exact ordered subsequence `[B,p,a,b,A,g,K]` occurs once across the same 2,763-window family, again in the selected p0 receiver, at transformed positions `[0,1,7,10,11,13,22]`. This is reported as a descriptive strengthening, not as a separately pre-registered probability.

## Cryptanalytic consequence

The p0 80..102 block should no longer be treated as an arbitrary ciphertext interval awaiting a generic language transform. Under two operations independently selected before this observation, READ OUT selects the receiver and H turns that receiver into a compact carrier of the complete DH23 state.

This changes the next decision. The strongest immediate target is the following p0 material beginning at offset103, where the independent candidate **THE ROAD** starts and its first two additive key residues are already `[a,p]=[6,23]`. A successful continuation should derive the remaining ROAD key residues from this readout or from a source-selected state transition. Broad key searches are not justified.

No additional p0 plaintext, creator key, or complete inverse is claimed here.

## Reproduction

Run:

`node sims/lp2_p0_readout_h_dh_state_sft.cjs`

The standalone CommonJS SFT reparses the canonical physical transcription, reconstructs p0 words18..21, applies the frozen H shell map, verifies the exact DH state readout, and exhausts all 2,763 four-word windows for the boundary and coverage controls.
