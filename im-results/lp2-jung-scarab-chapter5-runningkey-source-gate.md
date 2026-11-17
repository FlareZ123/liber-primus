# Jung 2009 scarab/fallen-man scene as a fixed LP2 running key

**Decision (17 November 2026, Agent14; Director #1320):** the one visually selected chapter-V *Red Book* scene and its unshifted GP29 running-key application are contradicted by the original ciphertext under the authentic 2014 plaintext-F bypass. Neither the candidate operation nor its opening key convention yields an unknown LP2 plaintext; the proposed Jung artwork connection remains unverified.

## Source-first player path

The original LP1 physical p16 (`resources/liber-primus/16.jpg`) places an insect resembling a scarab near a reclining/dead human figure around the already solved 5×5 numerical square. A 2014 reader could search for an illustrated literary scene combining a scarab and fallen man. The 2009 *Red Book*, **Liber Primus, chapter V**, pp. 237–239, contains a passage beginning **“I see the bloody head”** and soon depicting a floating scarab. This is a specific, period-available scene match and a possible book pointer. The rival is general occult/funerary imagery or the already-solved square's thematic illustration. No signed Cicada source says to use Jung as a key.

One deterministic hypothesis was fixed **before scoring the original ciphertext**: start the running key at the first rune of the scene's prose, in its edition order. No chapter-key offsets, hidden seed, cipher-fitting shifts, wraparound or language-ranked alternative passages are permitted. The source scene is text, rather than a literal transferred copy into the cipher; this differs from closed #1313's same-word-length quotation check.

The textual witness: [Jung, *The Red Book* (2009), Liber Primus V, original scene](https://studylib.net/doc/28515314/the-red-book---carl-jung). Strip punctuation, uppercase, map K/Q→C, V→U, Z→S, use historical aliases ING→NG and IO→IA, then greedy GP29 diphthongs `TH,NG,EO,OE,AE,IA,EA` before single runes. The fixed paragraph supplies 428 GP rune values. The reproducible SFT retains its **first 260 numeric GP rune indices**, with SHA-256 over the 260 raw index bytes `0e0e1bd8bed1ed4628e10e2d288102971e964f44e476049495ee16eb467ddd0d`, without copying a copyrighted whole passage. All three tested inverses fail before the 260-value limit.

## Reversible operation and decisive controls

The historical solved 2014 prime-totient cipher demonstrates the literal-plaintext-F skip: if `P=F(0)`, output `C=F(0)` and **consume no key**. Otherwise `C=(P+s*K[t]) mod29` consumes exactly one key symbol, where `s=+1` is the forward additive convention, `s=-1` its subtractive control. Every ciphertext F branches into a literal transparent F and, if the current key allows it, a consuming encrypted non-F. A source-native dynamic program retains **all** possible key-consumption states; any state that would decode non-F ciphertext to plaintext F is illegal. Thus an original *zero remaining states* result is an algebraic failure independent of English likelihood.

The same implementation confirms the **85-rune original solved p56** admits its authentic prime-totient F-transparent clock (five legal terminal consumed-key counts). Both signs of a **95-rune original clear p57** native plaintext plant, encrypted with the source-key F rule, admit a complete inverse. These are genuine source-native positive controls; no invented plaintext is used to choose original-cipher output.

For each receiver, the key starts at the source scene beginning with no offset and consumes continuously. All are on untouched original image-transcribed GP29 values; no words, punctuation or runes were removed:

| Original receiver (first 400 runes) | Source alignment | Additive key, first impossible rune index | Subtractive key, first impossible rune index |
| --- | --- | ---: | ---: |
| p0–2 chapter, starting **after the image-correct red13 title** | p0 rune 13 | **220** | **8** |
| p23–26 mayfly chapter | p23 rune 0 | **66** | **15** |
| independent p3–7 visual chapter | p3 rune 0 | **12** | **42** |

All three intact 400-rune receivers lack **any** complete key-consumption path for **both** signs, even allowing arbitrary legal F skip masks. Applying simpler always-consuming GP29 Vigenère to the first 200 real p0 body runes reencrypts perfectly but leaves IoC **0.03311557788944724** under subtraction or **0.03527638190954774** under addition and nonlinguistic GP output. These are original-input negatives, not a proof about every possible key from Jung.

## Decision and use

This test retires **only** the exact edition-scene opening, GP29 additive/subtractive running-key operation, and genuine plaintext-F bypass against these fixed original recipients. The source material does not select some other sentence, an offset deep into the book, a page-number seed, a different cipher, a reset rule or a custom normalization. These are missing authorial selectors; inventing them to rescue the image association would fit a new cipher after seeing failure.

No unknown plaintext, GP29 key, complete inverse, hash preimage or Cicada destination is recovered. A dated Cicada-authenticated Jung book pointer, exact page/line coordinate and consuming operator could justify a different, independently locked follow-up, but absent that selector the source-quote family offers no productive key sweep.

**Reproduce:** [Single-file original-input CJS SFT](../sims/lp2_jung_chapter5_scarab_runningkey_sft.cjs), [successful Windows Node 22 source run](https://github.com/FlareZ123/liber-primus/actions/runs/43997003681). All assertions on original p0, p3, p23, solved p56, native p57 and the fixed key fingerprint pass.
