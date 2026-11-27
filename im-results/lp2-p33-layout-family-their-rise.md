# p33 layout family audit and THEIR RISE source loop

**Agent4, 19 November 2026, Director #1782. Classification: p33 is validated as a source-selected state/checkpoint page inside the charged same-operand layout family. The later solved-p56 serializer independently recovers `THEIR RISE` and closes a signed-2016 source loop. The prospectively frozen attempt to turn the second THEIR position into another p50 physical-page pointer fails. No p33 body plaintext is claimed.**

**27 November source correction:** The actual enlarged initials are D/NG, with no additional decorative M above the first D. The 15/15 arithmetic packet below does not include an M-observation check and remains numerically unchanged; its claim of an independently visible [M,D] target is withdrawn. The recovered count serializer remains a conditional arithmetic observation, not authenticated original plaintext. See [original glyph comparison and corrected receivers](lp2-p33-initial-native-source-correction.md).

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
p50[B=19]             = 0X = 33, a conditional convergence on independently selected p33
p33 H([B,p])          = H([19,23]) = [25,13]
second THEIR position = 25 = GP0(WE)
THEIR rise            = 25 - 19 = 6 = a
p33 lower lines       = 6 = a
```

Thus the recovered words `THEIR RISE` describe a concrete source-visible transition already present in the signed clue and the p33 register: the first THEIR is the p33 entry state, the numerically evaluated p33 H chain emits the second THEIR position without an independent visible M target, and their rise is the private exponent `a` that also counts the lower physical lines.

The earlier signed-source collision reconstruction had already used `H(19,25)=[23,15]=[p,b]`. The new p33 phrase gives that pair a direct human-facing reading, although this semantic connection was recognized after the collision relation was known and should not be presented as a blind discovery probability.

## Literal body-rise consumer: 81 -> 115 selects p34 BE

A later source-layout audit found a direct consumer for the two ciphertext-body **counts** without decrypting either body. The upper and lower bodies already have fixed counts:

```text
upper: 5 lines, 21 canonical words, 81 runes
lower: 6 lines, 28 canonical words, 115 runes
```

Reading `THEIR RISE` literally as lower minus upper gives `[1,7,34]`. All three are authenticated zero-based signed-word positions, with source labels `THE, THE, BE`. Across the complete family of pages with exactly two canonical red spans beginning at the page head and a second span at a line boundary, only p33 keeps all three rises inside the 43-word source register; it is also the only member whose line- and word-scale rises name the same signed token.

The highest-resolution result is an authored-layout handoff independent of p34 ciphertext:

```text
115 - 81 = 34
-> signed word34 = BE
-> physical p34.
```

P34 already has an independently source-predicted exact BE receiver. This upgrades the p33 bodies from having no licensed consumer to having a **count-only navigation consumer**; their rune contents remain ciphertext. See [body-rise handoff](lp2-p33-their-rise-body34-be-handoff.md) and [SFT](../sims/lp2_p33_their_rise_body34_be_handoff_sft.cjs).

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

## P33 body-value gate: negative (Issue #1932, Agent43, 19 November 2026)

The heading's literal **THEIR RISE** motivated one finite test of whether the two black-body rune streams themselves select a reversible value-changing operation. The pre-registered receiver used the original p33 image and ink boundaries:

- upper heading `[0,10)`; upper black body `[10,91)`, 81 runes;
- lower heading `[91,99)`; lower black body `[99,214)`, 115 runes;
- original `resources/liber-primus/50.jpg` SHA-256: `13ff4c8d8ab934032a001b8c1fda16433aa44a38dd7272b3ff0dd7ac8300c62d`.

The only operation tested was the fixed forward transform
`H(lower,upper)=(lower-upper,lower+upper) mod 29`. The difference channel `D` was the sole plaintext candidate; the sum channel `S` was retained only as the reversible complement. Exactly three alignments were tested, with unmatched runes unchanged:

| Frozen alignment | Paired runes | D score | D prefix (first 2/3) | D suffix (last 1/3) | S score |
|---|---:|---:|---:|---:|---:|
| Flat body index | 81 | -10.84269254 | -10.88123080 | -10.75944990 | -10.63922075 |
| Same printed line/column | 80 | -10.76933828 | -10.83421324 | -10.62804196 | -10.65515028 |
| Same canonical word/within-word position | 61 | **-10.70770185** | -10.80111179 | -10.62882077 | -10.68170303 |

Raw p33 body scores were upper `-10.72488684` and lower `-10.77512924`. The GP29 trigram model used eight long solved sections; their score range was `[-7.78628801,-7.12420755]`. The held-out solved p56 section scored `-8.52727496`; p57 scored `-7.52209916` but is included in the training set and is not a holdout. Even the best p33 difference channel is 2.18 nats/rune worse than the held-out p56 control and remains far below native solved text. Its preview is non-linguistic. Every prefix and withheld suffix also fails the calibration.

The matched two-section p3 control gave similarly poor D scores (`-10.85544698`, `-10.76426030`, `-10.75839829`); p15 has no upper body and therefore no paired positions. Exact H-inverse reconstruction passed for all three p33 alignments, but that is automatic for this bijective transform and is only an implementation check.

**Disposition:** negative for all three frozen p33 body-value alignments. No p33 plaintext, key, or original-cipher decoder was recovered. Do not add signs, phases, offsets, permutations, alternative segmentations, or extra layers to this branch. The distinct count-only result remains: `115-81=34` selects signed/physical p34 BE; it does not decrypt p33's bodies.

Reproduction: `sims/lp2_p33_their_rise_vertical_difference_gate_sft.cjs`; Windows Node 22 manual SFT [PASS 44629615577](https://github.com/FlareZ123/liber-primus/actions/runs/44629615577).

## Decision

Director #1782 is positive for p33 as a state/checkpoint page and negative for the first prospective p50 continuation derived from `THEIR RISE`.

The evidence boundary is now sharper:

- p33's full source-layout packet is uniquely realized under the charged same-operand/H-orientation family;
- solved p56 independently serializes its two headings into `THEIR RISE`;
- the phrase closes an exact signed-2016 numerical loop `19 -> 25`, with rise6=`a`;
- the precommitted attempt to treat 25 as the next p50 page address fails;
- p33's 81- and 115-rune bodies remain ciphertext: Issue #1932 rejects the three frozen H body-value alignments, with no key or plaintext. Their authored counts still have a separate licensed navigation consumer: `115-81=34` selects signed/physical p34 BE.

Do not reopen p33 H phases, repeating keys or the failed address25 page-pointer route without a new authored selector.

## Reproduction

- Family/holdout SFT: `sims/lp2_p33_layout_family_holdout_sft.cjs`
- Windows CI: [PASS 44455554240](https://github.com/FlareZ123/liber-primus/actions/runs/44455554240)
- Hidden-text serializer SFT: `sims/lp2_p33_totient_hidden_text_sft.cjs`
- Serializer Windows CI: [PASS 44454927901](https://github.com/FlareZ123/liber-primus/actions/runs/44454927901)
- Upstream state report: `im-results/lp2-p33-dh-layout-state-register.md`
- Signed-source collision report: `im-results/lp2-signed2016-gp0-collision-dh-state.md`
