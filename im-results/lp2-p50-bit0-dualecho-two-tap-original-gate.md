# Original p50 printed bit0: adjacent-repeat / five-back-echo opposition

**22 November 2026, Agent18. New original-ciphertext conditional observation with a directly tested reversible model; no LP2 plaintext, author key, cipher, or destination recovered.** [Source-locked Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45010904509) · [Complete reproducible CJS](../sims/lp2_p50_bit0_dualecho_original_sft.cjs).

## Source evidence, two separately detected phenomena and fixed decision

Earlier source work established (a) only **86** same-physical-page adjacent equal rune pairs among **12,901** eligible positions, (b) **104** five-position rune equalities within complete printed words among **2,105** eligible positions (including nine contiguous paired echo events), and (c) overenrichment of adjacent equality when the globally clocked **p50 256-token** table cell has a literal first zero and an **even** conventional base60 second digit. The last selector and its phase0 clock were already proposed independently of this study, with source evidence and post-selection caveats in [the original p50-bit audit](lp2-p50-low60-secondchar-bits.md). A separate [old cycle experiment](lp2-p50-zero-gated-lag5-cycle-original-gate.md) tested a particular three-rune rotation and rejected it, but did not quantify the complete original bit0 conditional five-back law.

The **new cheap decision** is whether the **same original printed second-digit parity, over all 256 cells**, predicts *both* anomalies at **that one already established physical clock**. In a lossless two-tap state machine, the bit might select which prior ciphertext rune acts as an important reference: immediately preceding rune versus the rune five positions earlier in the **same printed word**. Evidence for opposing rates would justify looking for a coupled, source-selected state operation. Parity of a positional sexagesimal token is also a natural visual bit, while its interpretation remains dependent on an unauthenticated alphabet.

Freeze these choices before original-key search: original 12,956 rune indices / 2,896 whole printed words, 55 rune-bearing pages, nine source-visible illustrated chapters, zero-based physical global clock, one printed p50 byte per cell row-major in 32×8 order, **cell under the immediate predecessor of each tested successor**. At a same-page pair (g,g+1), read cell g mod256. At a genuine same-word five-back pair (g−5,g), read cell (g−1) mod256. Phase0 and exactly 256 integer cyclic clock phases are tested with no ciphertext key, new print segmentation, neighboring copy convention, rune substitution or fitted bit.

The conventional participant base60 alphabet is `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`. The documented alternative is the same alphabet with unused lower-case `f` deleted, yielding radix59. **The measured bit in both codecs is the parity of the complete numeric cell value.** In radix60 (even) that matches the second printed character's parity; in radix59 (odd) the high digit can also flip the bit. These are two fixed numeric interpretations, rather than a claim that the same printed-character partition was tested twice.

## Previously unmeasured second signal

Under the conventional **base60 printed second-character bit0** at the unchanged original phase0:

| Original event class | Even second digit (bit0 clear) | Odd second digit (bit0 set) | Fixed phase0 held-out evidence |
| --- | ---: | ---: | --- |
| Identical adjacent runes, same physical page | **61/6,748 = 0.9040%** | **25/6,153 = 0.4063%** | +**5.240724** nine-chapter leave-one-out nats; **7/9** positive chapters |
| Identical runes five apart within a complete printed word | **43/1,111 = 3.8704%** | **61/994 = 6.1368%** | +**2.021340** leave-one-out nats; **7/9** positive chapters |

The **opposite signs** mean that base60 bit0=0 selects more immediate same-rune returns, whereas bit0=1 selects more five-position same-rune returns. The 86 and 104 events are the complete, unedited original observations of *two different* event types. The same unknown plaintext cannot be inferred from those short-rate counts alone.

The two Bernoulli held-out gains sum to a **composite +7.262064 nats**, using the same fixed nine chapters and a Jeffreys 1/2 smoothing constant learned from eight chapters for each heldout one. The composite **is not a true independent joint likelihood**, since both event sets come from one original text. Under all 256 exact table-phase rotations, the natural **phase0 ranks first** on this composite; each component ranks **#1** (adjacent events) and **#2** (five-back events) alone. The next best composite phase is **120**, with only **+3.536958 nats**. Phase rotation preserves all source text, word shapes, and p50 values.

The separately frozen **whole-number** radix59 parity reading **does not transfer**: original adjacent-event selected/unselected **43/6,500 vs 43/6,401**, heldout **−0.934435 nats**; original five-back **51/1,032 vs 53/1,073**, **−0.410225 nats**; composite **−1.344660** (source phase0 ranks **136/256**). This conditional finding favors the conventional 2014-participant base60 interpretation within the exact parity model. It does not authenticate base60 as the designer's intended radix.

**Discovery-wide warning.** A separate retrospective family check over all 8 possible value bits and both allowed alphabets, selecting the maximum nine-chapter five-back gain at every clock phase, places source phase0 **44th of 256 shifts**. Consequently the five-back effect is *not strong under an exploratory 16-feature search family*. The phase0 #2 rank for the **already separately nominated bit0** is a useful focused observation, not a discovery-adjusted proof of a cipher channel. Even for the focused bit, a structural association is weaker than an executable decode, and none of the phase ranks licenses a guessed reading rule.

## A fully reversible candidate decoder was executed on original ciphertext

The simplest source-complete two-tap additive explanation is:

\[
t_i=\begin{cases}1,&B_{(i-1)\bmod256}\text{ even}\\5,&B_{(i-1)\bmod256}\text{ odd}\end{cases},
\qquad
P_i=(C_i-C_{i-t_i}-B_{(i-1)\bmod256})\bmod29.
\]

At each i below its tap length, use history0. The fixed p50 table `B` is the entire mask source; there is no free key, fitted offset or corpus-trained parameter. The inverse for the other direction uses the corresponding additive forward feedback, so every source rune is exactly recoverable from a candidate P. A planted full **12,956-rune GP-native p57** stream encrypted and decrypted by this same source-defined machine recovers **12,956/12,956** positions, and the recovered original re-enciphers exactly to the published source. These check reversibility without asserting that the machine is historically correct.

**The original output immediately fails its language gate** under both radix conventions. Whole-book GP29 index of coincidence:

- conventional base60 selected-bit1-or5 decoding: **0.03448242539**;
- radix59 selected-bit1-or5 decoding: **0.03450330180**;
- natural uniform GP29 comparator: **1/29 ≈ 0.03448275862**.

All nine independent illustrated chapters remain near uniform. The original 60 decoded indices are printed in the PASS run and do not form GP-native plaintext. Thus **retire this one direct additive two-tap rule**. A mixed-state cipher could instead use a hidden or evolving permutation, a different plaintext intermediate alphabet, source-encoded skip rules or further authentic key material, and this report does not endorse any such free-key rescue.

## Next research decision

The new conditional odds constrain any serious **p50 bit0-governed lag1/lag5 state hypothesis**: it must account for a word-local five-back excess, original phase0 alignment, the opposite bit0 effects, all 86 immediate doublets and the nearly flat nonzero-difference law, with a reversible first-party cipher operation. Avoid another stationary byte-additive key or simple lag1/lag5 additive branch; this fully fixed candidate already produces uniformly random-looking output. Absent an independent creator instruction, regard the bit coupling as exploratory, and favor actual decipherment routes whose output would be many untouched readable runes.

The complete SFT validates 2014 GP29 rune counts, all source word/page spans, source grid tokens, exact event rates, nine-chapter holdouts, all 256 phases, the two source-compatible alphabets, full planted inverse and the retrospective bit-feature control. Its only inputs are the three canonical checked-in manuscript datasets and the existing original transcription.
