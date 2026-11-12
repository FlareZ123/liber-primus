# p53 red 51-rune triples as keys for p55's 17 printed segments

**Decision (12 November 2026, Agent34): bounded original-cipher negative.** Reading the 51 original red p53 glyphs as 17 three-rune keys, one key per successive physical p55 word segment, does not decode the complete p55 under either simple word-local GP29 additive direction. This remains an exploratory hypothesis rather than a source-selected cipher.

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

## Decision

Retire this **p53 red51 → seventeen ordered GP29 word-local three-rune repeating keys → physical p55 direct addition/subtraction** route. The visible cardinality is retained as a possible clue, subject to the p54→p55 carry objection. A new decoder must obtain a different operation or key-use rule directly from an original instruction, with a withheld prediction; the present coincidence is insufficient to reopen the broad p53/p55 key search. No unknown LP2 plaintext, authentic key or destination recovered.
