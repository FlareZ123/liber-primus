# Continuous prime-clock H2 decoder: positive-control failure

**Agent 26, 17 November 2026.** A new blind receiver tested a single successive-prime key clock over **all 12,956 original LP2 rune positions**, without restarting at the nine visibly marked chapters or at page boundaries. It held physical **p54–55 (308 runes)** completely apart from learning its hypothesized 29×29 secret tableau and hidden retry positions. The attempted original output is nonlinguistic; the planted true-H2 source-shaped controls also fail. Thus this is an **algorithmic identifiability failure, not an authentic decryption or source-cipher exclusion**.

## Source constraint and hypothesis

The authentic solved p56 uses a consecutive `φ(prime)` key stream. H2 speculates that LP2 instead feeds such a prime-row clock into a secret 29×29 per-row bijection. Proposed output that repeats the previous ciphertext may cause a hidden skip with stochastic probability `q=0.81`. Neither the 841-cell table, skip process, nor global clock rule is selected by original Cicada instructions. The book-global clock distinguishes this experiment from already published **physical-page reset** and **nine-chapter reset** variants. Exact source original word lengths and 12,648 training runes from p0–53 remain fixed.

## Frozen blind calibration and original

The standalone receiver generates three independent source-shaped manuscripts with genuine arbitrary secret tables, all **2,896 original word lengths**, and **354–365 true hidden skip events**. The true plaintext/table/clock are withheld from training and only used for downstream positive-control accuracy. It learns emissions from the Gibran-Shakespeare native GP29 reference without access to the 308-rune holdout and runs blind Viterbi/Hungarian refinement. The first passing [full-clock trial](https://github.com/FlareZ123/liber-primus/actions/runs/44145728087) overfit its maximum drift 640 and yielded only **3.35%** planted heldout plaintext accuracy.

To prevent unrestricted drift overfitting, a second frozen test used the independently predicted skip rate `q/(29-q)` and a broad four-standard-deviation path corridor. That [amended Windows run](https://github.com/FlareZ123/liber-primus/actions/runs/44146519936) passed execution and integrity checks:

| Score | Source-shaped true-H2 positive controls | Untouched original p54–55 |
|---|---:|---:|
| Exact secret table entries | **3.88%** out of 841 | Unknown |
| Exact training hidden clock | **1.20%** | Unknown |
| Heldout exact plaintext runes | **5.74%** out of 308 | Unknown |
| Heldout GP29 bigram log mean | **−3.972** | **−4.006** |
| Raw original GP29 bigram log mean | Not applicable | **−4.424** |

All planted calibration paths have incorrect skip certificates. The original terminal bigram score improves over raw ciphertext, but the same deceptive improvement arises in **known-secret, known-plaintext planted positive controls**, with recovered plaintext nearly at 1/29 chance. The first 150 original candidate symbols do not form coherent plaintext.

## Decision

The model remains untested by this receiver: positive-control power is far too weak. Do not promote its original language score as evidence of a real mechanism, and do not treat the original failure as proof against a continuous H2 clock. Progress would require a creator-selected secret-table/key operand or a genuinely stronger blind receiver that recovers source-shaped positive controls before attempting ciphertext. Additional unmotivated hyperparameter variation is lower value.

**Reproduction:** [read-only CommonJS SFT](../sims/lp2_h2_bookglobal_joint_blind_original_sft.cjs) · [manual Windows workflow](../.github/workflows/agent26-h2-bookglobal-blind-manual.yml).
