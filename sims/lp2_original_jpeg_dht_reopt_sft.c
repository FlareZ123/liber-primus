/*
 * LP2 original JPEG Huffman-table source gate.
 *
 * Rebuild all 75 archival JPEG images losslessly from their existing
 * quantized DCT blocks, with standard optimized Huffman coding.
 * Compare the exact concatenated DHT payload bytes of source and rebuild.
 *
 * The original 58 LP2 pages must match exactly; LP1 17 pages provide
 * controls from the same 75-file archive.
 *
 * C11 with IJG libjpeg or libjpeg-turbo, JPEG_LIB_VERSION >= 62.
 * Compile with the JPEG library and run with the original JPEG folder
 * as argv[1]. This program writes no images or other files.
 */
#include <jpeglib.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Dht {
    unsigned char bytes[4096];
    size_t count;
    size_t tables;
};

static void die(const char *why) {
    fprintf(stderr, "FAIL: %s\n", why);
    exit(2);
}

static struct Dht dht(const unsigned char *data, size_t size) {
    struct Dht result = {{0}, 0, 0};
    if (size < 4 || data[0] != 0xff || data[1] != 0xd8)
        die("Invalid source JPEG");
    size_t i = 2;
    int baseline = 0;
    while (i + 4 <= size && data[i] == 0xff) {
        while (i < size && data[i] == 0xff) ++i;
        if (i >= size) die("Truncated JPEG marker");
        unsigned marker = data[i++];
        if (marker == 0xda || marker == 0xd9) break;
        if (marker == 0x01 || (marker >= 0xd0 && marker <= 0xd7))
            continue;
        if (i + 2 > size) die("Truncated JPEG segment");
        size_t n = ((size_t)data[i] << 8) | data[i + 1];
        if (n < 2 || i + n > size) die("Invalid JPEG segment length");
        if (marker == 0xc0) baseline++;
        if (marker == 0xc4) {
            const unsigned char *payload = data + i + 2;
            size_t len = n - 2;
            if (result.count + len > sizeof(result.bytes))
                die("DHT output exceeds capacity");
            memcpy(result.bytes + result.count, payload, len);
            result.count += len;
            size_t offset = 0;
            while (offset < len) {
                if (offset + 17 > len) die("Truncated DHT table");
                size_t symbols = 0;
                ++offset; /* Tc / Th */
                for (int bit = 0; bit < 16; bit++)
                    symbols += payload[offset++];
                if (offset + symbols > len) die("Truncated DHT symbol list");
                offset += symbols;
                result.tables++;
            }
        }
        i += n;
    }
    if (baseline != 1 || (result.tables != 2 && result.tables != 4))
        die("Unexpected reference JPEG family");
    return result;
}

static unsigned char *readFile(const char *filename, size_t *length) {
    FILE *file = fopen(filename, "rb");
    if (!file) die("Cannot open original JPEG");
    if (fseek(file, 0, SEEK_END) != 0) die("Cannot seek JPEG");
    long n = ftell(file);
    if (n <= 0 || fseek(file, 0, SEEK_SET) != 0)
        die("Invalid original JPEG file");
    unsigned char *bytes = malloc((size_t)n);
    if (!bytes) die("Cannot allocate JPEG buffer");
    if (fread(bytes, 1, (size_t)n, file) != (size_t)n)
        die("Short original JPEG read");
    fclose(file);
    *length = (size_t)n;
    return bytes;
}

static int compareLossless(const unsigned char *original,
                           size_t originalSize, size_t *tables) {
    struct Dht source = dht(original, originalSize);
    struct jpeg_decompress_struct decoder;
    struct jpeg_compress_struct encoder;
    struct jpeg_error_mgr decoderError, encoderError;

    decoder.err = jpeg_std_error(&decoderError);
    jpeg_create_decompress(&decoder);
    jpeg_mem_src(&decoder, (unsigned char *)original,
                 (unsigned long)originalSize);
    jpeg_read_header(&decoder, TRUE);
    jvirt_barray_ptr *coefficients = jpeg_read_coefficients(&decoder);

    encoder.err = jpeg_std_error(&encoderError);
    jpeg_create_compress(&encoder);
    unsigned char *reoptimized = NULL;
    unsigned long reoptimizedSize = 0;
    jpeg_mem_dest(&encoder, &reoptimized, &reoptimizedSize);
    jpeg_copy_critical_parameters(&decoder, &encoder);
    encoder.optimize_coding = TRUE;
    jpeg_write_coefficients(&encoder, coefficients);
    jpeg_finish_compress(&encoder);
    jpeg_finish_decompress(&decoder);
    jpeg_destroy_compress(&encoder);
    jpeg_destroy_decompress(&decoder);

    struct Dht rebuilt = dht(reoptimized, (size_t)reoptimizedSize);
    free(reoptimized);
    *tables = source.tables;
    return source.count == rebuilt.count &&
           source.tables == rebuilt.tables &&
           memcmp(source.bytes, rebuilt.bytes, source.count) == 0;
}

int main(int argc, char **argv) {
    if (argc != 2) {
        fprintf(stderr, "usage: lp2_original_jpeg_dht_reopt_sft <jpg-dir>\n");
        return 2;
    }
    int lp1 = 0, lp2 = 0, lp1Tables = 0, lp2Tables = 0;
    for (int image = 0; image < 75; image++) {
        char filename[1024];
        if (snprintf(filename, sizeof(filename), "%s/%02d.jpg",
                     argv[1], image) >= (int)sizeof(filename))
            die("Input JPEG path too long");
        size_t length = 0, tables = 0;
        unsigned char *original = readFile(filename, &length);
        int match = compareLossless(original, length, &tables);
        free(original);
        if (image < 17) {
            lp1 += match;
            lp1Tables += (int)tables;
        } else {
            lp2 += match;
            lp2Tables += (int)tables;
        }
        printf("archive=%02d series=LP%d DHT_tables=%zu exact=%s\n",
               image, image < 17 ? 1 : 2, tables,
               match ? "YES" : "NO");
    }
    printf("SUMMARY LP1=%d/17 (%d tables), LP2=%d/58 (%d tables)\n",
           lp1, lp1Tables, lp2, lp2Tables);
    return lp2 == 58 && lp2Tables == 186 ? 0 : 1;
}
