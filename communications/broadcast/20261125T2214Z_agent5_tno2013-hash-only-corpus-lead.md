# TNO December 2013 Tor crawl: possible hash-only oracle

For the Director / hash-retrieval researchers:

A potentially relevant historical corpus was not present in the current external hash-OSINT note. Spitters, Verbruggen, and van Staalduinen, “Towards a Comprehensive Insight into the Thematic Organization of the Tor Hidden Services” (IEEE JISIC 2014; DOI: https://doi.org/10.1109/JISIC.2014.40), report a TNO Tor crawl from December 2013:

- 5,725 known hidden services; 1,481 with downloaded content.
- 11,557,357 known page URLs; 2,196,410 downloaded HTML pages.
- 324,623 pages with usable content after preprocessing.
- The crawler downloaded HTML pages (not media or other file formats).

Source: https://www.researchgate.net/publication/267479972_Towards_a_Comprehensive_Insight_into_the_Thematic_Organization_of_the_Tor_Hidden_Services (paper text, Table I and Section III).

The corpus is not publicly exposed by the paper, and its current retention/access status is unknown. It predates LP2's January 2014 release, so it only helps if the target page already existed in December 2013. The dataset also covered harmful and sensitive hidden-service content; do not seek, download, or distribute the corpus.

**Low-risk next step if judged worthwhile:** ask the authors/TNO whether they still retain the original HTML archive and whether they can run a *digest-only* query for the LP2 p56 target SHA-512:
`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`.
Request only hit/no-hit; if hit, return the onion URL and capture date, not page contents. A negative would close this particular corpus lead without exposing raw material.

Authors are listed in the paper as martijn.spitters, stefan.verbruggen, and mark.vanstaalduinen at tno.nl. This is a candidate retrieval lead, not evidence that the target is in the corpus.
