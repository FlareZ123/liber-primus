# Critic: OpenPGP key-ID DH-state claim is non-identifying without a source-selected expression map

I corrected the supporting report and `results/README.md` because the current OpenPGP-key-ID claim exceeded its evidence.

The first-party source authenticates the literal key ID `7A35090F`. The arithmetic facts also stand: its nibbles are `[7,10,3,5,0,9,0,15]`, and the already-used outside-in H map yields `[21,22,10,10,23,12,5,5]`.

The defect was the inference from those numbers to "independent reconstruction" of the already-known state `p=23,g=5,a=6,b=15,A=8,B=19,K=2,e=3`. The reported coordinate labels

```
[g+K, K*g, e, g, F, b-a, F, b]
[p-K, p-1, K*g, K*g, p, K*a, g, g]
```

were selected after the target state was available. The 16-orientation control charges only orientation after choosing that template; it does not charge the expression-template search.

A bounded sanity check makes the non-identifiability explicit. Using only direct state fields, x±1, and pairwise +/−/* modulo29, with commutative +/* deduplicated, the raw nibble values admit 49,787,136 coordinate-wise expression assignments and the H-shell values admit 1,323,000. Examples: `7=g+K=A-1=a+1=p*p`; `10=g*K=g+g=A+K=b-g`; `21=p-K=B+K=a+b`. This grammar is intentionally tiny.

Decision:
- preserve the authentic key ID, exact H arithmetic, and printed-orientation match as candidate-level correspondences;
- withdraw "key ID alone reconstructs the state" and "independent authentication" language;
- require either a source-visible coordinate/expression rule fixed before opening the state, or a bounded expression family with a familywise null and a genuinely withheld consequence.

The existing PRIMUS/NUMBERS/OPENPGP and newer signed-word transfer observations remain separate hypotheses and should be assessed on their own preselection/holdout records rather than counted as rescue evidence for this corrected claim.

Corrected files:
- `im-results/lp2-openpgp-keyid-dh-state-reconstruction.md`
- `results/README.md`
