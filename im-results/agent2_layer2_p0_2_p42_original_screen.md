# Two-layer LP2 original-source gate: complete p0-p2 opening and held-out p42

**Scope:** fixed historical number-stream/keyword two-layer families only; this is not a general LP2 decipherment.

## Source-locked inputs

- Complete opening: original LP2 p0-p2, reference window seg0.7, 729 runes, initial previous-ciphertext value -1.
- Independent holdout: complete single-block LP2 p42 paragraph, 272 runes; previous-ciphertext value is the final rune of p41.
- The p42 window begins 504 runes into the existing seg0.15 p40-p55 section, outside the earlier first-300-rune seg0.15 window.
- Reference source: pnotisdev/cicada3301@15200c67abee106913ba01ff504c5b6e88d16cc7.
- The periodic counter widening was checked against the unmodified reference at n=300; normalized screen TSVs were identical.

## Positive-control gate

- Serial fixed-keyword controls (both the 581-stream solved-key family and the 20-stream 30-keyword family): **FAIL**.
- Combined one-pointer A1 order controls: **FAIL**.
- Unknown-keyword period 2-14 with ordinary F consumption (litf=0) controls: **FAIL**.
- Unknown-keyword period 2-14 with literal-F bypass (litf=1) controls: **FAIL**.
- Positive windows were independently planted GP29 ciphertexts of 729 and 272 runes; verification used the unchanged reference whole-window bigram rule.

## Original versus equal-work randomized null

| Window | Family | Original best | Matched-null best | Original verified candidates | Null verified candidates |
|---|---|---:|---:|---:|---:|

## Candidate adjudication

No original screen candidate passed the reference whole-window rule (score >= +2.0 per rune and >= its 20-offset matched-null maximum +5.0). No full-section expansion is justified.

## Incomplete or gated cells

- opening / solved: missing screen artifact; this cell remains open.
- opening / words: missing screen artifact; this cell remains open.
- opening / combined: missing screen artifact; this cell remains open.
- opening / periodic0: not run because the independently planted ordinary-F unknown-keyword controls did not pass.
- opening / periodic1: not run because the independently planted literal-F unknown-keyword controls did not pass.
- p42 / solved: missing screen artifact; this cell remains open.
- p42 / words: missing screen artifact; this cell remains open.
- p42 / combined: missing screen artifact; this cell remains open.
- p42 / periodic0: not run because the independently planted ordinary-F unknown-keyword controls did not pass.
- p42 / periodic1: not run because the independently planted literal-F unknown-keyword controls did not pass.

## Interpretation and limits

The search is bounded to the fixed source families: all exported number streams with the three solved-page keys; the 20 historically selected number streams with the 30 fixed keywords; the predeclared one-pointer A1 combination; and unknown keyword periods 2-14 on the same 20 streams. The matched-null KSBs preserve each family’s stream count and individual lengths.

A screen maximum is a ranking statistic, not plaintext. Only the unchanged independent whole-window re-decode is counted as a candidate. A surviving candidate would still need exact original forward replay and prediction on untouched material before being promoted.

No conclusion here excludes other keys, other source-selected operations, different section clocks, or other cipher families. A negative result closes only this finite historical two-layer family on the two preregistered source windows.
