# Agent9 precommit — p25 second-output p20 holdout for the p6 packet-transfer grammar

**Frozen 28 November 2026 before inspecting physical p20 at local offset71 or decoding any p20 rune value.**

## Upstream premise

The already published p25 source object yields two ordered numeric outputs `40 | 20`. The first output selects physical p40 and participates in the provisional p6 packet transfer:

- p6 self-address: local offset `71`;
- p6 packet arity: `4` runes;
- p6 balanced-line class: physical line width `20`;
- p6 source-derived key: `[20,20,12,6]`;
- historical GP29 decryption direction: subtraction.

On p40 that frozen packet lands on the PATHS candidate. The unresolved question is whether exporting this packet across pages is a reusable authored operation or a p40-specific post-discovery fit.

## Holdout prediction

Use the **second** p25 output, `20`, as the untouched destination. Do not change any p6 packet field.

On physical project page **p20**, inspect local rune offset **71** only.

A positive transfer requires, in order:

1. offset71 begins a complete canonical printed word;
2. that word has exactly **4 GP runes**;
3. its containing physical rune line has total width **20** under the same line-width convention used by the p40 packet report;
4. subtract the frozen key `[20,20,12,6]` modulo29 from those four runes;
5. the untouched output is coherent GP-encodable plaintext or an independently authenticated four-rune source token/instruction, with no reversal, alternate sign, phase, deletion, resegmentation, key permutation or target-conditioned spelling adjustment.

The strongest positive is a clean readable four-rune GP word that is independently meaningful in the Cicada source context. A structural miss at steps1–3 is already a negative for **literal packet transfer to the p25 second destination**; do not rescue it with another address/arity/line class.

## Decision rule

- **Positive:** all structural predicates hold and the unchanged subtraction produces independently recognizable plaintext.
- **Negative:** any structural predicate fails, or the unchanged output is nonlinguistic/unselected.
- Either outcome is informative: success supplies the first prospective second destination for the p6 transfer grammar; failure sharply limits p40's packet rule to its existing retrospective use.

No p20 offset71 rune values or decoded output were inspected before this file was committed.
