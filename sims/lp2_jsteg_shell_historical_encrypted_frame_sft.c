/*
 * Original LP2 historical JSteg-Shell length-header and encrypted-footer SFT.
 * C99 + libjpeg coefficient API; original JPEG files opened read-only.
 *
 * Historical wire source:
 * N. Provos, stegdetect/stegbreak (2001), BSD license:
 * common.c prepare_jsteg/jsteg_cb and jsteg_size,
 * jpeg-6b/jdhuff.c stego_mcu_order callback,
 * break_jsteg.c break_jsteg_prepare,
 * arc4.c arc4_fixedkey.
 *
 * The codec's unencrypted 5-bit width and width-bit length are recoverable
 * regardless of RC4 password. Test actual original source and a 31-byte
 * encrypted cMk5 positive planted into original JPEG coefficients, Huffman
 * optimized, and freshly decoded. Does not modify source JPEGs.
 *
 * Build: cc -O2 -std=c99 -Wall -Wextra -o lp2_jsteg_shell_historical_encrypted_frame_sft
 *        sims/lp2_jsteg_shell_historical_encrypted_frame_sft.c -ljpeg
 * Run:   lp2_jsteg_shell_historical_encrypted_frame_sft resources/liber-primus
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <jpeglib.h>

static const int zig[64] = {
    0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,
    48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,
    22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63
};
typedef struct {uint8_t *v;size_t n,cap;} Bits;
static void die(const char *s){fprintf(stderr,"FAIL %s\n",s);exit(2);}
static void append(Bits *b,int bit){
    if(b->n==b->cap){size_t n=b->cap?2*b->cap:8192;
        uint8_t *p=(uint8_t *)realloc(b->v,n);if(!p)die("allocation");
        b->v=p;b->cap=n;}
    b->v[b->n++]=(uint8_t)(bit&1);
}
static unsigned get(const Bits *b,size_t at,int n){
    if(n<1||n>31||at+(size_t)n>b->n)die("header bounds");
    unsigned out=0;for(int i=0;i<n;i++)out=(out<<1)|b->v[at+i];return out;
}
static int bitvalue(size_t at,unsigned w,const uint8_t *body,size_t len){
    if(at<5)return (w>>(4-at))&1;
    if(at<5+w)return (int)((len>>(w-1-(at-5)))&1);
    size_t j=at-5-w;if(j>=len*8)die("positive length");
    return (body[j/8]>>(7-j%8))&1;
}
static Bits read_coefficients(struct jpeg_decompress_struct *d,
                             jvirt_barray_ptr *arr,const uint8_t *body,size_t len){
    unsigned w=0;for(size_t n=len;n;n>>=1)w++;
    if(body && (w==0||w>31))die("positive width");
    Bits bits={0};
    const unsigned h=d->max_h_samp_factor,v=d->max_v_samp_factor;
    const unsigned mcux=(d->image_width+8*h-1)/(8*h);
    const unsigned mcuy=(d->image_height+8*v-1)/(8*v);
    for(unsigned my=0;my<mcuy;my++)for(unsigned mx=0;mx<mcux;mx++)
        for(int ci=0;ci<d->num_components;ci++){
            jpeg_component_info *c=d->comp_info+ci;
            for(unsigned by=0;by<(unsigned)c->v_samp_factor;by++){
                JDIMENSION row=my*c->v_samp_factor+by;
                if(row>=c->height_in_blocks)continue;
                JBLOCKARRAY a=(*d->mem->access_virt_barray)((j_common_ptr)d,
                    arr[ci],row,1,body?TRUE:FALSE);
                for(unsigned bx=0;bx<(unsigned)c->h_samp_factor;bx++){
                    JDIMENSION col=mx*c->h_samp_factor+bx;
                    if(col>=c->width_in_blocks)continue;
                    JCOEFPTR block=a[0][col];
                    for(int k=0;k<64;k++){
                        int val=block[zig[k]];
                        /* Historical callback skips 0 and +1, retains -1. */
                        if(val==0||val==1)continue;
                        int bit=val&1;
                        if(body && bits.n<5+w+len*8){
                            int want=bitvalue(bits.n,w,body,len);
                            if(bit!=want){
                                int next=val>0?(bit?val-1:val+1):val-1;
                                if(next==0||next==1)die("plant stability");
                                block[zig[k]]=(JCOEF)next;bit=next&1;
                            }
                        }
                        append(&bits,bit);
                    }
                }
            }
        }
    if(bits.n<1024)die("short eligible coefficient stream");
    return bits;
}
static int header(const Bits *b,unsigned *w,unsigned *len){
    *w=get(b,0,5);*len=*w?get(b,5,(int)*w):0;
    return *w>0 && *len>0 && ((*len>>(*w-1))&1)
        && (size_t)*len <= (b->n-5-*w)/8;
}
static void rc4(uint8_t *out,const uint8_t *in,size_t n,const char *password){
    uint8_t s[256],key[5]={0};
    for(size_t k=0;password[k];k++)key[k%5]^=(uint8_t)password[k];
    for(int k=0;k<256;k++)s[k]=(uint8_t)k;
    unsigned j=0;
    for(int k=0;k<256;k++){j=(j+s[k]+key[k%5])&255;
        uint8_t t=s[k];s[k]=s[j];s[j]=t;}
    unsigned i=0;j=0;
    for(size_t k=0;k<n;k++){i=(i+1)&255;j=(j+s[i])&255;
        uint8_t t=s[i];s[i]=s[j];s[j]=t;
        out[k]=in[k]^s[(s[i]+s[j])&255];}
}
static void plant(const char *directory){
    char path[1024];snprintf(path,sizeof(path),"%s/17.jpg",directory);
    FILE *f=fopen(path,"rb");if(!f)die("plant source");
    struct jpeg_decompress_struct d;struct jpeg_error_mgr e;
    d.err=jpeg_std_error(&e);jpeg_create_decompress(&d);
    jpeg_stdio_src(&d,f);jpeg_read_header(&d,TRUE);
    jvirt_barray_ptr *arr=jpeg_read_coefficients(&d);
    const char *password="33011033";
    const char *text="HISTORICAL JSTEGO RC4 TEST:cMk5";
    size_t len=strlen(text);uint8_t encrypted[128]={0};
    if(len>=sizeof(encrypted))die("control size");
    rc4(encrypted,(const uint8_t *)text,len,password);
    Bits modified=read_coefficients(&d,arr,encrypted,len);
    FILE *out=tmpfile();if(!out)die("temporary JPEG");
    struct jpeg_compress_struct enc;struct jpeg_error_mgr ee;
    enc.err=jpeg_std_error(&ee);jpeg_create_compress(&enc);
    jpeg_stdio_dest(&enc,out);jpeg_copy_critical_parameters(&d,&enc);
    enc.optimize_coding=TRUE;jpeg_write_coefficients(&enc,arr);
    jpeg_finish_compress(&enc);jpeg_destroy_compress(&enc);rewind(out);
    struct jpeg_decompress_struct check;struct jpeg_error_mgr ce;
    check.err=jpeg_std_error(&ce);jpeg_create_decompress(&check);
    jpeg_stdio_src(&check,out);jpeg_read_header(&check,TRUE);
    jvirt_barray_ptr *arr2=jpeg_read_coefficients(&check);
    Bits received=read_coefficients(&check,arr2,NULL,0);
    unsigned width=0,length=0;
    if(!header(&received,&width,&length)||length!=len)die("positive header");
    if(received.n!=modified.n || memcmp(received.v,modified.v,received.n))
        die("Huffman recode changed DCT payload");
    uint8_t tmp[128]={0},plain[128]={0},wrong[128]={0};
    for(size_t k=0;k<len;k++)tmp[k]=(uint8_t)get(&received,5+width+8*k,8);
    rc4(plain,tmp,len,password);rc4(wrong,tmp,len,"wrong-password");
    if(memcmp(plain,text,len)||!memcmp(wrong,text,len)
       ||memcmp(plain+len-4,"cMk5",4))die("RC4/cMk5 positive");
    printf("PASS planted RC4 JSteg-Shell control: length=%zu, footer=cMk5, wrong password rejected, optimized Huffman preserved %zu coefficient bits\n",len,received.n);
    free(modified.v);free(received.v);
    jpeg_finish_decompress(&check);jpeg_destroy_decompress(&check);
    jpeg_finish_decompress(&d);jpeg_destroy_decompress(&d);
    fclose(out);fclose(f);
}
static void original(const char *directory,int image,int *count){
    char path[1024];snprintf(path,sizeof(path),"%s/%02d.jpg",directory,image);
    FILE *f=fopen(path,"rb");if(!f)die("original JPEG");
    struct jpeg_decompress_struct d;struct jpeg_error_mgr e;
    d.err=jpeg_std_error(&e);jpeg_create_decompress(&d);
    jpeg_stdio_src(&d,f);jpeg_read_header(&d,TRUE);
    jvirt_barray_ptr *arr=jpeg_read_coefficients(&d);
    Bits bits=read_coefficients(&d,arr,NULL,0);
    unsigned width=0,length=0;int fits=header(&bits,&width,&length);
    size_t prefix=0;while(prefix<bits.n && bits.v[prefix]==bits.v[0])prefix++;
    if(image>=17){
        if(bits.v[0]!=1||prefix<36||width!=31
            ||length!=2147483647u||fits)die("LP2 historical length gate");
        (*count)++;
    }
    printf("%02d.jpg eligible=%zu first_bit=%u same_bit_prefix=%zu width=%u declared_bytes=%u fits=%d\n",
        image,bits.n,bits.v[0],prefix,width,length,fits);
    free(bits.v);
    jpeg_finish_decompress(&d);jpeg_destroy_decompress(&d);fclose(f);
}
int main(int argc,char **argv){
    if(argc!=2)die("provide JPEG directory with original 00.jpg ... 74.jpg");
    plant(argv[1]);int count=0;
    for(int i=0;i<=74;i++)if(i!=10)original(argv[1],i,&count);
    if(count!=58)die("LP2 census incomplete");
    puts("PASS 58/58 original LP2 frames reject historical JSteg-Shell unencrypted length framing, regardless of RC4 password");
    puts("Scope: only exact JSteg-Shell MCU/DC+nonzero-AC zigzag 0,+1-skip codec, not other DCT steganography.");
    return 0;
}
