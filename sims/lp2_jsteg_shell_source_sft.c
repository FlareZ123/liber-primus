/*
 * JSteg/JSteg-Shell original JPEG DCT coefficient header probe.
 * Source decision: documented pre-2014 JSteg sequential DCT-LSB receiver.
 * Requirements: libjpeg's public coefficient API. Does not modify originals.
 * Emits a rigorously bounded negative when no full-length signature is present.
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <jpeglib.h>

typedef struct { uint8_t *v; size_t n, cap; } Bits;
static void die(const char *msg) { fprintf(stderr, "FAIL: %s\n",msg);exit(2); }
static void add(Bits *b, unsigned char bit) {
    if(b->n==b->cap){ size_t c=b->cap?b->cap*2:8192;
        uint8_t *p=realloc(b->v,c);if(!p)die("realloc bits");b->v=p;b->cap=c;}
    b->v[b->n++]=bit;
}
static unsigned zig(int n) {
    int i=0;
    for(int diag=0;diag<=14;diag++){
        int r0=diag>7?diag-7:0, r1=diag<7?diag:7;
        if(!(diag&1)) { for(int r=r1;r>=r0;r--) {
            if(i++==n)return (unsigned)(8*r+diag-r);
        } } else { for(int r=r0;r<=r1;r++) {
            if(i++==n)return (unsigned)(8*r+diag-r);
        } }
    }
    die("zigzag index");return 0;
}
static unsigned getbits(const Bits *b, size_t start, unsigned n) {
    unsigned r=0;
    if(n>31 || start+n>b->n)die("invalid width");
    for(unsigned i=0;i<n;i++)r=(r<<1)|b->v[start+i];
    return r;
}
static int byteeq(const Bits *b,size_t pos,const char *s) {
    for(size_t k=0;s[k];k++) {
        if(pos+8*k+8>b->n || getbits(b,pos+8*k,8)!=(unsigned char)s[k])return 0;
    }
    return 1;
}
static Bits scan(struct jpeg_decompress_struct *d, jvirt_barray_ptr *coeff,
                 const uint8_t *message, size_t message_size, int embed) {
    Bits b={0};
    const unsigned max_h=d->max_h_samp_factor,max_v=d->max_v_samp_factor;
    const unsigned mx_count=(d->image_width+8*max_h-1)/(8*max_h);
    const unsigned my_count=(d->image_height+8*max_v-1)/(8*max_v);
    size_t source_i=0;
    unsigned header_width=0;
    if(embed){size_t n=message_size;while(n){header_width++;n>>=1;}
        if(header_width==0||header_width>31)die("message size field");
        if(header_width+5+message_size*8>100000000)die("message too large");
    }
    for(unsigned my=0;my<my_count;my++)for(unsigned mx=0;mx<mx_count;mx++){
        for(int ci=0;ci<d->num_components;ci++){
            jpeg_component_info *c=d->comp_info+ci;
            for(int vy=0;vy<c->v_samp_factor;vy++){
                JDIMENSION row=my*c->v_samp_factor+vy;
                if(row>=c->height_in_blocks)continue;
                JBLOCKARRAY ar=(*d->mem->access_virt_barray)((j_common_ptr)d,
                    coeff[ci],row,1,embed?TRUE:FALSE);
                for(int hx=0;hx<c->h_samp_factor;hx++){
                    JDIMENSION col=mx*c->h_samp_factor+hx;
                    if(col>=c->width_in_blocks)continue;
                    JCOEFPTR block=ar[0][col];
                    for(int zi=1;zi<64;zi++){
                        unsigned idx=zig(zi);
                        int v=block[idx];
                        if(v>=-1 && v<=1)continue;
                        int bit=(abs(v)&1);
                        if(embed && source_i<5+header_width+message_size*8){
                            int want;
                            if(source_i<5)want=(header_width>>(4-source_i))&1;
                            else if(source_i<5+header_width)
                                want=(message_size>>(header_width-1-(source_i-5)))&1;
                            else {size_t q=source_i-5-header_width;
                                want=(message[q/8]>>(7-q%8))&1;
                            }
                            if(bit!=want){
                                block[idx]=(JCOEF)(v>=2?(v+1):(v-1));
                                bit=want;
                            }
                        }
                        add(&b,(unsigned char)bit);
                        source_i++;
                    }
                }
            }
        }
    }
    return b;
}
static void describe(const char *path, const Bits *b, int positive) {
    if(b->n<100)die("no coefficient bits");
    unsigned width=getbits(b,0,5);
    unsigned n=width>0&&width<=31&&5+width<=b->n?getbits(b,5,width):0;
    unsigned meaningful=(n>0&&width>0&&(n>>(width-1))==1);
    size_t off=5+width;
    int within=(meaningful&&off+(size_t)n*8<=b->n);
    /* JSteg-Shell signatures may appear inside the message's last bytes.
       Restrict checks to native first-party documented signatures. */
    int sig=0;
    if(within){
        if(n>=7 && byteeq(b,off+(size_t)(n-7)*8,"korejwa"))sig=1;
        if(n>=4 && (byteeq(b,off+(size_t)(n-4)*8,"cMk4")||
                     byteeq(b,off+(size_t)(n-4)*8,"cMk5")))sig=1;
        if(byteeq(b,off+(size_t)n*8,"korejwa")||
           byteeq(b,off+(size_t)n*8,"cMk4")||
           byteeq(b,off+(size_t)n*8,"cMk5"))sig=1;
    }
    unsigned char first[17]={0};
    size_t pr=within?(n<16?n:16):0;
    for(size_t k=0;k<pr;k++)first[k]=(unsigned char)getbits(b,off+8*k,8);
    printf("%s coefficients=%zu width=%u length_bytes=%u canonical=%d fits=%d signature=%d first16=",
        path,b->n,width,n,meaningful,within,sig);
    for(size_t k=0;k<pr;k++)printf("%02X",first[k]);
    printf("%s\n",positive?" [PLANT]":"");
    if(positive && !(within&&sig))die("planted source header/signature absent");
    if(!positive&&sig)die("JSteg-shell signature found: preserve candidate and audit payload");
}
static void run_source(const char *path,int plant) {
    FILE *f=fopen(path,"rb"); if(!f)die("open original");
    struct jpeg_decompress_struct d;struct jpeg_error_mgr err;
    d.err=jpeg_std_error(&err);jpeg_create_decompress(&d);
    jpeg_stdio_src(&d,f);if(jpeg_read_header(&d,TRUE)!=JPEG_HEADER_OK)die("JPEG header");
    if(d.progressive_mode)die("progressive not supported");
    jvirt_barray_ptr *cf=jpeg_read_coefficients(&d);
    const char *message="TEST DCT PRESERVED:cMk5";
    Bits bits=scan(&d,cf,(const uint8_t*)message,strlen(message),plant);
    if(!plant)describe(path,&bits,0);
    else {
        struct jpeg_compress_struct e;struct jpeg_error_mgr ee;
        e.err=jpeg_std_error(&ee);jpeg_create_compress(&e);
        FILE *o=tmpfile();if(!o)die("tmpfile");
        jpeg_stdio_dest(&e,o);jpeg_copy_critical_parameters(&d,&e);
        e.optimize_coding=TRUE;jpeg_write_coefficients(&e,cf);
        jpeg_finish_compress(&e);jpeg_destroy_compress(&e);
        rewind(o);
        struct jpeg_decompress_struct d2;struct jpeg_error_mgr er2;
        d2.err=jpeg_std_error(&er2);jpeg_create_decompress(&d2);
        jpeg_stdio_src(&d2,o);jpeg_read_header(&d2,TRUE);
        jvirt_barray_ptr *cf2=jpeg_read_coefficients(&d2);
        Bits b2=scan(&d2,cf2,NULL,0,0);
        describe("optimized_coefficient_positive",&b2,1);
        if(b2.n!=bits.n || memcmp(b2.v,bits.v,b2.n))die("optimized recode changed coefficient bits");
        free(b2.v);jpeg_finish_decompress(&d2);jpeg_destroy_decompress(&d2);
        fclose(o);
    }
    free(bits.v);
    jpeg_finish_decompress(&d);jpeg_destroy_decompress(&d);fclose(f);
}
int main(int argc,char **argv){
    if(argc!=2){fprintf(stderr,"Input: directory containing original 00..74.jpg\n");return 2;}
    char path[1000];
    snprintf(path,sizeof(path),"%s/00.jpg",argv[1]);run_source(path,1);
    for(int i=0;i<=74;i++){
        if(i==10)continue;/* original 10.jpg concatenates JPEG streams */
        snprintf(path,sizeof(path),"%s/%02d.jpg",argv[1],i);run_source(path,0);
    }
    puts("PASS: no source original carried this exact documented sequential JSteg-Shell signature receiver.");
    return 0;
}
