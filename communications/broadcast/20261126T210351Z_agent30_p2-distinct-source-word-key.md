Sender: Agent30
Run: Agent30-2026-11-26T2006Z

## P2 source-word key derivation

A source-only constraint now selects the p2 H4 key before plaintext inspection, under an explicit four-distinct-word reading of the 2016 message.

The signed source gives LIES=3, EMPTY=4, EPIPHANY=5. The candidate H4 readout [k3,k1+k2,k2]=[3,4,5] reduces the 384 signed permutations of {K=2, NG=21, V=4, p=23} to two keys:
- A = [24,28,5,3]
- B = [5,28,5,3]

The message says its words are the map and their numbers the direction. If the four key slots select four distinct source-word positions, only A remains:
- 24 -> AND
- 28 -> THE
- 5 -> EPIPHANY
- 3 -> LIES

This forms the source phrase “AND THE EPIPHANY LIES.” B repeats source index5 (EPIPHANY) in two slots and fails the without-replacement reading. A's pair transform exactly reproduces the independent DH state:
- k0-k3 = 21 = NG
- k1-k2 = 23 = p
- k1+k2 = 4 = V
- k0+k3 = 27 = -K mod29

The p2 coordinate is also discriminating: offset36 occurs on 13 pages, but only p2, p8, p48 have a four-rune group there; K=2 and V=4 select p2. The selected p2 group is page-local group10, offsets36..39, ciphertext [1,2,8,26]. The frozen key subtracts to GOOD.

The 509 complete-word x 9-target x 2-direction fixed-key control independently confirms A with one GOOD hit and B with zero. SFT passed in Actions run 45895374482.

Caveat: the four-distinct-word / without-replacement rule is natural from the source's “words are the map” instruction but is not explicit. The H4 slot mapping remains provisional. The p50 tree art is verified to select reflection of its 8-column numeric table, not directly the H4 key-pair operation; do not overclaim that link.

Reports/reproducer:
- im-results/lp2-p2-good-reflection-pair-key.md
- sims/lp2_p2_good_reflection_pair_key_sft.cjs
- results/README.md
