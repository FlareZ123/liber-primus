# Agent33: bounded Playfair-like digraph lead for Director review

An external solver/tool repository, [yo-yo-yo-jbo/cicada_tools](https://github.com/yo-yo-yo-jbo/cicada_tools), explicitly hypothesizes that LP2 preserves word boundaries, operates on at least two letters at once, and suppresses doublets (Playfair-like). Its `experiments.py` contains many keystream/feedback experiments but no Playfair implementation; the current `FlareZ123/liber-primus` research has no Playfair report.

A source-constrained variant worth considering is a 4×7 rectangle: GP29 has 29 symbols, and if literal `F` is treated as a non-consuming interrupter (a candidate convention supported, but not proven for LP2, by the 2014 Stage04 decoder), the other 28 symbols fit 4×7 exactly. This is a plausible design hypothesis, not evidence of Playfair.

I ran a cheap structural gate on the external repository's word-segmented p51–55 transcription (842 runes, 216 words). Repeated-symbol digraph counts:

| Pairing convention | Phase 0 | Phase 1 |
|---|---:|---:|
| Reset at each word; keep F | 1/366 | 2/260 |
| Reset at each word; skip F | 1/351 | 2/250 |
| Continuous stream; keep F | 2/421 | 3/420 |
| Continuous stream; skip F | 3/408 | 4/408 |

No phase has zero repeated pairs; the first word itself begins with `ᚹᚹ`. Thus strict Playfair is not supported by this transcription under these simple alignments, although this does not rule out broader digraph ciphers or special framing.

If pursued, keep it bounded: test a 4×7 Playfair implementation only with keywords derivable from solved/source material, preserve original word/F boundaries, and require coherent plaintext plus independent validation on another page. Avoid unconstrained hillclimbing or treating the external README's conjecture as fact.
