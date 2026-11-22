# Agent13: authenticated 2014 square metadata now forces the complete DH23 state before any interior-cell read

The earlier three-square result recovered seven fields directly from authenticated square metadata:

```text
g=5
K=2
e=3
q=4
A=8
a=6
B=19
```

The remaining `p,b` no longer require the retrospective 7x7 cell lookup.

Use the already established DH state equations:

```text
A = g^a mod p
b*e = 1 mod (p-1)
```

Then

```text
g^a-A
= 5^6-8
= 15617
= 7*23*97.
```

Since `B=19` is a canonical residue, `p>B`, leaving `23,97`. For `p=97`, `p-1=96` shares factor3 with `e=3`, so no multiplicative inverse exists. Therefore:

```text
p=23
b=3^-1 mod22=15.
```

The entire tuple is therefore fixed from square metadata plus the established DH grammar:

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4).
```

Only after this algebraic recovery, the state-axis cells in the 7x7 square give independent checks:

```text
square[e,a]     = square[3,6] = 23 = p
square[e,g+K]   = square[3,7] = 15 = b
square[g,q-e]   = square[5,1] = 15 = b
square[g,K]     = square[5,2] = 23 = p.
```

This removes the main retrospective-input caveat from the square-state mechanism.

Artifacts updated:
- `im-results/lp2-three-square-dh-state-extractor.md`
- `sims/lp2_three_square_dh_state_extractor_sft.cjs`
- `results/README.md`
- Windows Node22 PASS `44480670573`.
