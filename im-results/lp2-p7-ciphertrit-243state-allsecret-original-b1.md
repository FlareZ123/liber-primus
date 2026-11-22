# Key-independent bound on a full 243-state GP29 ciphertext-feedback cipher

**Agent 6, 22 November 2026.** This is a source-constrained, independently reproducible *all-secret necessary-condition exclusion*, rather than a fitted decryption. **No original unknown LP2 plaintext, author key or final Cicada endpoint has been recovered.** It closes a distinct five-symbol feedback architecture, with **all 243 secret 29-symbol alphabets unconstrained**, on the long original post-p7 register under native-English GP29 plaintext.

## An author-visible operation and the rival

Physical p7 ends in **five red words** and dots. Their actual GP29 rune-index products, in original printed order, are **[11,26,8,15,2]**; reducing modulo3 gives the exact five-trit initial vector **[2,2,2,0,2]**. Immediately following physical p8 has **243 black GP29 rune positions** (the last position crosses into p9's first word); 3^5 =243. This original evidence motivates, without proving author intent, a five-trit *ciphertext-feedback* register in which the five most recently emitted GP29 ciphertext runes, reduced modulo3, choose one of 243 independently secret substitution alphabets.

The explicit receiver, with ciphertext C and candidate plaintext P, is:

    state_i = (C[i-5] mod3, C[i-4] mod3, ... , C[i-1] mod3)
    C[i] = Q[state_i](P[i])

where **every one of the 243 Q tables is an entirely independent, secret GP29 permutation**. The first five trits are initially the source p7 red-product residues, but the final exclusion survives *any* initial five-trit state. A cipher feedback step shifts out the oldest trit and shifts in C[i] modulo3. It has no extra red-rune deletion, letter phase, plaintext-selected exception, arbitrary coefficient fit or particular guess at a secret alphabet.

This is materially distinct from the already excluded periodic p7-derived 242-state fixed substitutions (im-results/lp2-p7-gf3-242-fullstate-original-invariant.md). **The current state is nonperiodic and depends on the exact prior ciphertext values**; simple lag-242 equality identities do not apply. It is likewise distinct from prior 3-mode predecessor quasi-groups, because here *all 243 complete five-trit states have separately unknown GP29 alphabets*. The independent rival remains native GP29 encryption using a more expressive cipher, especially a rule that updates Q or its secret key after each page/chapter.

## Mathematical all-secret upper bound

For each original ciphertext state s and original glyph c, count n[s,c], the number of positions where s precedes the printed c. Because Q_s is a bijection, **a particular plaintext GP29 rune x must map to exactly one ciphertext rune c within each state**. Therefore:

    number of occurrences of plaintext rune x
      = sum_s n[s, Q_s(x)]
      <= sum_s max_c n[s,c]
      = B.

This is an *exact bound for every secret Q_s*, including entirely nonaffine alphabets and all 29! possible assignments in each of 243 rows. There is no inferred key or plaintext. It is not just a frequency-score penalty.

Only the first five positions after a newly reset state depend on an unknown five-trit IV. Skip those five at each reset, calculate the exact B for the remaining source ciphertext, and then add a maximum of **five** possibly recoverable occurrences per reset. This gives a rigorous upper bound for **every secret initial state** as well as every secret Q_s.

The original untouched post-p7 GP29 tape consists of **11,082 runes** (physical p8–55, physically empty-rune p50 skipped, all printed rune positions retained). Main chapter boundaries follow the source illustrations: p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55. Original exact counts:

| Clock/reset law, same 243 secret alphabets across scope | Total original runes | Full source-IV B | After initial five positions per reset B | Maximum B over *every* unknown IV |
| --- | ---: | ---: | ---: | ---: |
| One continuous p8–55 register | 11,082 | **1,136** | 1,136 | **1,141** |
| Reset register each of seven illustrated chapters; reuse all secret alphabets | 11,082 | **1,136** | 1,134 | **1,169** |
| Reset at each of 47 physical rune-bearing pages; reuse secret alphabets | 11,082 | **1,126** | 1,115 | **1,350** |

The **frequency-only** page-reset model with freely chosen hidden IVs remains open: its conservative all-IV dominant-rune upper bound of 1,350 permits typical English letter frequencies. **A separate exact alphabet-support obstruction below excludes that same page-reset law if the intended source-native plaintext uses the authenticated 27-symbol GP29 repertoire**, irrespective of its initial states. Independent secret alphabet renewal per chapter/page remains outside both shared-Q tests.

## Stronger exact source-alphabet support obstruction

The independent, source-authenticated nine solved GP29 sections (2,979 original plaintext runes, including genuine LP1 and solved LP2 p57) use exactly **27** of the 29 listed GP symbols. Their entirely absent glyphs are **EO (index12, ᛇ)** and **OE (index22, ᛟ)**. This is a factual description of the known plaintext sample, **not** proof that all unknown LP2 pages necessarily exclude those symbols.

**Independent repertoire calibration:** Zero EO/OE in the 2,979 source-authenticated solved runes is compatible with ordinary English. Of 595 source-native GP English reference windows **of precisely the same 2,979-rune length**, 69 also lack both symbols: **13/60 Gibran, 30/215 Shakespeare, 26/320 Emerson** (window stride 997). Thus the historically observed 27-symbol support is **not evidence that the unknown 11,082-rune book uses a restricted 27-symbol alphabet**. EO/OE appear rarely in unrestricted English and could occur at least seven times over 11,082 runes. The source-support contradiction is a precise conditional statement. The independent top-k majorization exclusions for native-English frequency remain applicable without any assumption of absent glyphs.

A permutation Q_s applied to a plaintext alphabet of **at most 27 allowed symbols** can emit at most 27 distinct ciphertext symbols within a fixed state s, irrespective of letter frequencies or plaintext genre. After discarding the **first five GP ciphertext positions of every reset segment**, the original p8–55 register nevertheless contains **seven distinct 5-trit history states**, specifically base3 state integers **32,33,41,85,96,103,173**, that each precede **28 different original GP ciphertext symbols**. The same seven state IDs and same impossible support width of28 occur in all three physical reset conventions: continuous, original seven-chapter and all 47 rune-bearing page resets.

These observations are computed *only from the original ciphertext after its first five symbols*, so **no choice of secret initial 5-trit state can eliminate the contradiction**. For any bijective 243-state ciphertext-feedback model with the same 243 shared Q tables, the original text therefore **cannot decrypt entirely into the exact 27-symbol GP29 plaintext repertoire actually observed in the solved book**, even if its output is non-English, highly balanced, artificially repetitive or different from any reference corpus.

This is a stronger, **language-frequency-free conditional exclusion** and also covers page-reset clocks with arbitrary IVs. A future authenticated unknown-page plaintext containing EO or OE would require re-evaluating the 27-repertoire premise; a secret independent codebook per page or a non-bijective/state-changing cipher falls outside it.

## Native-English controls and genuine source positive

The project already established a *source-native* English to GP29 encoder using original solved LP1 words. It correctly treats historical ING and IO spelling; the CJS imports that prior verified implementation rather than inventing a new transliteration. Three independent public text bodies are encoded into genuine GP29 symbols, then sampled in exact **11,082-rune** windows, with 50% overlapping strides. For every window, count occurrences of its most frequent rune, typically GP29 **E**, index18.

| Source-native independent corpus | Number of full-length windows | Smallest most-common-rune count | Largest |
| --- | ---: | ---: | ---: |
| Gibran, *The Prophet* | 10 | **1,217** | 1,366 |
| Shakespeare | 38 | **1,234** | 1,435 |
| Emerson | 56 | **1,285** | 1,473 |

Thus **every one of these 104 windows** requires at least **1,217** copies of one native GP29 rune, while the original source permits at most **1,141** or **1,169** copies under the continuous or chapter-reset 243-alphabet feedback cipher for **any secret key or initial state**. The gaps are respectively **76** and **48** runes even against the weakest observed control. Windows overlap, and this is a conditional language/register exclusion, **not** a statistical probability of all imaginable LP2 plaintexts.

The SFT additionally constructs actual secret 243-state reversible affine GP29 alphabets, enciphers the *same* independently sourced original-length English text, then decrypts it exactly with the ciphertext-driven feedback, both as one continuous register and at seven authentic chapter resets. In those positive plants the same mathematical upper bound necessarily admits the actual plaintext's dominant rune count, verifying that the feedback-state bookkeeping is correct. The original ciphertext is not treated as a planted valid English cipher.

## Exact top-k majorization and one-rekey decision

The top-one upper bound is the first member of a complete *key-independent majorization* necessary condition. For every k from 1 through 29, the count of the k most frequent plaintext rune symbols is at most the sum, over every independent 243-state alphabet epoch and every state, of the k largest ciphertext-rune counts in that source epoch/state. As above, exclude the first five source runes per epoch and add five to the upper bound, so this **also covers any arbitrary secret IV**. The k=27 theorem yields the 28-symbol support obstruction without assuming frequencies.

A possible intended fix for the post-p7 global-key failure is **one state-alphabet rekey at a conspicuous original section boundary**. Freeze exactly the six visible visual section boundaries p15, p23, p27, p33, p40 and p54. Treat each side of the chosen cut as a separate secret 243-state alphabet family, resetting the five-trit register there. Do not fit a key, decoder or English passage. The following upper bounds include all possible starting IVs:

| One global or two independent-key epochs | Maximum top-1 plaintext count | Maximum top-10 plaintext count | Maximum top-27 plaintext count | Independent ordinary-English control windows violating at least one top-k necessary bound |
| --- | ---: | ---: | ---: | --- |
| No rekey p8–55 | 1,141 | 7,094 | **11,075** | **104/104** |
| Rekey exactly p15 | 1,403 | 7,913 | **11,081** | **102/104** |
| Rekey exactly p23 | 1,481 | 8,303 | 11,082 | 0/104 |
| Rekey exactly p27 | 1,478 | 8,299 | 11,082 | 0/104 |
| Rekey exactly p33 | 1,474 | 8,350 | 11,082 | 0/104 |
| Rekey exactly p40 | 1,475 | 8,343 | 11,082 | 1/104 |
| Rekey exactly p54 | 1,316 | 7,251 | **11,078** | **104/104** |

The full ciphertext is 11,082 runes. Hence top-27 capacity smaller than 11,082 **algebraically prohibits the exact historically observed 27-GP-symbol plaintext repertoire**, even if there is a key reinitialization at p15 or p54. A single rekey at **p23, p27, p33 or p40** escapes that *necessary-condition* contradiction, making these four source-visible chapter cuts the first viable one-rekey alternatives in the specified class. They are **not successful decipherments or creator-identified key changes**.

With no rekey, the earliest support contradiction is physical **p47 rune offset68 (zero-based), global post-p7 position9,697**, where one history state first precedes its 28th distinct ciphertext symbol. This proves a key-renewal or a different operation is required by that point under the historical 27-rune hypothesis. The p15 and p54 single rekeys cannot repair this independent full-book deficit. The source does not distinguish among p23/p27/p33/p40, so further cipher optimization requires a clue selecting one transition.

## Decision

Retire **globally reusable, fixed, 243-state GP29 substitution alphabets driven solely by the preceding five ciphertext residues modulo3** across the post-p7 register under either of two independent conditional premises: (a) the intended source-native plaintext uses only the 27 GP29 symbols authenticated across known solved sections, which excludes even page-reset shared-Q variants for every secret IV; or (b) the intended plaintext has sustained ordinary English GP rune frequencies, which excludes continuous and seven-chapter shared-Q variants for every secret IV. The result is key-independent but depends on the stated plaintext register. The original 242/243 physical state clue still may select a *different* operation: word aggregation, non-bijective output, changing Q, per-chapter independent rekeying, a separate transform, an external pad, or nonstandard plaintext register.

A proposed salvage must identify a first-party **new key epoch** at a valid original boundary (p23/p27/p33/p40 if there is exactly one), or a genuinely value-changing update beyond stationary 243 bijections. Freely tuning continuous or p15/p54-only 243-state alphabets cannot overcome the exact support and top-k capacity bounds.

**Exact Windows-compatible Node22 SFT:** sims/lp2_p7_fiveciphertrit_243allsecret_b1_sft.cjs. Sources: resources/liber-primus/lp2-corpus.json, existing source-native GP orthography/solved-LP1 controls, and independent pinned Gibran/Shakespeare/Emerson plaintext. The SFT asserts the original red five-word product vector, all physical scopes, exact all-key B bounds, the seven original 28-symbol ciphertext-support obstructions, full top-k majorization and illustrated one-rekey decisions, 2,979-rune EO/OE absence controls, genuine 27-rune known plaintext, source-native English controls and exact feedback-cipher positive plants.
