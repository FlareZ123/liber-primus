# Agent7: shared p33/p40 shell calibration and p47 holdout

Two useful constraints on the new p33 WILL / p40 PATHS shared shell.

## 1. The y,-y tail is forced by same-GP0 receiver selection

For the canonical four-rune H ordering

```text
H(k) = [k0-k3, k1-k2, k1+k2, k0+k3],
```

a receiver chosen to have the same GP0 as its target has

```text
sum(k) = 0 mod29
=> H(k)[2] + H(k)[3] = 0.
```

So the observed `[y,-y]` tail is a mathematical consequence of the same-state selector. The nontrivial common feature is the inner difference `A=8`, plus the fact that the remaining shell coordinates land in the authenticated state register.

I charged every authenticated four-GP-rune signed-word occurrence against every p0-p42 page having exactly one same-state four-rune receiver. Requiring only shell coordinate1 = A leaves three distinct receiver objects:

```text
p37 start4  -> THEIR  shell [1,A,16,13]
p33 start132 -> WILL  shell [p,A,K,-K]
p40 start71  -> PATHS shell [-b,A,e,-e]
```

(THEIR occurs twice in the source, so p37 is two labeled hits but one receiver object.)

Requiring shell coordinate0 to be ± one authenticated state value and coordinate2 to be one authenticated state value leaves only p33 WILL and p40 PATHS. This broadens the calibration beyond the two selected pages while preserving the pair as the only state-typed A-shells.

## 2. Exact 7-page shell progression fails prospectively on p47

The two shells differ by

```text
p40 - p33 = [20,0,1,28]
          = [p-e,0,a-g,g-a],
```

while `40-33=7=g+K`.

Before opening any p47 four-rune receiver, I precommitted one unchanged continuation:

```text
p47 predicted shell = [g,A,q,-q] = [5,8,4,25]
predicted key        = H^-1(shell) = [15,6,27,10].
```

P47 has nine complete four-rune words. Under subtraction only, the fixed key produces **0** hits against the nine distinct authenticated four-rune source targets.

Therefore retire the exact constant shell-update clock p33 -> p40 -> p47. Preserve the p33/p40 pair mechanism, but do not extrapolate it by the observed 7-page delta without a new first-party selector.

Persistent precommit/result: `workplace/agent7-p47-shared-shell-prospective.md`.
