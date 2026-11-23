# LP2 original: global-secret plaintext-predecessor source-crib recovery without printed word boundaries

**Agent 10, 23 November 2026. Classification: complete finite source-alignment negative for two explicitly reversible 29-entry feedback cipher families. No unknown LP2 plaintext, authentic secret key, or destination recovered.**

## Research decision

It remains conceivable that the original 12,956 GP29 runes represent a historical quotation enciphered under a *shared nonlinear 29-entry plaintext-feedback function*, with physical manuscript spacing unrelated to the plaintext. Earlier exact all-secret source tests required that source printed words correspond to English lexicon words. This original-source attack discards that assumption entirely: a 40-rune contiguous plaintext may start at **any source rune and any position wholly inside any original physical ciphertext page**.

The tested families have no specified authorial selector, so they are conditional hypotheses. Their appeal is that a small hidden lookup table can disperse GP29 unigram frequencies and create unusual local repeat behavior. They are substantially different from a one-time pad or an independently keyed function per position. The first source criterion is genuine plain-text recovery, not an attractive random frequency statistic.

## All-key algebraic attack

For every original within-page ciphertext position i, plaintext P_i and ciphertext C_i are in the actual 29-symbol Gematria Primus register. Let f be **any** global 29-entry secret table with each entry in 0…28; its full size is 29^29 possibilities.

Two independently reversible candidate encoders:

1. **Direct**: \`C_i = (P_i + f(P_(i-1))) mod29\`.
2. **Integrated**: \`C_i = (C_(i-1) + P_i - f(P_(i-1))) mod29\`.

Each initial target rune is free, and the table is unrestricted. Each family has an exact sequential inverse given its table and one plaintext seed. For aligned hypothetical source plaintext, each location beyond the first forces one table entry. If \`P_(j-1)=P_(k-1)\`, the same table input must produce the same output, giving a key-independent equality:

\`T_j - T_k = P_j - P_k (mod29)\`

where \`T_i=C_i\` (direct) or \`T_i=C_i−C_(i-1)\` (integrated).

Build a small inverted index of the **first six repeated-predecessor equalities within each source's opening 40 runes**. Every legitimate 40-rune match must satisfy all six. The first equality indexes all valid original start offsets; the remaining five reject false candidates. Any survivor must satisfy the complete unrestricted 29-entry table simultaneously at every subsequent position until the first conflict. **All source windows have at least six constraints**, so no source start is skipped for lack of witnesses.

Original targets: the unchanged \`resources/liber-primus/lp2-corpus.json\`, all 55 rune-bearing physical pp0–55 (p50 excluded), 12,956 runes. There are **10,811** eligible within-page starting positions leaving ≥40 printed runes, and **882,357** eligible source starts across the 12 reference inputs. The two model scans cover **19,078,323,054 possible source/target 40-rune pairs**, indirectly screened by the algebraic index. These are indexed pairs, not 19 billion individual decryptions or an independent multiple-testing p-value.

## Source inputs and original decision

| Source register | GP runes | 40-rune source starts | ≥40 match under either model |
| --- | ---: | ---: | ---: |
| William Blake, *Song of Liberty*, held-out training body | 1,459 | 1,419 | 0 |
| Aleister Crowley, *Book of the Law* I | 6,958 | 6,918 | 0 |
| *Book of the Law* II | 7,059 | 7,019 | 0 |
| *Book of the Law* III | 7,484 | 7,444 | 0 |
| Kahlil Gibran, *The Prophet* | 62,492 | 62,452 | 0 |
| Ralph Waldo Emerson, *Essays* | 321,327 | 321,287 | 0 |
| Shakespeare, pinned reference | 217,106 | 217,066 | 0 |
| Editor-normalized already solved Cicada LP1 / LP2 p56–57 excerpts | 3,246 | 3,206 | 0 |
| Old English *Beowulf*, original corrected GP sequence | 48,012 | 47,972 | 0 |
| Latin Vulgate NT, wordwise original GP sequence | 204,802 | 204,762 | 0 |
| Actual solved LP1 rune transcription | 2,797 | 2,757 | 0 |
| Actual solved LP2 p57 rune sequence | 95 | 55 | 0 |
| **Combined per model** | | **882,357** | **0** |

The strongest original short alignments reach **22 runes** (integrated Emerson) and **21** under a separate direct source; they fail before 40. These are small accidental partial-table fits with no recovered text and should **not** be treated as crib evidence. No tested literal historical or already-solved source segment is the exact unknown LP2 plaintext for 40 consecutive runes under either model and this original page-contained clock.

### Working positive control

The same program encrypts **262 actual native GP29 Gibran runes** at source offset 11,111 and exact p0 physical-page length using a nonlinear hidden function \`f(x)=(x²+7x+11) mod29\`. It picks an arbitrary initial cipher symbol. The indexed attack is *not supplied* that function and recovers **262/262 true native-GP runes** under the direct family and **262/262** under the integrated family. Thus the original 40-rune nonmatches follow from original source input rather than a nonfunctioning search. No synthetic cipher is promoted as an original LP2 solution.

## Scope, next decision, reproducibility

This is a genuine all-secret, word-boundary-independent **literal reference-crib** test of the two models. It does **not** exclude independently authored plaintext, other source works, source modifications, pre-encryption transpositions, windows spanning printed physical pages, hidden changing table entries, word-level key resets or another cipher architecture. The original manuscript supplies neither model's lookup rule, making the lack of a match only a bounded negative.

Do not commission more parameterized variants of this exact operation without a new creator-selected source, an independently recoverable key table, or a specified state transition. The next causal decision is to determine whether an **unrestricted global f can be inferred without verbatim plaintext**, from an authentic native-language statistical register, and whether that fitted same f predicts plaintext on untouched original pages. A separate read-only source-moment attack has been prepared for this follow-on.

- [Exact read-only CommonJS SFT](../sims/lp2_plainprev_wordfree_crib_lookup_sft.cjs)
- [Manual Windows Node22 workflow](../.github/workflows/agent10-wordfree-crib-lookup.yml)
- [Full original/all-source CI run **45124678777**, success](https://github.com/FlareZ123/liber-primus/actions/runs/45124678777).
