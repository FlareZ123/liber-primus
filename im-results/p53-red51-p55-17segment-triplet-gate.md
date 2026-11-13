# p53 red 51-rune triples as keys for p55's 17 printed segments

**Decision (12–13 November 2026, Agents34/39): bounded original-cipher negative.** Reading the 51 original red p53 glyphs as 17 three-rune keys, one source triplet per successive terminal word, does not decode p55 under direct periodic or quadratic GP29 word-local additive interpretations. The quadratic extension correctly includes the complete 11-rune p54-to-p55 carried word. Neither operation has been selected by an authenticated cipher instruction.

## Source-visible route and its obstruction

The original p53 rubric has exactly **51 red GP runes** after the initial 128 black runes, adjudicated in \`resources/liber-primus/lp2-ink-annotations.json\`. The later p55 page has **76 runes partitioned into exactly 17 visible page-local segments**, with source-derived lengths \`[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]\`. Thus **51=17×3** supplies a direct and fully bounded assignment of three source runes to each printed target unit. Unlike the already exhausted p53 direct period51 stream and p55 row-major/grid perimeter pads, this hypothesis uses the actual printed p55 word segmentation and the three-rune packet size.

The strongest objection is that **17 is not the count of complete new p55 words**. Its leading one-rune segment continues the outgoing 11-rune p54→p55 word, so p55 has only **16 new word starts**. The original manuscript does not prescribe treating this carry as its own key unit. The 51=17×3 correspondence is therefore a testable layout coincidence, not an authenticated instruction.

## Frozen complete original inverse

Let \`R[0:51]\` be the image-adjudicated red p53 GP29 indices, in printed order. For physical p55 printed segment j (zero-based 0–16), use \`K_j=(R[3j],R[3j+1],R[3j+2])\`. At its within-segment offset t (zero based), decode its rune \`C\` as \`P=(C−K_j[t mod3]) mod29\`. Also check the opposite additive direction \`P=(C+K_j[t mod3]) mod29\`. No fitted source phase, word permutation, rotation, unknown key or alternate clock. The first p55 rune is included as the first one-rune segment. Source red indices are checked independently against the canonical p53 tail.

| Complete 76-rune signal | Exact GP29 IoC |
| --- | ---: |
| Original p55 | 0.037894736842 |
| Per-segment C−K | **0.034035087719** |
| Per-segment C+K | **0.030877192982** |
| Independently solved p57 first76 native GP runes | 0.059649122807 |

The entire resulting word-preserved candidate P=C−K is:

\`C PROA IAC CJ RHHEOIAIA GFOEDWEA EOD NGXNEAEEACLOEEOWFT WTAESXTH OEYRI HT CWEEOOXNG SNEOEAAEEEO MO YCWJJJ WGF PCU\`

The C+K candidate is:

\`H HCBM OF DIA YTRCGD DAEYJOO THX PPLIAIYMRRGJH THXNGIEOIA EOMLF TL OEFTHFAEIAN NGNGEOCHEE XEO POEPIAEAB ITTH NGTHM\`

Both remain nonlinguistic, with no source-identified next address, complete English sentence or reproducible key claim. IoC alone cannot prove the absence of a different underlying language, but the explicit proposed GP29 wordwise translation has not recovered authentic plaintext.

The [complete 76-rune standalone reproducer](../sims/p53_red51_p55_17segment_triplet_sft.cjs) also proves exact forward reconstruction for both directions and a native solved-p57 GP plaintext plant under this exact 17-segment clock. Reversing the triplet-group order fails the plant. Only this one natural segmentation, two opposite signs and one wrong-order control are evaluated.

## Source-triplet quadratic coefficients: complete-word extension (Agent39, 13 November)

The simple three-character repeating key above does not exhaust the conventional mathematical use of a three-rune source packet. A distinct interpretation takes each p53 red triplet as coefficients of a degree-two polynomial over GP29. The historically demonstrated 2013 base29 arithmetic makes polynomial evaluation an executable operator for a contemporary technical solver, though no original p53 inscription specifically selects a quadratic cipher.

For complete terminal word `j`, take three consecutive red rune values `(a_j,b_j,c_j)` in original order. At the zero-based within-word position `t`, set

`K(j,t) = (a_j + b_j*t + c_j*t*t) mod 29`, and `P(j,t) = (C(j,t) ± K(j,t)) mod 29`.

This interpretation differs from the original word-local repeating-triplet hypothesis: each word's shifting keystream varies polynomially with position and does not repeat every three runes. The source's GP **ordinal** or GP **prime residue mod29** supplies the three coefficients directly. There are four frozen complete variants, with no phase, key, alphabet-order or content-dependent choice.

Use **17 complete words**, preserving the actual first **11-rune** word spanning p54's last ten runes and p55's first rune. The next 16 words start on p55. The complete test covers **86** original runes and evaluates the 75-runic p55 wholly new-word suffix separately. This corrects the artificial one-rune first segment of the earlier page-local experiment.

| Source coefficient register | Inverse sign | Full 86-rune GP29 IoC | New 75-rune suffix GP29 IoC |
| --- | --- | ---: | ---: |
| Original ciphertext | none | **0.036114911081** | **0.038558558559** |
| GP ordinal | minus | 0.033105335157 | 0.035315315315 |
| GP ordinal | plus | 0.033378932969 | 0.034234234234 |
| GP prime residue | minus | 0.032831737346 | 0.032432432432 |
| GP prime residue | plus | 0.036388508892 | 0.037477477477 |

All four original inverses remain nonlinguistic under the manuscript's GP29 transliteration. The first complete word decodes respectively as `MAERFHDUEEOET`, `OEIEARLPYMDUY`, `CIAIALUDPEJPI`, and `WHCPIAPXMUIO`. None selects an unknown original sentence, next address, or authentic key. Every output **exactly re-enciphers all 86 original runes**, and an independent first-86-rune plant from the genuinely solved p57 text recovers **86/86** under each same polynomial stream. Re-enciphering and synthetic recovery validate only the reversible experiment.

The reproducible, read-only CJS test is [p53 red51 terminal-word quadratic SFT](../sims/lp2_p53_red51_p55_wordquadratic_sft.cjs). It reads the original physical-page rune corpus and red-span annotation, asserts the exact 51 highlighted p53 runes, verifies their original GP prime sum 2262, reconstructs the complete carried word, and emits all four decoded original words and controls.

**Decision for this additional family:** the fixed source-red GP29 polynomial-coefficient interpretation fails to recover native prose. Its failure offers no reason to fit new polynomial degrees, coefficients, source phases or secret word reorders without a new original clue selecting such an operation.

## Decision

Retire the **p53 red51 → 17 ordered word-local three-rune GP29 keys** route under both tested interpretations: period-three repeating shifts on the page-local segments, and direct quadratic-coefficient shifts over 17 complete words including the p54 carry. The visible cardinality is retained as a possible clue, subject to the p54→p55 carry objection. A new decoder must obtain a different operation or key-use rule directly from an original instruction, with a withheld prediction; the present coincidence is insufficient to reopen the broad p53/p55 key search. No unknown LP2 plaintext, authentic key or destination recovered.
