# Spacing-free exact self-word Gematria prime-index inverse

**Agent 3, 24 November 2026 — independent original-input decision.** The exact 2014 participant-inspired word-prime-index candidate was previously tested only at printed groups. Original printed word-length order has weak grammar, so this test removes all printed boundaries without changing the proposed cipher. No unknown plaintext, authenticated key or continuation recovered.

## Fixed operation and exact inverse

For each actual plaintext word w, let S be its positive GP-prime weight sum. A plaintext F emits literal ciphertext F and holds q. Otherwise C=P+(prime[S+q]−1) mod29, with one-based prime indexing and q initially zero. This is precisely the [previous formula](lp2-2014-wordprime-position-index-gate.md). No fitted key or offset. Because each GP weight lies in [2,109], enumerate S=2..109L for L at most 24 (frozen before original scoring). At each consuming step derive P uniquely; reject P=0, branch at observed C=0 for literal F; prune if sum exceeds S or cannot attain S in remaining length. A candidate terminates when sum=S. This exhausts every word and all latent F masks of length 1..24, including OOV words. The forward map need not be injective.

Create a directed edge from each reachable offset to the end of each exact word. The acyclic graph supports exact MAP segmentation plus a separate exact maximum lexical coverage DP allowing mathematically valid OOV words. Neither uses the original printed word cuts, rubric positions or internal page seams. The latter objective gives a minimum count of OOV runes independently of language ranking, conditional on the finite vocabulary and word-length bound.

## Independent model and controls

Word prior: TextBlob frequencies, canonical native GP normalization (QU→CW, ING→NG, IO→IA, K/Q→C, V→U, Z→S) plus quarter weight for distinct literal greedy encodings; Shakespeare source and solved sections 0,2,6,7,8 each add actual counts. Single-rune lexical entries restricted to A/I/O. Training excludes complete sections 1,3,4,5. 34,895 unique types; 1,167,089.75 weighted lexicon occurrences, 5,126,805 weighted rune observations. Mixture .95 lexical frequency and .05 smoothed word-length and within-word GP trigram prior (interpolation alpha8, unigram .5). All frozen before original evaluation. No original training.

Gate: each native control must decode fully, recover ≥95% exact runes and ≥90% genuine boundaries. This is a boundary-recovery control with fixed cipher law, not evidence that Cicada used the law.

| Native control | Exact runes | Genuine boundaries | True graph edges | Maximum lexical coverage | MAP nats/rune |
|---|---:|---:|---:|---:|---:|
| WELCOME | 515/515 | 124/124 | 124/124 | 503/515 | −1.761375 |
| First KOAN | 767/780 | 207/208 | 208/208 | 776/780 | −1.731254 |
| LOSS OF DIVINITY | 755/755 | 181/181 | 181/181 | 734/755 | −1.847000 |
| Second KOAN | 319/319 | 88/88 | 88/88 | 316/319 | −1.719774 |

Total 2,356/2,369 runes, 600/601 genuine boundaries, all 601 true word edges, all selected paths replay exactly. The first KOAN has one wrong merged opening word. Native truth includes actual OOV spellings; max coverage can improve over true segmentation.

## Original p0–2 and disjoint p16–21

Both full scopes include all runes (including p0 red title), with all printed cuts erased. Neither is used to fit parameters.

| Scope | Candidate edges | Exact maximum lexical coverage | Minimum OOV runes | MAP known runes | MAP nats/rune |
|---|---:|---:|---:|---:|---:|
| p0–2 | 19,499 | 306/729 (41.98%) | 423 | 93 | −5.327104 |
| p16–21 | 39,882 | 673/1613 (41.72%) | 940 | 203 | −5.269923 |

Both have legal complete exact-replay paths, but neither yields connected prose. p0–2 starts W IT OTHNN F UINGI REARY OF RON PRCNGIAGY MARBE N EAP SUGISUBYAGOMIA MI SLM PLBLEGN FIRUTHP HYSHARUTH EA CHAO YEA. Even the max-coverage witness must leave more than half of each original tape OOV, versus 97–99% achievable native-control coverage. The earlier intact-word failure persists without any printed word-boundary assumption. Retire this exact self-word index law under the declared native register; other languages, longer words and different state laws are outside scope. No offset or formula variants introduced after original evaluation.

## Reproduction

[Core](../sims/lp2_spacingfree_selfword_primeindex_core.cjs) · [entry point](../sims/lp2_spacingfree_selfword_primeindex_sft.cjs) · [raw control outputs](lp2-spacingfree-selfword-primeindex-controls.json) · [raw original outputs](lp2-spacingfree-selfword-primeindex-original.json). Actual core executed in connected V8 first on controls, then original. The standalone Node22 wrapper was assembled afterward; no CI execution claimed. Raw files preserve numeric words and maximum-coverage witnesses.
