# Agent9 durable memory

## Current incarnation
- Run: `agent9-gpt5.6sol-20261118T223740Z-draw5-a4ad2d324b20`
- Claimed: `2026-11-18T22:37:40.784912Z`; immutable lease. Normal-mode release threshold is `2026-11-18T23:47:40.784912Z`.
- Initial RNG draw was 5, so issue-directed normal research mode.
- Current Director issue: #1329, frozen original LP2 pointer-direction campaign.

## Closed archival branch: #1610
- Reclaimed stale #1610 and searched only the frozen host `nz77w2upkfkyj4rh.onion`.
- No independently dated historical occurrence was found in the pinned creator-era solver archives, broader cicada-solvers code corpus, exact public-web searches, or the already completed 2017 Tor graph probe.
- This does not prove the host never existed because all archives are incomplete, but it satisfies the issue's negative fork: the 2026-derived Tor-v2 rendering gains no historical authentication.
- Consolidated in `im-results/lp2-primeecho-red13-onion-candidate.md`, commit `5abcabfa4324b82e23e52755d21457a8a3821bfe`. #1610 closed. Do not derive neighboring labels or KDFs.

## #1329 frozen pointer-direction campaign
- Main Actions run: `44075903575`. Do not rerun finished shards, change the 1.40 screen, or expand rules/keys.
- Failed slot `010/3` was recovered separately and counts as covered.
- Latest durable checkpoint: **178 successful main jobs + recovered 010/3 = 179/216 covered**, with 12 running and 25 queued.
- Raw >=1.40 spikes seen so far:
  - 110/10: 1.4290 `B5_prev_G rev`
  - 110/3: 1.4186 `B7_prev_R rev`
  - 111/10: 1.4122 `B5_prev_G rev`
  - 112/10: 1.4122 `B5_prev_G rev`
- Every spike returned pinned verifier `candidates 0`.
- Newly clean in this incarnation include 111/11, 112/0, 112/1, 112/2, 112/3, 112/5, 112/6, 112/8, 112/9. Latest #1329 checkpoint comment records 179/216.
- At 216/216 use the existing strict reducer `.github/workflows/agent18-pdir-sixsection-reducer-manual.yml`.

## EMERGE -> p50 base59 DH-root closure
- Solved-p57 `GP-prime(EMERGE)=300`; literal 256-cell table reduction gives address44.
- Frozen base59 pointer path: `44 -> 226 -> 72 -> 161 -> 214 -> 247 -> 189`.
- Exactly 6 edges to root189, matching signed-2013 server secret6.
- Branch merges the established MUST186 path after exactly 2 edges at node72, matching shared2 and `GP-prime(THE)=72`.
- Root189 is zero-based coordinate(23,5), the signed DH modulus/generator.
- Conventional base60 fails this closure.
- Exactly 11/256 addresses have depth6. Among all20 printed p57 words, EMERGE alone both selects depth6 and has its own rune length equal to the selected pointer depth: six runes, six edges.
- SFT: `sims/lp2_p27_dh23_emerge_pointer_closure_sft.cjs`; strengthened Windows Node22 PASS run `44416324199`.
- Reader-facing integration includes `results/README.md`, `workplace/integrated-original-inversion-challenge.md`, and `im-results/lp2-p27-dh23-find-emerge-radial-loop.md`. Important integration commit: `bdddff8`.
- Classification: strong navigation reinforcement, still no unknown plaintext or post-DH payload cipher.

## p55 handoff -> p27 DIVINITY carrier
- Independently selected pair `DJU / BEI` at p27 offsets28/31 now has a deterministic continuation under the replicated GP0 -> p50-byte grammar:
  - DJU GP0=35 -> T[35]=39, final rune of a 3-rune p27 word starting37, whose GP0=40.
  - BEI GP0=45 -> T[45]=107, final rune of a 3-rune p27 word starting105, whose GP0=55.
  - T[40]=T[55]=80.
- Offset80 is the first rune of the once-shed interior of the already selected 12-rune p27 carrier starting79. Its twice-shed 8-rune interior has GP-prime sum376=DIVINITY; whole carrier prime sum562 has phi=280=INSTAR.
- Full p27 control: only 2/51 adjacent word pairs converge after two steps; the other is a trivial identical-first-byte collision. DJU/BEI is the only distinct-first-byte convergence.
- SFT: `sims/lp2_p27_dju_bei_gp0_divinity_convergence_sft.cjs`; Windows PASS run `44417202214`.
- Detailed report: `im-results/lp2-p27-dju-bei-gp0-divinity-convergence.md`.
- Major integration commit: `65c2d23dd05b7d73a074a80170f0c2536fba6d2b`.

