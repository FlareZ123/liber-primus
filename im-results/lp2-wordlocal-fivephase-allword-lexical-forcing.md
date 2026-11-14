# All 2,896 LP2 words under arbitrary independent secret five-phase alphabets: four sharp lexical bottlenecks

**Agent31, 14 November 2026. Status: complete original-source word-viability census; no recovered plaintext, actual key, original cipher, or destination.** Original-input/CommonJS reproducer: [all-word finite secret-alphabet SFT](../sims/lp2_wordlocal_fivephase_allword_lexical_capacity_sft.cjs). All assertions and an independent full-length English plant passed [Node22 GitHub Actions 43610623940](https://github.com/FlareZ123/liber-primus/actions/runs/43610623940).

## Why investigate this specific all-key family?

The original 12,956 LP2 unknown GP29 runes form 2,896 printed words. The manuscript has **104/2,105** five-apart matches within words and an exact printed-boundary alignment anomaly. A plausible explanation is that every printed word receives its own independent five-phase permutation cipher, preserving equality between positions separated by five while flattening frequencies and concealing word identities. This is a *hypothesis*, without an original instruction choosing it or supplying the per-word permutations.

The existing [word-local five-phase result](lag5-contiguous-echo-second-order.md) checked long words and proved that independent *affine* five-phase word keys have **0/109** native-English dictionary matches, whereas completely arbitrary secret phase alphabets retain **109/109** long-word lexical viability. That 109-word capacity statement is correct but misses the evidence from shorter source words with multiple five-step echoes. Here all 2,896 words are checked, including the original eight-rune triple echo on physical p51.

Let the cipher at word w and zero-based rune position j be:

    C[w,j] = pi[w,j mod 5](P[w,j])

Each pi is a separately unknown full GP29 bijection. The family is deliberately generous: all five permutations may be chosen independently **for every word**, with no shared keys, prime clock, page reset or public inverse assumption. For any positions i,j in one word with i ≡ j (mod 5), the cipher must satisfy C[i]=C[j] exactly if and only if P[i]=P[j]. This invariant survives *every secret key*, and the full equality/inequality signature is decisive for lexicon viability. **It is also sufficient for the unrestricted cipher family:** each phase appears at most three times per original word, and the lag-five/lag-ten bits specify every within-phase equality or inequality. Equal signatures therefore define an injective map from the observed plaintext-symbol classes to the observed ciphertext-symbol classes. Any such partial injection extends to a permutation of the entire 29-rune alphabet, independently for each word/phase. This proves exact all-secret wordwise lexical feasibility under the stated model without fitting a finite list of phase keys.

## Full original manuscript versus native-GP English

Read the source GP indices from the canonical original 55 rune-bearing pages and the complete printed words from the original transcript (cross-page carries joined). For each word, freeze the exact equality bits at lags **five and ten**, capturing every within-phase pair because no printed word exceeds 14 GP runes. Encode all words from **55,407 Shakespeare tokens** and **29,164 TextBlob lexicon lines** with the solved-source GP orthography including ING and IO.

Across those two source inventories there are **30,369 distinct orthographic word entries** in **246** distinct length/equality-signature classes. For **every one of the original 2,896 words**, at least one matching English-register dictionary word exists. Therefore the full arbitrary per-word five-phase family remains mathematically feasible under this finite vocabulary; it cannot be universally rejected by equality structure alone.

But **four original words with six or more runes** have at most **two distinct candidate entries** under *every* possible choice of all their secret substitution rows:

| Zero-based original whole-word index | Original physical LP2 page | GP rune length | Full five-phase equality signature | Only native-GP candidate words in the combined control vocabulary |
| ---: | ---: | ---: | --- | --- |
| **754** | **p13** | 14 | 1000000000000 | **SEQUESTRECTOMY** |
| **1353** | **p25** | 14 | 0000001000000 | **INFRAMAXILLARY**, **METEMPSYCHOSIS** |
| **1967** | **p36** | 10 | 10011 | **TAPESTRIES** |
| **2722** | **p51** | 8 | 111 | **MESDAMES** |

Each row is an actual original ciphertext word constraint. For example, word 2722 is the eight-GP-rune ciphertext **ᛋᛞᛝᚷᛚᛋᛞᛝ**; its complete five-phase signature is 111 because the first and final triplets match. The only matching length-eight item in the tested merged vocabulary is MESDAMES, a French-form loanword. Word 754's sole candidate is the anatomical word SEQUESTRECTOMY. These candidate word identities are **conditional** on this cipher family and on completeness of the chosen vocabulary, and are **not authenticated LP2 plaintext**. The alternative INFRAMAXILLARY/METEMPSYCHOSIS is a genuine two-candidate ambiguity, not a key recovery.

An exact positive cipher control assigns a source-native English word to all **2,896 original word-length slots**, encrypts it under fresh word-specific period-five GP29 affine permutations and decrypts **all 12,956/12,956 symbols**. Its entire phase-equality signature is preserved exactly at every word. This tests the necessary-condition implementation against a real recoverable language-bearing example, separately from the original unknown ciphertext.

## Research decision

The all-secret five-phase per-word cipher is **formally compatible** with this finite English vocabulary, yet it requires several jointly unusual candidate word identities if the original text is standard GP-native English. It is therefore a poor route to intuitive philosophical prose without a historically justified translation register or source-supplied per-word key schedule. Merely fitting an arbitrary alphabet to an English word can always reencrypt a ciphertext; that does not authenticate its key or the resulting word.

The stricter [five-back fixed-marker rule](lp2-lag5-fixed-plaintext-marker-triple-original-gate.md) is excluded outright within the same tested English controls: the p51 triple echo forces plaintext word-final mmm, which never appears in either vocabulary. The independent five-phase permutation rule instead requires a plaintext prefix repeated as a suffix, and therefore survives narrowly via MESDAMES. Conflating the two rules would incorrectly announce a universal exclusion.

Do not treat the four candidate words as decrypted messages or devise position-specific exemptions to prefer a philosophical word. The next useful evidence would be a genuine original operation or key derivation selecting an actual word-specific permutation and predicting a complete readable passage on previously unexamined ciphertext.

[Reproducible source-only CJS SFT](../sims/lp2_wordlocal_fivephase_allword_lexical_capacity_sft.cjs) · [original source-native orthography](../sims/lp2_native_gp_source_orthography_sft.cjs) · [prior 109-long-word family test](../sims/lp2_wordlocal_fivephase_allsecret_sft.cjs).
