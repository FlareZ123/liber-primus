# Canonical adaptive whole-word MTF with shortlex literal escape (#3140)

**Decision (Agent13, 27 November 2026):** the single frozen exact whole-word recency grammar fails at the fourth original printed group. An out-of-range literal escape (not a fixed first-rune prefix) is reversible on eight native solved records and two historic donor texts, but the canonical integer transport cannot encode 116 original multirune GP-zero-leading groups. Independently, even the most generous reachable dictionary-size bound forces at least 2,155 original *canonical* groups into the literal branch. No original plaintext, key, or independently authored alternate framing.

## Frozen exploratory sender

Historical BASE29 is a source-attested integer conversion, and book-reference puzzles were used earlier; neither fact authenticates an adaptive dictionary or literal grammar. The initial dictionary is the first-occurrence order of distinct GP words from the repository-pinned 1906 Blake Marriage of Heaven and Hell edition (1,390 entries). Latin tokenization uses the existing GP longest-token convention, including ING, IO/IA, QU→CW, V→U, K/Q→C and Z→S; actual native holdouts instead use the original rune tokens. Freeze the first-occurrence vocabulary, source text, complete group framing and no resets within a message. The canonical transport uses unpadded ordinary base29 integer digits, including one-digit zero.

For each nonempty word w of length L, let shortlex(w) be its zero-based rank over all nonempty GP29 words ordered first by length, then by GP ordinal order. Thus shortlex(w)=sum_{j=1}^{L-1}29^j + numeric(w). With current ordered dictionary D of size N:

- If w occurs in D at zero-based rank r, transmit BASE29(r) and move w to the front.
- Otherwise transmit BASE29(N+shortlex(w)), then insert w at the front. This disjoint integer range is an explicit variable-length literal escape; it does not reserve a first digit.

Decode unpadded integer x; if x<N read rank and move to front, otherwise invert shortlex(x-N), reject if the literal is already in D, and insert. Exact reconstruction follows inductively from the shared initial state and identical deterministic transitions. The shortlex inverse preserves GP-zero-leading *plaintext* words. The single integer frame cannot accept GP-zero-leading *ciphertext* groups. No fitted aliases or side stream.

Code frozen [c42a720](https://github.com/FlareZ123/liber-primus/commit/c42a7207727e1fce8558358e8d0517be2ac4daaa) before native-control execution and original evaluation. The subsequent removal of one ambiguous counterfactual output field did not change the sender/receiver or exact gate.

## Exact round-trip and wrong-model controls

Eight separately reset native solved records (six physical LP1 clear pages, p56 decoded with known prime-minus-one and literal F at 56, p57 clear) recover all 1,181 runes, including all word boundaries, and exactly replay every encoded group. Also exact on Book of Law I (1,897 words) and Self-Reliance (10,170 words), both pinned independently of the Blake dictionary. All ten fail exact recovery under reversed initial dictionary and under disabling rank move-to-front; the synthetic OOV edge case exercises literal GP zeros, a repeated word, and a 14-rune literal (the wrong models also recover that edge, which is expected because it contains no distinguishing initial-dictionary use). Rates from the two substantial holdouts:

| Holdout | OOV fraction | >4-digit group fraction | Encoded repeat fraction |
|---|---:|---:|---:|
| Book of Law I | 16.39% | 11.70% | 4.887% |
| Self-Reliance | 19.20% | 16.09% | 4.077% |

This is calibration of the exploratory grammar, not evidence of a historical receiver. Source passages have different content and lengths, so rate comparisons are descriptive.

## Original grammar obstruction (before language scoring)

Canonical complete groups are parsed across line/page wraps; 12,956 runes and 2,896 groups in unresolved physical p0–55. First three groups enter the literal branch, then group index 3 (zero-based) is `ᚠᛄᛟ`, a nonminimal GP-zero-leading integer. No complete inverse. The Critic's [prior necessary condition](../communications/broadcast/2026-11-27T0319Z_critic_recency_reference_capacity.md) already identifies 116 such groups and 1,132 groups longer than four digits; this experiment is not another fixed-prefix escape count.

The selected initial vocabulary has N0=1390. Because at most one entry can be added per group, every ordinary reference in the entire book has rank ≤1390+2896−1=4285 (loose upper bound, even before accounting for its own access). Of the original 2,896 groups, **2,155 canonical integers exceed 4285**. Therefore even if a separate repair existed for all nonminimal groups, this *particular typed escape* would still have at least 2,155 forced literals among the unchanged canonical groups (74.41% of all printed groups, 77.52% of the 2,780 canonical groups), rather than 16–19% on the two substantial controls. Original repeat rate 86/12955=0.664% also differs from these two control rates. This is an exact lower bound on literal branches in the frozen dictionary-size regime, not a universal restriction on all possible recency dictionaries or on latent record boundaries.

Do not score the first three decoded words or retrofit padding/zero escapes, alternate dictionary rankings, boundaries or a new cipher. Missing input is an independently selected canonical group/escape grammar accommodating the original nonminimal integers and the observed length/literal statistics. No such source exists in the examined historical reference contract.

Reproduction: [SFT](../sims/lp2_whole_word_mtf_shortlex_sft.cjs), [raw output with exact six input blob identities and freeze commit](lp2-whole-word-mtf-shortlex-output.json). V8 computational core executed controls-only then original; standalone Node wrapper not separately executed.
