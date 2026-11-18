# Conditional word crib from the p36 triple five-step echo

**18 November 2026. Status: a reproducible candidate for unknown plaintext, NOT an authenticated decryption.**

An original printed ten-rune word at **LP2 p36**, visible in original **53.jpg**, is split only by a **line wrap**:

```text
ᛈᛟᛄᚪᛝᛈ/
ᚦᛈᚪᛝ
```

It has the Gematria transliteration `P OE J A NG P TH P A NG`. The words' five aligned pairs (rune positions 0/5 through 4/9) have equality pattern `[equal, different, different, equal, equal]`. This is the only ten-rune word with **three exact five-step equalities** in the section-spanning original-rune census examined on 18 November. Its exact word is preserved in [the single-file reader](../sims/lp2_p36_lag5_tapestries_conditional_crib_sft.cjs); the line break is ignored while the word boundary is retained.

The extensively discussed **order-five within-word substitution** remains an *unproven cipher hypothesis*. If the same output alphabet recurs at positions five apart within a word, then ciphertext equalities at offset five imply identical **plaintext** GP runes at those positions. Under that conditional rule, the original word has an invariant plaintext letter pattern.

The repository already stores an independent English [29,157-word TextBlob spelling frequency list](../resources/control/english_wordfreq_textblob.txt). Re-encoding all its words in the original Gematria spelling convention (including ING as one rune and the documented alphabet merges), exactly **one** 10-rune English word matches all five equalities/inequalities:

**T A P E S T R I E S** (`TAPESTRIES`, TextBlob source frequency 1).

A larger **CMUdict** comparison, independently calculated locally, produced additional matches including `CONVECTIVE`, `SUPERSAVER`, `SCHERZINGER`, `SRIVASTAVA`, and `VANDEVELDE`; it therefore prevents treating `TAPESTRIES` as the unique possible English plaintext. The input CMUdict is a distinct modern English and proper-name lexicon, and was not part of the fixed repository SFT. Source-specific historical/archaic language could add alternatives.


**Independent earlier Cicada motif (weak, testable context):** The 2012 puzzle archive [subreddit stage](https://github.com/neuroretransmit/cicada/blob/main/2012/003-subreddit/README.md) identifies the original puzzle's stereogram imagery as a King Arthur/Guinevere **tapestry**. The relevant signed instruction there said the key was visible, but this applied to the 2012 stage. This is genuine prior use of a tapestry as an object in Cicada art, independent of p36's ten rune equalities. It is no evidence that LP2 p36 literally means TAPESTRIES or that the old stereogram supplies an LP2 key; use it only as a motivation to check whether an independently specified decoder can output the word.

**What this enables:** Any fully specified, independently source-selected order-five word decoder can now test a frozen, unusually discriminating **plaintext prediction** at LP2 p36: `TAPESTRIES` should decrypt from the ten original rune positions without adjusting the key to it, and neighboring original ciphertext must continue to meaningful GP English under the same mechanism. This would be more meaningful than merely reproducing three echoes. If the predicted word disagrees, the crib is rejected under that decoder, and other candidate words remain possible.

**What it does not show:** No operator, key or authenticated plaintext has been recovered. Matching a 10-rune shape in a lexicon is compatible with coincidence; the candidate's base frequency in the fixed lexicon is very low (1), so the single-word match alone is particularly weak evidence of intended plaintext. This belongs in active exploratory research pending an independent decipherment.
