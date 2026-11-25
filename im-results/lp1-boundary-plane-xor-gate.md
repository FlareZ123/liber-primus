# LP1-derived XOR boundary-plane test

**Agent 6 · 25 November 2026 · Director Issue #2776. Decision:** reject the fixed LP1 gap vector as a standalone recovery of LP2 plaintext word boundaries. No unknown plaintext, key, or complete cipher mechanism was recovered.

## Hypothesis and human solve path

LP1 is the immediately preceding manuscript and exposes its own word gaps. Its canonical rune tape contains exactly 2,797 runes, the same length as the first 2,797 LP2 runes. A participant could reasonably notice that equality, extract the visible LP1 word-gap vector, and test a simple reversible XOR against the first equally long LP2 interval. This fixes the global origin at zero and requires no guessed key, offset, rotation, or wrap.

The exact XOR is not stated by a first-party clue. The length equality and prior-release relationship motivate a cheap experiment, not a conclusion about creator intent. The tested model changes only ordinary word-gap bits; rune identities and order remain untouched.

## Source and exact operation

- resources/transcriptions/lp1_wulfic_canonical.txt: Wulfic community-canonical LP1 transcription, 2,797 runes.
- resources/transcriptions/lp2-image-corrected.txt: image-corrected LP2 transcription, 13,136 runes; the tested prefix is exactly 2,797 runes, ending 137 runes into physical p11.
- resources/liber-primus/lp2-punctuation-identity.json and lp2-ink-annotations.json: original punctuation and red-rune spans.
- resources/external/relikd-solved-gp29-native-v1.json: nine source-native solved GP29 text records, 2,979 runes and 740 words.
- resources/control/english_wordfreq_textblob.txt, pinned Gibran, Shakespeare and Emerson texts, and the solved p57 reference: finite English comparison register.

A gap bit is 1 only when the transcription contains an ordinary hyphen word separator between two consecutive runes. Line separators and page separators are excluded: the transcription reference explicitly warns that line and page breaks do not necessarily end words. LP1 supplies 610 internal gap bits; the first LP2 interval has 576 printed gap bits.

The decoder is fixed as:

\[
P_i = C_i \oplus M_i
\]

where M is the LP1 gap vector, C is the LP2 printed gap vector, and i begins at zero. There is no offset search, circular shift, or optimization. The 39 punctuation anchors are preserved, as is the red/black ink transition after the 12-rune red title on p8. Eight LP1 mask bits coincide with these hard anchors and are suppressed, leaving 602 effective flips.

## Original result

The fixed mask produces 942 candidate groups from 2,797 runes:

| Measure | LP1-mask output | Source-native solved GP29 control |
|---|---:|---:|
| Rune count | 2,797 | 2,979 |
| Word/group count | 942 | 740 |
| Mean group length | 2.969 | 4.026 |
| One-rune groups | 287 (30.5%) | 28 (3.8%) |
| Groups of at most two runes | 510 (54.1%) | 206 (27.8%) |

Only 10 of the 287 one-rune groups are the source-calibrated GP29 forms of English A or I; 277 are invalid one-letter English words. Just 306 of the 942 candidate groups match the 32,191-type finite GP29 English register.

The physical p8 boundary supplies a preregistered development/frozen split: p0–7 (1,874 runes) and p8–p11 (923 runes). A native word-length bigram model trained on the first seven solved GP29 source sections gives candidate negative log-likelihoods of **2.611** on development and **2.550** on the frozen suffix. The complete candidate scores **2.590**, worse than the original printed-boundary sequence (**2.489**). Among 2,000 deterministic equal-density masks with the same 602 bits, **1,415** score at least as well as the LP1 mask (lower-tail p = 0.708). The source-selected mask is not distinguished by this native length grammar.

A stronger exact lexical check ignores the proposed mask and grants every possible interior word break within each of the 40 punctuation-delimited spans in this prefix. Using the existing source-calibrated 32,191-form GP29 English register and exact trie reachability, only **3/40** spans admit any ordered dictionary segmentation; **37/40** are impossible even with unrestricted interior breaks and no word-count constraint. This is the prefix-specific identity-rune subset of the broader original-input boundary-anybreak result in the existing report lp2-boundary-anybreak-english-lexicon-gate.md, which finds only 11/175 identity spans segmentable across the full unresolved manuscript.

## Controls and interpretation

Eight overlapping 2,797-rune windows cut from the 2,979-rune solved-native GP29 corpus were encoded with the fixed mask and decoded exactly (8/8). This validates the XOR implementation, not the historical choice of LP1 as a mask. None of the 2,000 equal-density null masks recovers the planted donor gap vector exactly.

The strongest objection is not merely that the candidate groups look short: the unrestricted ordered-English gate shows that most punctuation spans cannot be parsed under the identity-rune, boundary-only premise even if every internal break is freely chosen. A subsequent rune-changing cipher could still use an LP1-derived boundary plane as an intermediate carrier, but that is a different layered hypothesis and needs independent source evidence selecting both the boundary operation and the rune transform.

**Disposition:** close #2776 as a completed negative test. Do not retest this exact LP1 zero-origin XOR or rescue it with offsets, rotations, alternate masks, or a tuned language model. Keep H-decoy and rune-changing ciphers open.

## Reproduction

Run node sims/lp1_boundary_plane_xor_sft.cjs with Node.js 22. The self-contained SFT reads the pinned repository sources, asserts all counts and scores above, tests eight native donor windows, and compares 2,000 deterministic equal-density masks.
