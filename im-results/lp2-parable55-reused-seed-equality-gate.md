# PARABLE inner55 as reused page seeds: a key-independent cross-page plaintext test

**Agent49, 16 November 2026. Original-source necessary-condition exclusion under a source-native English register.** No new original unknown LP2 plaintext, authentic key, source-appointed seed consumer or destination has been recovered.

## Original readable candidate and stronger direct falsification

The literal solved p57 PARABLE has 20 printed words. Remove the first and last GP rune from each word, as suggested by the printed “shed our own circumferences” line: the heading yields five inner GP runes, and 19 body words yield 50, giving exactly **55** ordered source symbols. The original unsolved manuscript has **50 rune-bearing physical pages p0–49**, followed by a rune-empty p50 32×8 table, then **five more rune-bearing pages p51–55**. This gives a candidate per-page seed tape with a 50/5 partition, although moving the heading to the tape’s end would require an additional unverified instruction. [Full original-source structural analysis](lp2-parable55-interior-pagekey-source-gate.md).

A broader **key-independent** test is possible for any deterministic page-local encryption in which the same seed resets the same bijective GP29 emission alphabet at each local rune position. Its transformations may depend arbitrarily on seed and position, may change with every rune, and need no known key. If two pages share source seed s, at the same local index j their identical invertible maps preserve equality:

```text
C(page_a,j) = C(page_b,j)    iff    P(page_a,j) = P(page_b,j)
```

This holds for every source-selected same-seed additive stream, any arbitrary same-seed positionwise 29-symbol bijection, and a deterministic pseudorandom substitution stream derived solely from that page key. It also survives every unknown seed-dependent rotation, offset and nonstationary keystream **provided the page-start position alignment is fixed and identical for equal seeds**. This does not cover extra page-unique IVs, ciphertext-feedback states varying with each plaintext, nonbijective or length-changing encoders, non-GP registers, or different source rune traversals.

Exactly **106 pairs of physical unsolved pages** reuse one of the 55 candidate p57 source symbols under either of the two fixed source orders. Compare every pair's ciphertext rune at all aligned positions up to the shorter page's original length. All 12,956 original unknown runes remain unchanged; the page lengths, positions, and seeds are frozen before any language comparison.

| Seed-order hypothesis | Source ciphertext equal aligned positions | Independent Gibran GP English | Independent Emerson GP English |
| --- | ---: | ---: | ---: |
| Literal title5 + body50 | **785 / 22,716 = 3.4557%** | 1,351 / 22,716 = 5.9473% | 1,437 / 22,716 = 6.3259% |
| Proposed table split body50 + title5 | **826 / 23,150 = 3.5680%** | 1,420 / 23,150 = 6.1339% | 1,405 / 23,150 = 6.0691% |

The random-uniform GP29 equality benchmark is **1/29 = 3.4483%**. These original source equalities lie near that benchmark in both frozen alignments, and far below the corresponding native-language control registers. Native controls were independently source-normalized from the pinned Gibran and Emerson full texts, using exactly 12,956 GP rune positions divided into the 55 original physical page lengths. Positive plants apply an arbitrary changing seed- and position-dependent GP29 additive mask to these control registers; **every original English pairwise equality survives exactly**, proving that this test would still recognize the intended native register under an unknown same-seed stream.

These are direct sample comparisons, not independent Bernoulli trials: page pairs overlap, and neither the family-wise null nor the creator's intended plaintext language is proven. The *exact pairwise-equality invariance*, however, is algebraic for the specified bijective family regardless of all keys.

## Decision

The p57 inner55 source tape remains an interesting finite public operand. Using it as the **sole initializer of any identical page-reset, positionwise bijective GP29 keystream** is incompatible with a standard GP-English plaintext register under the source-pinned native controls; the real ciphertext retains virtually no English-like aligned equality. The already tested authentic prime-totient page-seed transfer also fails 54–55 of the 55 unknown pages, and fixed page-wide monoalphabetic output alphabets have an independent global GP-E frequency ceiling.

A future attempt must recover an *authored receiver*: an operation explaining how the 55 public symbols control distinct page states or position-dependent masks while accounting for the original anti-doublet / fifth-back properties. No key tuning against the same pages or new alphabet guess is warranted from this count alignment alone.

**Executed validation:** All three original source-gate programs, including this exact equality-invariance SFT and its positive controls, passed on [Windows Node.js 22 CI run 43870561022](https://github.com/FlareZ123/liber-primus/actions/runs/43870561022).

**Reproduction:** [exact single-file CJS SFT](../sims/lp2_parable55_seed_reuse_equality_sft.cjs), [original page-rune corpus](../resources/liber-primus/lp2-corpus.json), [original physical-word transcription](../resources/lp2-transcription.txt), [pinned Gibran and Emerson source-native controls](../resources/control/). Source register caveats and previous prime/F exclusions are in [the PARABLE inner55 report](lp2-parable55-interior-pagekey-source-gate.md).
