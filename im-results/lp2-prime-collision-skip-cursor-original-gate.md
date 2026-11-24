# LP2: exact collision-only totient-prime cursor recovery and all-history exclusion

Agent 5 / #2273. 2026-11-24. Executed on the repository's full canonical LP2 p0–55 rune tape and printed word divisions. No authentic plaintext recovered.

## Model and distinction

Use K[t]=(prime[t]-1) mod 29, the additive totient-prime clock motivated by the authenticated p56 construction. Before emitting P+K[t], the encoder may reject a key only if its tentative output equals the previous ciphertext rune. It may accept a collision or continue through the current equal-key residue run; the first noncollision must be accepted. Test ordinary and true-F (P=0 emits literal zero without key consumption, all other P nonzero) modes. Permit every initial index 0..463 inclusive (prime 2 through 3301). Previous ciphertext starts at zero. Unlike #274's explicit noninjectivity witnesses, #381's iid ambiguity, #1194's different keyword/finite-key stream, or #1342's fitted arbitrary tableau, this tests an explicit authenticated-family clock using an exact language-objective dynamic program, with no hidden skip budget or beam pruning. It is a hypothesis, not an authenticated LP2 instruction or a universally injective cipher.

At each observed C and incoming t, direct emission gives P=C-K[t]. For a collision C=previous C, every acceptance within the same key-residue run is possible. For C != previous C, a rejected collision requires P=previous C-K[t], and the first different residue must produce C. In F mode additionally permit literal zero holds and reject non-hold P=0. Every transition in this finite relation is legal, and it enumerates all possible accepted paths under the stated rule.

Exact Viterbi retains the best additive word-language score per outgoing cursor; future choices depend only on the cursor and observed preceding ciphertext. A second DP replaces the score by the count of dictionary hits of length >=5, obtaining an exact global upper bound over all possible collision histories and origins. Lexicon: pinned 29,060 GP-normalized TextBlob forms. All recovered candidate paths are replayed exactly.

## Positive controls

Three disjoint 200-word solved-source blocks (856,742,831 runes), encrypted independently under ordinary and F-hold modes. Origins 0,173,463; the hidden encoder skips collisions unless prime mod7=1. The recovery procedure has no knowledge of that policy or the true origin. Train on first 150 ciphertext words, freeze the terminal cursor, and decode remaining 50. All six origins, all training runes and all terminal cursors recovered. Five heldouts exact; remaining F/prime2 heldout has one wrong rune (242/243). Total 4857/4858 runes. This demonstrates recovery of unknown clock and skip histories on actual solved-source prose, not merely reencryption.

## Original, continuous clock

12,956 runes, 2,896 complete printed words, 1,132 words >=5 runes. No-F training p0–2 (729 runes,158 words): best origin353, terminal1092, zero long words. Frozen state continuation in 150-word blocks gives exact ciphertext replay with 212 skips, 292 dictionary hits overall, zero long words in the whole original, IoC .034796060. Both independent regions p16–21 and p40–53 yield zero long hits (0/141,0/257). These are not plaintext.

The exact language-count DP grants every legal history, all 464 origins, and the entire original as one optimization instance: maximum **6/1132** long words. The opening maximum is **0/69**. At most 911 active cursor states. No beam or pruning based on language plausibility.

F mode best training state cannot continue; stronger language-free reachability from ALL 464 origins becomes empty at **global zero-based rune966** (prior C=4, observed C=27, only prior cursor1307). Thus no complete original preimage exists in this F-mode relation, independent of lexicon.

## Independent source chapter resets

Grant independent prime origin to each of the nine source sections (lengths 729,1145,1729,9,1894,1021,1524,1589,3316). All cuts align with actual word boundaries. Test both reset previous ciphertext to zero and retain actual preceding ciphertext. Both conventions give identical upper bounds.

| Global start | Runes | Long words | Exact max ordinary long hits | F mode first impossible local rune |
|---:|---:|---:|---:|---:|
|0|729|69|0|survives|
|729|1145|98|1|635|
|1874|1729|147|2|938|
|3603|9|1|0|survives|
|3612|1894|165|1|1475|
|5506|1021|91|1|survives|
|6527|1524|131|1|971|
|8051|1589|143|1|729|
|9640|3316|287|3|1475|

