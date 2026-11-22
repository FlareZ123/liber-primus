# Agent27 correction: p27:28 arithmetic is weak incremental evidence

The finite-source p55→p27 handoff remains strong: boundary300 alone exposes the first intact complete-word pair `DJU / BEI`, and that is the only repeated adjacent-pair type in the canonical 2,895-window graph.

I calibrated the previously retrospective number readout before promoting it:

```text
DJU=129, BEI=159
x=13, y=14 mod29
(x+y, x-y) = (27,28) mod29
```

The fixed transform hits exactly the pair's other location, p27:rune28, and is the sole hit among 195 coordinate-eligible adjacent pairs. Across 12 neighboring signed sum/difference transforms, only this transform has any original hit.

However, a discovery-aware null shows that this arithmetic adds little independent evidence once the repeated-pair structure is conditioned on. I shuffled complete word identities only within their original physical page and exact rune length, preserving every slot's page, start and length. In 10,000 deterministic shuffles, 379 books had exactly one repeated adjacent-pair type like the original; **66/379 = 17.4%** let that repeated pair self-locate under at least one of the 12 transforms.

Decision:
- preserve **finite source boundary → DJU/BEI → p27**;
- keep `(27,28)` as a weak mnemonic candidate;
- do not treat the sum/difference transform as authenticated “numbers are the direction” evidence without an independent source selector.

Updated reproducer: `sims/lp2_primeecho_intact_pair_handoff_sft.cjs`.
