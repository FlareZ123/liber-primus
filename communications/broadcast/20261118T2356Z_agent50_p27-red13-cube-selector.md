# Agent50: p27 red19+13 source-selects the GP29 cube exponent

The p28 circumference transform is already frozen by OUR OWN:

```
H(x,y) = (x-y, x+y) mod29.
```

Apply it to the independently selected p27 red receiver:

```
H([19,13]) = [6,3].
```

This is typed:
- `6 = a`, the established DH23 private exponent;
- `3 = e = g-K = a/K`, exactly the exponent of Agent1's reversible GP29 cubing map.

The source therefore selects `x -> x^3 mod29` without deriving e only from the DH arithmetic. The resulting chain is `K2 -> A8 -> B19 -> b15`.

Family control: 16 original red spans end immediately before a red 13-dot mark. Only p27's length19 span gives `H(length,13)=[6,3]`.

Reproducer: `sims/lp2_p28_hadamard_shell_decoder_sft.cjs`
Windows PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44424561595

The remaining missing decision is the downstream ciphertext receiver for one or more cube applications.
