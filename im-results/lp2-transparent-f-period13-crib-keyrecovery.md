# Transparent-F period-13 dictionary-anchored key recovery

Period 13 is independently visible as the original p0 red 13-rune title and its large red dot marker; the solved LP1 keyword FIRFUMFERENFE also has 13 GP runes. This attack allows either literal F/no advance or encrypted non-F/advance at every ciphertext F. The key is an unknown repeating GP29 additive sequence, rotated to the start of a dictionary-selected intact long ciphertext word. A candidate word with at least 11 consuming runes fixes at least 11 of 13 key positions; exhaust the residual positions. Exact bidirectional bitset phase reachability rejects keys with no legal full-source inverse, without language scoring. Surviving key/anchor pairs undergo exact word-local Viterbi language scoring and exact re-encryption. The initial F-free-only version recovered the Gibran and Emerson keys exactly but skipped original section5 and selected an OOV metadata token in the LP1 control. This generalization permits F-bearing anchors and removes editorial headers/bracketed notes from LP1 before making a plant. No original-derived key is used in the controls. This is a dictionary-conditioned finite attack, not an exclusion of OOV anchors or other periods. Candidate counts are key/anchor pairs (a key may recur).

| Type | Section | Anchor runes | Non-F ciphertext | Candidate key/anchor pairs | Full legal inverse pairs | Best nats/rune | Exact control runes / total |
|---|---|---:|---:|---:|---:|---:|---:|
| control | Gibran heldout | 12 | 12 | 23171 | 22 | -1.9091 | 1100 / 1100 |
| control | Emerson heldout | 12 | 12 | 23171 | 105 | -1.8015 | 1101 / 1101 |
| control | LP1 reference | 13 | 13 | 429 | 1 | -1.8241 | 1500 / 1500 |
| original | section1 | 11 | 11 | 1199266 | 189 | -8.3619 | - / 729 |
| original | section2 | 12 | 12 | 23171 | 0 | - | - / 1145 |
| original | section3 | 14 | 14 | 8 | 0 | - | - / 1738 |
| original | section4 | 13 | 13 | 429 | 0 | - | - / 1894 |
| original | section5 | 14 | 13 | 10 | 0 | - | - / 1021 |
| original | section6 | 12 | 12 | 23171 | 0 | - | - / 1433 |
| original | section7 | 12 | 12 | 23171 | 0 | - | - / 1680 |
| original | section8 | 13 | 13 | 429 | 0 | - | - / 3316 |
| original | supplemental p54–55 | 13 | 12 | 603 | 0 | - | - / 308 |

See machine-readable [results](lp2-transparent-f-period13-crib-keyrecovery.json) for anchor positions, dictionary coverage, key recovery and candidate text. Reproduce with `node sims/lp2_transparent_f_period13_crib_keyrecovery_sft.cjs`.
