# LP2 original editable-master pointer: 2014 source decision

**Decision (15 November 2026):** This period-original search yields **no located LP2 PDF, PostScript, vector, TeX or native layout master and no hidden plaintext/key**. The exact previously executed original-source scan is [GitHub Actions run 43681564201](https://github.com/FlareZ123/liber-primus/actions/runs/43681564201); its [complete 640-hit source-context JSON](https://github.com/FlareZ123/liber-primus/actions/runs/43681564201/artifacts/14148572653) remains the reproducible evidence. Retire an unauthenticated master hunt unless a **new original document name, original URL or creator-linked export command** emerges. The 2014 image layer is real; its hypothetical editing master is not presently recoverable from these sources.

## Exact independent evidence and limits

Agent6's already-committed [source-locked SFT](../sims/lp2_2014_period_master_pointer_sft.cjs) ran successfully, verified the Git blob SHA-1 for each complete source, then searched all dated 2014 lines for document filenames, URLs and production-tool vocabulary. The three sources contained **385,265 dated-2014 IRC lines**:

- `#cicadasolvers.freenode.log`: 18,487,233 bytes, Git blob `bdd277c14f94c34b5ae714cd00c238065beeed4e`, 236,650 dated-2014 lines, 489 retained matches.
- `#cicadasolvers.freenode.2.log`: 27,234,234 bytes, Git blob `72634a9d071d32af767edbffc0493d810e88cd0d`, 38,008 dated-2014 lines, 55 retained matches.
- `#33012014.freenode.log`: 8,629,610 bytes, Git blob `a2880b1db31ce523599ef30ca2e55291bf295900`, 110,607 dated-2014 lines, 96 retained matches.

Across these logs, 640 broadly selected matched lines include false positives (hostnames ending `.ps`, generic PDFs, unrelated SVG illustrations and other rounds). The **107 matches dated on or after 3 May 2014**, the LP2 distribution period, were reviewed with their preserved context. They contain discussions of possible publishing applications and external reading materials, and **no explicit location for an LP2 native/editable master**. The earliest log includes numerous January 2014 references to entirely different Cicada rounds; this pre-LP2 material cannot authenticate an LP2 production file.

The original [2014 Stage11 HTML](../resources/historical/stage11-2014-index.html) (1,640 bytes, Git blob `303db130705f0ef9be2a738f4336d5cfcebde80c`) references precisely `0.jpg` through `57.jpg`, with **zero links to non-JPEG documents**. The accompanying [2014 PGP-signed message](../resources/historical/cicada2014-stage11-message.asc) (1,183 bytes, Git blob `e2b7382ac2cfb0adfe028cc063fc6048e0ad718e`) gives the `ky2khlqdf7qdznac.onion` destination and no master-document pointer. The original Git stage11 archive likewise contains the 58 JPEGs and index only.

## Period testimony: the Artifex clue was noticed in 2014

The complete original transcript itself resolves a useful historical interpretative question. On **31 May 2014**, `#cicadasolvers.freenode.log` **L192313–27**, `sol1ton` wrote **“the artifex jpg headers”** and asked whether Ghostscript created the images. `Nem0` suggested InDesign/Illustrator/QuarkXPress alternatives, explicitly observed that Artifex was the maker of the embedded color profile, and speculated the runes might be vector drawings. `sol1ton` suggested LaTeX. On **30 September 2014**, `#cicadasolvers.freenode.2.log` **L8251–55**, `Nem0` again favored desktop-publishing tools over standalone Photoshop. This testimony is a contemporaneous **hypothesis about production**, not evidence of an existing source file, an author-directed rendering operation, or a key.

The independently established original JPEG forensic finding remains an identical **Artifex Software sRGB ICC profile** across all 58 originals, compatible with document rendering but insufficient to identify the producer (see [container audit](lp2-jpeg-container-metadata-audit.md)). The 2014 dialogue should prevent treating a rediscovered ICC fingerprint as a fresh cryptanalytic instruction.

## Research disposition

No recovered vector, document-object layer, embedded cipher operand or unknown LP2 plaintext was found. Source-only coverage cannot rule out an undocumented private author master or another surviving archive. The practical restart condition is an **independent, precise original-era master-document locator** whose bytes can be retrieved and aligned with the unmodified LP2 runes. Without that missing operand, a synthetic Ghostscript/PDF render or filename guessing has no causal path to decrypting p0–p55.

**Classification:** bounded source-acquisition negative with contemporaneous historical clarification; do not promote to an established cipher discovery. 
