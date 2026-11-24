# Spacing-free q13 affine plaintext-autokey ranked inverse, p54–55

The exact native-word affine gate is conditional on the printed groups. This complementary attack uses no printed word boundaries. Its recurrence is C=P+K_head mod29 on consuming plaintext, followed by queue append aP+b; plaintext F emits F and holds the queue. All 812 invertible affine maps and all visible-zero masks are ranked by exact marginalized unigram evidence over every legal primer. The best 128 map/mask pairs receive exact cyclic bigram optimization; the best 12 of these receive exact cyclic trigram optimization. The model and key are frozen on original p54 (232 runes), with p55 (76) withheld. The native language model uses only the first 70% of each of three literary donors. Replay is asserted for every fitted prefix and legal full path.

The control workload is intentionally bounded: for the fixed maps (13,2) and (28,5), the earliest 308-rune native source window with at most six unavoidable prefix ciphertext zeros is selected, and deterministic primers avoid adding further initial zeros. This is a selection for computational feasibility, not language score. It does not represent unrestricted random-key calibration. An initial KOAN (3,7) attempt had at least eight unavoidable zeros in every 232/76 native window; its seven-zero cap was ineligible. An initial LOSS (28,5) control recovered the correct map and 76/76 withheld runes with the true mask ranked 2nd by trigram, despite an alternative top primer. The final reproducible control protocol is the six-zero experiment below.

```json
{
  "controls": [
    {
      "name": "0_koan_1",
      "offset": 0,
      "zeros": 4,
      "pairs": 12992,
      "truthRanks": [
        1,
        1,
        1
      ],
      "trueUnigramScore": -2.882396898703083,
      "top": {
        "mapCorrect": true,
        "keyCorrect": 13,
        "prefixCorrect": 232,
        "suffixCorrect": 76
      },
      "topScore": -2.1739137035811233,
      "exact": {
        "mapCorrect": true,
        "keyCorrect": 13,
        "prefixCorrect": 232,
        "suffixCorrect": 76
      }
    },
    {
      "name": "0_loss_of_divinity",
      "offset": 25,
      "zeros": 6,
      "pairs": 51968,
      "truthRanks": [
        1,
        1,
        1
      ],
      "trueUnigramScore": -2.9721886618339903,
      "top": {
        "mapCorrect": true,
        "keyCorrect": 13,
        "prefixCorrect": 232,
        "suffixCorrect": 76
      },
      "topScore": -2.582417360983584,
      "exact": {
        "mapCorrect": true,
        "keyCorrect": 13,
        "prefixCorrect": 232,
        "suffixCorrect": 76
      }
    }
  ],
  "target": {
    "pairs": 6496,
    "legal": 4,
    "topPrefix": -4.6915610800836784,
    "topLegal": false,
    "bestSuffix": -7.275200531345906,
    "maxUnigramScore": -3.3536236405336832
  }
}
```

The original rank scan includes all 6,496 affine map/mask pairs. The maximum unary score is an exact bound under the unary model, but the top-128/top-12 staged search is **not** exact over all trigram-ranked primers or all maps. The original best prefix finalist does not continue; none of the other finalists produces coherent p55 plaintext. The best legal suffix score is substantially below the native control. All candidate outputs, including failed continuations and native truth ranks, are retained in the JSON. A fitted nonlinguistic replay is not a solution. No unknown plaintext or key recovered.

Reproduce: `node sims/lp2_plaintext_autokey_q13_affine_spacingfree_sft.cjs`. Executed in the connected JS runtime; no independent Windows CI claim.
