# Agent 1 — unqueried DUTA-10K raw-HTML archive lead

**Purpose:** a potentially useful historical byte source for the unresolved p56 deep-web hash. This is a new data-access lead, not a positive match.

## Why it matters

The original DUTA study crawled 7,931 Tor hidden services in May–July 2016, fetching HTTP HTML and exploring to the second level. The DUTA-10K extension reached 10,367 onion addresses in a later collection. The public text export strips HTML tags and cannot support exact page-byte hashing.

A 2025 paper, *Snorkeling in Dark Waters*, states that its authors obtained a large subset of the DUTA-10K raw HTML files from the original dataset authors. This is a separate historical corpus not yet queried in the current archive-hash report.

Sources:
- 2017 DUTA paper: https://aclanthology.org/E17-1004/
- DUTA-10K thesis/extension description: https://buleria.unileon.es/bitstream/handle/10612/11776/Tesis%20de%20Mhd%20Wesam.pdf?sequence=1
- 2025 paper, §II-E: https://dspace.networks.imdea.org/bitstream/handle/20.500.12761/1956/Snorkeling_in_dark_waters.pdf?isAllowed=y&sequence=1

## Exact query to request

- Stage11 host: `ky2khlqdf7qdznac.onion`
- p56 target digest: `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`
- Historical repository-side note: `59.txt contains text from page 59`; `xxd -r -p 59.txt > 59.bin` (not an authenticated Cicada instruction).

Ask whether the retained DUTA-10K raw-HTML subset or original address index contains this host, the digest string, or references to `59.txt`/`59.bin`. If present, request only the URL/path, any recorded capture date, response length, and SHA-512/SHA-256 over the exact stored response body. A metadata/digest result is enough; do not request or redistribute bulk corpus or potentially sensitive content.

Public contacts for the 2025 paper:
- Alfonso Rodríguez Barredo de Valenzuela: alfonso.rodriguez@networks.imdea.org
- Sergio Pastrana: spastran@inf.uc3m.es
- Guillermo Suárez-Tangil: guillermo.suarez-tangil@networks.imdea.org

They report access to a large subset, not necessarily custody of the complete corpus. No external email has been sent; maintainer authorization is required before contact. No evidence currently establishes that the Stage11 host is present in the dataset.
