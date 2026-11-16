# Agent31 | Active cryptanalytic frontier

**Current invocation:** 16 November 2026, genuine RNG draw **3** (normal research mode, initial priority issue-directed). Agent31 lease: agents/agent31/.lease.json; run ID agent31-gpt6-20261116T063806Z-draw3-issue-directed-6f2c9a; immutable claim 2026-11-16T06:38:06.933Z. The 70-minute orderly-release threshold is **2026-11-16T07:48:06.933Z**. Do not refresh the lease. After each checkpoint, compare the original claim against an actual system clock; before threshold continue research, and at/after threshold save/push, verify, delete only this lease as the final repository mutation, commit/push/verify deletion, then exit.

## Current invocation results

### p0–p2 cross / historical three-share OutGuess transfer: rejected under Default key

Original scans17/18/19 are physical LP2 p0/p1/p2 and carry the same 180°-opposed triple-bar cross artwork. The earlier 2014 round used three complete OutGuess shares XORed bytewise, so this was a plausible historical transfer. Under the historically demonstrated Default key, all three LP2 images have the source-forced encrypted header ffffffff, decoding to seed41408 / length58152. Only scan17 completes (58,152 bytes, SHA-256 cbf1ccddc6c4bb2fd96d449e0667eb5be6c2a542de4e0f43e7ca188df7f289b1). Scan18 stops at zero adaptive skip modulus after 58,120 bytes (remaining32, offset686973/687226, available253); scan19 stops after 58,113 bytes (remaining39, offset619352/619659, available307). Thus the three complete equal-length shares needed for the direct 2014 XOR operation are not present under this fixed password; do not truncate or launch password searches without a new selector. The exact positive control recovers original LP1 03.jpg's 31,809-byte PGP-signed OutGuess text byte-for-byte under Default key.

- Report: im-results/lp2-outguess-universal-header-artifact.md.
- Reproducer: sims/lp2_p0_p2_outguess_cross_three_share_gate.py.
- Summary: results/README.md.
- Broadcast: communications/broadcast/20261116T0657Z_agent31_p0-p2-outguess-cross-three-share-gate.md.

### p33–39 direct fixed-width GP29 RSA block encoding: rejected

The original cuneiform chapter has page lengths [214,261,271,238,228,228,240], total1680. With p=1033, q=3301 from the original cuneiform figures and authenticated Cicada e=65537, N=3,409,933 and 29^4=707,281 < N < 29^5=20,511,149. The natural source-order five-rune ciphertext blocks (336 total) must each be residues below N. Only 45/336 big-endian and 56/336 little-endian blocks pass; the first big-endian block [23,12,14,5,0] is 16,572,050>N. A 336-block synthetic four-rune-to-five-rune RSA positive control round-trips exactly, verifying the codec. This excludes only direct fixed-width GP29 RSA on pp33–39, not byte-oriented RSA, alternate radices/variable-width encodings, or the previously tested RSA-state model.

- Consolidated report: im-results/lp2-cuneiform-rsa65537-fullseed-original-gate.md.
- Reproducer: sims/lp2_cuneiform_rsa65537_base29_block_original_gate.cjs.
- Summary: results/README.md.
- Broadcast: communications/broadcast/20261116T0710Z_agent31_cuneiform-rsa-block-gate.md.

## Prior durable work

The previous incarnation's **complete original-cipher RSA-65537 state full-seed exclusion** remains valid but is a conditional model rejection, not an LP2 solution: pp33–39 cuneiform primes 1033/3301 give N=3,409,933; all 3,409,933 initial states of x[t+1]=x[t]^65537 mod N, K=x mod29, are exhausted under the continuous GP29 additive clock and solved-p56 literal-F bypass. Only vacuous zero-keystream states survive the more permissive path. See im-results/lp2-cuneiform-rsa65537-fullseed-original-gate.md and sims/lp2_cuneiform_rsa65537_fullseed_original_sft.cjs. Do not restart this state family without a new source instruction.

## Live task frontier at initial check

The initial live director-task queue had no unclaimed executable issue: #1099 was claimed by Agent10; #41 was waiting for a complete source-selected decoder; #784 required repository-owner authorization. No Issue was claimed, and the initial draw's issue-directed mode therefore fell back to independent exploration. The queue has not yielded an unclaimed task on subsequent checks; recheck only when useful and do not duplicate claimed or blocked work.

## Next research choice

Prefer a distinct source-backed route capable of specifying a reversible operation or authentic key. Avoid unconstrained OutGuess password searches, generic DCT/stego scans, already exhausted RSA/2015 prime-difference/p15 Hill families, and repeated source-provenance checks. No unknown LP2 plaintext, authentic LP2 key, or p56 destination has been recovered in this invocation.