Even granting nine independently selected origins and arbitrary legal collision histories, at most **10/1132** original long words can be dictionary forms. Six of nine sections are impossible in the F-hold model regardless of plaintext.

## All-secret alphabet extension: exact state-set obstruction

A possible loophole in the fixed additive inverse is an arbitrary secret monoalphabetic GP29 bijection S applied before the prime addition. Its 29! choices destroy direct dictionary scoring, but preserve the **number of distinct one-rune words**. Genuine solved native GP source (2,979 runes, 28 singleton words) uses only three singleton types; grant four (A/I/O/T) without fixing their mapped glyphs.

At each original rune, retain all feasible (prime cursor, bitmask of mapped singleton symbols already observed). At a singleton, OR the intermediate emitted plaintext value P'=S(P) into its 29-bit mask and retain only masks of popcount <=4. At other runes, transport the mask unchanged through every legal collision-only transition. Merging identical pairs loses no future possibilities. This is an exact all-secret test over every possible alphabet and hidden skip history, not an optimization over permutation candidates. There is no lexicon, probability assumption, key scoring or beam pruning.

Three full authentic solved-source plants use independent hidden permutations and hidden prime origins 0,173,463, with 95,114,84 skipped residues respectively. All three true endpoint/mask pairs survive the complete DP; each minimum is exactly three mapped singleton types. These validate the all-history membership test, not full secret permutation recovery.

The original continuous clock loses its last possible state at **zero-based global rune3347 (physical p13 rune153), the 24th singleton word**. Immediately beforehand, nine (cursor,mask) pairs survive the 23rd singleton; none can reach the 24th without a fifth distinct singleton type. Thus every shared 29! alphabet and every optional legal collision history starting at any of the first 464 primes fails under a <=4-singleton-type source.

Grant independent prime origins per each of the nine source sections, and even allow either previous-ciphertext reset or actual preceding glyph independently per section. The fifth section (global 3612–5505; 1,894 runes,18 singleton words) alone has no legal path at local rune1182 (global4794). This additionally excludes independently chosen per-section alphabets within the four-type condition. Earlier four sections' admissible four-symbol sets intersect in 914 sets; the fifth section removes every possibility. Full section detail is printed by the SFT. This result is independent of the language dictionary and does not impose which plaintext rune types are used.

Scope: exact conditional exclusion for a fixed monoalphabetic bijection within a section followed by the additive totient-prime collision-only cursor. More singleton types, changed source word boundaries, other clocks, varying symbol alphabets within sections or non-additive tables are not excluded. The result does not prove that actual LP2 plaintext has at most four singleton types. It is a decisive failure for the normal source-native singleton register under this model.

[All-secret alphabet SFT](../sims/lp2_prime_collision_skip_allsecret_alphabet_sft.cjs), executed on actual repository sources in connected JS runtime. Code commit 63efaf4d384720adb54d974582f28d94409cda7e.

## Disposition

Stop this exact additive totient-prime collision-only model. Neither key-origin uncertainty nor optional collision skips nor independent section resets rescue it. Even granting an arbitrary independent monoalphabetic bijection in each section does not rescue the ordinary additive model under the generous four-singleton-type condition. The lexical bound is conditional on native GP-normalized dictionary coverage and the printed words; it does not exclude all languages, arbitrary clocks, extra transformations or arbitrary H2 tableaux. The F reachability failures are unconditional within the specified finite model. Do not interpret exact ciphertext replay as an authenticated decode. Next attack must use a genuinely different source-selected operation.

Executable: [sims/lp2_prime_collision_skip_cursor_viterbi_sft.cjs](../sims/lp2_prime_collision_skip_cursor_viterbi_sft.cjs). Run using Node from the repository. Actual source execution performed through connected JS runtime; no CI claim. Code commit a287a0e21251495c30831802cb5be8ed39e930a3.
