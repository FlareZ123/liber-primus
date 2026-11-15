# LP2 numeric-table flanking sentences: exact historical quotation crib search

**Agent20, 15 November 2026. Outcome: no verbatim direct plaintext crib in the six independently held full prose sources or the four authentic older book-code word-length registers.** This is an exact, narrowly source-constrained search for a missing plaintext/key known to a human solver. It yields no unknown LP2 plaintext or decipherment operation.

## Why these source texts and windows

The original pp49–51 numeric table interrupts rune prose at a visibly red ten-dot mark. Printed punctuation, preserved across page boundaries, defines a **33-word /138-GP-rune** sentence immediately before the table (p48→49) and a **40-word /170-GP-rune** sentence immediately after it (p51→52). A real creator-era literary quotation in either sentence would give a complete, independent known-plaintext crib; any correct proposed key would then have to reencrypt the original runes word-for-word. Thus exact word-length equality is a **necessary condition** for an unedited quotation under the word-boundary-preserving GP29 Vigenère-style ciphers actually used on solved LP1 pages.

The candidate library consists of (1) the complete 2013 historical *Book of the Law* chapter texts, themselves explicitly involved in a former Cicada puzzle; (2) a preserved GP29 word-length transcription of William Gibson's *Agrippa*, involved in the 2012 Cicada book code; and (3) three full English controls: Shakespeare, Gibran's *The Prophet*, Emerson essays. The Book of Law was checked **twice**, using the original-source-oriented 2013 derived chapter word-lengths and an independent plain-text chapter transcription. This is materially different from previously tested direct *running-key* use of Book of Law: the present operation tests **whole verbatim plaintext text** as a prospective known-plaintext crib and does not assume the book is a cipher key.

## Complete original-input test

Use exactly the 33 or 40 printed original GP rune lengths, including both true cross-page word joins. For each source, split into lexical English words and greedily map source-native GP ligatures **ING, TH, NG, EO, OE, AE, EA, IA, IO** to one rune each. Other letters count one rune; ordinary GP substitutions V→U, K/Q→C and Z→S are length-preserving. The original 2012 and 2013 derived registers already contain GP rune counts and retain their independently recorded source normalization.

Slide the complete source word vector without changing word order or removing any words. The exact distance is the sum over all positions of the absolute rune-length difference; **distance zero is required for an unedited literal quote**.

| Historical source/register | Source words | Best 33-word distance | Best 40-word distance |
| --- | ---: | ---: | ---: |
| *Book of the Law* chapter I plain text | 1,896 | 41 | 63 |
| Chapter II plain text | 1,967 | 42 | 63 |
| Chapter III plain text | 1,998 | 40 | 63 |
| Original 2013 chapter I length register | 1,897 | 41 | 63 |
| Original 2013 chapter II length register | 1,968 | 42 | 63 |
| Original 2013 chapter III length register | 2,002 | 40 | 63 |
| 2012 archived Gibson *Agrippa* length register | 1,682 | 44 | 64 |
| Shakespeare held corpus | 54,189 | 34 | 50 |
| Gibran *The Prophet* held corpus | 15,726 | 36 | 52 |
| Emerson essays held corpus | 77,773 | 36 | 53 |

**Zero exact matches** in any of the ten independent historical/source windows for either entire original 33-word or 40-word sentence. The nearest 33-word Shakespeare window still differs by total GP length 34; the nearest 40-word Shakespeare window differs by 50. Neither is a credible verbatim match. A planted 40-word exact GP-length excerpt from historical Book of Law chapter I at offset400 is recovered at **distance0 at the original offset400**, validating that the simple screen would detect an intact source-register quotation.

The [standalone CommonJS source-and-positive SFT](../sims/lp2_p49_historical_prose_quote_crib_sft.cjs) reads all original corpus, rune transcription, six full prose texts and two archival GP-length files from the committed repo; it checks all source rune pages, complete sentence counts, every tabled minimum and the positive. The full sliding-window calculations were independently executed with the connected JavaScript runtime. No GitHub Actions run is claimed.

## Decision

These exact full printed sentences do **not** reproduce a verbatim, word-boundary-preserving quote from the historically relevant Book of Law or Agrippa source versions, nor from the three held controls. This **does not** exclude a paraphrase, a heavily edited quote, a distinct book not tested, a transposition changing word order, or plaintext generated independently by Cicada. Original LP2 still needs an independently selected cipher/key or actual plaintext source. Do not manufacture another near-quote by selectively dropping words or choosing a cipher phase to fit a weak partial match.
