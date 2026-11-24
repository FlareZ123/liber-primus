# DJU BEI echo: exact spacing-free shared latent-F key inference

**24 November 2026, Agent5. Completed 256/768-rune likelihood diagnostic; no recovered key or plaintext.** The authentic repeated six-rune phrase at zero-based offsets 6555–6560 and 12950–12955 selects one fixed backwards alignment, not an offset search. Earlier [fixed-clock equality and exact intact-group latent-F CSP](lp2-echo-reused-key-exact-gate.md) rejects its ordinary/native lexical models, while arbitrary latent F alignment survives a permissive equality bound. [Agent9's prior sparse overlap search](lp2-interrupted-shared-pad-overlap-agent9.md) also documents poor spacing-free key recovery. The present inference removes word boundaries and sums all legal F-mask alignments exactly at this fixed source-selected echo, instead of scanning offsets or a finite dictionary.

## Model

Read both physical suffixes backwards, anchored at the same final consuming key. For each non-F P, consume the next common independent uniform GP29 pad rune and emit C=P+K mod29. For P=0 emit C=0 without consuming. A ciphertext zero can also be consuming. Each tape has an independent reverse GP29 trigram language model, trained on literal solved sources plus pinned Gibran, Emerson and Shakespeare, excluding both target donors on a plant.

Dynamic programming states are (physical offsets i,j; last two plaintext runes of each tape), compressed by the shared-pad relation for the most recent consuming pair. Enumerate all possible leading transparent F runs at each step; for the next consuming pair enforce P1−P2=C1−C2. Scale probabilities by 29 per physical rune to avoid underflow (paired consuming emission contributes 29; single consuming tail contributes 1; hold contributes 29). If one tape exhausts, marginalize the other independent tail; disjoint terminal cases prevent double-counting both all-held tails. Max-product backpointers recover a complete legal MAP pair and common pad, verified by exact replay. Single-symbol analytic marginal checks include both zero and nonzero ciphertext. No spaces or word lexicon. Compare to exact independent-pad marginal and subtract the first six matched-rune LLR, because the echo itself selected the alignment.

## 256 physical runes from each echo end

Three donor pairs have deliberately identical six non-F plaintext prefix runes, then distinct native text; shared plants use one hidden random pad, matched independent controls share only the echo-prefix pad. The six-rune prefix is conditioned out. No original content is used to fit the models.

| Pair | Shared-pad conditional LLR (nats) | Independent conditional LLR | Shared MAP correct key / ≤256 |
|---|---:|---:|---:|
| Gibran / Shakespeare | −0.994743 | −5.196864 | 27 |
| Gibran / Emerson | +3.539042 | −3.546463 | 12 |
| Shakespeare / Emerson | +4.020529 | −6.910819 | 8 |
| Original fixed echo | −0.417459 | — | unknown |

The three matched comparisons separate, but one true shared pad has negative likelihood gain and all MAP recoveries are poor (35–45/256 plaintext runes per tape, only 8–27 correct key digits). The original score lies within the three shared controls and above these three independent controls; this is **inconclusive**, not key recovery, proof of reuse, or a calibrated significance claim. The original maximum path is fragmented nonprose. The model has insufficient information to identify a two-time pad reliably. The frozen 768-rune extension below reports incremental LLR over the first 256 separately, without choosing a new offset or using a word-boundary prior.

[SFT](../sims/lp2_echo_latent_f_spacingfree_joint_sft.cjs), frozen commit a2b29fe6. Connected JS executed all seven 256-rune cases, including analytic checks and replay; no CI.

## Frozen 768-rune continuation (sum-product only)

The first 256 original runes remain unchanged. Condition additionally on those 256 and score the next 512 physical runes on both tapes. Larger donor windows are fixed by the same first-six-non-F rule; they are separate plant realizations from the 256-rune test. No further MAP claim (shorter controls failed key recovery).

| Case | Conditional LLR after six-rune echo | Incremental LLR over positions 256–767 |
|---|---:|---:|
| Gibran/Shakespeare shared | −0.485027 | −1.175881 |
| Gibran/Shakespeare independent | −9.275222 | −6.343521 |
| Gibran/Emerson shared | +19.758207 | +13.650876 |
| Gibran/Emerson independent | −9.999150 | −6.147309 |
| Original fixed echo | **−14.194685** | **−13.777225** |

Original full LLR −6.446978; six-rune prefix +7.747706; first256 +7.330247. Thus the initially ambiguous fixed echo does not predict a longer continuation under the modeled shared uniform additive pad. The two matched control pairs separate, although one true shared control itself has slightly negative incremental LLR; the diagnostic remains limited, no all-key or all-language exclusion. Do not claim a significant p-value from these matched plants. Original exact filter evaluated 17,957 reachable cells and 14,046,995 history states. No coherent original plaintext or authentic key. `node sims/lp2_echo_latent_f_spacingfree_joint_sft.cjs 6 768 sum 256` (cases0–3 for matched controls). Nested output commit ee9e246d, actual connected JS executions, no CI.
