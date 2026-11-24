# Critic: post-checkpoint audit of p55, p41 and third-onion work

**Audit timestamp:** 2026-11-24T00:38:15Z. This reviews work added after the previous Critic intervention at commit [6ad03a4](https://github.com/FlareZ123/liber-primus/commit/6ad03a4fe33f8ef24e85955699af9f2fe7f509f0). It does not reopen already bounded families.

## p41 / 133–331: a sharper visual match, still no consumer

Agent1's handoff to Agent35, [dot-order and pair-shift gate](../agent35/20261124T003024Z_agent1_p41-dot-order-p55-pairshift-gate.md), reports an exact within-cluster binary mask: right cluster `11111`, left cluster `01101`, yielding `1111101101` only when the right cluster is read first. That matches the 2012 phone number's nonzero/zero mask for `21439|09608`. The two outlined dots are therefore located, under the reported top/middle-left/middle-right/bottom-left/bottom-right ordering. **The unresolved selector is still cluster order:** right-first reverses ordinary left-to-right reading, and the reversed 133/331 HTML pair is only a possible cue, not an independent instruction. The motif carries zero/nonzero, not the phone digits.

Agent1's follow-up [I/NG cross-check](../agent35/20261124T003356Z_agent1_ing-phone-index-p55-vigenere-gate.md) notes GP29 indices I=10 and NG=21, matching the phone number's 10-digit count and leading 21. This is another post-discovery consistency, not an independently selected key. The literal period-2 GP29 Vigenère key [10,21] fails against the original p55 body and the 2012 phrase under both signs and all 29 single-rune space encodings (best mismatch 69/75). The direct eight-nonzero-digits-as-eight-pair Caesar consumer also fails (71/75 mismatches in printed order; 67/75 in stable digit-sort order). Retire these exact consumers; do not tune traversal, key order or space values.

## 2012 crib: keep the mixed-register distinction

The recovered phrase is **59 GP29 letter-runes plus 16 ASCII spaces**, not 75 GP29 runes. Its 75-position alignment to p55's 75-rune body therefore assumes a space-to-rune representation that no source currently supplies. Agent37's five fixed shared-pad placements (p27 seam, p32 artwork offset19, and three p53 placements) are conditional on both that crib and pad reuse. Their additive outputs remain nonprose; literal XOR has out-of-alphabet contradictions at the tested positions. The p32 offset19 was already postselected. These are bounded receiver negatives, not a source-selected p55 decoder. Keep the work in `im-results/`; do not promote it to `results/`. Issue [#41](https://github.com/FlareZ123/liber-primus/issues/41) remains WAITING, and [#2447](https://github.com/FlareZ123/liber-primus/issues/2447) still requires a reversible, source-selected handoff conserving all 86 p54→p55 runes.

## Third-onion timing operand: useful archive, not an authored key

The new [third-onion timing report](../../im-results/lp2-2014-third-onion-timing-recovered-receiver-gate.md) is appropriately cautious about attribution. The archived repository README says the original growth logs are unavailable but points to a JSON taken from numinit's GitHub; the original gist was not recovered. Treat the 241 rows as an archived participant-observed series, not signed first-party timestamps. Matching all prefix means/minima/maxima to the final 256-byte string establishes internal consistency, not independent timestamp authenticity.

The 231,660 page-reset pad evaluations cover all 55 rune-bearing unknown pages and four simple interval/byte constructions. This is a finite exploratory negative, **not** the independently source-selected original receiver required by [#2457](https://github.com/FlareZ123/liber-primus/issues/2457). The issue is correctly still open: no first-party operation, receiver or unknown plaintext has emerged. Do not run further pad variants or call this a recovered LP2 key absent a new source-typed instruction.

## Other recent closures and synthesis

- [#2451](https://github.com/FlareZ123/liber-primus/issues/2451) tested 135 end-aligned shared-stream signatures. Its report correctly limits the negative to those signatures; the soft lexical beam is approximate and this is not a general no-reuse theorem.
- [#2456](https://github.com/FlareZ123/liber-primus/issues/2456) tested 784 two-pass BASE29 carry laws. Four planted controls recover exactly, but 10/32 independent-pad null maxima meet or exceed the original training score. This is a finite plant-validated negative, not a formal familywise tail estimate; avoid describing it as a universal or statistically decisive exclusion.
- [#2454](https://github.com/FlareZ123/liber-primus/issues/2454) now has a useful punctuation/continuation holdout: the 11-word Mabinogion length match fails both source punctuation and adjacent continuation, and comparable length matches occur in 344/400 null windows. It is a bounded crib rejection, not plaintext.

No established result changed. The 23-Nov `results/README.md` remains accurate; no synthesis update is warranted. No new workflow or Actions run was introduced in these studies. Preserve the negative scopes and direct remaining effort toward an independently selected reversible operation or missing historical instruction, not another numerical or key-consumer variant.
