# Blake's 1794 *First Book of Urizen* as a finite original-LP2 running key

**Decision (23 November 2026):** The fixed 1794 Blake source excerpt, interpreted as a Gematria Primus running key under the previously solved Cicada signed additive operation, yields no unknown plaintext on the authentic opening, five numbered units, an independent chapter or p55. The exact historically attested **plaintext-F-transparent** transfer is **mathematically impossible** for every tested multi-hundred-rune original register. This is a bounded key/consumer negative; it does not disqualify Blake's thematic role, another source text or an independently indicated cipher.

## Why the source was selected

Cicada's original 2014 1033.jpg cover is a composite of four William Blake images, including *The Ancient of Days* (Urizen), *Newton* and two *Nebuchadnezzar* variants; the archived 2014 Stage02 onion page separately quotes a Blake phrase from *The Marriage of Heaven and Hell* in its HTML title. The 1794 illuminated poem itself is entitled **The [First] Book of Urizen**, providing a historically available "first book" thematic parallel to *Liber Primus*. [CicadaSolvers original-artifact overview](https://www.cicadasolvers.com/wiki/liber-primus/liber-primus-structural-overview/) · [authenticated original 2014 Blake-title gate](lp2-2014-blake-html25-key-native-F-original-gate.md) · [Wikisource Blake poem revision 15804931](https://en.wikisource.org/w/index.php?title=The_Book_of_Urizen&oldid=15804931).

**Upstream weakness:** no Cicada-authenticated instruction chooses this poem, any specific excerpt, one of the two natural initial points, or a running-key decipherment. A title parallel alone cannot select a cryptographic opcode. It is nevertheless a finite, newly source-derived alternative to the previously tested *Marriage of Heaven and Hell* and 2014 HTML title, without tuning a cipher to ciphertext.

## Frozen source input and exact original receiver

Take the public-domain Wikisource text from the seven-line **PRELUDIUM** through **Chapter I, verse 6** (ending “When the cloud blazes over the harvests”). Its 1,179 GP29 key runes are transcribed verbatim in the [read-only SFT](../sims/lp2_blake_urizen_1794_runningkey_original_sft.cjs). GP29 normalization expands `&` as AND, maps QU→CW, V→U, K/Q→C, Z→S, ing→NG and io→IA, then greedily uses the authentic GP29 transliteration tokens. The **Chapter I first-text start is 199 runes** after the Prelude.

The four predeclared alternatives use either source start **0** (Prelude) or **199** (first Chapter I verse), and both invertible signs, with ciphertext `C[i]=P[i]±K[start+i] (mod29)`. No optional key offset, page tuning, ciphertext-fitted crib, secret interpolation or extra keyed layer. Test the complete original opening **p0–2, 729 runes**, all five physically numbered paragraphs **p36–38, 553 runes** in their printed order (lengths 139/91/98/96/129), independent **p40–41, 504 runes**, and **p55, 76 runes**. The direct inverse re-encrypts each authentic window exactly. Solved clear p57 has authentic source-GP29 IoC 0.06270997 for comparison.

As a stronger, source-authenticated cipher transfer, take the solved Cicada plaintext-F rule: if plaintext P=F (GP index 0), emit literal F and **do not advance the key**; otherwise emit the signed additive output and advance the key. At each actual original ciphertext F, branch over *all* legal consuming vs literal-F interpretations. A dynamic-programming set of reachable exact key positions gives a first-impossible ciphertext index without choosing any hidden plaintext word. A 95-rune **solved p57** source sample planted through each signed key is positive: the same inverse has a legal exact clock path in all four source-key settings.

## Results on untouched original ciphertext

| Original register | Plain direct inverse GP29 IoC range across four keys | Transparent-F first impossible position (zero-based), in Prelude(−,+), Chapter I(−,+) order |
| --- | ---: | --- |
| p0–2, 729 runes | 0.03414281–0.03481361 | **377, 214, 109, 41** |
| Five numbered p36–38, 553 runes | 0.03429253–0.03476426 | **5, 7, 83, 0** |
| p40–41, 504 runes | 0.03443624–0.03576951 | **139, 17, 66, 15** |
| p55, 76 runes | 0.03298246–0.04140351 | **34, survives, 14, survives** |

The full 729/553/504-rune original windows are **all rigorously incompatible** with this exact plaintext-F-transparent Vigenère running-key transfer, even with every possible hidden skip history. The short 76-rune p55 window leaves two *algebraically possible* F histories, but the direct inverses themselves have no source-native connected plaintext and their low IoC is consistent with ciphertext. An F-legal history is a necessary condition, never proof of plaintext.

**Original Windows execution:** [GitHub Actions run 45149502622](https://github.com/FlareZ123/liber-primus/actions/runs/45149502622), Node 22, success after correcting an initial overly strong assertion about the 76-rune p55 window. The first unsuccessful run was a test-assertion error, not evidence of a negative outcome; final source was updated to report survivor paths precisely.

## Research decision

Reject only these **four natural starts/signs** for an intact original GP29 running-key transfer from the **fixed Urizen excerpt**. Preserve the original artwork's Blake link, and avoid rescuing this failure by scanning every poem offset, sigil count, transliteration exception or unseen cipher without a new first-party instruction. The five numbered paragraphs remain undeciphered. Strong rival: solved LP1 uses red ordinals as independent philosophical statements, so these may be five aphorisms rather than a chained cipher program.

For independent future progress, locate a specific original source that selects both an **actual decoding operation** and its **receiver**. Do not promote the literary parallel alone to authenticated key material.
