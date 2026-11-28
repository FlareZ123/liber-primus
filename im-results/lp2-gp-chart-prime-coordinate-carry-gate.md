# GP chart's 15×2 coordinate carry under the authentic prime clock — Director #3299

**Decision (28 November 2026):** The literal fixed-one-rune carried-coordinate Nihilist-like sender is *not a complete reversible 29-rune cipher* and has **no legal original parse**, even when ciphertext F is permitted either to represent transparent plaintext F or to arise through the numeric operation. A fully specified bijective cycle-walk repair on the two excluded cells exists, and reproduces native plants, but original p8–14 and held p15–22 decode to nonprose with essentially flat rune entropies. **No unknown LP2 plaintext, authentic key, or source-selected repair recovered.** Do not extend this receiver by fitted alphabet permutations, arbitrary framing, or tuned prime phase without an independent authored selector.

## Why this branch was worth a bounded test

The signed Gematria Primus chart has 29 ordered runes, displayed as 15 entries on the left and 14 on the right. As a candidate coordinate code, take `i = 15*column + row`, with `column∈{0,1}`, `row∈{0,…,14}`, and the 30th cell `i=29` blank. LP2 p56 authentically uses successive prime-minus-one shifts and *one* transparent plaintext F. Classical Nihilist substitution, already documented before 2014, converts letters and a key to Polybius coordinates and adds their numerical values; the [pre-2014 *Green Anarchy* #23 p16 example](https://azinelibrary.org/approved/Green_Anarchy_23.pdf) visibly demonstrates a worked Polybius coordinate square. Neither that outside example nor any first-party LP2 clue authenticates the present 15×2 carry composition; it is a source-constrained conjecture, not an observed sender.

Prior work differs in mathematical object and already supplies important negatives: [#2636](https://github.com/FlareZ123/liber-primus/issues/2636) rejects variable-width prime-sum BASE29 (no original parses), [#2745](https://github.com/FlareZ123/liber-primus/issues/2745) rejects continuous q8 BASE29 addition under its finite native register, and [#2619](https://github.com/FlareZ123/liber-primus/issues/2619) excludes the fixed power receiver's literal word vocabulary. Rectangular digraph [#3291](https://github.com/FlareZ123/liber-primus/issues/3291) and clause reciprocal [#3292](https://github.com/FlareZ123/liber-primus/issues/3292) have separate scope. The present test is a single-rune two-coordinate **carry** and prime-clock action, not repetition of either key or word candidate search.

## Literal mathematical receiver and exact obstruction

For plaintext chart position `P=15*c+r` and clock operand `K_t=(prime_t−1) mod 30`, add row digits `rP+rK` with the standard base-15 carry into the base-2 column and wrap the high column. In index notation the result is **`C=(P+K_t) mod 30`**. Reserve plaintext F `P=0` as transparent, consuming no prime; all other plaintext runes consume one prime as in the authentic p56 clock. The alphabet has only `0,…,28` and lacks cell29.

For **each nonzero** `K∈{1,…,28}`, legal input `P=29−K` emits the **unprintable cell29**. For every `K≥2`, a different legal non-F input `P=30−K` emits ciphertext F0, colliding with the transparent plaintext F0. Hence 28/28 nonzero chart-key values fail output closure, and 27/28 also fail injectivity. This is a theorem independent of language, page cuts, or any unknown key; no lossless direct inverse exists on all 29 source runes. A reserved escape/variable-width wrapper could change the result, but no such wrapper is selected by the source, and merely treating cell29 as another rune is disallowed.

We nevertheless evaluated the most generous *partial inverse*: for each ciphertext F, try either unchanged plaintext F (no prime consumption) or a non-F inverse (consume the prime); for each other ciphertext rune, apply the arithmetic inverse and reject outputs 29 or F. Exact dynamic programming maintains all possible prime-consumption counts, not a greedy assumption about F. With p56's first prime at each page/continuous segment and no fitted phase:

| Original receiver | First impossible rune, 0-based |
| --- | ---: |
| p8–14 continuous, `C=P+K mod30` | 14 (15th rune of p8) |
| p8–14 continuous, opposite sign | 33 (34th rune of p8) |
| Each page reset: p8,p9,p10,p11,p12,p13,p14, plus sign | 14, 3, 7, 8, 2, 1, 15 |
| Each page reset, opposite sign | 33, 2, 9, 5, 23, 15, 16 |

These impossibilities are stronger than gibberish scoring: not a single complete inverse path exists under the literal receiver. Source data: [canonical `lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json), 1,729 p8–14 ciphertext runes.

## One complete reversible repair (exploratory, *not* a source-authenticated decoding)

To distinguish the missing-cell obstruction from a useful cipher hypothesis, fix *exactly one* no-extra-key repair **before testing the original**: perform the same `+K mod30` rotation, repeatedly stepping by that same K while landing on either excluded cell `0` (transparent F) or `29` (blank), until a valid non-F slot `1,…,28` is reached. Plaintext F stays F and does not advance the prime clock. Decryption uses the identical skipping rule with `−K`. This is a proper permutation of all 29 runes for every K, without hidden overflow symbols, fixed key table, or arbitrary fitting. It is *not* ordinary one-pass Nihilist addition; it requires the otherwise unhinted instruction to skip both excluded cells.

- Exhaustive 30-operand × 29-symbol forward/inverse test: **870/870 exact**.
- Native solved p56 recovered with its established transparent F at original rune offset **56**, consuming **84 primes** and reproducing the known text beginning `ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTO`; re-enciphering that native plaintext through the repaired model and reversing it recovers **85/85** rune indices. The directly readable p57 planted control also recovers **95/95**.
- Original continuous p8–14, **1,729/1,729** runes invert and re-encipher; first output begins `PHIPNGTHOBISOJBIAXGTPEATNGBGNGSYTHRPWRGBDFD...`, not identifiable prose. GP29 single-rune entropy is **4.846776 bits before** and **4.844790 bits after**, close to the 29-symbol uniform maximum 4.857981 bits.
- Independent p15–22 source hold, clock restarted at p15 because no authorized handoff exists: **1,903/1,903** mechanical inverse/replay; first output begins `FEAESEEXGGEAONGOAEMUBEFNGRNGEAPHIACFSML...`, not identifiable prose. Entropy is **4.846726 before** and **4.844737 after**.

**Important limit:** a bijective receiver perfectly re-enciphers *every* ciphertext even with a wrong key/mechanism. Controls and exact replays prove implementation integrity only; flat output and lack of an original skip instruction provide no basis to promote this to an LP2 solution. The bounded direct-addition receiver is disproved; the repaired permutation is mathematically viable but presently unselected and cryptanalytically unproductive. The p56 result is a re-decoding of already solved text, not a new discovery.

## Reproduction and next decision

Run `node sims/lp2_gp_chart_coordinate_carry_sft.cjs` from the repository root with the tracked corpus. The script asserts both source-native replay checks, enumerates the 30 invertible repaired maps, produces the exact DP first-impossibility witnesses and prints full original/held statistics and sample output. The core DP, prime generator, entropy and cycle-walk calculations were **also directly executed in connected V8** against the canonical JSON; the committed standalone Node wrapper has not been separately run on this invocation's shell because only remote GitHub file access is available.

**Director fork:** close #3299 with the literal no-parse certificate, retain this report as a scoped exclusion, and do not commission further carry/wrap variants without an independent first-party instruction specifying a *different* packing, escape, table rotation, or exact known recipient. No change to the overarching [established-results synthesis](../results/README.md) is justified: the manuscript remains undeciphered.
