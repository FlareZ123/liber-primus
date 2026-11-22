# Original LP2 pointer-direction near-threshold candidates: full-window original inversion

**Research status (Agent12, 17 November 2026): completed negative for three frozen original candidates from Director #1329. No new original unknown-page plaintext, source-selected key, or viable repeated mechanism was recovered.** This is a bounded continuation of the already-running finite pdir campaign, not a replacement for its full 18-convention reduction.

## Why these three ciphertext candidates were worth checking

The signed 1 January 2016 Cicada text says that Liber Primus's words are the map and their numbers the direction. Issue [#1329](https://github.com/FlareZ123/liber-primus/issues/1329) proposes treating each original word's selected GP-number predicate as a **forward/backward key-stream pointer direction**. The pinned [source-programmed pdir reference](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/kscreen/pdir_ref.py) has 18 exact pointer conventions, 66 directions rules, two orientations, both key signs and skip/coin anti-repeat models. Agent13 launched **216 jobs** covering all those conventions/rules on two original unknown-section windows (`seg0.7`, 729 runes, and `seg0.8`, 1,145 runes), against 581 registered streams and matched nulls; source verification is in `sims/lp2_pdir_issue1329_gate.py`.

The first part of [stage1 run 44006868510](https://github.com/FlareZ123/liber-primus/actions/runs/44006868510) produced three unusually high original first-300-rune IoC scores, still **below** the preregistered 1.40 screen. They were selected **before** full-window decoding, without choosing a new key, offset or direction from the rest of the original ciphertext. Each exact registered `.tsv` was downloaded as an artifact from its original shard. The same search bundle contained `real/` and `null/` files with the same basename; the verifier selects only its original `real/` file.

## Exact full-window decision on existing original-cipher hits

The independent pinned [whole-window pdir verifier](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/kscreen/verify.py), invoked from `pdir_verify.py`, re-decodes the **top five distinct registered-key/window hits per vector**, with exact previously selected key, offset, GP29 sign and anti-repeat model. It compares each against 20 random offsets of the **same key stream**. A candidate must reach whole-window normalized GP29 IoC **≥1.40** and exceed its own same-key control maximum by **0.15**.

| Frozen pdir rule and original artifact | Registered first300 IoC | Full-window GP29 IoC, n | Same-key control max | Exact registered top-hit keystream and offset |
| --- | ---: | ---: | ---: | --- |
| `100/B7_prev_pl_fwd` from `pdir-stage1-100-7` | **1.3954** | **1.098**, n=1,145 | 1.071 | `sha256-ctr mod :the primes are sacred`, offset18028, mult28, skip model0 |
| `100/B3_prev_G_fwd` from `pdir-stage1-100-9` | **1.3902** | **1.084**, n=1,145 | 1.073 | `sha512-ctr reject :welcome`, offset6311, mult1, coin model1 |
| `000/B7_cur_w_rev` from `pdir-stage1-000-7` | **1.3857** | **1.130**, n=729 | 1.082 | `md5-ctr reject :all things should be encrypted`, offset901, mult28, skip model0 |

All **15/15** full-window candidates across those three vectors are labelled noise by the frozen original GP29 decision. No recovered 729- or 1,145-rune stream is recognizably coherent Liber Primus prose, and none attains whole-window IoC1.40. The top five per-vector complete decryption texts, GP-rank relabellings, exact keys/offsets/signs/models and 20 matched control summaries are retained in the [original executable workflow artifact](https://github.com/FlareZ123/liber-primus/actions/runs/44021379143/artifacts/14301805113), not retrospectively restyled as plaintext.

Independent sensitivity control: all **692** consecutive 300-rune windows from authenticated solved LP1 WELCOME (216), plain THE LOSS OF DIVINITY (456) and the decrypted FIRFUMFERENFE koan (20) independently exceed the threshold; observed normalized IoC ranges are 1.66111–1.78720, 1.60615–2.08270 and 1.98247–2.05231, respectively. This does not guarantee the unknown plaintext is English in the same orthography.

## Reproduction and scope

- Source-correct operational workflow: [`.github/workflows/agent12-pdir-nearthreshold-original-verify-manual.yml`](../.github/workflows/agent12-pdir-nearthreshold-original-verify-manual.yml), source-pinned `pnotisdev/cicada3301@15200c67abee106913ba01ff504c5b6e88d16cc7`. It builds the exact Rust engine, checks the original source/sections, recreates the two original windows and direction rules, downloads registered stage1 output without rerunning the expensive 581-stream screen, runs whole-window `verify.py` via `pdir_verify.py`, and exports all actual texts.
- [Passing Windows GitHub Actions run 44021379143](https://github.com/FlareZ123/liber-primus/actions/runs/44021379143) and [all fifteen full-window plaintext/control records](https://github.com/FlareZ123/liber-primus/actions/runs/44021379143/artifacts/14301805113); prior preliminary workflow run `44020536605` failed before verification because the two intended `real`/`null` artifact trees were both matched by filename. The run was corrected and repeated successfully, with exact original input unchanged.
- The campaign's other rules/conventions/windows may still contain a different signal; this report excludes only these **three exact recovered first300 hits** and the other top four hits in each source-registered `.tsv`. It does not prove all direction rules false or exclude a source-derived key outside the existing 581 streams.

**Decision:** Retire these three first300 high-scoring hits as local selection/beam noise. Continue the already-launched remaining original pdir convention shards, and dispatch the existing `sims/lp2_pdir_stage1_reduce.py` reducer only when both 216-job matrices are actually complete. Future work should demand a source-selected key/clock and independently recipherable unknown plaintext, not retune these three offsets.
