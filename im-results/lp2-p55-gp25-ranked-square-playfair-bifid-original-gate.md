# P55 source GP25 and p50 ranked 5x5: frozen Playfair/Bifid original receiver decision (17 November 2026)

**Decision:** The directly source-visible p55 25-symbol support does not, by itself, identify a 5x5 cipher alphabet. A single p50-derived square, converted to a 25-cell rank key without requiring the speculative base59 interpretation, produced no original p55 prose in the frozen Playfair/Bifid family below. No authentic p55 plaintext, source-selected inverse or unknown key is recovered. This is a finite receiver test, not a rejection of all square ciphers.

## Independent source observations

The canonical 76 LP2 p55 original ciphertext runes (original JPEG 72.jpg, source transcription `resources/liber-primus/lp2-corpus.json`) contain exactly 25 distinct GP29 runes. The four absent GP29 indices are `[3,9,16,26]`, transliterated `O,N,T,Y`. Removing the first p55 rune (which carries a word from p54) leaves 75 runes with the **same 25-symbol support**. Original p55 IoC is 0.037894736842105266.

Under the p50 32x8 table, zero-based rows21–25 and columns1–5 yield the previously proposed source-selected candidate 5x5 with 25 distinct numeric values. The top-left/top-right/bottom-left/bottom-right values under conjectural radix59 are 224/115/73/75; the physical manuscript encodes them in base60, and no source selects switching to base59. **Critically, simple rank-ordering of those 25 source numbers is unchanged under radix59 versus authentic base60**, so the experiment below has no radix-selector dependency. The square coordinates themselves are still a retrospective p57 clause-ordinal construction, not an authored key instruction.

The same 25-symbol observation is moderately common in comparably short ciphertext. Across **all 8,840** contiguous, within-physical-page, 76-rune windows on original unsolved LP2 p0–55, **560** contain exactly 25 distinct symbols, and **734** contain at most 25. This conditional baseline does not address post-selection of p55 length, candidate squares or multiple ciphers.

## Single complete inverse family

Frozen construction in `sims/lp2_p55_source5x5_playfair_bifid_sft.cjs`:

1. Sort the 25 GP rune indices observed on original p55. Map them in order to the conventional Latin25 `ABCDEFGHIKLMNOPQRSTUVWXYZ` (J omitted). This mapping is data-dependent and **not authenticated**.
2. Sort the 25 source square values ascending and descending. Map numeric ranks to Latin25 symbols to fill the original 5x5 cell positions; apply eight physically natural rotations/reflections.
3. Run 16 complete 76-rune Playfair inverses and 128 Bifid inverses over either p55 full76 or trailing75, using prespecified periods 5,25,75,76. Preserve each exact original input, orientation, direction and period. Verify full original ciphertext reconstruction and a native Latin25 planted positive for every model.

**Windows Node 22 manual CI PASS** on the original committed SFT: [run 44158926015](https://github.com/FlareZ123/liber-primus/actions/runs/44158926015), commit [9a6d5bf](https://github.com/FlareZ123/liber-primus/commit/9a6d5bf5549c12e08dc4cceb402e0ee4a0fdc7d4). All 144 models were internally reversible and all 144 independently planted text controls passed. Every original decode remains nonprose. Highest Playfair normalized IoC **0.0484210526**, plaintext-rendering `PEILHXMXLGQRCUHPSMXQWOTMIHHFLWYPXCKRLGDSWBAXQKQFEILRYDXLKUUULXUTYKLIYXUSPMFL`. This visual output is Latin25 under the trial symbol mapping, not authenticated GP plaintext.

## Next decision

Do not vary the p55-picked GP25 mapping, 5x5 offset, numeric alphabet or arbitrary periods to rescue this family: such degrees of freedom are not independently selected by the source. A new first-party pointer to a particular 5x5 alphabet and reversible operation, with at least a complete intelligible original excerpt or independently checkable typed object, would be new evidence. The 5x5 numerical square's previously documented DH/PARABLE arithmetic remains a separate, unconfirmed hypothesis.

Related stronger existing p50/p55 original gates: `im-results/lp2-p57-find-must-base59-dh151-35-primitive-root.md`, `sims/lp2_p50_clauseprime_square_p55_hill_sft.cjs`, and `results/README.md`.
