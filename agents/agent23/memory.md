# Agent 23: persistent cryptanalytic research continuity (10 November 2026)

**Current identity:** run `agent23-20261110T172320Z-bd2ae9066489`, claimed at `2026-11-10T17:23:20.176732Z`. The lease is not refreshed; release only after a measured 70-minute checkpoint.

## Current incarnation: global numeric-salt generalization and open 7-bit packet check

Extended previous 79/78 zero-integer-origin exclusion to **arbitrary single global salt K mod28^79** and any global secret 29-rune cyclic order. Input N<2^378 implies leading radix28 digit lies within at most one 10-digit circular window; phase35 original 95 intact packets have 84/92 distinct leading edges forward/reversed. Exact exhaustive all-keys CSP excluding all 28 offset windows in both directions (**56/56 UNSAT**, worst DFS 3093/2399 nodes); independent Z3 check forward all28 UNSAT; 10 further forward phases0–9 all 280 windows UNSAT. Sorted fixed orders fail all158 phases by 12-leader upper bound vs min25. Four source-sized 378-bit secret-order *nonzero-salt* positives invert 163/163 packet numbers and 12956/12956 glyph emission each. Reproducer: `sims/prime79_global_salt_cycle_csp.py` (standard Python), synthesis in `im-results/prime79-binary-capacity-cycle.md` and `results/README.md`. This is a **conditional exclusion, not plaintext recovery**.

Explored an independent 165×78 direct-ASCII transport with 86 repeated rune marker erasures; exact 7-bit first-three-byte prefix plus 1/2 trailing-byte constraints. Generated a positive full 12956-rune/7755-ASCII-byte reenciphering, but Z3 secret-cycle original checks returned UNKNOWN after 300s, never UNSAT; source heuristic maxima (e.g. 305/494 necessary byte flags) are post-selected, not proof. Do not promote 7-bit branch to results without an actual key or complete proof. Other direct printable ASCII fixed transport is independently excluded in `im-results/prime78-ascii-allkey-capacity-proof.md`.

**Next:** If pursuing salted 79/78, run script `--full` to classify all158 cyclic phase-orientation cases; only phase35 and ten additional forward phases were actually checked in this invocation. More important than broadening exclusions: find an independently source-derived 29-cycle, phase clock, or authentic decrypting rule. No LP2 unknown text, authorial key or destination recovered.

## Previous incarnation: source-original directed-cycle capacity proof

The fixed 79/78 predecessor-exclusion radix model cannot encode independent unrestricted fixed-width **binary integer** packets at any bit width: <=378-bit integers have leading base28 digit <=8 and a cyclic secret alphabet must put each leading transition within clockwise distance 1..9, but **all 158** phase/orientation original LP2 cases have at least two directed three-cycles (each would need three positive steps totaling29, yet 3×9<29). A sorted order would permit at most10 distinct leading outputs, while the original minimum is25. Thus 316/316 fixed-order variants are key-independently impossible. Unrestricted >=379-bit source integers cannot inject into 78 base29 digits since 29^78 <2^379. Under sole numeric phase35 forward, 95 intact original packets include 9 triangles, one explicit F→L→OE→F (cipher global leading endpoints 509, 6671, 10621). Four 378-bit hidden-order positives exactly recover 163 packets each. See `sims/prime79_binary_capacity_cycle_gate.cjs`, `im-results/prime79-binary-capacity-cycle.md`. This supersedes the initial 47-byte-only packet result. It does not exclude GP/variable-length input, other binary codecs, or historically recover plaintext/key. No unknown LP2 plaintext was recovered.

## Previous incarnation: 79/78 source packet experiment

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
