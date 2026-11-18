# Free wordwise direction and repeat-rejection inference under the authentic p56 prime-totient stream

## Research question and source premise

The authenticated 2016 Cicada statement, “words are the map, their meaning is the road, and their numbers are the direction,” motivates testing *wordwise traversal direction* as a cipher operation. The established solved LP2 p56 cipher uses consecutive Euler totients of primes in Gematria Primus arithmetic with transparent plaintext-F bypass. These clues suggest, but **do not independently authenticate**, a possible original LP2 ciphertext receiver: retain the prime-totient key while changing key-pointer direction between printed words.

The primary test asks whether a decoder can recover original unknown-page language **even if the rule for selecting each direction remains totally unknown**. A second test admits source-motivated repeated-output key rejection, suggested by the original ciphertext’s very rare identical adjacent runes. It is deliberately more permissive than the fixed 66 word-number rules in Director Issue [#1329](https://github.com/FlareZ123/liber-primus/issues/1329). It concerns a single documented key register, not all possible historical key streams or word-control interpretations.

## Exact source and finite decoder

The immutable original-input test is the complete physical LP2 p0–p2 opening, **729 ciphertext GP29 runes in 158 printed words**, from `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`. The 464 historical prime ranks from 2 through 3301 provide `K[j] = (prime[j] - 1) mod 29`, with pointer phase `j mod 464`. Every possible initial phase **0–463** and **both forward and reverse pointer directions independently for each printed word** are admitted. Pointer position carries between words. The model does not admit arbitrary extra jumps, alternate key streams, alphabet relabeling, letter transpositions, or page rekeys.

For plaintext rune `P`, the exact authentic-p56 branch is:

- If `P=F` (GP29 index 0), emit ciphertext `C=F` and leave the key pointer unchanged.
- Otherwise, emit `C = (P + K[pointer]) mod 29` and move the pointer by the word's selected direction.

An observed ciphertext F may arise from literal-F bypass **or** a shifted non-F symbol. The inverse enumerates *both* whenever valid, keeping all candidate key phases. A 464-state Viterbi dynamic program optimizes GP-native word language likelihood plus a finite historical-word lexicon. This yields the optimal scoring path under these exact assumptions, rather than a single guessed sign sequence. Original output is exactly forward-enciphered under the recovered state history as an implementation invariant.

The calibration corpus uses already solved LP1 text and historical Book of the Law chapters I–II, Blake, and KJV. Book of the Law chapter III is reserved as a planted-language holdout. Source-native GP spelling includes the verified `ING` and `IO` spellings, and the two positive controls use the **same original printed-word length sequence**.

## Original and independent-control results

Reproducer: [authentic F-transparent, all-word-direction DP](../sims/lp2_pdir_free_word_fskip_dp_sft.cjs). [Windows/Node 22 passing test, run 44314929843](https://github.com/FlareZ123/liber-primus/actions/runs/44314929843), pinned to source commit `665a40a0f5e6de7fc078e242bfba53ff75c80371`.

| Test | Observed result |
| --- | --- |
| Independently solved original p56 source ciphertext forward regression | **85/85 exact** |
| In-sample native-source encrypted plant | **158/158 original words exactly recovered** |
| Independently held-out Book III encrypted plant | **158/158 original words exactly recovered** |
| In-sample planted best GP word logscore / rune | **−1.654023** |
| Held-out planted best GP word logscore / rune | **−1.358350** |
| Original LP2 p0–2 best score / rune under every admitted sign/phase/F branch | **−4.084879** |
| Original DP-output matches to 3,288-word training lexicon | **14/158** |
| Adjacent source rune doublets | **4 original**, **23/25** two native plants |

The original maximum-scoring output begins `AEANAEOEWNG PEIALTH AHCC FOTH THED WITTNGHPEALMT TJRLE EAIGY OETG CHU RLDW`, and does not form coherent prose. This is empirical failure for the finite key family, **not** a new plaintext claim.

## Stronger all-key necessary-condition exclusion on long original words

The same program constructs an **8,134-type independent broad lexicon** using source-calibrated GP words from LP1, Books I–III, Blake, KJV, Shakespeare and Gibran. For **each original word independently**, it discards the hard global pointer-continuity requirement and tests *every* 464 possible starts, *both* directions and *every* legitimate F-bypass/non-F inverse branch. Thus any whole-book solution under the stated model that maps an original word to this lexicon would be counted; the observed original counts are exact finite reachability counts, not heuristically scored Viterbi choices.

| Minimum original word length | Original words | Original words with any exact lexicon preimage | Held-out native plant words present in lexicon |
| --- | ---: | ---: | ---: |
| 5 | 69 | **1** | 69/69 |
| 6 | 56 | **0** | 56/56 |
| 7 | 38 | **0** | 38/38 |
| 8 | 21 | **0** | 21/21 |
| 9 | 12 | **0** | 12/12 |

Hence the source-exact family cannot interpret **any of the 56 original printed words of length at least six** as one of these 8,134 historically sourced GP-native words, even by choosing each word's key phase independently. The original long words could logically be outside this finite lexicon, so this is a lexicon-bounded exclusion rather than an exhaustive proof covering every possible English word, proper name, deliberate misspelling or auxiliary encoding. Its failure against an independently calibrated long-word corpus makes this specific straightforward word-direction interpretation unpromising as the general decipherment.

## Stronger key-rejection extension (18 November)

The authentic solved p56 cipher supplies the fixed source key and transparent-F behavior; an unknown-page doublet-suppression layer is an independent, conjectural addition. The original unsolved runes suppress immediate repeated ciphertext symbols (86 repeats among 12,901 within-page consecutive pairs, roughly 0.67%). A plausible operator would refuse a prime-key step if its proposed output repeated the immediately preceding ciphertext rune, thereby consuming extra key positions. In contrast to a unique invented repeat rule, the extension **grants both acceptance and rejection** whenever a proposed output equals the preceding ciphertext rune, permitting **0–3 consecutive rejected steps for every non-F rune**. For plaintext F, the authentic bypass still emits F without consuming any key. The signs remain unconstrained per word, and **each original word may choose any of 464 key starts independently**. Thus absence of a source-lexicon preimage is a stronger exclusion than a constrained whole-book pointer or prescribed word-number rule.

Source code: [exact original repeat-rejection/word-direction reachability](../sims/lp2_pdir_ftransparent_repeatskip_wordlex_sft.cjs). [Windows Node22 passing run 44318796978](https://github.com/FlareZ123/liber-primus/actions/runs/44318796978), source commit `27ec6eb783fdc97aafe74a2ece9a8d25eb7948a9`. The script reproduces solved p56's complete source ciphertext **85/85** as the authentic zero-rejection subcase. It tests a native-source BookIII English plant encrypted with 0–3 actual rejected steps and varying wordwise direction, retaining original p0–2 word lengths.

| Minimum word length | Original printed words | Original with any GP-English lexical preimage after *all* allowed skips, signs, phases | Native English plant exact words reachable |
| --- | ---: | ---: | ---: |
| 5 | 69 | **1** | 69/69 |
| 6 | 56 | **0** | 56/56 |
| 7 | 38 | **0** | 38/38 |
| 8 | 21 | **0** | 21/21 |
| 9 | 12 | **0** | 12/12 |

The sole original long-word match is a five-rune candidate `SURER` at printed word index 26, an isolated dictionary feasibility result without a consistent cipher state or syntactic continuation. **No original printed word length six or greater** matches the frozen 8,134-word GP-native lexicon for this broad cipher family. The decoder cannot identify a coherent English chapter through prime-totient direction reversal rescued by a limited rejection loop; this bound covers both deterministic rejection and probabilistic repeat acceptance, provided the only extra keystream positions are those consumed after proposed repeated ciphertext and the maximum consecutive discarded positions is three. The result does **not** rule out an independently source-selected different key, a skip on nonrepeated symbols, arbitrary numbers of hidden skipped positions, non-English prose, or changing text geometry.

## Comparison, boundaries and next decision

A separate no-F-skip version, [source-fixed free-direction DP](../sims/lp2_pdir_free_word_direction_dp_sft.cjs), [passing run 44313823247](https://github.com/FlareZ123/liber-primus/actions/runs/44313823247), also recovers the 158-word held-out plant exactly and fails the original opening (best −4.091751/rune and 20/158 training words). Its omission of literal-F does not match authentic p56; the F-transparent test above is the source-respecting stronger one.

The original key register is authenticated only for p56; no Cicada source says the entire encrypted p0–55 uses it, or that direction changes wordwise. Reject **the precise 464-period p56-totient, freely directed wordwise family as a credible decoder of ordinary original-page GP-English** under calibrated controls, including both the continuously carried pointer and all independently chosen starts with up to three repeat-triggered key skips per output rune. Do not rerun the same 464-phase/word-sign family with new postselected direction rules: every such rule already lies within this tested sign superset. Keep Issue #1329's distinct 581 *other historical key streams*, 18 pointer conventions, skip models and six-section search separate; their 216-shard campaign is unaffected. A new positive lead would require an independently source-identified key/extra state operation and complete held-out original plaintext, not an opportunistic score improvement.

This is **original-cipher scientific evidence only**; no unknown LP2 plaintext, authentic unknown-page key or final destination is recovered.
