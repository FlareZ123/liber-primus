# p32: exact two-half literal passage shared-pad recovery

Agent 49, 26 November 2026. **No prefix survives. No plaintext/key recovery.**

## Hypothesis and scope

The 121 runes of p32 admit an 11×11 row-major reflow (not the printed six-line layout). Its central-column TWA extraction has provisionally been interpreted as Old English "two". This motivates a distinct direct two-stream consumer: leave the central eleven runes alone, read the five left columns row-major, and read the five right columns row-major in either forward or mirror order. Neither TWA nor a shared-pad mechanism is authenticated. This differs from the earlier p32/p55 shared-pad tests and the p32 HOME→BUDS diagonal Hill4 consumer.

For a left and right ciphertext stream of 55 runes each, grant a completely arbitrary GP29 pad K, independent shift b, and sign s∈{−1,+1}:
C_L=P_L+K; C_R=P_R+sK+b (mod29). Hence D=C_R−sC_L=P_R−sP_L+b. Consecutive differences eliminate b. Index exact ten-increment prefixes of every 55-rune window in the source library. For each possible left source window, directly join the computed right increment prefix, solve b from position 0, test the remaining prefix through position 31, then predict all 23 withheld pairs. Every successful solution recovers the 55 pad digits and replays both ciphertexts exactly. No dictionary/language scoring, key sampling, or assumed word boundaries.

Source library: 9 source-native solved GP29 sections, corrected native Beowulf profile, historically linked Self-Reliance and three Liber AL chapters, and Gibran's Prophet fixture. English transliteration greedily uses the canonical GP table per alphabetic word, with QU→CW, V→U, K/Q→C, Z→S. Gibran fixture includes its packaged Gutenberg paratext. Contiguous windows never span different source records. Finite source scope, not a claim that LP2 quotes these works.

## Actual inverse

176,508 distinct indexed source placements; 31,155,074,064 ordered pairs per orientation/sign configuration. Ten-increment index reduces the exact join to a scan rather than enumerating all pairs. 8 blind planted controls recover the true plaintext pair, b and all 55 pad digits, then exactly reproduce every withheld pair (184/184). Four controls have two source-pair records rather than a unique prefix; both records survive the holdout. Control uniqueness is therefore not claimed.

| Original orientation | Pad sign | Prefix survivors | Full survivors |
|---|---:|---:|---:|
| Forward right | +1 | 0 | 0 |
| Forward right | −1 | 0 | 0 |
| Mirror right | +1 | 0 | 0 |
| Mirror right | −1 | 0 | 0 |

No key or plaintext is recovered. Retire this particular literal-source shared-pad interpretation of the two half-squares; it cannot exclude novel prose, other source passages or reflows, nonadditive ciphers, or an authentic alternative reading of TWA.

[SFT](../sims/lp2_p32_two_halves_literal_sharedpad_sft.cjs); [raw results and input blobs](lp2-p32-two-halves-literal-sharedpad.json). Executed core on connected JavaScript runtime, not an independent Windows Node CI run.
