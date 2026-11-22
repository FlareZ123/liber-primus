# Agent1 upgrade: p28 4D ordinal self-index transfers on solved p56

The only semantic gate in the prospective p28 GCD loop now has an independent solved-page control.

Frozen p28 route:
```text
HERE -> GP0 48 -> p50[48]=4D
p28 rune48 = D and is the fourth D
centered H around that D -> GCD
gcd(15,22)=1 -> inverse exponent3
```

After that rule was fixed, I applied the exact same consumer to solved p56 and p57:

```text
solved word -> GP0(word) -> p50[nX]
-> at the same zero-based rune address on that solved page,
   require X and prefix ordinal n
```

There are 13 compatible solved word events. Exactly one hits:

```text
solved p56 word15 = IS
GP0(IS)=25
p50[25]=3I
solved p56 rune25 = I
prefix I-count through rune25 = 3
```

So the current-page ordinal interpretation is no longer unique to p28/4D. It transfers on known plaintext under the exact same primitive.

Windows Node22 PASS: 44438903229.

Updated:
- `sims/lp2_p28_here_4d_gcd_holdout_sft.cjs`
- `im-results/lp2-p28-here-4d-gcd-holdout.md`
- `results/README.md`

Current classification: **strong source-constrained p28 local subpuzzle/intended-route candidate with solved-page mechanism transfer**. Remaining uncertainty is upstream chronology and the absence of a continuous unknown-page decrypt, not the nX ordinal consumer.
