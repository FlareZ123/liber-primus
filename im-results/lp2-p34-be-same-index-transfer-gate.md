# Signed index34 BE now has a source-predicted unique receiver

**Agent30 original ambiguity audit; Agent1 source-selector resolution; Agent17 upstream body-rise selector, 19 November 2026. Classification: strong local BE plaintext candidate with an exact reversible key predicted from the authenticated THEIR RISE source operation, now preceded by a direct p33 layout selector for signed/physical index34.** P34 originally had two complete words with BE's same `(length, GP0)` state, so same-index state matching alone could not choose a receiver. The independently decoded p33 instruction `THEIR RISE` now supplies the missing source-visible discriminator: the fixed +6 rise pairs signed word34 BE with word40 PATHS, whose GP0 rise is `B=19`. Because every same-state two-rune receiver necessarily has H-key sum zero, that rise fixes the complete H shell `[B,0]`, hence the exact key and ciphertext before the two p34 candidates are chosen.

The selector was recognized after the earlier p34 inverse had already exposed `H(key)=[B,0]`. Preserve that chronology. The result repairs the receiver-selection defect and materially strengthens BE, while remaining candidate-level rather than a blind plaintext discovery.

## New upstream selector: p33's literal body rise is 34

P33's two red headings already decode to `THEIR RISE`. Their corresponding black bodies are independently fixed at `81` and `115` runes. The literal lower-minus-upper rise is:

```text
115 - 81 = 34.
```

The same page gives cross-scale rises `6-5=1` for section lines and `28-21=7` for canonical body words; signed indices1 and7 are both `THE`, while signed index34 is `BE`. In the charged two-red-heading family, p33 alone has all three rises inside the authenticated 43-word source register.

Thus p33 selects **signed index34 and physical p34 before any p34 ciphertext is consumed**. This removes the need to posit same-index p34 merely because BE was already a candidate. The source-rise key calculation below remains unchanged and still provides the receiver discriminator. [Body-rise handoff](lp2-p33-their-rise-body34-be-handoff.md).

## Source-assigned target and original ambiguity

Authenticated zero-based source word34 is:

```text
BE = [B,E] = [17,18]
length = 2
GP0    = 35
```

Physical p34 has exactly two complete words with the same source state:

```text
p34 canonical word2  offsets4..5     = [12,23]
p34 canonical word57 offsets249..250 = [28,7]
```

The earlier audit correctly stopped here because source index34 plus `(length2, GP0=35)` did not distinguish them.

## THEIR RISE supplies a fixed +6 source operation

P33 independently decodes to:

```text
THEIR RISE
```

The authenticated source has THEIR at zero-based positions19 and25, so the literal rise is:

```text
25 - 19 = 6 = a.
```

Use that same source-index rise on word34:

```text
34 BE
  +6
40 PATHS
```

Canonical GP0 gives:

```text
GP0(BE)    = 35
GP0(PATHS) = 54

54 - 35 mod29 = 19 = B.
```

Thus the BE→PATHS source pair supplies a fixed rise coordinate `B=19` without consulting either p34 ciphertext candidate.

## Same-state algebra forces the second H coordinate to zero

Let `P=[17,18]` be BE and let a candidate ciphertext `C=[c0,c1]` have the same raw GP0 state 35. Define the subtraction key:

```text
K = C - P mod29.
```

Because `sum(C)=sum(P)` modulo29:

```text
K0 + K1 = 0 mod29.
```

For the established pair map

```text
H(x,y) = (x-y, x+y) mod29,
```

the second coordinate of `H(K)` is therefore forced to zero for every same-state two-rune receiver. No separate choice is made for that coordinate.

The source rise supplies the only remaining H coordinate:

```text
H(K) = [B,0] = [19,0].
```

Invert H using `2^-1 = 15 mod29`:

```text
K = H^-1([19,0])
  = [24,5].
```

This key is predicted before choosing between the two p34 state receivers.

## Exact ciphertext prediction selects offsets4..5

Add the predicted key to the authenticated target:

```text
BE       [17,18]
key      [24, 5]
----------------
predicted [12,23] mod29.
```

The two previously known state receivers are:

```text
offsets4..5     [12,23]  <- exact prediction
offsets249..250 [28, 7]  <- miss
```

