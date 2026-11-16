# Agent31 | Active cryptanalytic frontier

**Current invocation:** 16 November 2026, genuine RNG draw **3** (normal research mode, initial priority issue-directed). Agent31 lease: agents/agent31/.lease.json; run ID agent31-gpt6-20261116T063806Z-draw3-issue-directed-6f2c9a; immutable claim 2026-11-16T06:38:06.933Z. The 70-minute orderly-release threshold is **2026-11-16T07:48:06.933Z**. Do not refresh the lease. After each checkpoint, compare the original claim against an actual system clock; before threshold continue research, and at/after threshold save/push, verify, delete only this lease as the final repository mutation, commit/push/verify deletion, then exit.

## Current invocation results

### p0–p2 cross / three-share OutGuess: direct XOR route rejected under three motivated keys

Original scans17/18/19 are physical LP2 p0/p1/p2 and carry the same 180°-opposed triple-bar cross artwork. The earlier 2014 round used three complete OutGuess shares XORed bytewise, so this is a plausible historical transfer.

- **Default key** (historically demonstrated OutGuess password): all three images have source-forced encrypted header ffffffff, decoding to seed41408 / length58152. Only scan17 completes (58,152 bytes, SHA-256 cbf1ccddc6c4bb2fd96d449e0667eb5be6c2a542de4e0f43e7ca188df7f289b1). Scan18 stops at zero adaptive skip modulus after 58,120 bytes (remaining32, offset686973/687226, available253); scan19 stops after58,113 bytes (remaining39, offset619352/619659, available307).
- **FIRFUMFERENFE** (exact LP1-derived Vigenere key, tested as candidate OutGuess password—not an authenticated OutGuess instruction): all three complete at9,474 bytes; forced header ffffffff decodes to 2aa00225, seed41002, length9474. Payload hashes: scan17 d9505f6f6d40c2099cad79963a16f2823f2e46f6aead83776c863c648815f6e6; scan18 ed5a3ced513c70c1f0e15cc3097af1173779fad7d2fbc994e763ba48393e9b15; scan19 3e190a76b50c25c486a4f21ca80e86730e878e418ebcf7f5f076e05e5cc02712. Three-way XOR SHA-256 fca81a16753c21df3d5874224d666c2c963cd8a036e67f766fa64e5f9b5628c8; entropy7.9821516973 bits/byte; printable fraction0.3836816551; longest printable run12; common payload prefix293 and suffix323; no recognized file/message signatures.
- **DIVINITY** (literal p57 source-visible word, tested as candidate OutGuess passphrase—not an authenticated OutGuess instruction): all three complete at51,011 bytes; forced header ffffffff decodes to ee5b43c7, seed23534, length51011. Payload hashes: scan17 772860c15ca24d4cbb41b60f7058caf3bb2a4557e9000a27adc1df8adce64eef; scan18 bef2dcb6a0e8498ba6aa5ac24e21c7cd80ca1a0572f305b00f39ce8a4b815f30; scan19 4f7c591533218bd47b354dbdfe76995b6cbffae80e116bfe412f592c2e3313bf. Three-way XOR SHA-256 62a287c6191693c7257f5958ba92e6136c992bfbcf8926ac6411bae1cd16c3dc; entropy7.9968030801 bits/byte; printable fraction0.3824665268; longest printable run10; common payload prefix1408 and suffix2110. The sole 1f8b occurrence at offset26909 is followed by BF, not valid gzip method08; no valid PGP/ZIP/gzip/bzip2/PDF/PNG/CICADA/LIBER/3301 signature.
- The authentic LP1 03.jpg 31,809-byte PGP-signed OutGuess payload is recovered byte-for-byte under Default key as a positive control.

Decision: direct p0/p1/p2 three-share OutGuess under Default key lacks three complete shares; under FIRFUMFERENFE and DIVINITY all three complete but their direct XORs are high-entropy, share large identical prefix/suffix regions, and have no valid message/file signature. Do not truncate, trim common regions, treat the invalid gzip-like marker as data, or search further passwords without a new original selector. No LP2 plaintext recovered.

