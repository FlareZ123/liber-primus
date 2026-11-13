/* Exact quantized JPEG luminance DCT block reader for LP2 runic typography.
   Source images are read without spatial decoding or requantization.
   Native little-endian JCOEF (signed 16-bit) blocks are streamed to stdout;
   the Python consumer checks the exact byte length and original page geometry. */
#include <stdio.h>
#include <stdint.h>
#include <jpeglib.h>

int main(int argc, char **argv) {
    if (argc != 2 || sizeof(JCOEF) != sizeof(int16_t)) {
        fprintf(stderr, "usage: lp2_f5_glyph_dct_reader original.jpg\n");
        return 2;
    }
    FILE *input = fopen(argv[1], "rb");
    if (!input) {
        perror(argv[1]);
        return 2;
    }
    struct jpeg_decompress_struct source;
    struct jpeg_error_mgr error;
    source.err = jpeg_std_error(&error);
    jpeg_create_decompress(&source);
    jpeg_stdio_src(&source, input);
    jpeg_read_header(&source, TRUE);
    if (source.image_width != 2400 || source.image_height != 3600) {
        fprintf(stderr, "unexpected source image geometry\n");
        return 2;
    }
    jvirt_barray_ptr *coefficients = jpeg_read_coefficients(&source);
    jpeg_component_info *y = &source.comp_info[0];
    if (y->width_in_blocks != 300 || y->height_in_blocks != 450) {
        fprintf(stderr, "unexpected JPEG luminance DCT geometry\n");
        return 2;
    }
    for (JDIMENSION row = 75; row < 363; row++) {
        JBLOCKARRAY b = (*source.mem->access_virt_barray)(
            (j_common_ptr)&source, coefficients[0], row, 1, FALSE);
        for (JDIMENSION col = 50; col < 256; col++) {
            if (fwrite(b[0][col], sizeof(JCOEF), DCTSIZE2, stdout)
                != DCTSIZE2) {
                fprintf(stderr, "incomplete binary DCT output\n");
                return 2;
            }
        }
    }
    jpeg_finish_decompress(&source);
    jpeg_destroy_decompress(&source);
    fclose(input);
    return fflush(stdout) == 0 ? 0 : 2;
}
