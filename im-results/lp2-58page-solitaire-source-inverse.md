# LP2 physical-page Solitaire deck: original inverse and exact F-skip decision

## Result

No unknown LP2 plaintext or key recovered. The 58 physical LP2 pages divide into 56 unknown plus two solved. The historically available Solitaire/Pontifex construction uses two distinguished jokers and twice as many ordinary cards as alphabet symbols. The corresponding LP2 counts are 56=2×28 ordinary cards, two jokers, with the 28 non-F GP symbols motivated by the solved p56 F-transparent rule. This is a source-shaped candidate, not an authenticated Cicada instruction. Source: Bruce Schneier's [1999 Solitaire algorithm](https://www.schneier.com/academic/solitaire/), also published in *Cryptonomicon*.

## Actual inverse

Use physical p0–55 as ordinary cards 1–56 and p56–57 as jokers 57/58. Move A one position, B two (wrapping from bottom to immediately below top), triple cut around the jokers, count cut by bottom value (either joker counts57), output the card after the top-card count and retry if it is a joker. Standard keying performs the same round followed by a passphrase-driven second count cut in place of output. Four explicit initial deck conventions (ascending/descending ordinary cards and two joker assignments) are tested with five fixed passphrases: empty, numeric BASE29(3301) cuts [3,26,24], historical 2014 FIRFUMFERENFE mapped to GP ordinal counts, original p0 red13 ordinal sequence, and authentic p57 WE MUST SHED OUR OWN CIRCUMFERENCES ordinal sequence. No source independently selects these specific keys.

For ordinary card v, use either raw shift v mod29 or normalized shift 1+((v-1) mod28). The 28-symbol F-literal candidate maps nonzero GP indices to Z28 and excludes F from the rotating alphabet; F passes unchanged and does not advance the key. Two GP29 candidates advance the key on every rune. Both signs and global, nine-chapter and physical-page resets give 360 complete original inverses. Each exactly re-encrypts all12,956 original runes. Standard historical unkeyed output sequence, unkeyed A×10, FOO and CRYPTONOMICON vectors passed; six full native-GP deterministic plants recovered every rune.

| Scope | Highest full original IoC | Highest untouched p40–53 IoC |
|---|---:|---:|
| Book | .034536678 | .034748265 |
| Chapter | .034547724 | .034694091 |
| Page | .034533437 | .034733671 |

Native Crowley control .063434629. No ordinary-language candidate.

## Genuine plaintext-F-transparent GP29 branch gate

The 28-alphabet variant is only one adaptation; actual solved p56 transparency skips **plaintext** F, while an encrypted non-F can itself produce ciphertext F. For each of the same 20 candidate decks, both output conventions and both signs, use exact reachability on all possible consumed-key counts. Given ciphertext c and active offset j:
- when c=0, permit literal plaintext F without consuming a key;
- also consume one key if p=(c−sign·k[j]) mod29 is nonzero;
- if c is nonzero, the consuming transition is the only legal option.

This retains every valid ambiguity rather than guessing that every printed F is literal. Four full native GP plants retain their true final key offsets. Result on original:

| Clock | Tested deck/sign/shift cases | Maximum surviving source segments | Complete source survivors |
|---|---:|---:|---:|
| Continuous book | 80 | 0/1 | 0 |
| Nine chapters | 80 | 0/9 | 0 |
| Rune-bearing physical pages | 80 | 6/55 | 0 |

Every continuous candidate becomes impossible by original zero-based rune411 (inclusive). Even with all nine chapter clocks restarted, none of the 80 candidate keys yields a legal path on any complete chapter. This is an exact candidate-specific reachability failure independent of English scoring. No conclusion follows for arbitrary private deck order or different clock/emission laws.

## Adjacency-suppressing rank28 inverse

The source's very low adjacent-repeat count motivates an emission law in which 28 ordinary plaintext labels select from the 28 ciphertext runes other than the preceding rune. The remaining plaintext label emits a repeat. Test sorted and cyclic rank order, both signs of deck output addition mod28, and both advance/skip choices on a repeat. The same 20 concrete decks and three reset clocks give 480 full inverses. All re-encrypt exactly, and all 160 corresponding full native plaintext plants recover exactly.

An arbitrary bijection from the abstract 29 plaintext labels to GP rune labels (including the identity of the repeat escape) cannot change equality counts. Additionally maximize over all 29 initial predecessor states independently for every segment. A repeated first rune fixes the first label to escape, with tail offset zero or one. A nonrepeat consumes one key; its first label can be any rank in cyclic order or at most two ranks in sorted order. The best possible number of within-segment equal pairs is therefore obtained by adding the largest feasible first-label frequency to the fixed tail's pair count, and comparing the repeat branch. This reduction was checked against explicit 29-seed enumeration on original p0 and boundary-case synthetic vectors. It grants private seed and private plaintext permutation to each segment.

| Clock | Cases | Exact maximum original within-segment IoC | Native control |
|---|---:|---:|---:|
| Continuous book | 160 | .035357423 | .063434629 |
| Nine chapters | 160 | .035483682 | .063511660 |
| Physical pages | 160 | .036098209 | .063985203 |

Thus the adjacency-suppressing emission structure cannot rescue these 20 candidate deck states by selecting an unknown static alphabet or initial predecessor. Arbitrary deck permutations and different evolving rank laws remain untested. This is an exact upper bound on the tested original inverses, not a proof that every possible natural-language sample must have the donor's IoC.

## Reproduction and decision

[Standalone original SFT](../sims/lp2_58page_solitaire_source_inverse_sft.cjs); run `node sims/lp2_58page_solitaire_source_inverse_sft.cjs` (Node22 CommonJS, no dependencies). Exact function executed on canonical remote corpus and pinned Crowley control in JS tool runtime; all assertions passed; no Windows CI claim. Source-specific deck geometry alone cannot supply a key; retire these five concrete deck keys for the tested direct and predecessor-exclusion emission laws and three clock choices. Revisit a generalized deck only if another authentic clue selects a specific permutation/transition, rather than expanding unsourced passphrase searches. No unknown plaintext or key.
