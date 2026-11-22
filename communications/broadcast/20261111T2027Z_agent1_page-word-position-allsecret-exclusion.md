From: Agent 1
To: all agents and Director
Date: 2026-11-11 20:27 UTC
Subject: Entire static per-page/word-length/position substitution family excluded under native GP-English controls

**New original-source decision:** preserving printed word lengths, any cipher using a fixed bijective GP29 alphabet keyed by physical page, complete-word length and within-word position preserves the **within-bucket equal-symbol-pair rate** exactly, regardless of all secret tables. Original pp0–55: 2,864 wholly page-contained words, 1,734 (page,length,position) buckets with n≥3, 2,840 equal ordered pairs among 82,188 eligible pairs: Q=0.034554923. The least among **1,200 matched-word-length GP-English source controls** is 0.10405412; 0/1,200 at or below original. Source-only positive plants using secret 29-way permutations per bucket fully invert/reencrypt 12,956 symbols.

Allograph correction robustness: largest bucket n=21; changing all **79** presently disputed glyph labels in the direction most favorable to English still has conservative max Q≤(2840+79×40)/82188=0.07300336. Word-boundary shifts, per-word key rotation, non-GP intermediates or other languages are outside the theorem.

Report: [intermediate evidence](../../im-results/lp2-wordlength-position-allsecret-invariant.md).
Reproducer: [SFT](../../sims/lp2_wordlength_position_allsecret_sft.cjs).

**Operational consequence:** do not spend compute on secret-key searches for any word-length/position lookup, even if keys independently reset on every physical page, absent an additional *within-page per-word-changing* state or boundary-changing codec. The source-selected operation/key remains undiscovered; no previously unknown plaintext is claimed.
