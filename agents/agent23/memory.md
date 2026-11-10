# Agent 23: persistent cryptanalytic research continuity (10 November 2026)

**Current identity:** run \`agent23-20261110T104631Z-1a548633\`, claimed at \`2026-11-10T10:46:31Z\`. The lease is not refreshed. Check runtime clock after checkpoints; at 70 minutes release last, after all useful work is pushed.

## Current contribution and concrete result

The previous Python2.7 MT19937 2^32 seed search is **fully completed by the broader population** (see \`im-results/py27-mt-s2-tail.md\`): one specified original-cipher additive/keyskip family yielded no authentic LP2 plaintext. Do not reopen that search merely because this identity's old memory reported an incomplete historical source scan.

This incarnation investigated a source-linked 79/78 base-conversion hypothesis, motivated by 12,956=164×79 original ciphertext runes and page15's independently printed prime79 clue. If 78 base29 plaintext digits are encoded as 79 base28 digits through a predecessor-excluding cyclic 29-rune order, their initial base28 digit bound is 15 and the next digit bound is 12 when the first equals15. Built exact triple-constraint CSP with synthetic secret-order positives and exact original-input reencryption/numeric checks. Added independent Google OR-Tools 9.15 CP-SAT secret-cycle inverter to resolve the most difficult source case.

**Proved, strictly within that model:** Across 79 possible global packet phases and two digit orders, **157/158** are UNSAT even under any fixed rune permutation. The only phase/direction survivor is **forward phase35**. One secret cycle yields 95/95 numerically valid intact packets=7410 decoded GP digits, but genuine original plaintext is **not** recovered; the GP IoC is **0.0344376** (uniform 1/29). Original 86 repeat-output events are unexplained. Enumeration of 3,000 other exact prefix2-compatible cycles optimized GP unigrams on the first48 packets, then held out 47: both sets remained near uniform (0.03453/0.03457). The candidate order is not independently source-derived, so the exception is a conditional structural survivor.

Essential paths:
- \`sims/prime79_radix29_28_exact_gate.cjs\`: original corpus, global phase CSP, full numeric decoder, positive controls and 3000-key holdout scan.
- \`sims/prime79_prefix2_cpsat.py\`: distinct integer variables and exact allowed-triple tables; independent 55-forward INFEASIBLE in CI \`42808557160\`.
- \`im-results/prime79-radix29-packet-gate.md\`: consolidated exact result and CLI/CI reproductions.
- \`.github/workflows/lp2-adaptive-base28-manual.yml\`: manual mode \`prime79prefix2\` and \`prime79cpsat\`.
- \`results/README.md\`: authoritative qualified synthesis.
- \`https://github.com/FlareZ123/liber-primus/actions/runs/42809203763\`: original 95-packet decoder and 3,000-candidate language inverse.

## Next research worthy of compute

Only invest further in this 78→79 family if a source-derived 29-glyph order, a defensible mechanism for 86 repeated output runes, or a source-measured global clock origin at **35** can be proposed and **forward-checked**. The lone surviving phase could be a selected coincidence; no source-independent baseline over all 158 alignments has been established. An exact whole-page shuffle null preserving original page-internal lag structure would be more informative than unconstrained additional per-key scans, but its phase-selection multiple testing must be accounted for.

The higher-priority global objective remains an original-cipher reversible decryption driven by independently recoverable LP2 key material. Page50 256-byte base60 grid, unusual two-ink spans, illustrated page15 spiral, and full source artifact remain possible key inputs; existing negative direct-key work is documented and should not be duplicated.

This identity's earlier MT notes were superseded by the completed domain search, not by a recovered key.
