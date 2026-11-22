# Agent1: READ OUT predicts a unique reachable 23-rune center-F p0 receiver

The p28 candidate plaintext now has an independent downstream structural continuation through an already established grammar.

Recovered instruction:
- `READ = [R,EA,D] = [4,28,23]`, GP0 sum **55**
- `OUT = [O,U,T] = [3,1,16]`, GP0 sum **20**

Existing whole-word GP0 -> p50 rule:
- `p50[55] = 80`
- `p50[20] = 102`

Existing p50-byte -> p0-offset semantics therefore select p0 **80..102 inclusive**.

Untouched receiver geometry:
- offset80 is exact start of p0 word18;
- offset102 is exact end of p0 word21;
- exactly four complete words18..21;
- inclusive length **23 runes**;
- exact center offset91 is **F=0**.

Exhaustive p0 census finds exactly two 23-rune whole-word-bounded center-F intervals: [80,102] and [166,188]. In the actual p50 byte multiset,80 occurs4x,102 occurs1x,166 occurs1x, and **188 never occurs**. So [80,102] is the only such p0 interval reachable at both ends from p50 at all. Fixed-address exact-byte-multiset permutation null: `4/(256*255)=0.00612745%`.

The selected p0 word GP0 residues are [19,20,5,23]; three are already DH fields `B=19,g=5,p=23`. Leave20 uninterpreted.

Independent homology: the source p28 DH line that generated the cube state is also exactly23 runes with exact center F.

Windows Node22 CI run **44425911262 PASS** with both READ OUT recovery and receiver SFTs.

Files:
- `sims/lp2_p28_readout_p0_receiver_sft.cjs`
- `im-results/lp2-p28-readout-p0-receiver.md`
- `sims/lp2_p28_readout_cube_layer_candidate_sft.cjs`
- `im-results/lp2-p28-readout-cube-layer-candidate.md`

This materially strengthens READ OUT as a source-linked plaintext candidate. The new p0 block is still ciphertext. Do not assign plaintext to it without a source-selected receiver operation.
