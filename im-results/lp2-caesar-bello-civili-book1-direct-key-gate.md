# Caesar's *De Bello Civili* I: direct original-cipher receiver for the proposed `SECUENDI RATIO` title

**Agent26, 22 November 2026.** This source-selected route is now implemented as a first-party **reversible original-input test**, with no recovered plaintext. It independently tests **Caesar's actual first book**, which earlier source-route notes identified through the tentative p0 heading but had not used as the running-key source.

## Why this historical source was selected

The original LP2 p0 red title is an 8+5-rune phrase. Existing geometric work proposed **`SECUENDI RATIO`**, a possible Latin reading of those thirteen encrypted runes. This title has **not been authenticated** and the geometric key derivation contains retrospective assumptions; its Latin spelling maps Q onto the available GP C rune and keeps I/O distinct.

In **Gaius Julius Caesar, *De Bello Civili*, Book I, chapter 30, first section**, the historically transmitted line reads `Itaque in praesentia Pompei sequendi rationem omittit...`. The title's nominative words `sequendi ratio` closely identify the inflected phrase `sequendi rationem`, and the source work's own heading includes **`LIBER PRIMUS`**. These are concrete, historical source words and a specific address within one ancient work; they make Caesar I.30.1 a much less arbitrary book-key candidate than a random Latin manuscript.

- First-party source: C. Julius Caesar, *De Bello Civili* I.30.1; [Gadsden edition](https://classics.andrewgadsden.com/library/caesar/de-bello-civili/1), [Perseus TEI / 1901 Du Pontet edition in CLTK](https://github.com/cltk/lat_text_perseus/blob/master/Caesar/opensource/caes.bc_lat.xml).
- Frozen source data: [normalized Book I](../resources/external/caesar-de-bello-civili-perseus-liber-primus-normalized.txt), **78,935** letters/spaces, **10,902** Latin words. Attribution and **CC BY-SA 3.0** license are embedded in that resource; its normalization is an adaptation of the Perseus TEI text and strips structural tags.
- Original ciphertext: canonical LP2 physical **p0**, first 13 title runes excluded, **249** black rune indices, preserving **57** printed body-word lengths. The scan itself is `resources/liber-primus/17.jpg`.

The direct already-tested approaches of a fixed GP29 Caesar shift and repeated GP29 `POMPEI` are in [the earlier negative receiver](../sims/lp2_p0_caesar_source_direct_gate_sft.cjs). This experiment therefore takes the next materially distinct, inexpensive original operation: Caesar's **contiguous source text as a running Vigenère key**.

## Precisely defined decoding experiment

Let `C[t]` be the original body rune index and `K[o+t]` the independently normalized Caesar Book I rune stream. Examine every source start `o` and both literal modular directions:

```
P[t] = (C[t] + sign * K[o+t]) mod 29
sign = +1 or -1
```

The model is exactly invertible, with no fitted key symbols. Two registrations of the source are tested:

1. **Direct Latin GP letter register:** one GP rune per Latin letter, with `Q→C, V→U, J→I`, following the tentative title's separate I/O convention, **68,034** source runes.
2. **Solved-LP compound GP register:** use authentic compound digraphs and `ING/IO` where applicable; **66,296** source runes.

For each registration, score **every one of its contiguous source starts** and both signs. This is **135,572 + 132,096 = 267,668 complete original inverse candidates** with two independent output-language controls: GP-native English from Shakespeare and direct Latin from the separately supplied Latin Vulgate. The language models are fixed conditional GP trigram distributions with additive count0.05; they never train on ciphertext. The original printed title's unique Caesar phrase selects much narrower source positions, and the SFT explicitly prints both signs of the 1.29/1.30/chosen-phrase aligned trials, including the known LP cipher convention of **transparent ciphertext F**, which suppresses key advancement at F.

A source-native **249-rune real Caesar Latin plaintext** is encrypted using the corresponding source positions, then fully inverted in both directions; both registers recover **249/249** original chosen plaintext runes. This confirms that the tested model can carry and recover actual Latin under a correct source key, rather than merely output arbitrary numbers.

## Decisive original result

Higher scores are more natural under the indicated independent language model; scores are **mean natural log probability per GP rune**.

| Source-key registration | Caesar source starts and signs checked | Highest Latin score | Highest English score |
| --- | ---: | ---: | ---: |
| Direct one-letter Latin | 135,572 | **−4.01242** | **−4.40405** |
| GP compound Latin | 132,096 | **−4.07122** | **−4.39697** |

Independent clear-text reference scores under the same method are **−2.36047** for 249 actual Caesar Latin runes and **−2.46513** for the authenticated 95-rune solved LP2 p57 English passage. The raw original p0 body itself yields **−4.38182** (Latin) and **−4.93260** (English). The very best unconstrained Caesar-book offsets are far below either positive threshold and visibly gibberish. The phrase-specific starts are worse than the best accidental global offsets.

The older hypothesis that p0 black text **is a consecutive quote from Caesar Book I with word boundaries preserved** also fails immediately under original word geometry. The physical p0 body begins with lengths `4,3,3,11,5,4,3,3,...`; across **10,902** possible Latin source-word starts, the longest matching initial word-length run is only **3 words**, at **10** positions. No four consecutive words fit, so the original body is not verbatim Caesar Book I text under that necessary condition.

## What changes next

**Retire simple contiguous Caesar Book I running-key addition/subtraction and contiguous direct Caesar quotation as plaintext recovery routes for original p0.** This test exhaustively covers all Book I offsets under the two historically motivated rune registers, including an independently selected source passage. It avoids repeatedly trying other Caesar shift phases or arbitrary Caesar-derived passwords. The exact source, text-normalization rule, original-runic input, reversible inverse, language models and printed-shape crosscheck are preserved in the [single-file Node22 reproducer](../sims/lp2_caesar_bello_civili_book1_original_receiver_sft.cjs).

The source relationship remains conditional because the title `SECUENDI RATIO` itself is only a candidate. A *distinct* book-coordinate scheme, one-line source-selected key, or custom transformation would require **new authorial instructions specifying how the Caesar text is indexed and mapped to GP ciphertext**. This report does **not** exclude that possibility, any other Latin source, or multilayer encrypted text. It does not authenticate any new LP2 plaintext.

**Original-input Windows Node22 execution:** [GitHub Actions run 44986891596](https://github.com/FlareZ123/liber-primus/actions/runs/44986891596) completed successfully on the unchanged Caesar/LP2/Vulgate/Shakespeare repo corpus, reproducing all source anchors, 267,668 original-key inverses and synthetic exact inversions.

The next useful decisive experiment is a source-selected operation tied to the **exact original numeral or illustration**, with an independent untouched-page prediction; blind additional source offsets, password formats or unhinted key derivations do not advance the route.
