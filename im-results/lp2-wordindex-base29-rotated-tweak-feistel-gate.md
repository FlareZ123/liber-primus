# Rotated BASE29 word tweak: blind recovery and all-secret singleton obstruction

**Decision (#2477, 24 November 2026): the tested word-position-tweaked six-round alternating arithmetic Feistel is excluded for the observed solved-native singleton register.** A stronger exact two-original-singleton contradiction independently excludes every additive shift depending only on the multiset of the three BASE29 word-index digits, however the secret function is specified. Other order-sensitive tweaks and other nonlinear singleton maps remain open. No unknown plaintext/key was recovered.

## Historical construction and frozen experimental model

The 20-Feb-2010 [FFX proposal](https://csrc.nist.gov/CSRC/media/Projects/Block-Cipher-Techniques/documents/BCM/proposed-modes/ffx/ffx-spec.pdf) by Bellare, Rogaway and Spies specifies a tweakable, variable-radix alternating Feistel framework. The [NIST draft format-preserving modes announcement of 2013](https://csrc.nist.gov/news/2013/draft-publication-800-38g) is also period-available. Signed historical Cicada BASE29 supplies the independent radix representation. Neither source selects this experimental round function or word-index tweak for LP2. This is not a standard secure FFX implementation. #2258, #2239, #2461 and #2474 cover different earlier fixed/per-word, prefix-IV and whole-word affine/cyclic models; #2478 covers CBC-CS1 on two-rune packets, not a complete word-tweaked inverse.

Use all 2,896 actual complete words, including carried seams; 12,956 source runes exactly match canonical physical p0–55 indices. For a word of length n split its base29 integer digits into left floor(n/2) and right ceil(n/2) halves. At public zero-based whole-book word index t let (d0,d1,d2) be its least-to-most-significant base29 digits. For r=0..5 define T_r=d_(r mod 3)+29d_((r+1) mod 3)+841d_((r+2) mod 3). The round function at left width m is F(R,t,r)=a(R+T_r)^3+b(R+T_r)+c+r modulo 29^m; swap halves and add F to the former left. Six rounds preserve original widths. Reverse rounds subtract F. For n=1 the empty half is the unique element of Z/1, so no special free key, deleted symbol or nonce is needed. Key a=1..28, b,c=0..28 (23,548 possibilities). BigInt arithmetic preserves every original word length 1–14.

## Key recovery, source-exact invariant

At n=1 only rounds 1,3,5 can change the nonempty half. Their right inputs are zero, and their low tweak digits are d1,d0,d2. Hence the ciphertext singleton is exactly

C = P + a(d0³+d1³+d2³) + b(d0+d1+d2) + 3c + 9 mod 29.

The reproducer confirms this formula against full Feistel encoding and inverse for all 2,896 word indices under four keys (11,584 cases). Native solved LP source contains singleton symbols A=24, I=10, T=16. The fit first finds all keys maximizing compatible native singletons in p0–7, then scores decoded words of lengths 1–3 with an independent Gibran/Emerson GP-word count likelihood. No holdout rune is used for key selection.

**All-secret extension:** any additive singleton shift S that is an arbitrary function of the unordered three BASE29 digits has equal shifts at these two original positions (zero-based indices throughout):

| Whole-book word | Physical page | Global rune | Local rune | BASE29 digits (most significant first) | Cipher |
|---:|---:|---:|---:|---|---|
| 1274 | 23 | 5699 | 193 | (1,14,27) | D=23 |
| 1638 | 30 | 7311 | 4 | (1,27,14) | M=19 |

Their multiset is (1,14,27), so C1274−C1638=P1274−P1638=4 mod29. For the entire observed native singleton set {10,16,24}, the possible ordered differences are {0,6,8,14,15,21,23}. Four is absent. Enumeration of all 29 shifts confirms zero compatible shifts. The 83 original singleton indices have 82 distinct digit-multiset groups, with exactly this collision. This contradiction excludes arbitrary symmetric singleton-shift functions, not merely the cubic law, under the unchanged source-word clock and native singleton inventory. It also holds for any wider inventory lacking a difference of ±4. It does not exclude nonsymmetric tweaks or alternative singleton plaintext registers.

## Full original attack and controls

Four native-GP matched-layout controls use actual native words independently sampled within each original length stratum; these are not connected source passages. Blind fitting on p0–7 (413 complete words, 1,874 runes, 13 singleton and 177 short words) uniquely recovers all four hidden keys and the entire 12,956-rune plaintext per trial. A separate connected 755-rune native LOSS OF DIVINITY control fits on its first 108 words (54 short words, no singletons) and recovers all 755 runes, including untouched307. All replay assertions pass.

Original training has no all-singleton-feasible key: the best covers only 7/13 native singleton values, uniquely choosing (a,b,c)=(20,18,19). This failed-fit key is frozen and tested on untouched original regions without changing it. Independent full-book singleton enumeration, never used to select the training key, shows a sharp maximum of 21/83 among all 23,548 keys (one maximizer).

| Region | Original short-word lexical count | Original mean short-word log likelihood | Matched native control mean range |
|---|---:|---:|---:|
| p0–7 train | 14/177 | −10.94285 | −3.58347 to −3.35843 approximately |
| p16–21 holdout | 18/171 | −10.92152 | −3.30874 to −3.23753 |
| p40–53 holdout | 18/284 | −11.20202 | −3.58928 to −3.47513 |

The full original decode re-encrypts 12,956/12,956 runes exactly (as every key must). Regional IoCs 0.0344450, 0.0344458, 0.0344336 remain near 1/29. Neither heldout region contains connected decoded prose, and the frozen candidate is not an authenticated key.

**Research decision:** retire this rotated-tweak shared inverse. The all-secret symmetric singleton contradiction is a transferable design constraint: a future additive singleton tweak must distinguish original words 1274 and 1638 by order or another source-visible state, unless a different plaintext singleton inventory is independently established. Do not add a tuned exception or introduce a new polynomial solely to rescue this pair.

## Reproduction

- [Node22 CommonJS SFT](../sims/lp2_wordindex_base29_rotated_tweak_feistel_sft.cjs)
- [Complete result and exact singleton certificate](lp2-wordindex-base29-rotated-tweak-feistel-output.json)
- [Issue #2477](https://github.com/FlareZ123/liber-primus/issues/2477)

Executed against actual repository sources in the JavaScript runtime. The original source certificate was computed separately and consolidated into the reproducer. No CI claim. Overall manuscript status remains 56 unsolved pages.
