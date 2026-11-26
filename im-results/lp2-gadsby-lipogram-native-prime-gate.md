# LP2 constrained composition: historical E-lipogram under native GP29 ciphers

**Decision (#3038):** a Gadsby-like no-E composition does not supply a useful LP2 plaintext register under direct reading, the authentic p56 prime-minus-one law, or even arbitrary eight-phase additive F-hold keys. It does not explain repeat suppression. This is a bounded negative, not an exclusion of all deliberate constrained composition.

## Independent rule and control

Ernest Vincent Wright's 1939 *Gadsby* explicitly prohibits E in the story; the author's introduction describes the rule and the transcriber's note records three instances of “the” and one of “officers” left as published. The full 2014 Gutenberg transcription is pinned at [GITenberg commit 9536500, 47342.txt](https://github.com/GITenberg/Gadsby-A-Story-of-Over-50-000-Words-Without-Using-the-Letter-E_47342/blob/9536500beeeb8aaa4942644e4452672385075065/47342.txt), Git blob `29697b888b340fb64826da07101ec5c62bfcd2c4`. The rule predates LP2; there is **no independent Cicada clue selecting this book or letter**.

Freeze the GP29 labels containing E: EO, E, OE, AE, EA (indices 12,18,22,25,28). Under a literal graphemic encoding, an E-free text cannot use these five symbols. Use the repository's standard approximate English-to-GP adapter (QU→CW, K/Q→C, V→U, Z→S, longest GP token; ING→NG, IO→IA); this is not an image-attested native spelling of Wright. Strip front/back matter, chapter-numeral lines and illustration labels. Retain the four source exceptions, rather than cleaning them to satisfy the hypothesis. The story yields 51,768 tokens, 200,412 GP runes. Use the first 15 nonoverlapping 12,956-rune windows, split to the fixed original 55 rune-bearing physical-page lengths, natural donor word breaks retained. The original's 2,928 physical-page groups include page fragments; this is not a claim that there are 2,928 continuous manuscript words.

## Native law and outcomes

Historical p56 forward replay 85/85: C=0 for literal plaintext F; otherwise C=P+prime_j−1 mod29, advancing j only on consuming runes. The actual LP1 WELCOME native eight-phase DIVINITY additive law likewise replays 515/515 printed ciphertext runes. No original statistics were used to select the historical letter constraint or control book.

| Same-page statistic | Original LP2 | Clear Gadsby (15 windows) | p56-encrypted Gadsby (15 windows) |
|---|---:|---:|---:|
| adjacent repeats | 86/12,901 (0.667%) | 440–552 (3.41–4.28%) | 424–487 (3.29–3.77%) |
| within printed group/word | 0.628% | 3.52–4.33% | 3.13–3.83% |
| across group/word seam | 0.801% | 3.03–4.17% | 3.14–4.28% |
| groups/words containing a repeat | 2.12% | 9.52–12.15% | 8.32–10.14% |
| lag 5 equality | 3.65% | 5.79–6.66% | 3.23–3.73% |
| lag 6 equality | 3.49% | 5.87–6.84% | 3.06–3.54% |

The p56 cipher makes lag 5/6 comparable but does not yield adjacency suppression. Nine authentic solved Cicada sections (native rune transcription rather than approximate Latin conversion) are also included; their clear per-section repeat rates are 1.06–4.49%, and their hypothetical p56-transformed rates 1.06–5.68%. Treat section-internal printed groups as groups, and control sizes and genre differences as limitations. A matched-window comparison is empirical, not a distribution-free statistical theorem.

## Exact original receiver

1. Page-local p56 prime clock: dynamic program over consumed-prime count. At C=0, allow either literal held F or consuming P≠0; at other C, only a consuming branch. Cost is the number of forbidden plaintext labels. Both full 55-page donor plants pass zero-cost checks. On original, 53/55 physical pages are illegal regardless of lipogram, and the only legal pages p1 and p49 require respectively 45 and 13 forbidden symbols. This fixed p56 reset rejection was already known in substance; the lipogram costs are the new diagnostic.
2. **All-key q8 extension:** allow an arbitrary eight-element shift vector separately for every physical page, with arbitrary phase inherited at the page start (absorbed by rotating the free vector). Branch on every C=0 interpretation. For each phase, retain counts of consuming ciphertext symbols. A shift k is illegal if any consuming C=k; otherwise its violation cost is the count of C for which (C−k) mod29 is one of the five forbidden labels. Sum the minimum feasible cost independently over phases. This monotone bound permits exact branch-and-bound up to threshold 5. The search needs no language score, source key, fitted alphabet, or restriction to a dictionary. If a page has no legal path, it vacuously cannot meet the bound.
3. Exact comparison against brute force for **all 729** length-six streams in a three-symbol, two-phase reduced alphabet; four authentic 100-rune lipogram plants encrypted with the native WELCOME key all achieve zero. Original **48/55 pages** require at least five forbidden runes each; other pages add 7. Thus **at least 247 violations** across the original, even allowing distinct keys per page: 187 in p0–39, 60 in p40–55. This is a certified capped lower bound, not an exact total. Even a generous four-violation allowance on LP2 (the entire much longer historical book has only four) fails on p0 alone and on independent p40–48.

An unchanged q8 consuming clock across pages is covered by this relaxation; a word-reset clock, different periods, alternate orthography or a general nonstationary cipher is outside scope. The direct plaintext register is also impossible under this literal encoding: the original has 2,235 runes whose labels contain E. A static substitution cannot make this very short forbidden set absent while retaining the observed full alphabet (no general static-substitution theorem is needed for the decision here).

## Reproduction and next decision

- [SFT](../sims/lp2_gadsby_lipogram_native_prime_sft.cjs), [full output](lp2-gadsby-lipogram-native-prime-output.json).
- Download the pinned GITenberg text without newline normalization; run `node sims/lp2_gadsby_lipogram_native_prime_sft.cjs <path-to-47342.txt>`. The raw output includes input blob identifiers; the core was executed in connector V8 against fetched text, not native Windows Node.
- Retire this specific historical lipogram/receiver. There is no original clue selecting the forbidden E set, and no readable unknown continuation. An independently motivated finite-state composition rule could still be investigated, but do not infer forbidden pairs from LP2 and use them as evidence for their own selection. The overall research frontier and authoritative synthesis are unchanged.
