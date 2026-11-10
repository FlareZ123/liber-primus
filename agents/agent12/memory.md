# Agent 12 research memory (2026-11-10)

Identity claimed at `2026-11-10T02:06:10.737Z` under `run_id=agent12-mod29-spectral-20261110`. Keep this timestamp fixed; normal-mode release is allowed only after a measured age of 70 minutes at a checkpoint.

## Work completed

Focused on the LP2 p49–p51 256-byte base-60 table, as a *source of 256-bit stream cipher keys*. Wulfic and others already tested direct grid key streams and the broad anti-doublet rate, so avoided repeating those tests.

- Script `sims/base60_seeded_stream.cjs`, manual CI `.github/workflows/base60-seeded-stream.yml`.
- Evidence `im-results/base60-seeded-stream.md`.
- Successful GitHub Actions run [42742817792](https://github.com/FlareZ123/liber-primus/actions/runs/42742817792).
- Parsed 256 base60 tokens from `resources/transcriptions/liber_primus_master.txt`. Corrected canonical bytes hash SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`; the initial Dukotah majority version had three different bytes at offsets 45, 50 and 246, so used corrected master for CI.
- Tested 32 column/row 32-byte keys x AES256CTR / ChaCha20 / RC4 x IV/drop/map/sign variants = **2,432 decoded full-corpus runs**. Best real IoC 0.034568719 vs uniform 0.03448276. Planted AES-256-CTR key with 81% anti-doublet repair recovered exact key and mode at rank 1, IoC 0.065291199. Thus a bounded, reproducible negative: no plaintext recovered.
- Word-boundary doublet rate checked early: 63/10060 internal, 23/2895 crossing, but Wulfic C1 already established this exact result. Do **not** publish or iterate that as a discovery.

## Research environment and likely next steps

- Repo authoritative `results/README.md` states LP2 remains unsolved; do not promote speculative scores to that page.
- Corpus `resources/liber-primus/lp2-corpus.json` contains LP2 pages 0..57, with runeless numeric p50 and solved pages p56,57. LP2 unsolved includes 55 rune pages, total 12,956. `resources/transcriptions/liber_primus_master.txt` preserves word/page/line markers.
- Shared high-activity work includes `im-results/grid-keyskip-viterbi-20261110.md` (Agent 6 tested direct grid repeating key with collision-justified skips, negative), `im-results/page-reset-pad-heldout.md` (Agent 30, negative), `im-results/latent-pad-likelihood.md` (Agent 10, negative), `im-results/page-shift-synchrony.md` (Agent 49, negative), `im-results/two-tap-heldout.md`, `im-results/wordwise-equality-invariant.md`.
- External pnotisdev `STATUS.md` documents a large number of strong negatives including simple keyed streams, nonuniform anti-doublet, and keyword substitution; external Wulfic logic findings C1..C28 cover many naive architectures.
- Need pursue a genuinely distinct, independently testable attack, ideally an inference from numeric table's internal design / hidden data or a cipher mechanism that makes held-out plaintext predictions. Don't retread easy doublet stats, word-length counts, reused pad or linear feedback already covered.

At time of this memory checkpoint ~2026-11-10T02:31Z the original 70-minute lease condition is **not yet met**; continue substantive research and preserve further findings.
