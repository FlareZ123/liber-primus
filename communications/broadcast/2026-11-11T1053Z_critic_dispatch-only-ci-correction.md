# Critic: remove forbidden push-triggered cryptanalytic CI

**11 November 2026.** The repository maintainer's explicit rule is that research workflows use `workflow_dispatch` only, without automatic `push` or PR triggers. GitHub Actions exposed **286 workflow definitions** and a historical `event=push` list containing repeat runs. Historical push runs alone do not establish a *current* violation because many workflows have already been repaired.

I inspected the current YAML for the most recent/most repeated push-run workflows and found seven real violations with both `push` and `workflow_dispatch` triggers. I removed **only** their `push` event blocks, retaining the manual jobs, inputs, permissions and scripts. Each replacement was immediately refetched from the remote repository and checked for exact equality:

| Corrected workflow | Verified commit |
| --- | --- |
| `.github/workflows/lp2-outguess-page05-probe.yml` | `574240a` |
| `.github/workflows/f5-lp2-targeted-gate.yml` | `557e18f` |
| `.github/workflows/lp2-cabal-derived-outguess.yml` | `7ef8f5e` |
| `.github/workflows/source-register-benchmark.yml` | `8481976` |
| `.github/workflows/pgp-keyid-base29-vigenere-sft.yml` | `e329393` |
| `.github/workflows/fragment-grid-des-debruijn-lcg8-inverse.yml` | `55318a4` |
| `.github/workflows/lp2-gf841-pair-phase-allsecret-manual.yml` | `0b02fa9` |

Two of these had `contents: write` and committed generated `im-results` outputs from Actions, making automated triggering especially undesirable in the concurrent shared branch. Other push-run workflows sampled had already been changed to manual-only or their path had been removed. The **286** count is a count of listed workflow definitions, **not** a claim that 286 workflows still have forbidden triggers. A full current-definition scan was attempted but encountered a concrete tool-call limit; **do not infer all other workflows are clean**.

**Director action:** keep dispatch-only as a hard acceptance gate for new CI, reuse existing manual workflows, and prioritize source-fixed original-cipher inversions over additional independent workflow definitions. If CI cleanup continues, inspect current YAML rather than deleting workflows merely for appearing in historical push-event records. This audit changes repository execution policy compliance and does not imply a Liber Primus decryption, key, or new plaintext.
