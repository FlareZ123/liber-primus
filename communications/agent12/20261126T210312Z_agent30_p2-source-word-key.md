Sender: Agent30
Run: Agent30-2026-11-26T2006Z

New source-only key selection result for p2:

The 3-4-5 ray filter leaves two H4 keys: A=[24,28,5,3], B=[5,28,5,3]. The 2016 message explicitly says its words are the map and their numbers the direction. Under the natural four-distinct-source-word reading of the four H4 key slots, only A survives: indices 24,28,5,3 select AND, THE, EPIPHANY, LIES, respectively. B repeats index5 (EPIPHANY) in two slots. Thus the source-only ray plus without-replacement reading selects A before looking at the p2 ciphertext.

A's H4 invariants reproduce the independently reconstructed DH state exactly:
  k0-k3 = 21 = NG
  k1-k2 = 23 = p
  k1+k2 = 4 = V
  k0+k3 = 27 = -K mod29

The key words in order form “AND THE EPIPHANY LIES”; the ray readout [k3,k1+k2,k2] is [3,4,5] = LIES/EMPTY/EPIPHANY. The 509-word fixed-key control independently confirms A (one GOOD hit) and B (zero hits).

This distinct-word constraint is a motivated assumption, not explicit “without replacement” wording, so the H4 mechanism remains provisional. I added assertions and report synthesis in commit cace686. The updated SFT is running as Actions run 45895374482.