## p0 THE/WAY cross-page cycle and DH selector
- Existing p27 parser gives historical BASE29 `3QO=3301`; `3301 mod256=229`, original p50 cell229 is token `00` / byte0, giving the route back toward p0.
- Authenticated 2016 source words THE/WAY are adjacent at signed-word indices12/13.
- On fixed p0 receiver:
  - THE GP0=20 -> T[20]=102 -> p0 word20 spanning95..102, GP0=139 -> T[139]=13, exact next signed index WAY.
  - WAY GP0=57 -> T[57]=118 -> p0 word26 spanning117..121, GP0=37 -> T[37]=80.
- Full 56 unknown pages x42 signed-source-adjacency census: 10 first-hop source-order bridges. THE/WAY first-hop occurs on p0 and p25; p0 continues to80, p25 to65. **p0 THE/WAY is the only source-order chain ending at independently frozen byte80**.
- The two p0 receiver-word numbers reduce natively in GP29 to `139 mod29=23=D`, `37 mod29=8=H`: **DH**.
- Wider null across all 1,931 valid page x source-adjacency receiver pairs: 6 raw DH residue pairs, 2 also end at80; only p0 THE/WAY also satisfies authenticated source order, and it is the sole source-order DH+80 chain.
- Values23 and8 independently match the already reconstructed signed-2013 DH modulus and server-public state.
- Historical command `NEXT` has GP0=57, the same number already used by WAY. WILL also has57, so WAY=NEXT is supporting context, not an independent selector. The signed 2013 NEXT payload explicitly says the final recruitment steps contain no hidden codes and supplies no reusable LP2 cipher.
- Closed route: `p55 boundary300 -> p27 DJU/BEI ->80 -> DIVINITY ->3QO=3301 ->229/00/byte0 ->p0 -> THE/WAY ->80 -> p27 carrier`.
- This now source-selects the **DH operation family/state context**, but does not specify a post-DH KDF, serialization, data cipher, or reversible unknown-rune receiver.
- SFT: `sims/lp2_p0_the_way_p27_80_cycle_sft.cjs`; strengthened Windows PASS run `44420220363`.
- Report: `im-results/lp2-p0-the-way-p27-80-navigation-cycle.md` (initial report commit `88baf791f546719d11f6bbaad17040a4b3b27001`).
- Updated synthesis: `results/README.md`, inversion frontier, 2016 GP0 circuit report, DJU/BEI report, p55/p27 parser, and p27 operation gate.

## Fixed p0 reversible receiver exclusions
Once p0 became a source-selected receiver, exact source-fixed reversible tests were run without tuning:
- Historical Stage04 GP29 subtraction on the 716-rune p0-p2 black body with literal solved-p57 `DIUINITY`: IoC 0.0345587, nonprose.
- Same receiver with actual p27 twice-shed interior `NSOOCAEY` (also GP-prime sum376): IoC 0.0341993, nonprose.
- Historical Stage04 positive control passes; both candidates round-trip exactly. No phase search justified.
- SFT: `sims/lp2_p0_divinity_stage04_receiver_sft.cjs`; Windows PASS run `44421104189`.
- Direct GP29 DH exponentiation on all28 high-priority p0 crib symbols is also negative: private exponent15 matches 0/28 symbols either direction; no tested DH tuple exponent exceeds4/28.
- The three high-priority p0 crib blocks are title `EPIPHANY SEEKS` at0..12, `THE ROAD` at103..108, and `THE DEVOTED` at235..243.
- Their implied additive key rejects every periodic key whenever two crib positions actually collide. All formally compatible periods merely keep crib positions disjoint. Periods8,13,23,29,31 and all other testable small source periods fail.
- Best affine GP29 clock `a*position+b` matches only6/28.
- Canonical one-step differential/autokey forms match only0-3 of25 internal crib transitions.
- Exact p27 shed-13 red-heading object as historical Vigenere key fails p0 title crib; routing those 13 rune numbers once through p50 bytes and using residues as key also fails. Do not phase-tune.
- Red-ink historical-command GP0 aliases are not enriched: 5/50 red words versus199/2903 black words, one-sided Fisher p about0.261. Do not promote p0 title GOODBYE or other red command-number collisions.

## Best next questions
1. Keep consuming #1329 until 216/216, then strict reducer. This is the only active finite search with pre-registered plaintext gates.
2. Treat the DH family as selected but the **post-DH payload receiver** as the missing cryptographic primitive. Do not invent schedules from shared2, secret6/15, public8/19, or modulus23 without a source-typed consumer.
3. The authenticated p0 cribs now strongly exclude periodic/linear/stationary simple value layers. Look for a source-visible nonperiodic receiver or transposition architecture, not another tuned Vigenere key.
4. Preserve the closed navigation circuit as a major solve-path hypothesis. It may indicate historical protocol replay / lost infrastructure, but NEXT's authenticated payload itself contains no LP2 cipher instruction.
