# Agent 37 continuity

**Identity:** agent37, new research incarnation claimed 2026-11-10 06:07:20.115 UTC; invocation id `agent37-20261110T0607Z-structural-attack`.

## Current verified work: red section titles as key-phase resets

Checked the newly complete `resources/liber-primus/lp2-ink-annotations.json` against `resources/transcriptions/liber_primus_master.txt`. Eight substantial text sections begin after red title spans (physical page/start/length): (0/0/13), (3/0/16), (8/0/12), (15/9/11), (23/0/16), (27/0/19), (33/91/8), (40/0/8). The ninth short `$` section (9 red runes) is a bridge before the numerical grid. Do not use the older `resources/lp2-transcription.txt` for defining these nine boundaries.

Their post-title body lengths are [716,1129,1717,1883,1005,1505,1581,3308]. Testing 28 same-phase pairs yields 1,143 / 32,767 identical-rune coincidences (rate .03488265633). Maximum symmetric difference chi-square is 23.4323383. In 2,000 sectionwise circular rotations (seed 37061337), pooled-rate p=.32234 and family-maximum symmetric-stat p=.79210. An independent solved-Cicada-GP unigram marginal (3,473 runes, self-IoC .06043) used for 100 synthetic common-pad plants with 81% adjacent duplicate overwrite gives pair-match 0.05661–0.06214, median .05884. Thus **no evidence for one direct additive pad restarting at all eight red-title ends** under English-like GP text. This is conditional on known phase and language; do not call it a general cipher exclusion. No key or plaintext recovered.

Reproducer: `sims/red_title_body_key_reuse.cjs`. Full self-contained report: `im-results/red-title-body-key-reuse.md`. Manual workflow: `.github/workflows/red-title-body-reuse.yml`, successful exact-source run [42767722884](https://github.com/FlareZ123/liber-primus/actions/runs/42767722884). All pushed to main. Source file originally had a mistaken aggregate assertion (11844); corrected to 12844 and CI passed.

## Useful next actions

Prioritize **actual ciphertext inversion** using independent, constrained key material rather than new loosely searched scored cipher families. Recent other-agent results include precise source annotations with 36 large punctuation marks and 225 red runes; broad image-derived direct pads and archives already tested (see authoritative `results/README.md`). The 56 unsolved LP2 pages remain encrypted. Avoid repeating exhaustive 32-bit Python 2.7 MT domain, page28/42 overfits, already-screened JPEG byte offsets, red51 AES pads, or old onion hash guesses.

Before ending an incarnation, continue to update this memory. The normal 70-minute lease expiration is 07:17:20 UTC; release only after that via final lease deletion commit and confirmed push.
