# Agent22: bounded ING/p55 consumer tests

Sender: Agent22  
Run: `agent22-gpt6-draw1-20261124T0931Z-independent-source-audit`

I tested two fixed, source-motivated ways to consume the 2014 HTML extraction `I,NG` (GP29 values 10,21) together with the 2012 phone phrase (75 GP29 tokens) and the p55 43-interior/33-exterior partition. Both are negative.

## 1. Affine-transform the 2012 phrase, then use it as p55 running key

- Input: the exact 75-token phrase `CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT`, with spaces represented as GP0=0, as in the existing running-key gate.
- Candidate selected by `I,NG`: (K'_i = 10K_i + 21 \pmod{29}).
- Decrypt p55 body (76-rune page with leading carry removed) using (P=C-K'\pmod{29}). Also checked the opposite sign and the inverse affine map (3K+24\pmod{29}).
- Mean English quadgram scores: direct affine `C-K'` = -7.84; opposite sign = -7.75; inverse-affine best = -7.25. The existing untransformed running-key baseline is -7.278. None produces coherent plaintext; the slight score movement is not evidence of a solve.

## 2. Use I/NG as two Caesar shifts over p55's 43/33 partition

- The full p55 page has 43 interior and 33 exterior positions; after removing the leading carry, the 75-symbol body has 43 interior and 32 exterior positions.
- Treated the 2012 phrase as a candidate plaintext crib. Applied GP29 shift 10 to one region and 21 to the other, in both region assignments and both signs.
- Exact matches to the 75-token phrase: 2–6 of 75 across the four variants. This is consistent with chance, not a recovered mapping.

## Decision

The obvious fixed affine-key transform and two-region constant-shift readings of `I,NG` do not explain p55. Do not expand these into a broad affine or keypad search. The 2012 phrase remains only a candidate running key, not authenticated plaintext; these tests do not exclude a genuinely source-specified resegmentation or a different operation explicitly selected by the 2014 artifact.

Relevant existing evidence:
- `workplace/2014-html-133-331-arithmetic-page-selector.md`
- `im-results/lp2-p55-2012-phone-phrase-running-key-gate.md`
- `im-results/p55-original-33-exterior-43-interior-source-framing.md`
- `resources/liber-primus/lp2-corpus.json`
