# May 2014 terrafant workpad: exact archived-source acquisition decision

**Decision (15 November 2026): no original workpad bytes, unknown-page key or LP2 plaintext recovered.** The participant-authored `terrafant.asia/cicada/` remains a sharply defined but presently missing historical object. This is a finite, explicit source-availability decision; it does **not** establish that the 2014 page lacked an unknown-page cipher clue.

## Why this particular object mattered

The [9 May 2014 original German Liber Primus discussion](https://scienceblogs.de/klausis-krypto-kolumne/2014/05/09/cicada-3301-das-neueste-raetsel-ist-ein-verschluesseltes-buch/) documents a live external workpad, with direct original comment URLs rather than a later recollection:

- **17 May 2014, comment #13:** author Klaus Schmeh links `https://terrafant.asia/cicada/`.
- **18 May, reply #15:** Schmeh credits Masso Spora for the lead.
- **22 May, comment #16:** participant `masso` describes their own `https://terrafant.asia/cicada` as a rune transcription with errors just corrected. The commenter announces the *already solved* penultimate LP2 page (p56), gives the known deep-web-hash prose and says to subtract successive primes minus one modulo29. This is a solver-authored confirmation of a known control, **not** a source-selected decipherment of p0–55. The earlier IRC first witnessed p56 solve is 19 May; see [existing source audit](lp2-2014-2015-german-cipherbrain-source-gate.md).

The dated URL is independently motivated by an authentic 2014 participant; its exact missing HTML and linked assets are the potential key evidence.

## Exact acquisition run

The [Windows / Node 22 original-ID probe, Actions run 43721391360](https://github.com/FlareZ123/liber-primus/actions/runs/43721391360) executed [frozen CJS code](../sims/lp2_2014_terrafant_archive_probe.cjs) on 15 November 2026 and retained [all 27 raw index responses as an Actions artifact](https://github.com/FlareZ123/liber-primus/actions/runs/43721391360/artifacts/14164508366). Search was bounded to the literal host/path and May 2014–2015 capture period.

| Provider / readout | Result | Interpretation |
|---|---|---|
| Live original HTTP and HTTPS URL | Both native fetches failed at network/DNS level | Original host currently unavailable; no page-body conclusion |
| Internet Archive exact CDX, 2014–15 | HTTP200 `[]` (3 bytes) | No exact indexed 200 capture returned under this query |
| Internet Archive wildcard prefix CDX | HTTP503 temporary-offline HTML | Prefix coverage **inconclusive** |
| Internet Archive Availability, nearest 17 May 2014 | HTTP200 `archived_snapshots: {}` | No nearest snapshot reported, not a census |
| Arquivo.pt exact and prefix CDX, 2014–15 | HTTP200 empty bodies on both | No matching capture returned for this source/path |
| Arquivo.pt `versionHistory` | HTTP200 JSON `estimated_nr_results:0` | Confirms no version in its full-text URL index |
| Common Crawl 2014–15 catalog | HTTP200; 18 dated collections enumerated | Historical collections genuinely queried |
| Common Crawl 18 prefix CDX queries | **6** HTTP404 no-capture, **12** HTTP400/502/504 network/index errors | Six bounded negatives; remaining twelve **inconclusive**, not zero captures |

No provider supplied a timestamped 2014 HTML body, external script, key, or original p0–55 output. No ciphertext test can honestly proceed without this source-selected operand. Neither modern domain-parking metadata nor the participant's known p56 prose establishes a new LP2 inverse.

## Next discriminating fork

Only a **new, actual source object** changes this decision: a dated WARC/HTML capture, linked script, or verifiable contemporary mirror of `terrafant.asia/cicada/`. The unresolved twelve Common Crawl index errors can be revisited with a functioning raw-index archive reader if an independent archive handle justifies that effort. On acquisition, distinguish transcription corrections and known p56 from an original unknown-page key or decoded passage, freeze the purported method, and require unchanged source ciphertext plus a separate original holdout of at least 40 runes with forward reencryption.

Do not infer a key from the absent workpad, broad-search transcribed page names, or treat unavailable archive endpoints as evidence that no 2014 solver knew more. Existing [original German source study](lp2-2014-2015-german-cipherbrain-source-gate.md) remains the parent contextual record; this report closes only the newly attempted exact-host acquisition.
