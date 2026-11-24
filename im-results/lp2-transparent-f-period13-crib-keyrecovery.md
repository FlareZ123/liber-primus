# Transparent-F period-13 dictionary-anchored key recovery

Period 13 is independently visible as the original p0 red 13-rune title and its large red dot marker; the solved LP1 keyword FIRFUMFERENFE also has 13 GP runes. This attack allows either literal F/no advance or encrypted non-F/advance at every ciphertext F. It does not assume every F is transparent. The key is an unknown repeating GP29 additive sequence, rotated to the start of a dictionary-selected intact long F-free ciphertext word. No cipher key is chosen from original output. A word of length 11–14 fixes 11–13 key positions under each candidate F-free plaintext; exhaust all residual key positions. Exact bitset forward and backward phase reachability rejects keys with no legal full-source inverse, without language scoring. Surviving keys undergo exact word-local Viterbi language scoring and exact re-encryption. The three controls use independent keys and authentic native-GP text; the same algorithm is used on all eight original source sections and p54–55. This is a dictionary-conditioned finite attack, not an exclusion of OOV anchors or other periods.

| Type | Section | Anchor runes | Candidate keys | Full legal inverse keys | Best nats/rune | Exact control runes / total |
|---|---|---:|---:|---:|---:|---:|
| control | Gibran heldout | 12 | 23171 | 22 | -1.9091 | 1100 / 1100 |
| control | Emerson heldout | 12 | 23171 | 105 | -1.8015 | 1101 / 1101 |
| control | LP1 reference | 16 | 0 | 0 | - | - / 851 |
| original | section1 | 11 | 1199266 | 189 | -8.3619 | - / 729 |
| original | section2 | 12 | 23171 | 0 | - | - / 1145 |
| original | section3 | 14 | 8 | 0 | - | - / 1738 |
| original | section4 | 13 | 429 | 0 | - | - / 1894 |
| original | section5 | - | - | - | - | - / - |
| original | section6 | 12 | 23171 | 0 | - | - / 1433 |
| original | section7 | 12 | 23171 | 0 | - | - / 1680 |
| original | section8 | 13 | 429 | 0 | - | - / 3316 |
| original | supplemental p54–55 | 11 | 1199266 | 1443 | -7.9536 | - / 308 |

See machine-readable [results](lp2-transparent-f-period13-crib-keyrecovery.json) for anchor positions, dictionary coverage, key recovery and candidate text. Reproduce with `node sims/lp2_transparent_f_period13_crib_keyrecovery_sft.cjs`.