- Report: im-results/lp2-outguess-universal-header-artifact.md.
- Main reproducer: sims/lp2_p0_p2_outguess_cross_three_share_gate.py.
- DIVINITY reproducer: sims/lp2_p0_p2_outguess_divinity_candidate_sft.py.
- Summary: results/README.md.
- Broadcast: communications/broadcast/20261116T0657Z_agent31_p0-p2-outguess-cross-three-share-gate.md.

### p33–39 direct fixed-width GP29 RSA block encoding: rejected

The original cuneiform chapter has page lengths [214,261,271,238,228,228,240], total1680. With p=1033, q=3301 from the original cuneiform figures and authenticated Cicada e=65537, N=3,409,933 and 29^4=707,281 < N < 29^5=20,511,149. The natural source-order five-rune ciphertext blocks (336 total) must each be residues below N. Only 45/336 big-endian and 56/336 little-endian blocks pass; the first big-endian block [23,12,14,5,0] is 16,572,050>N. A 336-block synthetic four-rune-to-five-rune RSA positive control round-trips exactly, verifying the codec. This excludes only direct fixed-width GP29 RSA on pp33–39, not byte-oriented RSA, alternate radices/variable-width encodings, or the previously tested RSA-state model.

- Report: im-results/lp2-cuneiform-rsa65537-fullseed-original-gate.md.
- Reproducer: sims/lp2_cuneiform_rsa65537_base29_block_original_gate.cjs.
- Summary: results/README.md.
- Broadcast: communications/broadcast/20261116T0710Z_agent31_cuneiform-rsa-block-gate.md.

## Prior durable work

The previous incarnation's **complete original-cipher RSA-65537 state full-seed exclusion** remains valid but is a conditional model rejection, not an LP2 solution: pp33–39 cuneiform primes 1033/3301 give N=3,409,933; all 3,409,933 initial states of x[t+1]=x[t]^65537 mod N, K=x mod29, are exhausted under the continuous GP29 additive clock and solved-p56 literal-F bypass. Only vacuous zero-keystream states survive the more permissive path. See im-results/lp2-cuneiform-rsa65537-fullseed-original-gate.md and sims/lp2_cuneiform_rsa65537_fullseed_original_sft.cjs. Do not restart this state family without a new source instruction.

## Director issue queue and current assignment

The initial draw-3 check found no unclaimed executable issue, so the first independent investigations were appropriate. Later the Director added Issues #1199–#1202; #1199, #1200, and #1201 were already claimed when checked. I claimed the only unclaimed task, **#1202**, using the current run ID. It remains open and my claim expires when this identity lease is released.

The task's exact/keyskip1 MT19937 seed-space compute has **already been run**: workflow run **43612834637** (lp2-py27-mt32-exact-uncovered-manual.yml) completed successfully and produced **96 exact-full artifacts**, retained until 2027-02-12. The frozen external status at Dukotah/cicada3301 commit 9087dc36b5aa64c1786428e32180261ab9420c29 reports 2,235,695,586/4,294,967,296 seeds completed, leaving 2,059,271,710 for the 96-shard plan. The workflow file and original lp2-corpus.json blob match current main exactly. The run-time and current sims/lp2_py27_mt32_uncovered_shards_sft.cjs differ only by changing the unconditional main() call to a require.main guard and exporting helpers; the range/scoring logic is identical. No duplicate computation was launched.

**Handoff:** #1202 remains open because the 96 artifacts have not yet been merged and candidate hits adjudicated. Next agent should retrieve/merge the 96 retained artifacts, verify every exact shard interval and aggregate candidate count, then apply the current original-input scorer. Close as negative only if the full coverage is confirmed and no authentic plaintext candidate survives. Issue comments contain the run IDs, artifact count, pinned blob hashes, and exact SFT diff.

## Next research choice

Prefer a distinct source-backed route capable of specifying a reversible operation or authentic key. Avoid unconstrained OutGuess password searches, generic DCT/stego scans, already exhausted RSA/2015 prime-difference/p15 Hill families, and repeated source-provenance checks. No unknown LP2 plaintext, authentic LP2 key, or p56 destination has been recovered in this invocation.
