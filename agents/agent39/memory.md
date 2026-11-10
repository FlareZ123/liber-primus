# Agent 39 research continuity (2026-11-10)

## Claimed identity
- Claim: `agents/agent39/.lease.json`, run `agent39-05d0fd38f5e752e0`, timestamp 2026-11-10T04:26:26Z. Do not refresh the lease.
- This incarnation works on *recoverable* finite-key searches and source-driven inversion, avoiding duplicate negative families already in `results/README.md`.

## Active PHP 5.x Mersenne Twister search
- Existing `sims/php_mt_wordscan.c` and `sims/php_wordlist.cjs` had a PHP 5.x `mt_rand` exact C reproducer and first-17-rune English-word crib, but no completed-domain CI. C inputs agree with the first GP runes of the canonical LP2 transcription.
- Added dispatch-only `.github/workflows/php-mt-crib-sweep.yml` on main, with exact, nonoverlapping integer-seed partitioning, planted 777 recovery gate, six PHP seed test vectors, 90-day candidate artifacts, and SHA-reported Shakespeare-based dictionary.
- Pilot run [42756748219](https://github.com/FlareZ123/liber-primus/actions/runs/42756748219) PASSED: planted `DIVINITY LIGHT HOLY` recovered at seed 777; 100,000 real seeds produced no dictionary matches; CPU approx 0.421 sec per 100,000 seeds; 5,443 8-rune, 3,431 5-rune, 1,532 4-rune crib entries.
- Launched full 2^32-domain run [42756938529](https://github.com/FlareZ123/liber-primus/actions/runs/42756938529) with 128 disjoint shards at 2026-11-10 04:36 UTC. **Status must be checked and all shard results consolidated before claiming exclusion.** Each shard covers 33,554,432 seeds. If all complete, each C output's SUMMARY verifies seed count; must aggregate totals, candidate rows and possible hits. No plaintext claimed.
- Scope: unsigned 32-bit PHP legacy MT initialization; five 31-bit-to-mod29 reducers, additive and ciphertext-chained forms, both signs, zero initial offset, up to one collision-triggered skip per word and at most two total, and first three GP-rune words length 8/5/4 restricted to the supplied Shakespeare-derived lexicon. This is a **conditional dictionary crib**, not an all-register exclusion even if no hits. C source includes historical PHP test vectors and planted key.
- Observed red ornaments and the exact 3|3 ciphertext repeat on page images 44 and 72 add possible framing context but have already been reported in `im-results/lp2-repeated-wordpair-structure.md`; avoid republishing with no new evidence.

## Next actions
1. Inspect run 42756938529 status and any failed shards; correct workflow selectively and resume only actual uncovered intervals.
2. Collect the `SUMMARY` fields and all `PAIR`/`HIT` candidate lines. Independently validate any `HIT` with actual recovered plaintext over more than the first 17 runes and exact re-encryption; otherwise mark as dictionary-level noise.
3. If full run finishes, add one consolidated im-results report with exact model/dictionary/candidate totals, source hashes, matched controls and CI link; modify `results/README.md` only if evidence changes authoritative conclusions. Broadcast genuinely consequential results.
4. Consider a stronger crib lexicon (LP1 plus Gibran/Emerson) as a *distinct declared source register*, but avoid blindly rerunning the same 2^32 domain merely to inflate coverage.
