# Paired-insect chapter: exact two-lane known-key inverse (#2690)

**Decision:** retire the specified odd/even alternating WELCOME/KOAN key transfer. Both assignments are algebraically impossible; no unknown plaintext or key has been recovered.

## Frozen source and receiver

The p24–26 paired insect illustration is a half-turn copy relationship (#2675); it motivates two streams weakly, without selecting a traversal or proving encryption. Use the entire physical p23–26 chapter, 213/270/273/265 GP29 symbols (1,021 total), split by zero-based chapter index parity, preserving order and all runes. No word boundary, reversal, offset, phase tuning or other arity. Lane lengths 511 and 510. The canonical corpus and native source witness are `resources/liber-primus/lp2-corpus.json` and `resources/external/relikd-solved-gp29-native-v1.json`.

The historical GP keys are DIUINITY = [23,10,1,10,9,10,16,26] and FIRFUMFERENFE = [0,10,4,0,1,19,0,18,4,18,9,0,18]. Each lane starts phase zero independently. A plaintext F=0 emits 0 and holds; all nonzero plaintext p emits (p+k[j]) mod29 and advances j. This includes a nonzero p that generates ciphertext zero. For observed c, the inverse allows (0,j) iff c=0, and ((c-k[j]) mod29,j+1) iff that plaintext is nonzero. Propagate every reachable phase; accumulate exact BigInt path counts. An empty state set proves impossibility for that prefix regardless of language, word order interpretation or later glyphs.

## Original ciphertext decision

All indices and phases in this table are zero-based.

| Lane | Assigned key | First impossible lane offset | Chapter offset (p23 local) | Cipher index | Last reachable phase | Shift |
|---|---|---:|---:|---:|---:|---:|
| even | DIUINITY | 5 | 10 | 10 | 5 | 10 |
| odd | FIRFUMFERENFE | 14 | 29 | 10 | 1 | 10 |
| even | FIRFUMFERENFE | 99 | 198 | 1 | 4 | 1 |
| odd | DIUINITY | 7 | 15 | 26 | 7 | 26 |

The first assignment therefore fails by chapter offset10, the exchanged assignment by offset15. Every individual lane/key pairing also fails before p23 ends. At each contradiction, the only surviving phase would require plaintext F but the nonzero cipher rune cannot be a transparent F. The original receives no language scoring or fitted key. No new cipher layer or offset is inferred.

## Controls and reproducibility

Two independent solved-native donor sections (first 511 runes of `0_koan_1`, first 510 of `0_loss_of_divinity`) form two matched-length plants with exchanged key assignments. These two plants share donor tapes; they are not four independent literary draws. The trigram backoff model excludes both complete donor sections. Decode the first 75% independently, freeze terminal phase and last two plaintext symbols, and decode the remainder without revising the prefix. Truth is used only to measure recovery after decoding. Exact forward replay is mandatory.

- Both assignments pass full phase reachability and decode all 2,042 planted rune instances exactly, including **512/512 withheld**. The four lane plants include 40 generated ciphertext zeros and 30 literal F holds.
- Complete path counts are 3,888/60 and 3/240 respectively. Thus phase feasibility alone does not identify plaintext, even for known keys; the frozen language model resolves these particular controls.
- Exchanged wrong keys fail all four lane controls. Sixteen independent deterministic pseudorandom uniform pad pairs fail both lanes (32/32).
- Authentic p56 AN END re-encrypts all 85 original runes exactly with consecutive prime-minus-one shifts and the same literal-F hold convention (one held F); this is a separate historical emission-law control.

Run from repository root:

```
node sims/lp2_p23_26_two_lane_knownkeys_sft.cjs
```

[Executed raw results](lp2-p23-26-two-lane-knownkeys.json) · [Standalone CommonJS reproducer](../sims/lp2_p23_26_two_lane_knownkeys_sft.cjs). The experiment was executed against the live repository source contents using the same JavaScript function embedded in the checked-in SFT; no Actions run was needed.

**Scope:** this excludes only the two frozen known-key, chapter-zero, odd/even independent-lane receivers. It does not establish that the insects are decorative or exclude an independently selected traversal, a different key, or another cipher. A successor would need an actual source-derived operation or key selector; do not widen the parity/key grid merely because the present transfer failed.
