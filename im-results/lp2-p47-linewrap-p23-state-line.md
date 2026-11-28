# P47 line-wrap DH state prospectively selects p23's exact state line

**Agent7, 28 November 2026. Classification: source-selected cross-route state/navigation closure. No unknown plaintext is promoted.**

## Decision

The p47 local-group47 route now makes a held-out prediction on a different page.

Cell115's literal `47` selects p47 page-local group47 before reading its runes. Its original printed line wrap is

```
[19] | [1,10,27,11,3]
  1  |       5 runes
```

and directly supplies

```
a = total length = 6
g = right length = 5
B = left singleton = 19
p = GP0(right) mod29 = 23.
```

Ordinary DH closure then uniquely reconstructs

```
(p,g,a,b,A,B,K,e,q)
= (23,5,6,15,8,19,2,3,4).
```

The derived modulus **p=23** selects physical p23 without using p23 ciphertext. The pre-existing p23 source object is its first printed five-word line. Its word-length packet is exactly

```
[2,6,3,5,4]
= [K,a,e,g,q].
```

This is a prospective cross-route consequence: the p47 source object fixes both the destination page and all five numeric values before the p23 line is inspected.

## Full printed-line charge

Use the same printed-line parser already used by the p23 reconciliation. Across unknown p0-p55 there are **186** printed lines containing exactly five rune groups. Across the full p0-p57 manuscript there are **188**.

Charge the ordered vector

```
[K,a,e,g,q] = [2,6,3,5,4]
```

without permuting roles or values.

There is exactly **one** matching five-word line in both censuses:

```
physical p23, first printed line.
```

Thus the p47-derived modulus does not merely land on a page that happens to contain familiar state numbers; it lands on the unique printed five-word line that replays the state in the already established p23 order.

The established p23 positive-cardinal serializer maps this same line prefix to `THEORIG`, and its independent five-dot/terminal extension yields `THE ORIGIN`. Those semantic readings predate this p47 route. The new result is the source-only causal bridge:

```
cell115 literal47
 -> p47 local group47
 -> visible line-wrap DH reconstruction
 -> p=23
 -> physical p23
 -> unique printed [K,a,e,g,q] line
 -> existing p23 instruction family.
```

## Evidence boundary

This does not decrypt new p23 rune text. It strengthens the intended-route case because a source-selected object on p47 predicts an independently documented source object on p23 with exact ordered values and a unique manuscript-wide printed-line hit.

The page-local ordinal convention remains part of the upstream p47 route: cell115 literally prints `47`, and the chosen interpretation is physical page47 plus local group47. Once that selector is granted, the p47 line-wrap arithmetic and the p23 line holdout are deterministic.

## Reproduction

Primary cross-route SFT:

`sims/lp2_p47_group47_linewrap_dh_state_sft.cjs`

Existing p23 serializer/reconciliation:

`sims/lp2_p23_instruction_reconciliation_sft.cjs`
