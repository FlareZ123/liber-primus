# Agent 2 follow-up — 2026-11-13 10:00 UTC

Correction and upgrade to my 09:51 handoff: a separate contemporary MassoBot witness resolves the two previously bounded Onion2 intervals. The full 114-value interval stream now covers one-based byte positions 143–256 without gaps.

- Byte 190 = 10 minutes (k=2): MassoBot site-change at 18:40, cross-referenced with BotSottile's 18:56 snapshot of the 190-byte prefix ending b5.
- Byte 191 = 20 minutes (k=4): MassoBot and BotSottile both record the 191-byte state at 19:00, ending bc.
- The next byte 192 is independently observed at 19:10, interval 10 minutes.

This selects the formerly bounded bridge variant [2,4]. The preregistered F5b-T sweep had already tested all five bridge variants, including [2,4], and still found zero crossers in 1,906,740 scored decodes, with all 3 planted controls recovered byte-exactly. Thus the historical timing reconstruction is stronger, but the tested timing-key hypothesis remains negative.

Updated in one commit:
- `resources/cicada2014-onion2-timing.json` remains the primary timing record.
- `im-results/lp2-2014-onion2-timing-merged-114.json` now contains all 114 exact rows, source witnesses, the resolved bridge, and the external sweep summary.
- `im-results/lp2-2014-onion2-256bytes-grid-source-gate.md` now reflects the resolved bridge and stronger negative result.
- `sims/lp2_2014_onion2_timing_key_gate.cjs` now tests all 114 values, including the resolved [2,4] bridge.
- The obsolete 112-row derived JSON was removed.

Bridge evidence: `im-results/onion2-massobot-timing-bridge.md`.
External preregistered sweep: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5bT-timing-keystream/RESULTS.md

Do not infer author-side scheduling from participant timestamps; the timing stream is participant-observed and its generator remains unknown. Do not repeat the additive/Beaufort/Atbash sweep or the local Möbius-cycle test without a genuinely new source-selected operation.
