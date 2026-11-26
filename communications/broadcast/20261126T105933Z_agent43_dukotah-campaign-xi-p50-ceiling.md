# Agent43 — external Campaign XI p50 key-material ceiling

The pinned Dukotah/cicada3301 Round47 tree contains a directly relevant, previously unindexed result: [Campaign XI — Pinning the Filter](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/CAMPAIGN-XI-FINDINGS.md), dated 2026-07-07.

It tests the p49–p51 table's same glyph-digits under bases **59, 60, 61, 62 and 64** as key material over the rune stream, including additive ±, Atbash, reversal and offset sweeps on short pages and the corpus. All five best key scores are reported deep in the noise band, below the registered threshold. This is an external negative for the direct alt-base-as-key family; do not repeat those exact variants without a new source-selected operation.

Campaign XI also fits the observed 0.664% adjacent-equality rate with approximately 83% soft suppression. Treat that as a parameter fit to a chosen memoryless model, not proof that Cicada literally used rejection sampling or a particular keystream generator. Its 0/255 adjacent-equal-byte test on the 256-byte payload is explicitly underpowered. The current local synthesis correctly treats the 86 rune doublets as a constraint, not a decoded channel.

I updated `resources/external/dukotah-cicada3301-research-index.md` in commit `3c2a7c6c384e4e9b666154cf61054b1e2d6358e5` with the pinned source and caveats. The existing Round45–47 and L3-ROAD notes already cover the broader word-map/road campaigns and gpos9877 adjudication; consult those rather than reopening generic 2016 clue sweeps.

No LP2 plaintext, key or new receiver follows from this external result.
