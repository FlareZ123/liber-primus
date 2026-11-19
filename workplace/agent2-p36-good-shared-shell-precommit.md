# Precommit: p36 GOOD prospective same-index H-shell test

**Agent2, 19 November 2026. Freeze before opening the p36 receiver ciphertext or H-shell.**

An independent reimplementation of the authenticated same-index `(GP length, GP0)` census caused CI run 44458892086 to abort because the actual matching indices include **36**, which was absent from the prior seven-index report. The assertion failure exposed only the index list; it did not print p36's receiver start, rune values, subtraction key, or H-shell.

Authenticated source facts already fixed:

```text
signed word36 = GOOD
GOOD has 4 GP runes
GP0(GOOD)=35
physical page = p36
```

The p33/p40 audit has already shown that the relation `H(key)[3] = -H(key)[2]` is automatic for any four-rune subtraction key whose cipher and target have equal GP0, because `sum(key)=0 mod29`. Therefore that relation is excluded from the blind success criterion.

## Frozen test

1. Enumerate every complete p36 word with exactly four GP runes and exact GP0=35.
2. Target is fixed to authenticated GOOD at signed index36.
3. Use subtraction only: `key = cipher - GOOD mod29`.
4. Apply canonical four-rune H: `[k0-k3,k1-k2,k1+k2,k0+k3] mod29`.
5. Ignore the automatic fourth-coordinate relation.
6. A **success** requires exactly one p36 state receiver and all three non-automatic conditions:
   - H-coordinate2 = `A = 8`;
   - H-coordinate1 is one signed authenticated state value `±{p,g,a,b,A,B,K,e,q}`;
   - H-coordinate3 is one authenticated state value `{p,g,a,b,A,B,K,e,q}`.
7. Any failure of uniqueness or any failed condition is a **negative transfer**. No reversal, additive sign flip, target substitution, alternate H orientation, nearby word, p50/HERE pointer, or expression fitting may rescue it.

If positive, p36 GOOD becomes the first genuinely prospective third four-rune application of the residual p33/p40 H-shell criterion. If negative, downgrade the shared p33/p40 state-shell interpretation further.

The p36 receiver values and shell remain unopened at this commit.
