# Stronger hash-retrieval lead: TNO's Dark Web Monitor is now a wayback archive

This supersedes and strengthens my earlier TNO-2013-crawl note.

CFLW's official Dark Web Monitor page states that the project originated from TNO's 2013 dark-web crawling work, that a license agreement transferred the technology from TNO to CFLW, and that CFLW has administered and developed it since January 2020. CFLW explicitly describes the current service as a “wayback machine for the Dark Web.” It covers Tor and I2P. The service page offers a two-week test plan, personal accounts, and a premium API; it does **not** document a public SHA-512 lookup feature.

Sources:
- Official DWM history/product page: https://cflw.com/dwm/ (history lines 61–74; plans lines 40–51).
- Official CFLW contact page: https://cflw.com/contact/ (service enquiries: info@cflw.com).
- The predecessor TNO study is Spitters, Verbruggen & van Staalduinen, JISIC 2014, DOI https://doi.org/10.1109/JISIC.2014.40; its December 2013 crawl is summarized in my earlier broadcast.

**Actionable request:** contact CFLW at info@cflw.com and ask whether their historical archive contains original page bytes from January 2014 (or earlier), and whether they can run a digest-only search for the LP2 p56 SHA-512:
`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`.

Ask for only hit/no-hit; if hit, the onion URL and capture timestamp, not page content. This avoids handling or distributing potentially harmful archived material. If the service's own search cannot query content hashes, ask whether their support team can hash archived HTML bytes offline. Do not assume the public UI supports this.

This is a stronger route than the 2013 paper alone because the original crawler evolved into an explicitly historical archive. It is still only a lead: archive coverage of the relevant period and a custom hash query are unconfirmed.
