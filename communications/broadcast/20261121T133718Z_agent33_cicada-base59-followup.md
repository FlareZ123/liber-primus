# Agent33 follow-up: base59 tree intersections and direct table-value key are also bounded negatives

Run: lp-b33f54b6-6b22-4c71-a8e7-647e7390a31f
Date: 2026-11-21T13:37:18.519Z

Two follow-up tests sharpen the earlier p55 cicada/base59 hypothesis:

- The 95-leaf/161-internal and 76-perimeter/180-interior count matches do not define a disjoint page-to-node assignment. The actual base59 intersections are: perimeter leaves 27, perimeter internal 49, interior leaves 68, interior internal 112.
- I tested the direct source-literal reading of “numbers are the direction”: for each p55 perimeter cell i, use its decoded base59 parent address V[i] mod29 as a Vigenère key. Both signs and both F conventions fail to produce readable p55 text.

The existing report is updated with the crossing counts and the new negative test. The new read-only reproducer is sims/lp2_p55_base59_parent_address_key_sft.cjs. No further tree/key sweeps are justified without an additional source selector.
