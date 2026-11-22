# GP29 word-length resegmentation: exact all-key upper bound on original LP2

**Agent 3, 22 November 2026; Director #2177. Classification: source-conditioned original-cipher exclusion of a fixed, highly permissive word-delimiter cipher family.** This investigation recovers **no unknown plaintext, author key, or destination**. Its positive controls recover genuine GP29 text exactly.

## Intended operation and strongest rival

The original 2016 signed message calls Liber Primus's words a map and its numbers a direction. The original LP2 stream has 2,896 printed words over 12,956 runes, with 32 authentic words continuing across a physical page break. Existing length-order work showed that their adjacent word-length syntax lacks ordinary source-English dependencies. An economical alternative is that the **spaces frame cipher operations**, rather than directly preserving plaintext word positions. This remains a hypothesis: the signed clue does not identify a particular word-length resegmentation, a per-position alphabet, or a static key.

Test one strongly favorable family of lossless delimiter interpretations. Within **each of the nine original visual chapters**, preserve the exact list of printed word lengths as public sidecar metadata, but allow four fixed readings of that list before assigning the unchanged rune stream to words:

1. Literal printed lengths in place.
2. The **next printed length** frames the current block, rotating the chapter length list left by one.
3. The **previous printed length** frames the current block, rotating right by one.
4. The chapter's printed length list is **reversed**.

These preserve all **12,956 original rune symbols and their order**, every original chapter rune total, and all physical page-crossing rune sequences. The chapter word totals are `158,255,383,437,224,326,378,669,66`; its rune totals are `729,1145,1729,1903,1021,1433,1680,3008,308`. No hidden offset or learned boundary is selected. A cipher can re-emit the original printed spaces by retaining its original length list, so the framing is reversible when the sidecar is retained.

For **every** resulting frame, define state `(L,j)`, with `L` the frame length and `j` its zero-based rune position. Grant the attacker a **completely arbitrary, independent secret bijective mapping of all 29 GP symbols for each such state**. There are 105 observed `(L,j)` states; all their alphabets are fully unknown. This contains length/position Caesar shifts, all 29-symbol affine permutations, and many other value-changing keyed operations. A literal positive implementation also includes a directly invertible `C=(P+L+j) mod29` word clock. The much larger unknown-key claim below does not assume that particular formula.

## Exact unknown-key obstruction

Let `n(s,c)` be the number of occurrences of original ciphertext rune `c` in frame-state `s`. For **any** hidden permutation `π_s` of each state's complete 29-letter alphabet, at most `top_k(n(s,*))` source positions in that state can map to any particular set of `k` plaintext letters. Adding across all states gives the **sharp attainable upper bound**

`U_k = sum over states s of the k largest ciphertext frequency counts in s.`

The bound exhausts **all 29! alphabets per state implicitly**, without scoring or fitting a key, and is unaffected by rearranging the decoded rune order afterward. It also permits known spaces to be reattached after reading. A viable native-GP plaintext must meet the bound for its own four most frequent rune classes.

| Reframing of original printed lengths | Exact source max U1 /12,956 | Max U4 /12,956 | Max top-four share |
| --- | ---: | ---: | ---: |
| Literal | 828 | **2,912** | **22.4761%** |
| Next length | 849 | **2,910** | **22.4606%** |
| Previous length | 843 | **2,920** | **22.5378%** |
| Reversed lengths | 854 | **2,954** | **22.8002%** |

For an independent native-language calibration, the SFT encodes the original repository's Gibran and Shakespeare controls into **source-calibrated GP29**, including original solved-text `ING→ᛝ` and `IO→ᛡ`. It measures successive complete 12,956-rune windows at fixed stride 503, without inspecting any LP2 decoder:

- Gibran, **99** full-length windows: **minimum 4,373/12,956 = 33.7527%** of symbols in the four most frequent GP labels.
- Shakespeare, **406** windows: **minimum 4,266/12,956 = 32.9268%**.

All four exact all-secret original upper bounds are far below **every** independently encoded native-GP control window. No choice of 105 independently secret, state-specific GP29 alphabet permutations can produce these native-English registers from the full original LP2 under any of the four framed length grammars.

## Blind chapter with a stronger independent-key allowance

The p40–53 visual chapter contains **3,008 runes and 669 complete words** and is disjoint from the p16–21 interval (1,613 runes). If the hidden alphabets instead reset and become completely independent *per chapter*, whole-book frequency concentration no longer gives a universal exclusion. On the **untouched full p40–53 chapter alone**, however, the exact literal-frames upper bound is **U4=957/3,008 =31.8152%**, even when all its `(L,j)` state maps have arbitrary separate chapter-only keys. In 3,008-rune fixed-stride controls, the minimum observed Gibran top-four count is **1,015** over 119 windows and the minimum Shakespeare count is **968** over 426 windows. Thus the literal per-chapter all-secret model cannot reproduce any of those 545 source-English controls on the full original p40–53 chapter. The next-length chapter-private bound is **974/3,008** and is not below every Shakespeare control; it must not inherit this stronger exclusion.

The fixed direct inverse `P=(C−L−j) mod29`, with the four sidecar framing rules, also decrypts p16–21 and p40–53 without key fitting. All **eight** untouched original intervals have GP29 IoC **0.03435–0.03463**; the authenticated original p57 clear reference is **0.06271**. First 40 decoded p16–21 runes remain nonlinguistic under every framing. These examples are weaker evidence than the all-secret bounds and are given only to make the reversible operation explicit.

## Positive paths and decision

The SFT tests full-rune forward/inverse recovery of a real GP29 Gibran passage with the exact visible length/position clock. Separately it constructs **105 independent planted 29-symbol secret permutations**, encrypts full-length real Gibran GP29 for each of the four source-resegmentation geometries, recovers **12,956/12,956** planted symbols under the true inverse, and asserts that the observed output capacity bound includes the true source four-rune mass. The full original corpus, cross-page word count and chapter boundaries are asserted.

**Reject the specified four word-length resegmentations followed by any globally fixed complete state-conditional GP29 permutation** as a direct restoration of ordinary GP29 English. The literal resegmentation has an additional full p40–53 independent-chapter exclusion relative to the tested controls. Space-side data remains an important alternative to literal plaintext word breaks, but no external sidecar grammar, changing secret state, nonlinear multi-rune emission, non-GP intermediary, or English plaintext is inferred by this test.

Read-only Node.js 22 Windows-compatible reproducer: [`sims/lp2_wordlength_resegment_allsecret_sft.cjs`](../sims/lp2_wordlength_resegment_allsecret_sft.cjs). Manual Windows workflow: [`.github/workflows/agent3-original-source-gates-manual.yml`](../.github/workflows/agent3-original-source-gates-manual.yml). Earlier source-length grammar findings and cross-page carry checks are in [the consolidated length study](lp2-printed-wordlength-conditional-independence-original-gate.md); the present result asks about **cipher alphabets after deterministic resegmentation**, rather than length-order mutual information or word permutation.
