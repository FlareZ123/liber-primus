# p0 EMPTY/EPIPHANY boundary: split-packet self-index recovers THE; adjacent seven-rune receiver exposes B,p,A

**Agent47, 19 November 2026. Classification: exact reversible local plaintext recovery under a packet operation motivated by the independently selected READOUT receiver. The p0 two-rune word at offsets235..236 decrypts to native-GP THE under a unique small lookup family. The immediately following seven-rune word237..243 remains undecrypted; its ciphertext-only H structure supplies a strong DH holdout. Do not promote DEVOTED until its value-changing inverse is recovered.**

## Source-selected boundary before decryption

The authenticated 2016 sentence is:

`The path lies empty; epiphany seeks the devoted.`

Under the already promoted whole-word GP0 -> zero-based p50 address -> base60 p0-offset navigation:

- `EMPTY` has GP0 92 and p50[92] = **236**;
- `EPIPHANY` has GP0 121 and p50[121] = **237**.

These are exactly the two sides of one p0 printed-word boundary:

- p0 word53: offsets **235..236**, two runes, ciphertext `[8,5]`;
- p0 word54: offsets **237..243**, seven runes, ciphertext `[15,22,16,22,21,1,4]`.

The signed phrase later contains exactly the native-GP length pattern:

`THE` = 2 runes, `DEVOTED` = 7 runes.

The boundary and word lengths were therefore fixed before the packet inverse below.

Separately, the new dual-packet DH cascade recovers `g=5`; p50[g] under the same base60 p0-offset grammar is also **237**, independently returning to the start of the seven-rune receiver. Agent4's EA109 continuation reaches endpoint243 under its already selected post-SHED base59 state. Thus the seven-rune object is now bracketed by independent route states, but its plaintext is still not recovered here.

## Exact two-rune packet inverse

Director #1706 independently selected the split READ | OUT receiver p0 80..102. Its canonical preserved-center wordwise H packet is:

`[19,23,25,4,16,12,9,6,10,14,15,8,24,5,21,5,28,26,22,9,0,18,2]`.

The boundary-selected two-rune ciphertext is:

`C = [8,5] = [A,g]`.

Use each ciphertext value itself as a **one-based index** into the split packet:

`K(C) = [packet[8], packet[5]] = [6,16]`.

Subtract the looked-up key modulo29:

`[8,5] - [6,16] mod29 = [2,18]`.

Native GP29 `[2,18]` is exactly:

`TH,E = THE`.

Forward reconstruction is exact:

`[2,18] + [6,16] mod29 = [8,5]`.

This is a deterministic reversible operation on the original ciphertext. No per-rune key values are fitted.

## Small operation-family charge

On the fixed selected ciphertext `[8,5]`, charge the natural packet-lookup family:

- packet: split or whole;
- lookup direction: forward packet lookup or inverse packet lookup;
- index origin: one-based or zero-based;
- arithmetic sign: add or subtract.

The only configuration that returns native-GP THE is:

`split packet + forward lookup + one-based indices + subtraction`.

The one-based origin is the same convention already validated out of sample by the whole-READOUT sibling `(A,K)->(K,A)`.

## Manuscript-wide control

Across the 55 rune-bearing unknown pages there are **465** complete two-rune words. Under the fixed winning inverse:

`P_i = C_i - splitPacket[C_i] mod29`

with one-based indices, **284** two-rune words are indexable because both ciphertext values lie in1..23.

Exactly **5/284** decode to THE.

The p0 selected word235..236 is one of those five, so THE is not globally unique under the cipher transform alone. The independent EMPTY/EPIPHANY receiver selection is essential.

A second control avoids generic English scoring. Apply the fixed split and whole one-based self-index subtraction rules to every indexable unknown-page word and compare outputs only with the **29 natural prose words** in the authenticated 2016 message, excluding headers, signatures, fingerprint text and numeric artifacts.

There are **1,145** indexable unknown-page words. Exactly **five** outputs equal any authenticated source word. All five are THE under the **split** packet, and there are **no source-vocabulary hits longer than two runes**.

On p0 specifically, the selected word235..236 is the only exact authenticated-prose hit under the two fixed packet rules.

This does not make the transform a page-wide decoder. It makes the source-selected p0 THE recovery a sharply localized, exact inverse.

## Adjacent seven-rune receiver: plaintext-free DH structure

Do not transfer the two-rune rule by force. Direct split-packet self-index subtraction, whole-packet self-index subtraction, and the simplest fixed linear combinations of split/whole lookup values all fail to produce DEVOTED on word54.

The untouched seven-rune ciphertext nevertheless carries a strong source-independent packet structure.

Apply the same canonical H shell to:

`[15,22,16,22,21,1,4]`.

The result is:

`[11,19,21,23,24,8,22]`.

The three pair-sum positions, i.e. even one-based H positions2,4,6, are exactly:

`[19,23,8] = [B,p,A]`.

Across all **214** complete seven-rune words on unknown pages:

- only **5** have all three H pair sums inside the fixed seven-value DH23 set;
- exactly **1** has the ordered triple `[B,p,A]`;
- that sole hit is the independently selected p0 word237..243.

This is ciphertext-only evidence that the DEVOTED receiver is carrying the same DH state architecture. It does not yet reveal the remaining value-changing rule.

## Decision

The strongest defensible local plaintext statement is now:

> Given the independently selected EMPTY/EPIPHANY p0 boundary and the independently selected split READOUT H packet, the exact self-indexed one-based subtraction rule recovers **THE** from original p0 ciphertext offsets235..236 and reconstructs the ciphertext exactly.

The adjacent seven-rune word is strongly state-structured and independently bracketed, but **DEVOTED remains a fixed crib awaiting an actual inverse**.

The next productive target is therefore narrow: explain how the packet/state transition changes at the 236/237 boundary so that the seven-rune receiver can be inverted without per-position tuning.

## Reproduction

Run:

`node sims/lp2_p0_boundary_the_packet_selfindex_sft.cjs`
