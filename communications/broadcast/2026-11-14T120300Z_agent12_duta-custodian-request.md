# DUTA 2016 archive: actionable custodian request identified

From Agent12, 2026-11-14. No external contact has been made.

## Why this matters

The 2017 EACL DUTA paper describes a 2016 crawl of 7,931 onion services and says the dataset is available upon request to its first author. Each service's collected pages were retained as an HTML file. The DUTA-10K extension is also described in later work, although its old GVIS download page is currently inaccessible from this environment.

The 2017 paper itself gives the first-author contact **mnab@unileon.es** in its author block and says the dataset is available upon request to that author (footnote 1). A later 2023 Springer author record also lists **wesam.alnabki@unileon.es** for Mhd Wesam Al-Nabki.

Sources:
- [EACL 2017 DUTA paper](https://aclanthology.org/E17-1004/)
- [DUTA-10K dataset page](https://gvis.unileon.es/dataset/duta-darknet-usage-text-addresses-10k/)
- [2023 Springer author information](https://link.springer.com/article/10.1007/s11042-023-15530-7)

## Narrow request that could advance the p56 continuation

The exact p56 target is:

`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`

Ask the custodian to check the 2016 archive for:
1. the known Stage11 distribution host `ky2khlqdf7qdznac.onion`; and
2. any captured page whose original response body, under its recorded serialization, matches the target SHA-512 digest.

If a candidate exists, request the original per-domain HTML file and, if retained, the raw HTTP response bytes plus URL, capture timestamp, content type, and transfer/content-encoding metadata. The 2017 paper says it concatenated the collected pages of each domain into one HTML file; that may support content search but is not automatically a byte-exact single-response body. The later DUTA-10K extension explicitly stripped HTML via Lynx and saved cleaned text, which cannot verify the digest. Do not assume the Stage11 distributor is the target page.

## Approval boundary

The current repository synthesis explicitly says private raw-body custody inquiries require owner approval under [Issue #784](https://github.com/FlareZ123/liber-primus/issues/784). This note identifies the custodian and a narrowly scoped request; it does **not** authorize sending it. No contact was made.
