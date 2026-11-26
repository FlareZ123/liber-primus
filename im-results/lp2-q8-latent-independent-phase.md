# Independent-phase latent-word inverse (Agent 5)

Source: physical p54 red8 [19,21,23,27,2,14,10,19], its GP-prime residues [13,21,2,20,5,18,2,13], and authentic WELCOME q8 offsets [23,10,1,10,9,10,16,26], both signs. This tests the distinct H-decoy specialization in which neither word boundaries nor per-word phase are given. Canonical GP29, literal F hold, independent uniform phase per actual word. Lexicon is 95% weighted training words (first 80% of three donor texts, external TextBlob dictionary, solved native corpus), 5% singleton fallback. 31,629 distinct words, 77,636 trie nodes. Exact dynamic program sums dictionary/phase paths; prefix marginal includes strict extensions of an unfinished word. Key selected by 223-rune prefix only; suffix score is conditional log probability of remainder and final boundary, per 76 runes. Joint MAP path replayed exactly. Three 299-rune held-out literary donor controls, one each of positive keys, and matched iid pad controls. No printed separators used.

| Control | True key | Selected key | Prefix nats/rune | Held nats/rune | Held rune accuracy | Held boundary F1 |
|---|---|---|---:|---:|---:|---:|
| Gibran | red8+ | red8+ | -2.304797 | -2.121748 | 75/76 | 1 |
| Shakespeare | red8-prime+ | red8-prime+ | -2.121110 | -2.065621 | 70/76 | .918919 |
| Emerson | WELCOME+ | WELCOME+ | -2.186070 | -2.213864 | 76/76 | 1 |
| iid pad Gibran | none | WELCOME- | -4.596956 | -4.579112 | — | — |
| iid pad Shakespeare | none | WELCOME+ | -4.657643 | -4.431000 | — | — |
| iid pad Emerson | none | red8- | -4.477980 | -5.047887 | — | — |
| original p54 body+p55 | unknown | red8-prime- | -4.459031 | -4.735797 | — | — |

Calibration gate: all three keys correct, each held rune accuracy >=85%, held boundary F1 >=75%, held score above all pad controls. Passed. Original continuation falls in iid pad control range. Original MAP consists of fragmented words and 25 fallback singletons; no coherent plaintext. Original prefix/held score pairs for all six variants: red8+ (-4.679468,-5.074473); red8- (-4.738701,-4.465569); red8-prime+ (-4.625977,-4.481325); red8-prime- (-4.459031,-4.735797); WELCOME+ (-4.783913,-4.413690); WELCOME- (-4.680027,-4.876196). None approaches donor control scores.

This is a calibrated negative for these fixed keys and this independent-phase generative model, not for arbitrary q8 keys, permutations, nonuniform phase mechanisms, multi-rune OOV language or H-decoy in general. Exact replay is implementation validation, not evidence of plaintext. Positive donors come from final fifth of literary texts; their vocabulary may appear in external dictionary. Whole-span MAP boundaries use the entire ciphertext after prefix-only key choice, not prefix-only predictions of individual words. The core was actually executed via V8 on connector-returned input. Initial multi-file GitHub GraphQL write failed; smaller contents writes used for persistence.
