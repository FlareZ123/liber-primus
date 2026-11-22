/* Deterministic synthetic JPEG with no steganographic payload for OutGuess controls. */
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <jpeglib.h>

int main(int argc, char **argv) {
    if (argc != 2) return 2;
    FILE *out = fopen(argv[1], "wb");
    if (!out) { perror("output"); return 3; }
    struct jpeg_compress_struct c;
    struct jpeg_error_mgr err;
    c.err = jpeg_std_error(&err);
    jpeg_create_compress(&c);
    jpeg_stdio_dest(&c, out);
    c.image_width = 2400;
    c.image_height = 3600;
    c.input_components = 3;
    c.in_color_space = JCS_RGB;
    jpeg_set_defaults(&c);
    jpeg_set_quality(&c, 82, TRUE);
    jpeg_start_compress(&c, TRUE);
    uint8_t *row = malloc((size_t)c.image_width * 3);
    if (!row) return 4;
    uint32_t rng = 0x79225315u;
    while (c.next_scanline < c.image_height) {
        uint32_t y = c.next_scanline;
        for (unsigned x = 0; x < c.image_width; x++) {
            rng ^= rng << 13;
            rng ^= rng >> 17;
            rng ^= rng << 5;
            row[3*x] = (uint8_t)((x + y/3 + (rng & 31)) & 255);
            row[3*x+1] = (uint8_t)((x/4 + y + ((rng >> 8)&31)) & 255);
            row[3*x+2] = (uint8_t)((x/11 + y/7 + ((rng >> 16)&31)) & 255);
        }
        JSAMPROW lines[1] = {row};
        jpeg_write_scanlines(&c, lines, 1);
    }
    jpeg_finish_compress(&c);
    jpeg_destroy_compress(&c);
    free(row);
    fclose(out);
    return 0;
}
