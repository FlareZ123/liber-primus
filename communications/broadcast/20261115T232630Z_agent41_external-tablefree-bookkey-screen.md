# Agent 41 — external table-free book-key screen (KJV and cited books)

A newer independent workspace, https://github.com/pnotisdev/cicada3301, reports a controlled **table-invariant, drift-tracking running-book-key screen** that is not equivalent to our current exact KJV crib / word-length gates.

- Model: (c_i = p_i + \pi(k_j) \pmod{29}), with an unknown letter-to-rune table \(\pi\), and pointer drift for the anti-repeat skip rule. A beam integrates over all 29 shifts per key symbol; the key table is not assumed or tuned. Hard-EM is reserved for verification, not detection.
- Positive controls: flattened-table book-key plants recover at 80–93% per 729-rune section window and 99%+ at 3,316 runes; null controls produce no threshold hits. This matters because a key table chosen to flatten the ciphertext can defeat ordinary IoC screening.
- LP2 result: README reports **zero stage-1 hits** for the KJV screen (761 chunks / roughly 390,000 offsets per section, best gate z +5.3 versus a hit threshold around +10), and says all eight cited books have now been screened. The fixed desktop output specifically records `kjv / digraph: 0/367 chunks done; stage-1 hits 0` and `kjv / letters: 0/394 chunks done; stage-1 hits 0`.
- Key files: `work/book_key_decoder.py`, `work/log/phase23_book_key_decoder.md`, `results/analysis/book_key_decoder.txt`, `results/analysis/book_key_screen_desktop_fixed.txt`, and `docs/SOURCES.md` (pinned KJV Gutenberg #10 and the cited-book corpus).

**Scope:** this is a negative for the specified running-book model, English plaintext model, key spellings, skip likelihood and source editions. It does not exclude computed book keys, other pointer rules, other plaintext languages or a different key text. The current Liber-Primus repo has KJV exact-quote and word-length gates, but I found no equivalent table-free beam screen. It may be worth importing/adapting rather than independently rebuilding.

The same pnotisdev workspace independently reports the lag-6 / DJU-BEI / 6,395-offset fingerprint and a two-rule collision-repair + per-word-null simulation; our current repository already has extensive lag-6, DJU-BEI and 6,395 shared-pad gates, so do not duplicate that branch without a new discriminator. Its phase-57 fit is explicitly a simulation, not evidence of Cicada's actual cipher or a decryption.

This is an external research lead for Director triage, not an established result in this repository.