Therefore the source rule selects exactly:

```text
p34 canonical word2 offsets4..5
cipher [12,23]
key    [24,5]
subtract
-> BE [17,18].
```

Forward replay is exact.

The rejected second receiver has:

```text
key = [11,18]
H(key) = [22,0] = [p-1,0],
```

so it fails the fixed rise coordinate `B=19`.

## Complete authenticated two-rune family charge

The p34 relation was discovered after its compact shell was already known, so the rule must be charged across the whole matching source family.

There are nine authenticated source words among indices0..36 whose canonical GP encoding has exactly two runes and whose +6 partner exists:

```text
1  THE
7  THE
11 IS
12 THE
17 THE
21 IS
22 THE
28 THE
34 BE
```

For each source word `W_i`:

1. compute the fixed authored rise
   `r_i = GP0(W_{i+6}) - GP0(W_i) mod29`;
2. derive the unique same-state two-rune key
   `K_i = H^-1([r_i,0])`;
3. predict the exact ciphertext `C_i = GP(W_i)+K_i mod29`;
4. inspect only physical page `i` for that exact complete two-rune word.

The frozen family produced an unexpected second hit:

```text
1  THE -> no hit
7  THE -> no hit
11 IS  -> no hit
12 THE -> no hit
17 THE -> no hit
21 IS  -> no hit
22 THE -> no hit
28 THE -> p28 canonical word28 start140
34 BE  -> p34 canonical word2  start4
```

The p28 hit was exposed by Windows CI run **44459406789**, which failed a hard assertion that had expected no p28 receiver. It is documented separately as the held-out **READ OUT THE** continuation in `lp2-p28-readout-the-heldout-rise.md`.

Both successful rises are the authenticated Bob pair:

```text
THE28 -> BE34       rise b=15
BE34  -> PATHS40    rise B=19.
```

The opposite rise sign is unnecessary under the literal word `RISE`; as an additional control all nine reverse-sign predictions miss.

## Relationship to the earlier negative audit

The earlier report found:

```text
p34 start4 key [24,5] -> H=[B,0]
p34 start249 key [11,18] -> H=[p-1,0].
```

At that time there was no upstream rule choosing `B` rather than `p-1`, so retaining both receivers and rejecting plaintext promotion was correct.

The later p33 recovery of `THEIR RISE` changes that decision. The authored +6 operation now produces `B` specifically on the BE→PATHS source pair, and same-state algebra fixes the shell's other coordinate to zero. The previously retrospective `[B,0]` label therefore becomes an independently sourced receiver discriminator.

The exact fixed key remains nonunique when applied indiscriminately across every unknown two-rune word and several authenticated targets. That older manuscript-wide control is still valid. It is no longer the relevant selection family because the source now fixes both the target BE and physical page34 before the key prediction is made.

## Evidence boundary

Preserve p34 offsets4..5 as a **strong local BE plaintext candidate**:

```text
THEIR RISE
 -> rise6
 -> 34 BE -> 40 PATHS
 -> GP0 rise B=19
 -> same-state two-rune key must have H-sum0
 -> H(key)=[B,0]
 -> key=[24,5]
 -> predicted p34 cipher=[12,23]
 -> unique p34 receiver offsets4..5
 -> exact BE.
```

This is a compact human-solvable route and closes the specific ambiguity that blocked the previous p34 result.

The selector was recognized after the p34 candidate shell had already been inspected, so this is source-constrained retrospective authentication rather than a preregistered blind plaintext recovery. A prospective transfer of the same rise-to-H-key rule to a fresh independently source-selected two-rune block would justify stronger promotion.

## Reproduction

The integrated SFT is:

```text
sims/lp2_their_rise_h_rectangle_selector_sft.cjs
```

It reconstructs THEIR RISE from the authenticated source positions, verifies the BE→PATHS rise, derives `H^-1([B,0])=[24,5]`, predicts p34 ciphertext `[12,23]`, checks the two old BE-state receivers, and charges the complete nine-word authenticated two-rune family. The reconciled family, including the held-out p28 hit, passes Windows Node22 run **44461032220**.

The historical ambiguity SFT remains useful for the older broad controls:

```text
sims/lp2_signed_index_page_state_will_sft.cjs
```
