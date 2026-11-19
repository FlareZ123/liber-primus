# P36 signed-index GOOD has a unique same-state receiver and state-only H shell

**Agent1, 19 November 2026. Classification: strong local GOOD plaintext candidate with an exact reversible inverse.** The authenticated source fixes target word36 = GOOD and physical page36 before any key construction. P36 contains exactly one complete four-rune word with GOOD's canonical `(length4, GP0=35)` state, at offsets87..90. Its exact subtraction key has the compact state form `[g,-e,A+K,b+K]`; canonical outside-in H gives `[b+K,K-b,g+K,p-1]`. A bounded 81-shell family produces one hit on p36, and the exact key produces one hit across all 562 complete four-rune unknown-page words and all distinct authenticated four-rune targets.

The shell roles were recognized after the source-selected GOOD receiver was known. Preserve that chronology: this is strong local mechanism compression, not blind plaintext discovery.

## Source and receiver are fixed before the key

Authenticated zero-based source word36 is:

```text
36 GOOD
GP(GOOD) = [6,3,3,23] = [a,e,e,p]
length   = 4
GP0      = 35
```

Physical p36 has nine complete four-rune words. Exactly one has raw GP0=35:

```text
p36 offsets87..90
cipher [11,0,13,11]
length = 4
GP0    = 35
```

Thus the source index and source word state select one receiver without using a key or language score.

This receiver belongs to a sparse same-index family. Across all authenticated source words whose GP encoding has four runes, the only physical same-index pages containing a complete word with the same `(length, GP0)` state are:

```text
33 WILL  -> p33 offsets132..135
36 GOOD  -> p36 offsets87..90
40 PATHS -> p40 offsets71..74
```

No other authenticated four-rune source word has a same-index state receiver.

## Exact local inverse

Subtract canonical GOOD from the selected ciphertext:

```text
cipher [11, 0,13,11]
GOOD   [ 6, 3, 3,23]
---------------------
key    [ 5,26,10,17] mod29
```

The key is entirely expressible in the independently reconstructed state:

```text
[5,26,10,17]
= [g,-e,A+K,b+K].
```

Using the canonical four-rune outside-in H serialization

```text
H4([k0,k1,k2,k3])
= [k0-k3, k1-k2, k1+k2, k0+k3] mod29,
```

gives:

```text
H4(key)
= [17,16,7,22]
= [b+K, K-b, g+K, p-1].
```

Forward replay is exact:

```text
[11,0,13,11] - [5,26,10,17] mod29
= [6,3,3,23]
= GOOD.
```

## THEIR RISE gives an independent source-side echo

The independently decoded p33 instruction `THEIR RISE` fixes source rise6 from THEIR positions19→25.

The final source corridor contains:

```text
36 GOOD
  +6
42 OPENPGP
```

and:

```text
GP0(OPENPGP) - GP0(GOOD) mod29
= 75 - 35 mod29
= 11
= a+g.
```

The selected p36 ciphertext has both endpoints equal to that exact source rise:

```text
[11,0,13,11].
 ^          ^
 a+g        a+g
```

This endpoint equality was noticed after the receiver was already selected, so it is corroboration rather than part of the key-selection rule.

## Bounded shell-family charge

The exact shell was recognized retrospectively. Charge a compact two-role family that preserves its algebraic structure:

```text
[x+K, K-x, y+K, p-1],
```

where `x` and `y` each range independently over the nine authenticated state fields:

```text
{p,g,a,b,A,B,K,e,q}.
```

This gives 81 shells. H-invert every shell to a four-rune key and apply all of them to:

- all nine complete four-rune words on p36;
- all eight distinct authenticated four-rune target words;
- both additive directions.

Total charge:

```text
81 * 9 * 8 * 2 = 11,664 configurations.
```

Exactly one hit survives:

```text
x=b
y=g
shell [17,16,7,22]
key   [5,26,10,17]
p36 offsets87..90
subtract
-> GOOD.
```

The family therefore does not produce a menu of alternative p36 plaintexts.

## Manuscript-wide fixed-key control

Hold the exact key `[5,26,10,17]` fixed.

Across physical p0–p55 there are 562 complete four-rune unknown-page words. Test the same eight distinct authenticated four-rune targets and both additive directions:

```text
562 * 8 * 2 = 8,992 configurations.
```

There is exactly one hit:

```text
p36 offsets87..90
subtract [5,26,10,17]
-> GOOD.
```

Thus the exact key is manuscript-wide selective under the charged authenticated target family.

## Relationship to WILL and PATHS

The same-index state census now contains exactly three four-rune candidates:

```text
p33 WILL
p36 GOOD
p40 PATHS
```

P33 and p40 already share the bounded shell skeleton `[x,A,y,-y]`. P36 has a different shell grammar, so this result should not be used to claim one universal same-index cipher. The meaningful commonality is source selection: target word number selects the page, and target `(length,GP0)` selects a unique receiver before a compact DH-state inverse is inspected.

P36 therefore strengthens the signed-index page-reading route without erasing the fact that local key serializations still differ.

## Evidence boundary

Preserve:

```text
signed word36 GOOD
 -> physical p36
 -> unique length4/GP0=35 receiver87..90
 -> cipher [11,0,13,11]
 -> exact key [g,-e,A+K,b+K]
 -> H shell [b+K,K-b,g+K,p-1]
 -> exact GOOD.
```

The target, page, and receiver are source-selected before key construction. The shell expression roles were found after the inverse, so this remains a **strong local plaintext candidate** rather than an established reusable cipher.

A prospective receiver selected independently by the same `[x+K,K-x,y+K,p-1]` shell grammar would justify stronger promotion. Do not broaden the shell family or tune new state expressions after failed transfers.

## Reproduction

Run:

```text
node sims/lp2_p36_good_sameindex_state_shell_sft.cjs
```

The SFT reconstructs the authenticated state, confirms GOOD's GP packet, performs the complete four-rune same-index state census, verifies the p36 receiver and exact inverse, charges the 81-shell family, and runs the manuscript-wide exact-key control.
