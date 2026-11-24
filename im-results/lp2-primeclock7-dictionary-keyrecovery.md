# Seven-state plaintext-prime clock: dictionary-driven original key recovery

## Decision

A changing-state additive clock can evade fixed-position phase exclusions. We tested one deliberately finite exploratory family, using the authenticated GP prime weights but **not** claiming the creator selected modulus 7:

```
C_i = (P_i + K[s_i]) mod 29
s_(i+1) = (s_i + GPprime(P_i)) mod 7
```

All seven key entries are unknown. Because an arbitrary initial state is equivalent to rotating the secret table, the state at a selected anchor can be set to zero without losing any keys. Native word lengths are retained. Each exact dictionary plaintext candidate for an original word sets entries of the table; any conflict rejects that word. The search extends partially assigned keys through up to eight consecutive words, with no beam approximation, and decodes complete keys into the following original text. It ranks by dictionary rune coverage in a training prefix, then reports untouched continuation separately. This is an exploratory key-recovery mechanism, not evidence that the historical puzzle uses it.

## Data and controls

Canonical physical page arrays and original transcription are checked rune-for-rune on all 55 rune-bearing unknown pages and solved p57. The 28,695 distinct GP-native dictionary entries are the repository's TextBlob frequency list with the solved LP1 vocabulary and actual solved p57 words included. The latter augmentation is deliberate: native Cicada words such as PARABLE, INSTAR, and CIRCUMFERENCES are absent from the unaugmented frequency list. This is a vocabulary-assisted test, not blind general English language identification.

Three independently chosen nonconstant seven-entry keys on the **95 original clear p57 runes** produce 86, 80, and 76 complete dictionary-consistent candidate keys. All three exact keys win training ranking, recover all 95 original symbols including the independent 52-rune continuation, and re-encrypt exactly. This verifies the inverse and candidate inference in the stated dictionary-complete plant.

## Unknown original result

Scan every internal physical-page printed word of length at least nine (excluding first/last word fragments). Of **175** anchors, 24 admit any dictionary-compatible partial or complete table:

| Rune length | Original anchors | Compatible |
|---:|---:|---:|
|9|74|21|
|10|49|3|
|11|28|0|
|12|18|0|
|13|3|0|
|14|3|0|

Thus **all 52 original anchors of length >=11** are incompatible with every tested dictionary word under any seven-entry key and any starting state. Of 17 compatible anchors with at least 12 remaining words, 15 yield complete keys within the eight-word inference depth. All re-encrypt, as expected for any correct inverse. The highest held-out dictionary rune coverage is **3/29 = 10.34%**, versus 52/52 in all three plants; no continuation is coherent prose. No authentic unknown rune or key is recovered. Short fitted anchor words are false positives in isolation.

## Scope and next decision

The exact dictionary gate is finite: unknown vocabulary, moved boundaries, another state update, a larger table, and different plaintext representations remain possible. A modulus-7 clock is not independently selected by a first-party instruction. Do not interpret the failure as an all-English theorem or spend more effort tuning the same seven-state recurrence. The useful implementation lesson is that sparse secret-table assignments derived independently from long plaintext hypotheses can be joined before scoring unknown text. A separately motivated larger-state model may warrant a shared-key intersection attack.

Run from repository root: `node sims/lp2_primeclock7_dictionary_keyrecovery_sft.cjs`. [Raw output](lp2-primeclock7-dictionary-keyrecovery-output.json). The code was executed against the actual repository input via the connector JS runtime; Windows CI is not claimed.
