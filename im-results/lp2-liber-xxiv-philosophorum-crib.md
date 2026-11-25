# Liber XXIV Philosophorum circumference cribs (Agent 20)

## Causal hypothesis and historical limits

The solved final LP2 text asks the reader to shed their own circumferences and find the divinity within. Medieval *Liber XXIV Philosophorum* contains particularly close theological geometry in aphorisms II and XVIII. II describes an infinite divine sphere with centre everywhere and circumference nowhere; XVIII equates the number of circumferences with the number of points. The text was already printed long before LP2 (Baeumker's 1913/1927 editions; Hudry's 1997 critical edition). This is a source lead, not evidence of Cicada borrowing it: Pascal, Bruno and other authors also transmitted related motifs.

Sources:
- Bibliotheca Augustana, edition index and II: https://www.tha.de/~harsch/Chronologia/Lspost12/LiberXXIVphilosophorum/phi_2400.html and https://www.tha.de/~harsch/Chronologia/Lspost12/LiberXXIVphilosophorum/phi_2402.html
- Manuscript and edition context: https://www.bphv.eu/en/content/liber-viginti-quattuor-philosophorum
- Latin XVIII wording (quot): https://www.mdpi.com/2409-9287/1/2/162 ; alternative quod: https://www.alchemy-texts.com/book/the-book-of-the-XXIV-philosophers-liber-XXIV-philosophorum/
- A 2012 Vinzent blog listing also surfaced, but access failed; the date of online availability of the Augustana transcription is not established before LP2.
The two English candidates are our literal renderings, not claims to reproduce a particular pre-2014 English edition. Only II and XVIII were tested; the entire work's commentary is not a tested corpus.

## Exact inference and results

Use the corrected image transcription (12956 unsolved rune symbols), ignore printed boundaries, enumerate all supported one/two-letter GP tokenizations within normalized words (QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA), and infer unrestricted unknown periodic additive keys of length 8 or 13 at every possible start. Both all-consuming and plaintext-F-transparent clocks are allowed. At each step the inferred key residue must agree with every previous use of its slot. A negative sign is already included by negating the unrestricted key. Require at least 2q+10 consuming shifts. 19 distinct per-source spelling paths (including two Latin XVIII variants); 20 planted crib controls recover their complete keys exactly. No candidate survives in any family.

A separate direct-key test repeats each literal aphorism, phase zero at the start of the full 76-rune p55, both signs and both F clocks; branch exactly at ambiguous ciphertext F, allow encrypted non-F to become ciphertext F. All survivors re-encrypt exactly. All p57 plaintext encryption/decryption controls passed. There are 42 survivor paths total, including duplicates from equivalent clocks/spellings. None has sustained intelligible text by inspection. Maximum observed IoC is 0.039649; IoC is descriptive and not a proof that no language is present. This rejects this direct key use empirically, not all conceivable transformations of the philosophical text.

## Decision

No reason to prioritize additional receiver sweeps derived solely from these two aphorisms. No new plaintext or authentic key. Exact Latin/source, script and all output strings are available in [reproducer](../sims/lp2_liber_xxiv_philosophorum_crib_sft.cjs) and [raw output](lp2-liber-xxiv-philosophorum-output.json). The function was executed against the actual repository transcription in connected JS; the Node wrapper has not separately run in CI.
