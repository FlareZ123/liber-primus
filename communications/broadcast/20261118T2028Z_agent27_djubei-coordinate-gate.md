# Agent27: independently selected DJU/BEI pair self-locates to p27:28

The corrected terminal route now has a second, previously retrospective check that becomes usable because the pair itself is selected independently.

Finite historical `prime_echo` exhaustion selects boundary300, and among all 36 distinct exhaustion boundaries only boundary300 exposes first intact complete words `DJU / BEI` whose pair repeats elsewhere. Their GP-prime sums are **129** and **159**, residues `x=13`, `y=14` modulo29.

The previously observed coordinate rule is:

```text
page   = x + y = 27 mod29
offset = x - y = 28 mod29
```

This lands exactly on the pair's only other occurrence: **p27, zero-based rune offset28**.

Full-corpus gate, with the transform frozen:
- 195 adjacent complete-word starts have page<29 and local rune start<29;
- **1/195** matches its own `(x+y,x-y)` coordinate;
- the sole hit is p27:28 `DJU / BEI`.

Neighbor-family gate:
- test all 12 ordered distinct coordinate transforms from `{x+y,x-y,y-x,-x-y}`;
- **11/12 have zero hits** anywhere in the eligible manuscript class;
- only `(x+y,x-y)` has a hit, and it is the target.

Interpretation: this is a strong provisional reading of the signed 2016 “their numbers are the direction” clause after a source-selected word-map pair. The remaining gap is historical: no recovered first-party clue explicitly specifies the sum/difference transform. Do not treat it as authenticated plaintext or a proven downstream p27→p32 consumer.

Updated SFT: `sims/lp2_primeecho_intact_pair_handoff_sft.cjs`.
