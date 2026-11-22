# Original floral lag13/31 feedback: full-chapter and page-reset all-secret decision

**Agent27 · 22 November 2026 · Director [#2218](https://github.com/FlareZ123/liber-primus/issues/2218).** A concrete, independently illustrated nonlinear-state candidate is narrowed by original-cipher evidence. **No previously unknown plaintext, genuine key, authenticated cipher, or destination is recovered.** This experiment concerns taps from the *actual earlier ciphertext*, not the previously tested i−1/i−2 Fibonacci two-tap family or a repeating eight-column table key.

## Human-readable source hypothesis and alternative

The repeated flower borders on physical p40–55 (original images 57.jpg–72.jpg) each contain two sets of five binary-looking marks, read in the already independently established source interpretation as **13** at left and **31** at right. A human might use those two printed integers as the *two feedback delays* in a reversible GP29 cipher. The p40–53 floral chapter provides **3,008 original runes**, including eight initial red runes, 51 terminal red runes and every true word carry. The rune-free numerical p50 page supplies no extra GP rune tick.

A simple single-state hypothesis is \`C[i]=P[i]+a×C[i−13]+b×C[i−31]+k mod29\`, with the first 31 original ciphertext runes as free initial outputs. The literal no-extra-key setting is \`a=b=1,k=0\`; a second, less direct reading would take \`a=13,b=31≡2 mod29\` as the numerical coefficients too. Both are decoded before any search. To avoid treating a poorly chosen scalar as proof against this mechanism, **grant all 841 coefficient pairs** \`(a,b)∈GF29²\` and any common additive constant \`k\`. The latter just rotates output labels, so cannot change symbol collision counts.

A materially distinct page-reset rival uses *the same lags* within each of the **13 rune-bearing physical pages** and grants 31 independent beginning-state runes on each page. Both architectures are over-generous to their hypotheses: in a page-reset variant even **every page gets independently fitted a and b, an arbitrary page offset and an arbitrary secret permutation of all 29 rune labels**. Since a secret bijection leaves equal-rune pairs unchanged, this much larger family has an exact computable key-independent upper envelope.

Neither a 13/31 *delay* interpretation nor the specific additive linear feedback law is printed in the source. The exact same motif can be decoration or two numerical row selectors. This missing authored operation is the project's strongest objection, regardless of the negative result.

## Original-cipher envelope and held-out decision

For each whole-chapter pair \`a,b\`, compute \`P[i]=(C[i]−a×C[i−13]−b×C[i−31]) mod29\` for i≥31. No fit, key, phase, red glyph or completed word may be removed. The statistic is the 29-rune symbol **index of coincidence** (equal ordered pairs / eligible ordered pairs).

| Architecture or candidate | Original cipher eligible runes | Maximum attainable native-like IoC |
| --- | ---: | ---: |
| Literal continuous a=b=1 | 2,977 | **0.0343130217** |
| Continuous literal coefficients a=13,b=2 | 2,977 | **0.0345678879** |
| **Best all 841 continuous a,b**, any secret global constant/alphabet permutation | 2,977 | **0.0347859576**, best a=1,b=5; 308,188 / 8,859,552 collision pairs |
| **Page-reset** even with a,b,constant and secret alphabet chosen **independently on each of 13 pages** | 2,605 | **0.0391928919**, 22,858 / 583,218 within-page collision pairs |

The within-page maximum is a *sum of thirteen independently optimized pair numerators*, not an incorrectly pooled alphabet across independently secret page keys. Thus it is at least as permissive as any one page-local a,b rule, and also every page-local Caesar/secret substitution of the recovered rune labels. The 403 initial positions are completely unconstrained; this test claims nothing about them.

For a genuinely prospective training/holdout assessment, select the single pair maximizing native symbol collisions on the **first p40 200 decryptable runes only**. It selects \`a=14,b=6\` at **0.0390452261**, still far from native text. Freeze that pair without readjustment: the untouched continuous p45–46 output has IoC **0.0354497354** across **540** runes, and the original p52–53 output has **0.0351730436** across **442** runes. Neither contains an independently credible native-English text passage. No page-reset alternative improves the source-native whole-page necessary bound.

## Independent native controls and positive inverse

Use three repository-archived, independently authored source works, converted with the **source-calibrated GP29 orthography** from solved LP1 and p57: \`ING→21\`, \`IO→27\`, \`QU→CW\`, \`V→U\`, \`K/Q→C\`, \`Z→S\` and the ordinary longest GP tokens. For each work take **nonoverlapping** complete 3,008-rune contiguous source windows, lay each over the **same 13 original page sizes**, and discard the same original first31 runes per page/whole chapter. Compute the native output IoC using the *identity* operation, which is a **lower bound** on any maximum taken over secret coefficients and alphabets.

| Native source | Independent 3,008-rune windows | Minimum true native whole-stream IoC | Minimum true native page-within IoC |
| --- | ---: | ---: | ---: |
| Gibran | 20 | **0.0586919068** | **0.0590379584** |
| Shakespeare | 72 | **0.0564741874** | **0.0566271960** |
| Emerson | 106 | **0.0590930557** | **0.0581600705** |
| **Original LP2, even under every allowed secret coefficient** | One original chapter | **≤0.0347859576** | **≤0.0391928919** |

These 198 source windows are finite literary comparators, not evidence of the unknown book's language or an unconditional authorship probability. They decisively show that this *specific fixed-lag affine-feedback class*, even under independent page secrets, does not yield the symbol collision profile expected for native GP29 English.

The [complete read-only, original-input Windows Node22 SFT](../sims/lp2_floral_lag13_lag31_two_tap_allsecret_source_sft.cjs) asserts 3,008 original input runes, all thirteen page sizes and every count above. It verifies **both forward/reverse directions exactly** on the original and on eight separate full-length positive plants: actual solved p57 GP source repeated to 3,008 symbols plus an independent all-29-symbol diagnostic, each run under the continuous and page-reset architectures at two frozen coefficient pairs. Every 3,008-rune planted plaintext round-trips completely. Exact forward reconstruction alone is a reversibility control, not evidence of a historical cipher.

## Decision and next operation

**Retire the source-lagged stationary affine GP29 ciphertext-feedback family** with lags13 and31, including arbitrary a,b, additive offsets, and secret fixed symbol alphabets, whether continuous across p50/page carries or reset at each physical page. This is a new, bounded decision beyond the earlier adjacent-tap \`i−1,i−2\` study; changing lag endpoints or introducing an arbitrary per-rune alphabet to force an English score would violate the source-constraint premise.

Issue #2218's general continuous nonlinear state **remains unresolved**. An actionable successor requires a visibly selected nonlinear update or external key that can be reconstructed and tested on **200 contiguous source rune positions**, then on a withheld page. P40's red8 and the p49–51 numeric insert have no authenticated role in the two-tap delay law. Until such an operation is identified, a high-dimensional state search would generate self-consistent ciphers without explaining how a 2014 player was meant to solve the actual book.
