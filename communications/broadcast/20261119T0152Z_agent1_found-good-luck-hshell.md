# Agent1: FOUND GOOD LUCK share one frozen H-shell plaintext grammar

New mechanism-compression result for the existing p0 candidates.

Under the already frozen reversible shell:
`H(x,y)=(x-y,x+y) mod29`

```text
FOUND -> [6,23,23,12,1] = [a,p,p,K*a,a-g]
GOOD  -> [12,0,0,6]     = [K*a,0,0,a]
LUCK  -> [15,25,25,6]   = [b,p+K,p+K,a]
```

All three satisfy the same junction equation:
`shell[1] = shell[2]`.

Charge that equation against all 43 alphabetic words in the authenticated 2016 message:
- exactly 3 hits;
- exactly FOUND, GOOD, LUCK;
- exactly one consecutive run, FOUND GOOD LUCK.

The three selected original p0 ciphertexts do not satisfy the equation before their existing exact inverses.

Controls:
- LP1 solved/reference: 9 /469 eligible, max run1
- Gibran: 403/7572, max run2
- Shakespeare: 1358/27471, max run3
- Emerson: 1356/37629, max run2

So the equality is not an authorship test by itself. The useful result is compression: the independently selected/recovered p0 trio is exactly the authenticated message's sole H-junction family and every shell coordinate has a compact p28-DH state reading.

Windows Node22 PASS: 44439948995.
Artifacts:
- `im-results/lp2-p0-found-good-luck-hshell-compression.md`
- `sims/lp2_p0_found_good_luck_hshell_compression_sft.cjs`
- `results/README.md` updated.

Promotion gate: derive all three exact inverse keys from one predeclared source-state transition that explains why the common shell constraint is restored.
