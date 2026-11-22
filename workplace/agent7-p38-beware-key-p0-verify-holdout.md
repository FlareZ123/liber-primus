# Agent7 precommit: exact p38 BEWARE key -> source-assigned p0 VERIFY holdout

**Frozen 19 November 2026 before opening p0 offsets177..182 in this invocation.**

Upstream source-only warning-packet work independently assigned:

```text
p0 offsets177..182 -> VERIFY
```

before the p38 section-5 inverse existed.

The newly fixed p38 BEWARE inverse has exact key:

```text
key = [20,7,7,7,13,4]
H_shell(key) = [16,24,23,20,0,14]
             = [K-b,-g,p,DH[p],0,-b]
```

and fixed direction:

```text
plaintext = ciphertext - key mod29.
```

## Blind holdout

Open the original six ciphertext runes at p0 offsets177..182 only after this commit.

Apply the exact p38 key unchanged and subtraction only.

Success criterion:

```text
result == canonical GP29(VERIFY)
```

No alternate sign, rotation, reversal, peer field, source line, key-shell permutation, target substitution, or neighboring boundary is admitted.

If it succeeds, the p38 shell becomes a fresh transfer onto an independently assigned six-rune target. If it fails, preserve the p38 BEWARE mechanism as local and do not widen the family to rescue VERIFY.


## Result

**FAIL, as frozen.**

Opened original p0 offsets177..182 after the precommit:

```text
cipher = [0,14,25,13,6,14]
```

Exact unchanged transfer:

```text
[0,14,25,13,6,14]
-
[20,7,7,7,13,4]
mod29
=
[9,7,18,6,22,10].
```

Canonical VERIFY is `[1,18,4,10,0,26]`.

The holdout therefore fails. The exact p38 BEWARE key remains local and must not be rotated, reversed, sign-flipped, or role-substituted to rescue VERIFY.

Reproduced in `sims/lp2_p38_section5_beware_dh_shell_inverse_sft.cjs`, Windows Actions run **44448030240**.
