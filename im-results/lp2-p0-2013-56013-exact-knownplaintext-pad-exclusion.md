# Exact historical 2013 DATA/560.13 known-plaintext key search against p0 red title

**Agent31, 22 November 2026. Classification: executed bounded negative on a candidate local plaintext, not a decipherment.** No previously unknown LP2 plaintext, real key, reusable cipher or destination is recovered.

## Causal question

Physical LP2 p0 begins with a red **8+5-rune title**, followed by a red thirteen-dot marker. The signed January 2016 message nominates `EPIPHANY SEEKS`, the single adjacent 8+5 phrase in that message, as a p0 title-plaintext candidate. Existing residual-state constructions do not independently authenticate its additive key. In GP29, the untouched title ciphertext, candidate, and required key are:

```text
C = [15,8,18,3,6,19,27,0,15,26,18,21,5]
P = [18,13,10,13,8,24,9,26,15,18,18,5,15]
C-P mod29 = [26,24,8,19,27,24,18,3,0,8,0,16,19]
```

The 2013 Cicada puzzle genuinely used bytewise XOR against a precisely located slice of `DATA/560.13`. An exact matching historical key at any offset would identify a specific original source and address without scoring English. The missing premise is an original LP2 clue selecting that historical file, an offset and a GP29-to-byte transfer.

## Frozen source and finite scan

The original file's exact length **118,818,811 bytes** and SHA-256 `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f` are asserted. The p0 ciphertext is loaded from the original GP29 corpus. **Every one of 118,818,799 complete 13-byte windows** is tested under each of six direct byte transfer rules in both forward and reversed byte-key order:

| Target | Transfer from each original file byte |
| --- | --- |
| `C xor P` (GP29 indices) | literal byte |
| `GPprime(C) xor GPprime(P)` | literal byte |
| `C-P mod29` | `byte mod29` |
| `P-C mod29` | `byte mod29` |
| `C-P mod29` | `floor(29×byte/256)` |
| `P-C mod29` | `floor(29×byte/256)` |

No original key phase/offset is fitted, and no language or near-match scoring is used. All **12/12** source-native planted exact-key controls recover their fixed inserted position under their declared mapping and direction.

## Original-file result and research decision

**Zero exact thirteen-symbol key matches across all twelve cases.** The longest matching key prefix is **six**; literal raw-byte GP-index and GP-prime-weight XOR each reach only three. Partial prefixes are unsurprising over 118 million offsets. The pinned source-length and SHA-256 checks passed in the original Windows Node22 GitHub Actions job.

[Original-source CommonJS SFT](../sims/lp2_p0_2013_historical_pad_knownplain_crib_sft.cjs) · [Successful 22 November GitHub Actions run 44975004841](https://github.com/FlareZ123/liber-primus/actions/runs/44975004841).

This excludes direct contiguous DATA/560.13 pad reuse under **these exact six transfer rules**, conditional on the provisional `EPIPHANY SEEKS` candidate. It does not invalidate the candidate title, other authentic historical key sources, or a different source-selected key schedule. A successful unknown-page decoder has not been identified. The prior 249-rune blind full-body dense-pad experiment (`im-results/lp2-2013-56013-dense-direct-offset-gate.md`) tested a materially different original-input question and was not repeated.
