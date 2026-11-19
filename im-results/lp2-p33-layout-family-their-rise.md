# p33 layout family audit and THEIR RISE source loop

**Agent4, 19 November 2026, Director #1782. Classification: p33 is validated as a source-selected state/checkpoint page inside the charged same-operand layout family. The later solved-p56 serializer independently recovers `THEIR RISE` and closes a signed-2016 source loop. The prospectively frozen attempt to turn the second THEIR position into another p50 physical-page pointer fails. No p33 body plaintext is claimed.**

## Charged matched-layout family

The audit keeps the frozen DH/H state

```text
(p,g,a,b,A,B,K,e,q) = (23,5,6,15,8,19,2,3,4)
H(x,y) = (x-y, x+y) mod29
```

and does not inspect p33 body ciphertext values while selecting layout relations.

Across the complete ink/transcription annotations there are **18 red spans with at least two runes** and **8 red spans that are exactly two complete printed words**.

Two source relations are individually unique:

- p33 local0 is the only exact two-word red span with lengths `[K,A]=[2,8]`, first rune `p=23`, and `H([2,8])=[p,A+K]=[23,10]`.
- p33 local91 is the only red span whose literal first two runes map through forward H to `[B,p]=[19,23]`.

For the full two-heading packet, pair every exact two-word red span on the same page in printed order. There is one such ordered pair, p33 local0/local91. Charge H versus H⁻¹ independently on the upper title lengths, lower title lengths and lower heading first-rune pair, giving **8 orientation variants**.

The frozen 15 source-layout checks are:

```text
upper title lengths      [K,A]       = [2,8]
upper first rune         p           = 23
upper title total        A+K         = 10
upper title transform    [p,A+K]     = [23,10]
upper body words         p-K         = 21
upper body runes         e^q         = 81

lower title lengths      [e,g]       = [3,5]
lower first rune         p-K         = 21
lower title total        A           = 8
lower title transform    [-K,A]      = [27,8]
lower body words         p+g         = 28
lower body runes         p*g         = 115

lower first2 transform   [B,p]       = [19,23]
upper terminal dots      13
section line counts      [g,a]       = [5,6]
```

Exactly one charged variant is **15/15**: p33 with forward H on all three pair relations. The runner-up orientation scores 14/15. This does not supply a discovery probability because the state interpretation predates this family audit, but it shows that the full packet and its H direction are fixed within the manuscript-visible operand class rather than freely relabeled per relation.

## Independent solved-page control: THEIR RISE

After the original p33 state-register report was written, Director #1788 recovered an integer-to-GP29 serializer directly from the solved p56 cipher:

```text
T(n) = phi(p_n) mod29 = (p_n - 1) mod29
```

for positive one-based cardinal `n`.

P33's existing H polarity tells how each title extends one step toward the opposite section:

```text
upper: [2,8] || H^-1([2,8]) = [2,8,5,3]
       T -> [2,18,10,4] = TH E I R = THEIR

lower: [3,5] || H([3,5])    = [3,5,27,8]
       T -> [4,10,15,18] = R I S E = RISE
```

The physical reading is therefore **THEIR RISE**. The dedicated serializer regression reproduces all 85 solved p56 runes, its 25-rune holdout and exact forward reencryption before applying T to p33.

This is an independent solved-control consequence of the p33 layout packet. It postdates the original state labeling, although it was not preregistered before the title counts were already known, so it should be treated as a strong cross-control rather than a formal blind layout holdout.

## Literal source loop: 19 → 25, rise 6

The authenticated signed-2016 message contains exactly two occurrences of `THEIR`, at zero-based word positions:

```text
19, 25
```

Those numbers align with p33 without choosing a new arithmetic family:

```text
first THEIR position  = 19 = B
p50[B=19]             = 0X = 33, the existing p33 entry route
p33 H([B,p])          = H([19,23]) = [25,13]
second THEIR position = 25 = GP0(WE)
THEIR rise            = 25 - 19 = 6 = a
p33 lower lines       = 6 = a
```

Thus the recovered words `THEIR RISE` describe a concrete source-visible transition already present in the signed clue and the p33 register: the first THEIR is the p33 entry state, the p33 H chain emits the second THEIR position, and their rise is the private exponent `a` that also counts the lower physical lines.

The earlier signed-source collision reconstruction had already used `H(19,25)=[23,15]=[p,b]`. The new p33 phrase gives that pair a direct human-facing reading, although this semantic connection was recognized after the collision relation was known and should not be presented as a blind discovery probability.

## Prospectively frozen continuation: negative

Before reading p50 cell25, Issue #1782 recorded the following precommit:

1. take the literal rising THEIR transition `19 -> 25`;
2. reuse exactly the same p50 address → native-base60 byte → physical-page consumer that gives `19 -> 0X -> 33`;
3. require p50[25] to decode to a legal physical LP2 page 0..57;
4. no alternate radix, component, neighbor, wrapping or fallback cell.

The result is:

```text
p50[25] = 3I
base60  = 198
198 is outside physical pages 0..57
```

The prospective continuation therefore **fails**. The source loop remains useful evidence for the p33 checkpoint, while no next-page route is licensed from cell25.

## Decision

Director #1782 is positive for p33 as a state/checkpoint page and negative for the first prospective p50 continuation derived from `THEIR RISE`.

The evidence boundary is now sharper:

- p33's full source-layout packet is uniquely realized under the charged same-operand/H-orientation family;
- solved p56 independently serializes its two headings into `THEIR RISE`;
- the phrase closes an exact signed-2016 numerical loop `19 -> 25`, with rise6=`a`;
- the precommitted attempt to treat 25 as the next p50 page address fails;
- p33's 81- and 115-rune bodies remain ciphertext with no licensed consumer.

Do not reopen p33 H phases, repeating keys or the failed address25 page-pointer route without a new authored selector.

## Reproduction

- Family/holdout SFT: `sims/lp2_p33_layout_family_holdout_sft.cjs`
- Windows CI: [PASS 44455554240](https://github.com/FlareZ123/liber-primus/actions/runs/44455554240)
- Hidden-text serializer SFT: `sims/lp2_p33_totient_hidden_text_sft.cjs`
- Serializer Windows CI: [PASS 44454927901](https://github.com/FlareZ123/liber-primus/actions/runs/44454927901)
- Upstream state report: `im-results/lp2-p33-dh-layout-state-register.md`
- Signed-source collision report: `im-results/lp2-signed2016-gp0-collision-dh-state.md`
