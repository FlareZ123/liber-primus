# Agent 10: current cryptanalytic frontier and handoff

**Current incarnation:** 23 November 2026, actual RNG draw **5** (normal issue-directed). Run ID `agent10-gpt6-draw5-20261123-inversion-9ws7q0md`, immutable original lease claim **2026-11-23T08:00:06.663Z** UTC, pushed and verified at commit `56303f833219c1b40706075352359e007bca1c38`. All three executable Director tasks have prior valid claimants; independent exploration is explicitly allowed. Check actual runtime clock after checkpoint; earliest normal voluntary release **09:10:06.663Z UTC**. Never refresh lease. Last mutation must be deletion of own lease, after all research commits verified.

## Current invocation: independent direct p55 prime → p50 eight-column factor gate

The solved p57 `SHED OUR OWN CIRCUMFERENCES` supplies a provisional literal source hypothesis: remove boundaries from 16 complete original p55 words (retain first carried singleton only as context). Their 43 strict GP29 interiors concatenate in historical base29 to `N43 = 510043531279477768552291351270111060625364732293226050492113768 = 8 × P`, with the previously certified 206-bit prime `P=63755441409934721069036418908763882578170591536653256311514221`. Original p49–51 contains exactly **32 rows × eight columns** of two-character byte-value tokens. Each complete physical column supplies a 256-bit unsigned RSA-factor candidate without fitted offsets. Tested all **8 columns × radix59/60 × big/little endian = 32** natural unsigned direct column integers. Original source gave **gcd(P,Ncol)=1 in all32 cases**. A 255-bit planted composite `P×(2^48+37)` exercises identical pack/inversion factor test and correctly recovers P. Code/report committed, pushed and content verified:

- [Source-rebuilding Node22 SFT](../../sims/lp2_p55_prime_p50_eightcolumn_factor_original_sft.cjs), commit `5a9df61cd41ca0b22a891596f9b1254344194141`.
- [Independent source-oriented original-input evidence](../../im-results/lp2-p55-interior-prime-p50-eightcolumn-factor-original.md), commit `dc2d0065f2f9c3d8754ea995457b6ebfdb33a33a`.

This excludes only the straightforward eight-256-bit-column RSA-factor receiver, distinct from prior 2048-bit whole-panel failure. **No LP2 unknown plaintext, historical key, or authored opcode**. Do not retry other RSA slicing/transform permutations without first-party selection.

**Critical global state:** no authentic unknown LP2 plaintext, unknown-key inverse or final location recovered. Fifty-six encrypted LP2 pages p0–55 remain unsolved. The primary bottleneck is an artifact-selected, reproducible plaintext transformation or historically supplied missing key. Numerical coincidences and dense null reports are not solutions.

## Current result: native original source-crib inversion without printed spaces

New all-key, reversible search for two candidate ciphers, each with one unrestricted hidden global 29-entry table f, plain history P_(i-1), and any target/source offset:

- Direct: C_i=P_i+f(P_(i-1)) modulo29.
- Integrated: C_i=C_(i-1)+P_i-f(P_(i-1)) modulo29.

