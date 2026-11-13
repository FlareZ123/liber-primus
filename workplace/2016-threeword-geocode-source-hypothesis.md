# 2016 signed-message three-word geocode: a bounded historical locator test

**Agent 16, 13 November 2026. Classification: new, unverified original-source hypothesis; no decryption, coordinates, key, historical destination or positive result.** Retire this candidate unless a location check independently returns a period-grounded Cicada waypoint. Do not use a merely valid three-word geocode as evidence.

## Exact first-party source selection

The preserved, independently PGP-verified 2016 Cicada message contains the complete first substantive sentence:

> The path lies empty; epiphany seeks the devoted.

Its next paragraph says:

> Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.

Local original: [signature-valid 2016 OutGuess payload](../resources/historical/cicada2016-4gq25-outguess.asc). Source provenance and signature verification: [2016 original-image record](../resources/cicada2016-4gq25.md).

A period-available literal interpretation of **words are the map** is the *what3words* coordinate reference, launched in **2013**, which assigns addresses of exactly three English words to 3-metre global squares. Company history: https://what3words.com/de/press. Official English word length is **4–18 letters**, per https://www.aramex.com/us/en/what3words/faq?page=2 (a merchant's version of the original English FAQ); current official display syntax is `///word.word.word`: https://developer.what3words.com/tutorial/ux-guidelines.

The signed sentence has **two semicolon-separated clauses**. Each clause contains four tokens, one of which is the three-letter English article `the`, which is too short for an English what3words word. Removing *only* those two disallowed articles yields exactly two complete three-word candidates, with no ciphertext fitting, word reordering, or synonym replacement:

1. **`path.lies.empty`** (original tokens 2–4 of clause 1).
2. **`epiphany.seeks.devoted`** (original tokens 1, 2, 4 of clause 2).

All six remaining words meet the *length* eligibility condition. That alone does **not** establish dictionary membership, valid encoded geocodes, their geographical outputs, an original author intention, or any relationship to the LP2 page ciphertext. The second address removes a nonconsecutive intervening article, so its selector is weaker than the first. The message does not itself print the period what3words delimiter `///` or dots, and its **explicit subject is the words of Liber Primus**, not necessarily its own preceding prose. A straightforward alternative is that the sentence is religious/metaphorical advice and maps/roads/directions refer to later plaintext; no what3words service is specified.

## Locked discriminating experiment

**No further token rearrangements are permitted.** Query the official public what3words map or authenticated API *once* for the exact two candidates and retain the service response, queried UTC date, coordinates, nearest municipality and whether the address is valid in English. The formal API requires a user-supplied key: https://developer.what3words.com/public-api/docs. Direct online map paths `https://what3words.com/path.lies.empty` and `https://what3words.com/epiphany.seeks.devoted` were inaccessible to the web retriever in this invocation; the local Playwright service returned a concrete upstream 404. No coordinate result is presently available.

**Positive criterion:** before looking at output, fix a finite comparison set of independently documented *pre-2016 Cicada waypoints*, e.g. the actual 2012 signed poster latitude/longitude set. Count a hit only if one candidate resolves within one 3×3-metre cell of a documented waypoint or to a verified period-specific Cicada-controlled service address. A random ordinary square or a contemporary city name is **not** a success. If a hit occurs, independently reproduce it and establish that the 2016 mapping existed then (the service's algorithm/version is a possible temporal confound). A negative is invalid dictionary membership or two ordinary uncorroborated outputs. Neither result alone is a cryptographic inverse of the 56 unknown LP2 pages; at best a positive would identify a source-selected continuation route.

**Priority:** this is an inexpensive locator probe for an independent future investigator with ordinary browser access, not a rationale for new candidate addresses, large key sweeps, field travel, or network scanning. There is presently insufficient evidence to move it into `results/` or create a dependent decoding task.
