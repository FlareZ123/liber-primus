/* Original JPEG-DCT coefficient identity gate for LP2 decorated pp40-55.
 * C99 + libjpeg; run from repo root on untouched source files 57.jpg..72.jpg.
 * Tests quantization coefficients, including RGB JPEG chroma subsampling.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>
typedef struct { JCOEF *coeff; unsigned short quant[64]; size_t nblocks; } Border;
typedef struct { Border channel[3]; int ncomponents; } BorderImage;
static void fail(const char *why, int image) {
    fprintf(stderr, "FAIL source %02d.jpg: %s\n", image, why);
    exit(EXIT_FAILURE);
}
static BorderImage read_image(int image_number) {
    char path[128];
    snprintf(path, sizeof path, "resources/liber-primus/%02d.jpg", image_number);
    FILE *input = fopen(path, "rb");
    if (!input) fail("cannot open original JPEG", image_number);
    struct jpeg_decompress_struct image;
    struct jpeg_error_mgr err;
    image.err = jpeg_std_error(&err);
    jpeg_create_decompress(&image);
    jpeg_stdio_src(&image, input);
    jpeg_read_header(&image, TRUE);
    if (image.image_width != 2400 || image.image_height != 3600 ||
        (image.num_components != 1 && image.num_components != 3))
        fail("unexpected image dimensions/components", image_number);
    jvirt_barray_ptr *coefficients = jpeg_read_coefficients(&image);
    BorderImage result = {0};
    result.ncomponents = image.num_components;
    for (int c = 0; c < result.ncomponents; c++) {
        const jpeg_component_info *info = &image.comp_info[c];
        const JDIMENSION side = c == 0 ? 64 : 32;
        const JDIMENSION width = c == 0 ? 300 : 150;
        const JDIMENSION height = c == 0 ? 450 : 225;
        if (info->width_in_blocks != width || info->height_in_blocks != height)
            fail("unexpected component sampling", image_number);
        Border *dst = &result.channel[c];
        dst->nblocks = (size_t)height * side * 2;
        dst->coeff = malloc(dst->nblocks * 64 * sizeof(JCOEF));
        if (!dst->coeff) fail("allocation failure", image_number);
        const JQUANT_TBL *table = image.quant_tbl_ptrs[info->quant_tbl_no];
        if (!table) fail("missing JPEG quantizer", image_number);
        for (int i = 0; i < 64; i++) dst->quant[i] = table->quantval[i];
        size_t written = 0;
        for (JDIMENSION y = 0; y < height; y++) {
            JBLOCKARRAY row = (*image.mem->access_virt_barray)
                ((j_common_ptr)&image, coefficients[c], y, 1, FALSE);
            for (JDIMENSION x = 0; x < width; x++) {
                if (x >= side && x < width - side) continue;
                memcpy(dst->coeff + written * 64, row[0][x], 64 * sizeof(JCOEF));
                written++;
            }
        }
        if (written != dst->nblocks) fail("incorrect border block count", image_number);
    }
    jpeg_destroy_decompress(&image);
    fclose(input);
    return result;
}
static void dispose(BorderImage *image) {
    for (int c = 0; c < image->ncomponents; c++) free(image->channel[c].coeff);
}
int main(void) {
    BorderImage ref = read_image(57);
    size_t luma_coeffs = 0, chroma_coeffs = 0;
    for (int image_number = 58; image_number <= 72; image_number++) {
        BorderImage test = read_image(image_number);
        for (int c = 0; c < test.ncomponents; c++) {
            Border *a = &test.channel[c], *b = &ref.channel[c];
            if (a->nblocks != b->nblocks ||
                memcmp(a->quant, b->quant, sizeof a->quant) ||
                memcmp(a->coeff, b->coeff, a->nblocks * 64 * sizeof(JCOEF)))
                fail("quantization table or original border DCT differs", image_number);
            if (c == 0) luma_coeffs += a->nblocks * 64;
            else chroma_coeffs += a->nblocks * 64;
        }
        dispose(&test);
    }
    dispose(&ref);
    if (luma_coeffs != 55296000 || chroma_coeffs != 7372800)
        fail("unexpected total comparison count", 72);
    printf("PASS: 16 original pages have identical 57,600-block luma borders.\n");
    printf("      Matched %zu luma and %zu chroma coefficients to page 57.\n",
           luma_coeffs, chroma_coeffs);
    puts("      No page-varying DCT coefficient changes in the common 512-px strips.");
    puts("      A shared static payload and all non-border regions remain untested.");
    return EXIT_SUCCESS;
}
