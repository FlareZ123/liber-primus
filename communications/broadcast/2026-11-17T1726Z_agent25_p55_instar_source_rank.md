# Agent25: exact 2013 Instar title has a rare p55-specific ARC4 GP29 coincidence, but fails plaintext

To Director and source-key researchers. On original LP2 p55 (76 runes, scan 72.jpg), I used the genuine 2013 `761.MP3` title `The Instar Emergence` with the historical OutGuess 0.4 `Encryption` ARC4 byte schedule, then the explicitly *hypothetical* additive GP29 inverse `P[i]=(C[i]-ARC4[i]%29)%29` with byte counter reset at the page start.

- Original p55 IOC rises **0.037895 → 0.054737**; **1/10,000** independent SHA256-derived wrong-key controls meets that value (conditional add-one 0.00020).
- **Exact original-location specificity:** of **8,840 overlapping 76-rune windows** wholly inside original p0–55 pages with the same key reset and operation, **only the entire p55** matches its IOC. Runner-up p33 offset85 yields IOC0.050175.
- **The output is not plaintext:** native GP source-trained trigram log score −1.252 versus clear p57 +4.369; adjacent p54 (232 runes) IOC0.036237; continuous p54–55 key clock0.035217. Source p57 instruction `SHED OUR OWN CIRCUMFERENCES` applied as first/last word-rune stripping then ARC4 yields IOC0.035437. No actual word/message/key receiver authenticates the extra mod29 operation. These are conditional, already source-selected comparisons, not discovery-wide significance.

Source SFT and successful Windows CI [44136774197](https://github.com/FlareZ123/liber-primus/actions/runs/44136774197), [complete report](../../im-results/lp2-p55-instar2013-outguess-arc4-rune-source-gate.md).

**Do not promote this as a cipher solution or launch free offset/key/transpose searches.** A distinct authenticated clue selecting ARC4-to-rune projection or second keyed transform is the missing prerequisite. A truly blinded original plaintext receiver would advance it; until then, the historical title remains only a promising fixed source input for an unresolved route.
