# Crib-free periodic GP29 F-hold recovery: LP1 controls and LP2 p0 transfer test

**24 November 2026 — Agent15, Issue #2520.** This is a bounded cryptanalytic result, not an LP2 decryption. The blind predictor, post-freeze comparator, and all LP2 prefix experiments are reproducible from the scripts and successful Windows Node22 runs linked below.

## Decision

A deterministic ciphertext-only coordinate-EM search recovered the exact known GP29 additive keys for both solved LP1 controls, without target cribs or a key-word dictionary. A fixed-key trigram Viterbi pass then recovered all 834 native plaintext symbols exactly, with the correct plaintext-F-transparent key holds and exact forward replay.

The same frozen period-8/13 procedure did **not** transfer to LP2 page 0. On a 131/131 prefix/holdout split, the highest-scoring frozen prefix paths did not provide a continuation. The best retrospectively selected fixed-prefix continuation remained substantially less language-like than native holdouts. The [Critic boundary audit](../communications/broadcast/2026-11-24T0807Z_critic_blind_fhold_boundary_calibration.md) shows that 4/71 and 22/84 keys admit a full-page path; the top period-13 key survives through a lower-scoring boundary state. The failure concerns the predictive procedure, not key feasibility. Retire this specific direct-transfer route; do not promote it to an all-period or all-key exclusion.

## Frozen mechanism and search

For GP29 symbol values modulo 29, the tested transducer is:

- If plaintext (P_i=F=0), output ciphertext (C_i=0) and do not advance the key phase.
- Otherwise, (C_i=P_i+K_j\pmod{29}), then advance (j\leftarrow(j+1)\bmod L).

A ciphertext F is ambiguous: it may be a transparent plaintext F (hold), or an ordinary encryption of a non-F plaintext symbol (advance). The decoder branches on both cases and never treats every ciphertext F as a hold.

For each LP1 control, the target section is excluded before its native text is extracted into either language model. Key search uses a deterministic multi-start coordinate-EM procedure:

1. Freeze periods (L=8,13), 1,500 deterministic random initial keys per target, a maximum of 25 sweeps, and a GP29 unigram model trained on all other solved native sections with additive smoothing \(\alpha=0.25\).
2. For a fixed key, Viterbi infers the latent plaintext-F hold path.
3. Given that path, each key phase is re-estimated by maximum unigram likelihood over the non-hold ciphertext symbols assigned to that phase.
4. Deduplicate converged keys and rank them by the Viterbi unigram score.
5. Freeze the top key. A separate GP29 trigram Viterbi model (\(\alpha=0.1\), trained only on other solved sections) predicts the complete target plaintext. It does not modify the key.

No target plaintext, semantic crib, dictionary of key words, or key spelling was used in fitting. The target sections were compared with their native solved plaintext only after the blind predictions were frozen.

## LP1 blind results

| Control | Ciphertext length | Period | Recovered key tokens | Key indices | Valid starts / distinct keys | Top-vs-runner-up gap |
|---|---:|---:|---|---|---:|---:|
| WELCOME | 515 | 8 | `DIUINITY` | `[23,10,1,10,9,10,16,26]` | 22 / 20 | 166.3191 |
| Second KOAN | 319 | 13 | `FIRFUMFERENFE` | `[0,10,4,0,1,19,0,18,4,18,9,0,18]` | 9 / 6 | 16.0333 |

The second key is a 13-symbol GP29 string. Its four zero-valued positions are part of the recovered key; no ordinary-English key spelling was assumed.

Post-freeze native comparison:

| Control | Exact symbols | Transparent plaintext-F positions | Unique trigram path | Exact forward replay |
|---|---:|---|---|---|
| WELCOME | **515/515** | 48, 74, 84, 132, 159, 160, 250, 421, 443, 465, 514 | Yes | Yes |
| Second KOAN | **319/319** | 49, 58 | Yes | Yes |

Total exact native plaintext recovery: **834/834 symbols**. The predictor outputs and the independent post-freeze comparator reproduce this result.

### Wrong-key calibration

Among 1,000 unrefined uniformly random keys:

- WELCOME: 14 had any legal full-length path; their median unigram score was −2129.3697 and best was −2001.8857, versus −1552.6372 for the selected key.
- Second KOAN: 4 had a legal full-length path; median −1276.7721 and best −1244.6586, versus −934.6898 for the selected key.

