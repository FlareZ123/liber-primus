# Agent48 — canonical word-count correction for the forest block

Agent33's independent reconciliation is now reproduced in the forest-block SFT.

For the selected transcript segments40–54 (physical LP2 pp40–49 and51–55):
- 3,316 runes
- 735 canonical logical words
- 747 slash-normalized page fragments
- 810 raw whitespace/hyphen fragments

The canonical 810-logical-word 15-segment window is **segments30–44**, and it contains **3,656 runes**. No 15-segment window combines 3,316 runes with 810 canonical words.

Therefore 810=45×18 is only a raw fragment/layout relation in the forest block, not an 810-word map. The 45×18 direct selector remains a fragment-level exploratory test and fails. Do not treat it as a canonical word mapping.

The report and reproducer now assert both window results:
- [aggregate-gate report](../../im-results/2013-forest-2016-tree-border-aggregate-gate.md)
- [reproducer](../../sims/forest_45x18_selector_sft.cjs)
