/*
 * Original-byte SFT: Is the LP2 JPEG Huffman/entropy representation an
 * independent steganographic channel beyond the image's DCT coefficients?
 *
 * Requires a libjpeg-compatible coefficient API. Build with libjpeg and run
 * against the repository's resources/liber-primus directory.
 *
 * Never alters an input file. The eight authentic LP1 OutGuess carriers consistently use different
 * entropy/Huffman choices; seven other LP1 cover scans match exactly. Coefficient steganography is outside this test.
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <jpeglib.h>

typedef struct {
    unsigned char *bytes;
    size_t count;
} Buffer;

typedef struct {
    unsigned char dht[4096];
    size_t dht_count;
    const unsigned char *entropy;
    size_t entropy_count;
    int dht_tables;
} JpegScan;

static void fail(const char *why) {
    fprintf(stderr, "ERROR: %s\n", why);
    exit(2);
}

static Buffer read_all(FILE *f) {
    if (fseek(f, 0L, SEEK_END) != 0) fail("seek end");
    long size = ftell(f);
    if (size < 0 || fseek(f, 0L, SEEK_SET) != 0) fail("seek start");
    unsigned char *p = (unsigned char *)malloc((size_t)size);
    if (!p) fail("allocation");
    if (fread(p, 1, (size_t)size, f) != (size_t)size) fail("read");
    return (Buffer){p, (size_t)size};
}

static JpegScan inspect(Buffer b) {
    JpegScan s = {0};
    if (b.count < 8 || b.bytes[0] != 0xff || b.bytes[1] != 0xd8) fail("SOI");
    size_t pos = 2;
    while (pos + 4 < b.count) {
        if (b.bytes[pos++] != 0xff) fail("marker prefix");
        while (pos < b.count && b.bytes[pos] == 0xff) pos++;
        if (pos >= b.count) fail("marker end");
        unsigned char marker = b.bytes[pos++];
        if (marker == 0xd9) fail("missing SOS");
        if (marker == 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
        if (pos + 2 > b.count) fail("segment length");
        size_t seg = ((size_t)b.bytes[pos] << 8) + b.bytes[pos+1];
        if (seg < 2 || pos + seg > b.count) fail("segment extent");
        if (marker == 0xc4) {
            if (s.dht_count + seg > sizeof(s.dht)) fail("DHT overflow");
            memcpy(s.dht + s.dht_count, b.bytes + pos, seg);
            s.dht_count += seg;
            s.dht_tables++;
        }
        pos += seg;
        if (marker == 0xda) {
            if (b.bytes[b.count-2] != 0xff || b.bytes[b.count-1] != 0xd9)
                fail("trailing bytes or nonbaseline carrier");
            s.entropy = b.bytes + pos;
            s.entropy_count = b.count - 2 - pos;
            if (!s.dht_count || !s.entropy_count) fail("empty entropy/DHT");
            return s;
        }
    }
    fail("SOS not found");
    return s;
}

static int run_file(const char *path, int contrast) {
    FILE *in = fopen(path, "rb");
    if (!in) fail("missing image file");
    Buffer source = read_all(in);
    JpegScan a = inspect(source);
    rewind(in);

    struct jpeg_decompress_struct decoder;
    struct jpeg_compress_struct encoder;
    struct jpeg_error_mgr de, en;
    decoder.err = jpeg_std_error(&de);
    encoder.err = jpeg_std_error(&en);
    jpeg_create_decompress(&decoder);
    jpeg_create_compress(&encoder);
    jpeg_stdio_src(&decoder, in);
    if (jpeg_read_header(&decoder, TRUE) != JPEG_HEADER_OK) fail("JPEG header");
    jvirt_barray_ptr *coefficients = jpeg_read_coefficients(&decoder);
    FILE *output = tmpfile();
    if (!output) fail("tempfile");
    jpeg_stdio_dest(&encoder, output);
    jpeg_copy_critical_parameters(&decoder, &encoder);
    encoder.optimize_coding = TRUE;
    jpeg_write_coefficients(&encoder, coefficients);
    jpeg_finish_compress(&encoder);
    fflush(output);
    Buffer recompressed = read_all(output);
    JpegScan b = inspect(recompressed);
    int dht_match = a.dht_count == b.dht_count &&
        memcmp(a.dht, b.dht, a.dht_count) == 0;
    int scan_match = a.entropy_count == b.entropy_count &&
        memcmp(a.entropy, b.entropy, a.entropy_count) == 0;
    printf("%s DHT=%s entropy=%s source_scan_bytes=%zu optimized_scan_bytes=%zu tables=%d\n",
           path, dht_match?"EXACT":"DIFFERENT", scan_match?"EXACT":"DIFFERENT",
           a.entropy_count, b.entropy_count, a.dht_tables);
    if (contrast && dht_match && scan_match) fail("contrast control unexpectedly canonical");
    jpeg_finish_decompress(&decoder);
    jpeg_destroy_compress(&encoder);
    jpeg_destroy_decompress(&decoder);
    fclose(in);
    fclose(output);
    free(source.bytes);
    free(recompressed.bytes);
    return dht_match && scan_match;
}

int main(int argc, char **argv) {
    if (argc != 2) {
        fprintf(stderr, "Usage: lp2_jpeg_huffman_reencode_sft <original-jpg-folder>\n");
        return 2;
    }
    char path[1024];
    int equal = 0;
    for (int k = 17; k <= 74; k++) {
        if (snprintf(path, sizeof(path), "%s/%02d.jpg", argv[1], k) >= (int)sizeof(path))
            fail("file path too long");
        equal += run_file(path, 0);
    }
    if (equal != 58) fail("LP2 contains a noncanonical entropy/DHT stream");
    const int positive_scans[] = {0, 1, 2, 3, 8, 11, 12, 13};
    for (size_t j = 0; j < sizeof(positive_scans)/sizeof(positive_scans[0]); j++) {
        if (snprintf(path, sizeof(path), "%s/%02d.jpg", argv[1], positive_scans[j]) >= (int)sizeof(path))
            fail("control path too long");
        run_file(path, 1);
    }
    const int cover_scans[] = {4, 6, 7, 9, 14, 15, 16};
    for (size_t j = 0; j < sizeof(cover_scans)/sizeof(cover_scans[0]); j++) {
        if (snprintf(path, sizeof(path), "%s/%02d.jpg", argv[1], cover_scans[j]) >= (int)sizeof(path))
            fail("cover path too long");
        if (!run_file(path, 0)) fail("expected LP1 unchanged-cover match");
    }
    printf("PASS: all 58 LP2 scans have exactly libjpeg-optimized Huffman tables and entropy streams.\n");
    printf("All eight authenticated LP1 OutGuess controls differ; seven contrasting LP1 covers match.\n");
    printf("No inference about hidden data within quantized DCT coefficient values.\n");
    return 0;
}