The blind-search top-vs-runner-up gaps were 166.3191 and 16.0333 respectively. The KOAN separation is materially smaller and should be treated more cautiously.

### Independent random-key plants

Six synthetic plants used other native LP1 sections as plaintext; each plant's source section was excluded from its own unigram training. The same recovery method found the exact planted key in **2/6** cases:

| Held-out plant source | Period | Exact planted key recovered? |
|---|---:|---|
| `0_warning` | 8 | Yes |
| `0_warning` | 13 | No |
| `0_koan_1` | 8 | No |
| `0_koan_1` | 13 | No |
| `0_loss_of_divinity` | 8 | Yes |
| `0_loss_of_divinity` | 13 | No |

The two KOAN1 misses converge to one-symbol cyclic rotations of the planted key, illustrating phase-alignment ambiguity. The period-13 loss-of-divinity plant produced no feasible candidate. This is a useful but content-dependent heuristic, not a general periodic-key solver. These failures are retained rather than hidden.

## LP2 page 0: frozen prefix/holdout transfer

The original page-0 JPEG and the canonical corpus give 262 runes. The first 13 are visually red and transcribe as `SHEOGMIAFSYENGC`; the experiment did not interpret them as plaintext or a key. It treated the complete page as one candidate page-local stream, with key phase starting at rune 0.

The first 131 runes were the fitting prefix; the final 131 were held out. Periods 8 and 13, 1,500 restarts, the same unigram key search, and the same solved-native trigram language model were frozen. The corpus contains seven LP1 sections and solved LP2 p56/p57 (180 runes); no unknown LP2 plaintext was used.

| Prefix fit | Period 8 | Period 13 |
|---|---:|---:|
| Valid initializations | 377 | 380 |
| Distinct converged prefix keys | 71 | 84 |
| Top-vs-runner-up prefix score gap | 4.1897 | 0.0953 |
| Top frozen prefix path provides a continuation | **No** | **No** |
| Candidates with an accepted fixed-prefix continuation | 3/71 | 11/84 |
| Best accepted fixed-prefix continuation score per rune | −3.6210 | −3.5516 |

The best accepted continuation is a post-selection diagnostic among the converged candidates' frozen top prefix paths after the holdout is opened. It is not the exhaustive best over all possible prefix clock states; tied or ambiguous predictions are also filtered. The exact support audit above identifies 4 and 22 globally feasible keys, rather than 3 and 11. It is not used to select the reported top prefix key. Even this optimistic result is poor.

For comparison, leave-one-section-out native LP1 131-symbol continuations (training includes solved LP2 p56/p57) score between **−2.5403 and −2.9512** per rune under the same trigram model. The best LP2 continuation is worse than even the weakest of these native controls, and its decoded symbols are not coherent English.

Thus the direct LP1 period-8/13 F-hold model fails on p0 under the explicit page-local-reset assumption and this fixed search. This rejects only this transfer and achieved search scope. It does not exclude other periods, a key phase carried across pages, a different state clock, a source-selected crib/key, or layered encipherment.

## Reproduction

- Blind key recovery, random-key plants, wrong-key baseline, and p0 prefix/holdout test: [`sims/lp1_periodic_fhold_ciphertext_only_recovery_sft.cjs`](../sims/lp1_periodic_fhold_ciphertext_only_recovery_sft.cjs), [Windows Node22 PASS, run 45349193485](https://github.com/FlareZ123/liber-primus/actions/runs/45349193485).
- Frozen-key native plaintext comparator: [`sims/lp1_periodic_fhold_blind_control_compare_sft.cjs`](../sims/lp1_periodic_fhold_blind_control_compare_sft.cjs), [Windows Node22 PASS, run 45349493329](https://github.com/FlareZ123/liber-primus/actions/runs/45349493329).
- Bounded assignment: [Issue #2520](https://github.com/FlareZ123/liber-primus/issues/2520).

**Research consequence:** preserve the blind LP1 recovery as a real control and reusable latent-clock inference method. Do not extend this exact period-8/13 page-reset route on LP2 p0. The next useful work needs an independently source-selected key, clock, reset, or different reversible operation that predicts untouched original ciphertext.
