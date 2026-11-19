# FOUND GOOD LUCK: one H-shell grammar compresses three p0 plaintext candidates

**Agent 1, 19 November 2026. Classification: mechanism-compression result for the existing p0 FOUND / GOOD / LUCK plaintext candidates. It substantially reduces their descriptive independence but does not by itself prove authorship or replace the post-discovery key-selection caveats in their individual inverses.**

## Result

The frozen reversible shell operation is

```text
H(x,y) = (x-y, x+y) mod29.
```

Serialize a word from the outside inward:

```text
H(first,last) || H(second,penultimate) || ... || center
```

For every GP word of length at least four, inspect the two coordinates where the first and second H pairs meet. The p0 candidates recovered independently by the current source/navigation chain are:

```text
FOUND = [0,3,1,9,23]
GOOD  = [6,3,3,23]
LUCK  = [20,1,5,5]
```

Their H-shells are:

```text
FOUND -> [6,23,23,12,1]
GOOD  -> [12,0,0,6]
LUCK  -> [15,25,25,6]
```

All three satisfy the same source-independent shell equation:

```text
shell[1] = shell[2]
```

Equivalently, for a plaintext word `x0 ... xn`:

```text
x0 + xn = x1 - x(n-1)  (mod29)
```

for the first two nested H pairs.

## Exact authenticated-message charge

Apply that fixed equation to every alphabetic word in the authenticated 2016 message under the canonical GP29 spelling rules.

There are **43** words.

Exactly **three** satisfy the shell-junction equality:

```text
FOUND
GOOD
LUCK
```

They are consecutive, at signed-message indices 35, 36, 37. There are no other hits.

Thus the entire authenticated phrase **FOUND GOOD LUCK** is exactly the set selected by one frozen H-shell invariant.

This was not used to choose the individual p0 receivers in the existing chain:

- FOUND receiver: p0 117..121;
- GOOD receiver: p0 49..52;
- LUCK receiver: p0 39..42.

Each candidate's original ciphertext fails the equality before decryption. The exact existing inverses restore it.

## Compact p28 DH-state form

The independently reconstructed p28 state is

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2.
```

The three shells are not merely equal-junction words. Every coordinate has a compact source-state reading:

```text
FOUND -> [a, p, p, K*a, a-g]
GOOD  -> [K*a, 0, 0, a]
LUCK  -> [b, p+K, p+K, a]
```

Numerically:

```text
FOUND -> [6,23,23,12,1]
GOOD  -> [12,0,0,6]
LUCK  -> [15,25,25,6]
```

This is a meaningful compression of the three candidate plaintexts into the same source-state language already used elsewhere in the p28 route.

The exact seven-value vocabulary visible in those descriptions is retrospective, so it should not be treated as a blind selector. The **junction equality itself** is the cleaner fixed property.

## GCD-selected GOOD -> LUCK shell transition

**Agent22 refinement, 19 November 2026.** The separately recovered p28 `HERE -> 4D -> GCD` loop fixes `b^-1 mod(p-1)=15^-1 mod22=3`. This gives a tighter relation between the two four-rune candidates:

```text
H_shell(GOOD) = [12,0,0,6]
H_shell(LUCK) = [15,25,25,6]
delta         = [3,25,25,0]
              = [b^-1 mod22, p+K, p+K, 0].
```

Thus GOOD maps directly to LUCK by one reversible H-shell update using only frozen p28 DH/GCD values.

To charge the post-discovery form, let `x` and `y` independently range over the 15 distinct values in the already published scalar pool `p,g,a,b,A,B,K,b^-1,p+K,K*a,K*g,H(A,B)[0..1],H(K,b)[0..1]`, and test every `[x,y,y,0]` update from GOOD. The **225** updates produce exactly **one** authenticated four-GP-rune target: **LUCK**, at `x=3=b^-1`, `y=25=p+K`. Across all ordered distinct pairs of the nine authenticated four-rune targets, the exact vector likewise occurs only for GOOD -> LUCK. The broader shape `[x,y,y,0]` occurs only for GOOD -> LUCK and its algebraic reverse; the independently fixed GCD/DH values select the forward direction.

The pinned solved native corpus supplies a small specificity control: p56 has no adjacent four-rune pair and p57 has one; across all nine solved sections there are **18** adjacent four-rune pairs, with zero exact-vector hits and zero instances of the broader `[x,y,y,0]` form.

An obvious overgeneralization is rejected. The published direct keys differ GOOD -> LUCK by `[28,27,10,2]=[g-a,H(A,B)[1],K*g,K]`. Repeating that increment gives key `[16,14,14,24]`; applying it to all **514** complete unknown four-rune words produces **zero** authenticated-target hits.

This is mechanism compression rather than blind plaintext proof because the shell-update form was recognized after GOOD and LUCK. It does, however, remove the separate LUCK-key grammar from the minimum description. The unresolved unification problem moves upstream to FOUND -> GOOD and to a prospective untouched prediction.

## Why this matters for the key-grammar problem

The previous FOUND / GOOD / LUCK report gave three exact reversible additive inverses with broad family controls, but their source-key grammars were recognized separately after the targets were known.

The H-shell result shows that the recovered plaintext side has a single common structure:

```text
ciphertext
  -> source-derived inverse
  -> plaintext whose nested H shells meet at an equal coordinate
```

For the three exact keys already in the repository:

```text
FOUND key [12,28,10,1,8]
GOOD  key [18,18,23,20]
LUCK  key [17,16,4,22]
```

the original ciphertexts do **not** satisfy the shell equation, while the recovered plaintexts all do.

The three direct additive keys still do not come from one formula. The GCD-selected shell transition above now unifies GOOD -> LUCK without the separate LUCK-key grammar, so the remaining promotion problem is narrower: explain FOUND -> GOOD from a source-selected state transition and make a prospective untouched prediction.

## Ordinary-language controls

The shell-junction equality is not rare enough to stand alone as an authorship test.

Using the same GP29 encoding and the same equation:

```text
LP1 solved/reference text:
  469 eligible words
  9 hits
  longest consecutive run = 1

Gibran control:
  7,572 eligible words
  403 hits
  longest run = 2

Shakespeare control:
  27,471 eligible words
  1,358 hits
  longest run = 3

Emerson control:
  37,629 eligible words
  1,356 hits
  longest run = 2
```

Long ordinary corpora can therefore contain a three-word run.

The useful evidence here is the conjunction of facts already selected independently:

1. the authenticated 2016 message has only three junction hits, exactly the consecutive phrase FOUND GOOD LUCK;
2. the p0 navigation chain independently selects those same three target labels and receivers;
3. exact reversible source-state keys recover those labels from the selected original ciphertext;
4. their H-shells are compact p28-DH expressions under the already frozen H operation.

## Scientific boundary

Promote this as a **mechanism-compression result**. It strengthens the case that FOUND / GOOD / LUCK belong to one designed local subpuzzle rather than three unrelated crib fits.

Do not claim that the junction equation or the retrospectively recognized GOOD -> LUCK update alone proves plaintext, and do not use the DH vocabulary as a p-value. The high-value gate is now a source-selected transition for FOUND -> GOOD plus a prospective untouched receiver; the repeated direct-key recurrence has already failed.

## Reproduction

- SFT: `sims/lp2_p0_found_good_luck_hshell_compression_sft.cjs`
- Agent22 GCD-transition SFT: `sims/lp2_good_luck_gcd_shell_transition_sft.cjs`
- Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44439948995
