# p0 EPIPHANY SEEKS residual shell

## Scope

This report freezes the conditional p0 red-title candidate **EPIPHANY SEEKS** selected by the upstream p57 -> p28 -> SHED -> EMERGE route and tests it directly against the original first two p0 ciphertext words.

The result is a compact set of source-linked checks on the exact 13 ciphertext runes. A reusable rune-level cipher remains unresolved.

## Fixed source objects

The physical p0 title is two words of GP rune lengths:

```
8 + 5 = 13
```

The authenticated 2016 signed message has adjacent zero-based words5 and6:

```
5 EPIPHANY
6 SEEKS
```

Their source-native GP lengths are exactly8 and5.

The upstream EMERGE route conditionally selects value192. The authenticated adjacent phrase has:

```
GP0(EPIPHANY SEEKS)=192
```

and the 8+5 opening is unique among physical unknown-page openings.

## Exact original-ciphertext residual

Original p0 title GP values:

```
C1 = [15,8,18,3,6,19,27,0]
C2 = [15,26,18,21,5]
```

Authenticated-source candidate:

```
P1 = EPIPHANY = [18,13,10,13,8,24,9,26]
P2 = SEEKS     = [15,18,18,5,15]
```

Use the ordinary additive-cipher residual:

```
K = (C-P) mod29
  = [26,24,8,19,27,24,18,3,0,8,0,16,19]
```

The word sums are:

```
GP0(P1,P2) = [121,71]
GP0(K1,K2) = [149,43]
```

## Whole-title 192 / 729 closure

The candidate and its required residual have the same ordinary GP0 total:

```
GP0(P)=192
GP0(K)=192
```

The residual also has:

```
GP-prime(K)=729
```

The original p0-p2 rune counts are:

```
262 + 266 + 201 = 729 = 27^2
```

This is the independently rubrication-selected p0-title-to-next-red13 square span. The residual itself has13 runes, matching the physical title and red13 delimiter count.

Across every ordered authenticated 2016 source-word pair with total GP length13, there are52 candidates per additive sign, or104 sign-pair cases. The forward prime729 condition leaves:

```
EPIPHANY HELLO  residual GP0=194
EPIPHANY SEEKS  residual GP0=192
```

The conjunction `residual GP0=192` and `GP-prime=729` leaves **EPIPHANY SEEKS** alone. The independent equality `GP0(residual)=GP0(candidate)` also leaves the same sole case. The reverse additive sign has no self-sum hit and no prime729 hit.

## Physical word split returns p28

At the original 8+5 boundary:

```
149 - 121 = 28
 71 -  43 = 28
```

The unknown residual therefore transfers exactly28 between the two word sums while preserving total192.

That value is independently upstream: clear p57 `FIND` selects physical p28, whose word28 drives the nested OUR / OWN / CIRCUMFERENCES / WITHIN / EMERGE state route. The p0 title checksum consequently closes back on the same receiver page that fed the route.

## H shells land on MAP / THEIR ... IS

Use the established GP29 pair operator

```
H(x,y) = (x-y mod29, x+y mod29)
```

on the two physical word sums.

Candidate plaintext:

```
H(121,71) = [21,18]
```

Required residual:

```
H(149,43) = [19,18]
```

The authenticated signed source has exact zero-based positions:

```
18 MAP
19 THEIR
20 MEANING
21 IS
```

Both shells share **MAP=18**. Their first components are **THEIR=19** and **IS=21**, exactly bracketing **MEANING=20**. Their separation is2, the independently recovered DH shared state `K=2`.

This statement was recognized after the residual candidate, so it is a structural holdout rather than an authorship probability. It is still operationally constrained: the physical 8+5 split and H operator are frozen, and the source positions are literal authenticated words.

Charging every signed-source candidate that exactly fits the 8+5 split under both additive signs gives16 cases. Exactly one has the typed shells `[19,18]` and `[21,18]`:

```
C-P : EPIPHANY SEEKS
```

## Reconciliation with the older geometric title route

The older source-geometry construction produces the conditional raw 13-sign sequence:

```
SECUENDI | R-A-T-I-O
```

Treat that fixed geometric output as `G` and the authenticated-source candidate `EPIPHANY | SEEKS` as `P`. The forward additive bridge `(G-P) mod29` has physical-word GP0 sums:

```
[123,73]
```

while the candidate word sums are:

```
[121,71]
```

Therefore both words satisfy exactly:

```
GP0(bridge_word) - GP0(candidate_word) = 2 = K
```

where `K=2` is the independently reconstructed DH shared value.

The same bridge has:

```
GP-prime(bridge)=707
729-707=22=phi(23)=phi(p)
```

with independently reconstructed `p=23`.

Charge every authenticated signed-source phrase that exactly fits the physical 8+5 shape, under both additive signs. There are16 sign/candidate cases. **EPIPHANY SEEKS under `G-P` is the sole case** satisfying the shared2 condition on both words, and independently the sole case whose bridge prime sum leaves the square deficit22.

This is a substantive reconciliation: the newer authenticated-source candidate is selected by state invariants relative to the older source-geometry output rather than merely competing with it. It still does not define the rune-level inverse from original ciphertext to final plaintext.

For completeness, applying the same forward additive comparison directly between the original p0 ciphertext and the older `SECUENDI RATIO` sequence gives:

```
GP0(residual)=112
GP-prime(residual)=384
```

so that older raw sequence lacks the 192/729 original-ciphertext closures above. Its documented GP orthography problem also remains.

## Independent OPENPGP43 cube route to the same candidate

A later numbered endpoint supplies a source-only selection of the same title candidate without using the residual or value192. Authenticated `OPENPGP43` selects project p42 word43 `[11,13,11]`; fixed outside-H gives `[0,22,13]=HELLO / THE / WAY`. The independently established source operator `C(x)=x^3 mod29` has `C(13)=22`, so the endpoint exposes the directed edge `WAY13 -> THE22`. One further fixed cube gives `C(22)=5=EPIPHANY`. The original p0 title is 8+5, and source word5 `EPIPHANY` followed by word6 `SEEKS` is the unique adjacent authenticated source pair with that GP-length shape.

This route consumes no p0 ciphertext values and is independent of the 192/729 residual checks below. It therefore upgrades the candidate's source selection while leaving the exact 13-rune residual-generation rule unresolved.

See `im-results/lp2-openpgp43-cube-epiphany-title.md`.

## Evidence boundary

The evidence now selects and checks a concrete p0 title candidate through:

- the authenticated 2016 source phrase and exact 8+5 physical word shape;
- the independent OPENPGP43 cube continuation selecting source indices5-6 `EPIPHANY SEEKS` from the untouched 8+5 title shape;
- the upstream EMERGE value192;
- original-ciphertext residual GP0=192;
- residual GP-prime=729 matching the source-visible 27-square span;
- exact p28 word-split balance;
- the fixed H shells landing on MAP18 / THEIR19 / IS21 around MEANING20.

A full decipherment still needs a source-selected rule that generates the 13 residual runes or predicts another untouched ciphertext interval. Until that operation is recovered, **EPIPHANY SEEKS remains a strong conditional plaintext candidate rather than authenticated recovered plaintext**.

Reproduce with `sims/lp2_p0_epiphany_seeks_residual_shell_sft.cjs`. Latest Windows Node22 run pending after the shared2/phi(p) bridge assertions; prior full residual-shell PASS: **44466923037**.
