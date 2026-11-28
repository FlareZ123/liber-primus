# LP2 Round48 solved-symbol-table cardinality gate

## Decision

The artifact-side discriminator proposed by the independent Round48 audit is **negative** for using
the solved authoring alphabet to justify an m=35–37 silent-symbol picker.

Round48's pinned follow-up says to count **GP29 + space + punctuation + digits actually used**.
A conservative solved-source census is already **45 symbols**:

- 29 Gematria Primus runes;
- six source-native ordinary-text classes: word separator/space, period, comma, chapter/title mark,
  double quote, apostrophe;
- all ten Arabic digits 0–9, collectively present in the solved numeric material.

Relikd's documented transcription alphabet also includes semicolon (`⁖`), and its working input
contains that class, making the full documented text repertoire **46**. The conclusion does not
depend on this seventh punctuation class: 45 is already outside 35–37 and is the larger-count
failure case the Round48 proposal anticipated.

So `m=36 = 29+7` is **not** the result of the pre-specified solved-artifact census. It remains a
fitted visible-tape cardinality, not an independently source-selected mechanism parameter.

## Fixed sources

### Upstream prediction

Pinned source:

- `Dukotah/cicada3301`
- commit `b271334d9718bf68187f7a1e6362731159c36a2a`
- `liber-primus/analysis/round48/M1-INDEPENDENT-PASS.md`

That audit gives the homogeneous no-repeat picker law

`p_same(m) = (m-29) / (29 (m-1))`

and predicts about 79, 89, 99 adjacent equalities for m=35,36,37 on the 12,956-rune LP2 tape. It
then explicitly proposes the solved-alphabet census above as the independent artifact test. It also
records two separate limitations: printed separators are not themselves the silent symbols
(23/86 equalities cross printed boundaries), and the homogeneous picker does not explain T7
(+0.380 equality-gap lag-1 autocorrelation).

### Source-native symbol evidence

Pinned transcription/tooling source:

- `relikd/LiberPrayground`
- commit `719380ebee0523ad7f2fbf389c6f960d51bea5a4`

Its README documents `•` space, `⁘` period, `⁚` comma, `⁖` semicolon and `⁜` chapter mark.
Solved/source transcriptions also preserve literal double quote and apostrophe. Relevant pinned
Git blobs:

| file | blob | relevant non-runes |
| --- | --- | --- |
| `pages/solved_0_koan_1.txt` | `20b93910be67bd93dc1a076c36e628f8ba54cf42` | quote, space, period, comma, chapter mark |
| `pages/solved_jpg107-167.txt` | `a86281c0160d195ec6e91043906089d68446c1e0` | quote, apostrophe, space, period, comma, chapter mark |
| `pages/0_wisdom.txt` | `320257b0db6ee6326ef3fc216c5379c9c91694f3` | digits 1–8 |
| `pages/jpg229.txt` | `2506940a81a324e127e6f722c0d11893550714ed` | digits 0,1,2,3,4,6,7,8,9 |
| `_input.txt` | `cc6b2c95ee1c034a179fa4cfc3d1262bf6ee5379` | quote, apostrophe, space, semicolon, period, comma, chapter mark |

The union of the two numeric solved-page sources contains every digit 0–9. Project-local
`resources/transcriptions/lp1_wulfic_canonical.txt` independently preserves the numeric
tables/numbered text, though its punctuation normalization is too coarse for the class census.

## Quantitative gate

Using 12,955 adjacent opportunities and the independent-step law stated for this homogeneous model:

| m | interpretation | E[equalities] | z for observed 86 | P[X<=86] |
| ---: | --- | ---: | ---: | ---: |
| 35 | fitted neighborhood | 78.8337 | +0.810 | 0.8081 |
| 36 | fitted neighborhood | 89.3448 | -0.355 | 0.3874 |
| 37 | fitted neighborhood | 99.2720 | -1.337 | 0.0970 |
| **45** | conservative solved-source count | **162.4451** | **-6.036** | **2.56e-11** |
| **46** | full documented punctuation repertoire | **168.7625** | **-6.413** | **1.14e-12** |

The doublet-count MLE in this picker family is m≈35.675. That explains why the exploratory
35–37 band fits the ciphertext. The solved artifact count does not independently land there once
the required digits are included.

The tail values are model-internal binomial diagnostics, not universal probabilities over cipher
families.

## Consequence

**Reject the claim that the solved authoring alphabet supplies an independent source prior for
m=35–37.** The exact follow-up proposed to turn an exploratory fit into a creator-selected
mechanism returns at least 45.

This does not reject every hidden-symbol or erasure construction. A private 36-state machine
unrelated to printed characters remains possible, as do stateful/nonstationary mechanisms.
However, 36 must now be treated as a fitted phenomenological cardinality unless an artifact
actually supplies a 35–37-entry private state table.

The next high-value direction is therefore the separately measured p50/T7 state association, which
can potentially supply a concrete position-dependent gate rather than retrofitting the authoring
alphabet to seven silent states.
