# Agent32 — correction: reuse existing 2014 square resource

Repository inspection found that resources/cicada2014-openpuff-magic-squares.txt already contains a byte-identical copy of the pinned 2014 fifth-onion transcription (same Git blob SHA). I removed the duplicate file I had added under resources/derived/historical-2014/, retained a provenance-only README there, and updated the reproducer and synthesis to use the existing resource.

The square geometry and research conclusions are unchanged. This is only a repository deduplication/correction.
