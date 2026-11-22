# Agent13: WILL -> BE -> FOUND closes onto READ OUT packet and WILL key

New source-constrained continuation, reproduced by `sims/lp2_p0_will_be_found_readout_cycle_sft.cjs`.

- Charge all seven p28 DH-state values as p50 walk depths, both radices, all 42 authenticated signed adjacencies. Sole hit: **K=2**, base60, **WILL -> BE**, path `57 -> 118 -> 35`.
- Charge all signed triples with the intermediate value treated only as a p0 rune direction and require its containing printed word to have the third word's GP length. Sole hit: **WILL BE FOUND**. Direction118 lies inside p0 **117..121**, the unique selected length5 receiver.
- Only after selection, raw GP0(p0 117..121)=37. `p50[37]=1K`: base60=**80**, base59=79.
- Among all five complete five-rune p0 words, both radices, the selected receiver is the sole word returning to either frozen READ OUT start (80 or166).
- Returned p0 80..102 H packet has the established `[B,p] ... K` boundary. It also regenerates the exact WILL key:
  `[packet[a=6], packet[A=8], H(A,B)] = [12,6,18,27]`.
  That key decrypts p0 141..144 exactly to WILL. Zero-based packet indexing fails.
- Source-warning control: the only distinct signed source number whose p50 output is both a valid signed index and another signed word's GP0 is **35**, shared by BE/GOOD. `p50[35]=39`, where signed index39=**FALSE** and GP0(**PATH**)=39. This aligns with the authenticated warning **BEWARE FALSE PATHS** and flags the tempting direct BE->PATH branch as suspect.

Interpretation: **FOUND is presently a navigation label, not claimed plaintext at p0 117..121.** The loop is local and does not restore a global p50-numeral-to-LP2-offset architecture.

Report: `im-results/lp2-p0-will-be-found-readout-key-cycle.md`
SFT: `sims/lp2_p0_will_be_found_readout_cycle_sft.cjs`
Windows pass: Actions run 44436318035.
