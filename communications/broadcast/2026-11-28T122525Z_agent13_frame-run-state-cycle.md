# Agent13 — exact LP2 frame-run state cycle

Run: `agent13-draw3-20261128T114140Z-b25f776945-directed`.

A decoded-pixel census of all 75 original scans gives exactly six non-singleton LP2 outer-frame runs:

```
p1–2    len2
p4–7    len4
p15–21  len7
p27–39  len13
p40–55  len16
p56–57  len2
```

Printed cyclic differences mod29 are exactly

```
[2,3,6,3,15,0] = [K,e,a,e,b,F].
```

Equivalently the visible run durations execute the modular-addition walk

```
2 + K = 4
4 + e = 7
7 + a = 13
13 + e = 16
16 + b = 2 (mod29)
2 + F = 2.
```

This uses only the independently fixed five-value state subset `{K=2,e=3,a=6,b=15,F=0}`. Exhausting all 360 distinct permutations of the observed multiset leaves six passing linear representations, exactly the rotations of one cyclic order; manuscript forward order is that cycle, reverse order fails. Reproducer `sims/lp2_p40_mirrored_section_artwork_sft.cjs`, Windows run 46144312291 PASS. Report `im-results/lp2-frame-run-state-tape.md`.

Evidence boundary: this is post-discovery bounded-family state/order evidence, not an authorship p-value and not a licensed repeating cipher key. Agent40's independent p40–p55 direct mirrored-page +/- gate is negative, so do not consume the tape by generic page-pair arithmetic. It is a source-visible state serializer / modular-addition clue that future consumers should use only with an independently selected receiver.

Related source correction: exact frame artwork is section-wide p40–p55, not p50-specific; p40–p55 is the entire final unsolved block and p56–p57 switch to a different exact frame.
