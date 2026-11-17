# Agent14 — current handoff (17 November 2026)

## Lease and run
- Normal issue-directed research; required cryptographic RNG draw **9/12**.
- Run ID: `agent14-gpt6-20261117T045941Z-draw9-issue-1335-61c622ddc8`.
- Immutable, remotely verified claim: **2026-11-17T04:59:41.677909Z**. Do not renew. Check actual UTC after each checkpoint. Release threshold: **2026-11-17T06:09:41.677909Z**. After that, push useful state, delete only this run's lease as the final repository mutation, verify, and exit.

## Issue #1335
- Claimed after confirming no active claimant. Balanced v2 p55 blind-review packet already exists through #1346.
- Remaining acceptance item is a genuinely naïve human judgment based only on the public packet. AI/model reads, the packet builder, repository-aware agents, and anyone exposed to the source mapping/reveal are disqualified. Available agent tools cannot recruit an unaffiliated reviewer; issue comment records the blocker and asks the maintainer to obtain one. Keep #1335 open; do not fabricate a human result or substitute another model.

## New bounded original-cipher result
- Tested p50 base60 table polynomial / exact H·G divisor `[12,17,11,21,23]` → 252 quotient residues; signed 2013 DH example → affine `T(x)=24-2x mod29`, order 28, fixed H; nine original chapters → nine 28-phase exponent blocks. Direct candidate exponent: `Q[28s+(i mod28)] mod28`.
- Both direct original inverses are uniform-like (IoC **0.03447243998599** and **0.03447035472851** versus original **0.03447839786451**); no plaintext. Exact re-encryption and repeated solved-p57 positive plant pass.
- Solved-p56 literal-F/no-key-consumption extension: set-valued propagation grants all 28 starting phases independently per chapter and both literal-F and ordinary-non-F branches at ciphertext F. **All phases die** in every chapter; first impossible positions for any start (1-based): **342,160,155,180,163,184,124,104,158**. Positive F-bypass p57 plants retain the true phase and round-trip in all nine chapters.
- New lag-six combination: tested `C[i]=T^{q_i}(C[i-6])` and inverse sign on 1,290 within-word pairs, with both chapter-local and word-local phase clocks. Counts (plus/minus): **37/43** and **47/46**, versus uniform reference 44.48; only **2/80** or **1/80** existing fixed-`T` lag-six matches occur at `q=1`. No evidence that Q selects or explains the fixed-`T` echo.
- These are bounded negatives for the exact quotient→T-cycle and quotient-powered lag-six constructions, not a rejection of H·G, signed DH, the independent fixed-T echo, or all uses of Q. Do not repeat these phase/sign schedules.
- Reproducer: `sims/lp2_hg_q252_dh_t28_affine_original_sft.cjs`; report: `im-results/lp2-hg-q252-dh-t28-affine-original-gate.md`. Supporting evidence only; no change to `results/README.md`.

## Older durable Agent14 exclusions
- Fixed Jung *Red Book* p16 scarab/fallen-man running key rejected by original p0, pp23–26 and pp3–7 F-bypass tests: `im-results/lp2-jung-scarab-chapter5-runningkey-source-gate.md`.
- #1322 found no new public byte-preserving 2014–16 Tor target corpus; p56 still lacks validated target URL, hash algorithm and serialization. Avoid repeating the same archive inventories.
- #1327 duplicated p16–21 illustration/text inspection; no independent key/decoder.
- p15 period-16 spiral/GP28 generator was dominated by the broader all-secret phase-16 no-repeat impossibility.
- The 2015 prime-delta candidate reproduces 40 repeated differences but not the missing 12-column algorithm; p27 wing geometry has multiple valid paths; p50 phase192/229 and short YOUA associations have no coherent plaintext; p56 five-dot triangle fails its two extra points; p0 title is 13 red runes, not red8. Preserve the existing supporting reports.

## Next direction
Seek a creator-authenticated instruction or independent source operand that selects a key/state evolution and can decode a blind ≥150-rune original interval with exact forward re-encryption. Prefer new historical evidence or a materially different reversible mechanism over another direct consumer of the tested p50 quotient, static 28-key schedule, phase search, or table-column permutation.
