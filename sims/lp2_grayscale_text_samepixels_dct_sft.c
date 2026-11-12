/* Original grayscale JPEG same-pixel / different-DCT stego discriminator. */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>

#define IMAGE_WIDTH 2400
#define IMAGE_HEIGHT 3600
#define PAGE_COUNT 11
#define TEXT_X0 82
#define TEXT_X1 218
#define TEXT_Y0 82
#define TEXT_Y1 356

typedef struct {
    unsigned char pixels[64];
    JCOEF coefficients[64];
    int page;
} Sample;
static const int page_ids[PAGE_COUNT] = {58,59,60,61,62,63,64,65,67,68,69};
static const size_t max_samples = PAGE_COUNT * (TEXT_X1-TEXT_X0) * (TEXT_Y1-TEXT_Y0);

static unsigned char *decode_original(const char *path) {
    FILE *f = fopen(path, "rb");
    if (!f) { perror(path); exit(1); }
    struct jpeg_decompress_struct decoder;
    struct jpeg_error_mgr error;
    decoder.err = jpeg_std_error(&error);
    jpeg_create_decompress(&decoder);
    jpeg_stdio_src(&decoder, f);
    jpeg_read_header(&decoder, TRUE);
    if (decoder.num_components != 1) {
        fprintf(stderr, "Not a one-component original JPEG: %s\n",path);
        exit(1);
    }
    decoder.out_color_space = JCS_GRAYSCALE;
    jpeg_start_decompress(&decoder);
    if (decoder.output_width != IMAGE_WIDTH || decoder.output_height != IMAGE_HEIGHT ||
        decoder.output_components != 1) {
        fprintf(stderr, "Wrong original dimensions\n"); exit(1);
    }
    unsigned char *image = malloc((size_t)IMAGE_WIDTH * IMAGE_HEIGHT);
    if (!image) exit(3);
    while (decoder.output_scanline < decoder.output_height) {
        JSAMPROW row = image + decoder.output_scanline * IMAGE_WIDTH;
        jpeg_read_scanlines(&decoder, &row, 1);
    }
    jpeg_finish_decompress(&decoder);
    jpeg_destroy_decompress(&decoder);
    fclose(f);
    return image;
}

static int by_pixels(const void *a, const void *b) {
    const Sample *sa = a, *sb = b;
    return memcmp(sa->pixels, sb->pixels, 64);
}

int main(int argc, char **argv) {
    const char *folder = argc > 1 ? argv[1] : "resources/liber-primus";
    Sample *samples = malloc(max_samples * sizeof(*samples));
    if (!samples) exit(3);
    size_t n = 0;
    for (int page_index = 0; page_index < PAGE_COUNT; page_index++) {
        char path[512];
        snprintf(path, sizeof(path), "%s/%02d.jpg", folder, page_ids[page_index]);
        unsigned char *pixels = decode_original(path);
        FILE *f = fopen(path, "rb");
        if (!f) { perror(path); exit(1); }
        struct jpeg_decompress_struct decoder;
        struct jpeg_error_mgr error;
        decoder.err = jpeg_std_error(&error);
        jpeg_create_decompress(&decoder);
        jpeg_stdio_src(&decoder, f);
        jpeg_read_header(&decoder, TRUE);
        jvirt_barray_ptr *arrays = jpeg_read_coefficients(&decoder);
        for (int by = TEXT_Y0; by < TEXT_Y1; by++) {
            JBLOCKARRAY row = (*decoder.mem->access_virt_barray)(
                (j_common_ptr)&decoder, arrays[0], (JDIMENSION)by, 1, FALSE);
            for (int bx = TEXT_X0; bx < TEXT_X1; bx++) {
                Sample current;
                int ink = 0, minimum = 255, maximum = 0;
                for (int y = 0; y < 8; y++) {
                    for (int x = 0; x < 8; x++) {
                        const unsigned char v =
                            pixels[(by*8+y)*IMAGE_WIDTH + bx*8+x];
                        current.pixels[8*y+x] = v;
                        ink += v < 235;
                        if (v < minimum) minimum = v;
                        if (v > maximum) maximum = v;
                    }
                }
                if (ink < 4 || maximum-minimum < 25) continue;
                current.page = page_ids[page_index];
                memcpy(current.coefficients,row[0][bx],
                       sizeof(current.coefficients));
                samples[n++] = current;
            }
        }
        jpeg_finish_decompress(&decoder);
        jpeg_destroy_decompress(&decoder);
        fclose(f);
        free(pixels);
        printf("page %02d: eligible cumulative %zu\n",
               page_ids[page_index], n);
    }
    qsort(samples,n,sizeof(*samples),by_pixels);
    size_t unique = 0, groups = 0, members = 0;
    size_t between_groups = 0, between_members = 0, different_dct = 0;
    for (size_t i = 0; i < n;) {
        size_t j = i+1;
        while (j<n && !memcmp(samples[i].pixels,samples[j].pixels,64)) j++;
        unique++;
        if (j-i > 1) {
            groups++;
            members += j-i;
            int another_page = 0;
            for (size_t k=i+1;k<j;k++) {
                if (samples[k].page != samples[i].page) another_page = 1;
                if (memcmp(samples[k].coefficients,samples[i].coefficients,
                           sizeof(samples[i].coefficients))) different_dct++;
            }
            if (another_page) {
                between_groups++;
                between_members += j-i;
            }
        }
        i=j;
    }
    printf("Eligible %zu, unique pixels %zu, repeated groups %zu,"
           " repeated members %zu\n",n,unique,groups,members);
    printf("Cross-page groups %zu, members %zu,"
           " pixel-identical quantized-DCT differences %zu\n",
           between_groups,between_members,different_dct);
    if(n!=119939 || unique!=17405 || groups!=6131 || members!=108665 ||
       between_groups!=5337 || between_members!=106703 || different_dct!=0) {
        fprintf(stderr,"Unexpected original-source comparison result\n");
        return 1;
    }
    Sample planted = samples[0];
    planted.coefficients[7]++;
    if(memcmp(planted.pixels,samples[0].pixels,64) ||
       !memcmp(planted.coefficients,samples[0].coefficients,
               sizeof(planted.coefficients))) {
        fprintf(stderr,"Planted exact-pixel, altered-DCT difference missed\n");
        return 2;
    }
    printf("PASS original-source and planted-DCT-positive\n");
    free(samples);
    return 0;
}
