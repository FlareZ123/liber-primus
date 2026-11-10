# LP2 permutation-invariant common-pad probe (Agent 3, 2026-11-10)

## Question and scope

Could multiple LP2 pages be encrypted with one page-aligned keystream even if
each page subsequently uses a **different arbitrary permutation of the 29
ciphertext rune labels**? Ordinary cross-page exact-rune matching fails under
that variant. The experiment below is independent of those per-page label
assignments and requires no guessed plaintext.

Input: `resources/liber-primus/lp2-corpus.json`, all 55 rune-containing
unsolved LP2 pages (p0–49 and p51–55). LP2 p50 contains only a numerical
grid. The input represents canonical Gematria Primus indices 0–28. See the
corpus source notes for transcription lineage and page numbering.

## Label-free construction

For positions `t,u` where `u-t >= 8`, define

`E(page,t,u) = 1[ciphertext(page,t) == ciphertext(page,u)]`.

A page-specific permutation of ciphertext labels leaves this indicator
unchanged. For each position pair, sum `E` over pages long enough to
contain both positions; include pairs supported by at least ten pages.
The aggregate score is:

`T = SUM_(t,u) choose(SUM_page E(page,t,u), 2)`.

Intuition: if `C_page,t = sigma_page(P_page,t + K_t mod 29)` with one shared
`K_t`, the internal equality pattern of multiple pages can weakly align
even if all `sigma_page` differ. The statistic does not assume a specific
symbol permutation or a known key.

Matched null: independently circularly rotate **the full rune array**
of every page, sample a random starting offset, recompute `T`, repeat
250 times with fixed xorshift32 seed `0x71de219e`. This retains each
page's rune counts, adjacency, and near-term repeat suppression while
removing page-to-page position alignment. Positions within eight symbols
are excluded to reduce sensitivity to short-range anti-repeat behavior.

## Executed evidence

GitHub Actions [opt-in run 42738776184](https://github.com/FlareZ123/liber-primus/actions/runs/42738776184)
completed successfully on the main branch and reproduced these fixed-seed
values with `node sims/label_free_reuse.js`:

| Measurement | Result |
| --- | ---: |
| Unsolved rune pages | 55 |
| Position pairs after eligibility filters | 34,980 |
| Observed shared-pattern score `T` | 39,012 |
| Circular-shift null mean | 38,937.872 |
| Null standard deviation | 192.416 |
| Standardized observation | +0.385 |
| Empirical one-sided `p`, with +1 correction | 0.33466 |

### Positive control and limits

A single synthetic scenario uses 46 pages of 200 runes, all from **the
same randomly generated 29-symbol keystream**, with independently
randomized page-wise label permutations, plaintext sampled independently
from the two solved LP2 pages' empirical rune distribution, and an
81% repair probability for immediately repeated ciphertext runes. Its
score was 22,368 against a 120-rotation null mean 22,127.867 and
standard deviation 129.934 (`z=1.848`, one-sided empirical `p=0.04959`).

This planted example is only **modestly detectable**. One planted trial
cannot establish calibrated power across alternative plaintext languages,
page-specific key slips, other anti-repeat implementations, or subsets
of pages. Therefore the real-data `p=0.335` is a **failure to find evidence**,
not an exclusion of arbitrary-permutation keystream reuse. There is no
decrypted text or recovered key.

## Technical conclusion and next step

The equality-pattern invariant provides a cheap screen for a family that
ordinary equal-rune alignment tests do not cover. Here, the observed
effect is small and the test has limited sensitivity to a realistic planted
case. Improving this lane requires a stronger multi-page latent-keystream
estimator (e.g. a low-rank or likelihood method), with preregistered
multiple-plant power checks **before** screening LP2 again.

Executable: `sims/label_free_reuse.js`. Runner:
`.github/workflows/label-free-reuse.yml` (manual dispatch only).
External work on exact-label reuse and anti-repeat constraints is
documented separately by Wulfic and pnotisdev; this note claims no
independent decryption or contradiction of that prior work.
