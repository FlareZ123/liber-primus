# Bob-pair exception gate for the THEIR RISE +6 H-shell family

**Agent40, 28 November 2026. Director #3432. Classification: prospective-domain negative.** After the fresh p7 miss, the only pre-existing source label distinguishing the two successful two-rune +6/H-shell cases is that their GP0 rise coordinates are the worked DH client's private/public pair `b=15`, `B=19`. A complete source-only census shows that this restriction supplies **no unused two-rune target**. It therefore cannot prospectively rescue the failed general rule.

## Frozen source-only definition

The authenticated 2016 message has 43 alphabetic words under the repository's established tokenizer. Its two `THEIR` occurrences at zero-based indices19 and25 fix the already-used `RISE=+6=a` operation.

The authenticated 2013 worked DH transcript fixes `(p,g,A,B,K)=(23,5,8,19,2)`. Since `g=5` has order22 modulo23, the client public share `B=19` uniquely implies `b=15` in the ordinary exponent range. In the established 2016 positional state register those same values are source indices `WORDS=15` and first `THEIR=19`.

Define a **Bob-rise event** without destination ciphertext as any source transition

```text
W_i -> W_(i+6)
r_i = GP0(W_(i+6)) - GP0(W_i) mod29
```

with `r_i ∈ {b,B}={15,19}`.

The existing H-shell mechanism is more specific: it is a **two-rune** same-state receiver rule, because `H(key)=[r,0]` determines exactly two key coordinates. Extending it to a four-rune source word would require a new H4/key grammar and is outside this frozen hypothesis.

## Complete source census before any new ciphertext

Across every source index with a +6 partner, only three transitions have a Bob rise:

```text
index23 ROAD -> index29 DIRECTION   length4   rise15=b
index28 THE  -> index34 BE          length2   rise15=b
index34 BE   -> index40 PATHS       length2   rise19=B
```

After applying the pre-existing two-rune operand type, the eligible domain is exactly:

```text
THE28 -> BE34       rise b=15
BE34  -> PATHS40    rise B=19
```

Those are precisely the two already-open successful calibration cases. **Unused Bob-eligible two-rune transitions: 0.**

The ROAD23 event is a useful control: `b=15` genuinely recurs outside the success pair, so the Bob-rise criterion itself is not synonymous with the two hits. But ROAD is four GP runes. Applying the two-coordinate H-shell to it would introduce a new serialization after seeing the p7 miss and cannot serve as a prospective test of the frozen mechanism.

The fresh p7 target from #3423 is also source-excluded by this rule before ciphertext: `THE7 -> WAY13` has rise8=A, not b/B. That explains the miss descriptively, but because the Bob restriction was recognized from the two successful cases and has no unused typed target, this exclusion has **zero independent predictive support**.

## Decision

The Bob-pair rescue fails the issue's prospective-support requirement.

- The source-only Bob criterion is finite and reproducible.
- It excludes p7 without consulting p7 ciphertext.
- It leaves exactly the two known successes and **no held-out two-rune target**.
- The sole additional Bob-rise source transition is the wrong operand type for the frozen two-rune shell.

Therefore do **not** upgrade p28 THE / p34 BE into a Bob-domain cipher. Preserve both as strong local candidate recoveries under their existing evidence, while treating `{b,B}` as a post-hoc description of the two successful rises until an independently selected new two-rune Bob event exists or a source cue explicitly extends the key grammar to another operand type.

No destination ciphertext was opened for this decision, and no unknown plaintext or key was added.

## Reproduction

`sims/lp2_their_rise_bob_pair_exception_sft.cjs` reconstructs the signed 2016 word register, GP0 values, +6 transitions and the complete Bob-rise census directly from repository sources.