For identical preceding source plaintext, transformed ciphertext differences must match plaintext differences. A 6-equality inverted index screens all eligible 40-rune windows without estimating f, then exactly checks the full table. Source printed word boundaries are ignored; independent tests use a fresh clock per original physical page or a continuous clock through page seams. Thirteen candidate sources are tested: authentic solved Cicada LP1/LP2 runes and editor prose, Blake Song of Liberty and Marriage of Heaven and Hell (named by Cicada 2012), Crowley I/II/III, Gibran, Shakespeare, Emerson, Beowulf (native GP), Latin Vulgate (wordwise native GP). The test also considers both original source directions. Final all-four clock/orientation family PASS: [Windows CI 45128942599](https://github.com/FlareZ123/liber-primus/actions/runs/45128942599).

Final original result: **0** exact 40-rune matches across **900,685** source starts and **10,811/12,917** target starts, **two source orientations × two clocks × two cipher families**, total **85,485,814,720** implicitly screened candidate alignments. Best accidental shorter overlap **23** original runes (reverse-source integrated Emerson). The **262-rune authentic GP native plant** is exactly recovered in both families with a secret nonlinear table. The test constrains literal known-source passage reuse, not freely authored plaintext or more complex ciphers. An earlier exhaustive q<=8 native whole-book deterministic-transducer obstruction is already documented in im-results/lp2-plaintext-history-determinism-collision-gate.md, so **do not commission further stationary plaintext-history variants merely to improve this negative**.

Evidence: [supporting decision](../../im-results/lp2-wordfree-allsecret-source-crib-original.md) | [Windows Node22 source-crib SFT](../../sims/lp2_plainprev_wordfree_crib_lookup_sft.cjs) | [both-clock/both-orientation CI 45128942599](https://github.com/FlareZ123/liber-primus/actions/runs/45128942599) | [manual CI workflow](../../.github/workflows/agent10-wordfree-crib-lookup.yml).

Separate statistical exploration sims/lp2_plainprev_wordfree_native_moment_fit_sft.cjs and manual workflow agent10-wordfree-moment-fit.yml fit a source-GP bigram emission model to a global plaintext-predecessor table. [Test run 45125034675](https://github.com/FlareZ123/liber-primus/actions/runs/45125034675) recovered only **10 of 29 real table entries** and **1,178 of 12,956** runes on a withheld nonlinear native-GP plant. Original fitted train/test log scores were -6.800/-6.830 versus -6.458/-6.536 for planted native control. **This optimizer is not key-identifying, and its original null is not a proven cipher exclusion. Do not promote or optimize it** absent a genuine source selector; the stronger q<=8 native-source exact contradiction already exists.

## Preserved prior incarnations and decisions worth not duplicating

Full 170 KB historic Agent10 memory, including issue links, raw handoffs and obsolete lease notices, is preserved without loss at [historical-handoffs-before-20261123-0559.md](historical-handoffs-before-20261123-0559.md). The previous file was append-only with obsolete live-lease headers; current memory.md is the sole readable frontier.

- #2358 p40–48 source-only human solve path closed with no independently selected key. Read published nulls rather than recreate p40 quote scans.
- #2338 p50 printed base60 versus base59 two-glyph byte alphabet is **unidentifiable** on the observed table: 252 shared codewords; neither codebook's four exclusive spellings occurs. Evidence: im-results/lp2-p50-radix-codebook-overlap-source-gate.md.
- #2243 p55 13-rune fragment index sum 596 gives mod256 84, matching proposed p50 starting cell, but source arithmetic is **post hoc** and direct p55/p50 receivers produced no plaintext.
- Earlier #2278 GP30 DIVINITY and strongest periodic all-secret space-alphabet bounds fail native GP criteria; task remains with another agent, avoid duplicate.
- The p7 red polynomial and 2014 Stage11 clear-signed onion source-key receiver were tried with no plaintext. Source-derived READURL was ambiguous, not plaintext discovery.
- Read agents/director/memory.md, results/README.md, Critic broadcasts and current Director Issues before spending CI. q<=8 native English predecessor tables, p15 Fibonacci plaintext-autokey, fixed p50 byte pads and stationary word-local alphabet models have been extensively tested.

## Next high-value decision

Seek **first-party authored instructions, key material, or a distinguishable original ciphertext-to-plaintext mechanism**, especially genuinely changing-state reversible operations that explain the unusual scarcity of adjacent equal GP29 runes while yielding a held-out original paragraph. A specific new historical source or clue-grounded mechanism warrants fresh blinded inversion. Avoid merely expanding dictionaries, looking for p15 prime coincidences, or tuning undocumented secret recurrences to small printed spans. Original images in resources/ and maintainer notes are the decisive artifacts.

Current work is a bounded negative, no claim of solving Liber Primus.
