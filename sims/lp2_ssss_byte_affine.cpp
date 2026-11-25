// Exact degree-six SSSS obstruction with arbitrary common 8x8 binary byte map.
#include <array>
#include <algorithm>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <string>
#include <vector>
#include <numeric>
using U64=uint64_t;
struct F {
    std::array<U64,4> a{};
    F& operator^=(const F& b){for(int i=0;i<4;i++)a[i]^=b.a[i];return *this;}
    bool operator==(const F& b)const{return a==b.a;}
};
F operator^(F a,const F& b){return a^=b;}
F times_x(F v){const auto carry=v.a[3]>>63;for(int i=3;i>0;i--)v.a[i]=(v.a[i]<<1)|(v.a[i-1]>>63);v.a[0]=(v.a[0]<<1)^(carry?0x425:0);return v;}
F multiply_small(F v,U64 w){F out;while(w){if(w&1)out^=v;w>>=1;v=times_x(v);}return out;}
U64 clmul(U64 a,U64 b){U64 z=0;while(b){if(b&1)z^=a;a<<=1;b>>=1;}return z;}
using Plane=std::array<F,8>;
using Shares=std::array<std::array<uint8_t,32>,8>;
Plane planes(const std::array<uint8_t,32>& s){Plane p{};for(int i=0;i<32;i++)for(int b=0;b<8;b++)if((s[31-i]>>b)&1)p[b].a[i/8]|=U64(1)<<(8*(i%8));return p;}
using U128=unsigned __int128;
int rank_projected(const Plane& p){
    std::array<U128,128> basis{};int r=0;
    for(F v:p)for(int j=0;j<8;j++,v=times_x(v)){
        // High 128 bits is a fixed linear projection; full rank here proves full rank.
        U128 x=(U128(v.a[3])<<64)|v.a[2];
        while(x){U64 hi=U64(x>>64);int bit=hi?127-__builtin_clzll(hi):63-__builtin_clzll(U64(x));if(basis[bit])x^=basis[bit];else{basis[bit]=x;r++;break;}}
    }return r;
}
int rank_full(const Plane& p){
    std::array<F,256> basis{};std::array<bool,256> have{};int r=0;
    for(F v:p)for(int j=0;j<8;j++,v=times_x(v)){
        F x=v;while(true){int i=3;while(i>=0&&!x.a[i])i--;if(i<0)break;int bit=64*i+63-__builtin_clzll(x.a[i]);if(have[bit])x^=basis[bit];else{basis[bit]=x;have[bit]=true;r++;break;}}
    }return r;
}
std::array<U64,7> weights(const std::array<int,7>& ids){
    std::array<U64,7> w{};
    // Multiply interpolation coefficient by the common nonzero Vandermonde.
    // V / product_{j!=i}(x_i+x_j) is product of the 15 pair differences excluding i.
    for(int i=0;i<7;i++){w[i]=1;for(int a=0;a<7;a++)if(a!=i)for(int b=a+1;b<7;b++)if(b!=i)w[i]=clmul(w[i],ids[a]^ids[b]);}
    return w;
}
struct Result{U64 trials=0,full_fallback=0;std::array<U64,65> ranks{};};
Result test(const Shares& shares){
    std::array<Plane,7> p{};for(int i=0;i<7;i++)p[i]=planes(shares[i]);
    Result out;std::array<int,7> ids{};
    for(int a=1;a<=4;a++)for(int b=a+1;b<=5;b++)for(int c=b+1;c<=6;c++)for(int d=c+1;d<=7;d++)for(int e=d+1;e<=8;e++)for(int f=e+1;f<=9;f++)for(int g=f+1;g<=10;g++){
        ids={a,b,c,d,e,f,g};const auto w=weights(ids);std::array<std::array<Plane,7>,7> wp{};
        for(int t=0;t<7;t++)for(int s=0;s<7;s++)for(int h=0;h<8;h++)wp[t][s][h]=multiply_small(p[s][h],w[t]);
        std::array<int,7> perm={0,1,2,3,4,5,6};
        do {
            Plane sy{};for(int t=0;t<7;t++)for(int h=0;h<8;h++)sy[h]^=wp[t][perm[t]][h];
            int rank=rank_projected(sy);if(rank<64){out.full_fallback++;rank=rank_full(sy);}
            out.ranks[rank]++;out.trials++;
            if(rank<64){std::cout<<" deficient rank="<<rank<<" ids-per-source=";std::array<int,7> ai{};for(int t=0;t<7;t++)ai[perm[t]]=ids[t];for(auto v:ai)std::cout<<v<<",";std::cout<<"\n";}
        }while(std::next_permutation(perm.begin(),perm.end()));
    }
    assert(out.trials==604800);return out;
}
F field_eval(const std::array<F,6>& coeff,int id){F y;for(int j=5;j>=0;j--)y=multiply_small(y,id)^coeff[j];return y;}
std::array<uint8_t,32> bytes(F v){std::array<uint8_t,32>b{};for(int i=0;i<32;i++)b[31-i]=uint8_t(v.a[i/8]>>(8*(i%8)));return b;}
U64 sole_dependency(const Plane& p){
    std::array<F,256> basis{};std::array<U64,256> label{};std::array<bool,256> have{};U64 relation=0;int n=0;
    for(F v:p)for(int j=0;j<8;j++,v=times_x(v),n++){
        F x=v;U64 tag=U64(1)<<n;
        while(true){int i=3;while(i>=0&&!x.a[i])i--;if(i<0){assert(!relation);relation=tag;break;}int bit=64*i+63-__builtin_clzll(x.a[i]);if(have[bit]){x^=basis[bit];tag^=label[bit];}else{basis[bit]=x;label[bit]=tag;have[bit]=true;break;}}
    }assert(relation);return relation;
}
uint8_t byte_map(uint8_t x,U64 matrix){uint8_t y=0;for(int i=0;i<8;i++)if((x>>i)&1)y^=uint8_t(matrix>>(8*i));return y;}
uint8_t encode_byte(uint8_t x){x^=uint8_t(x<<1);return uint8_t((x<<3)|(x>>5))^0xa5;}
int main(int argc,char** argv){
    std::array<F,6> coeff{};for(int j=0;j<5;j++)for(int i=0;i<4;i++)coeff[j].a[i]=0x9e3779b97f4a7c15ULL*(1+j*4+i);coeff[5].a[0]=1;
    Shares plant{};for(int s=0;s<8;s++){auto b=bytes(field_eval(coeff,s+1));for(auto& x:b)x=encode_byte(x);plant[s]=b;}
    std::array<int,7> ids={1,2,3,4,5,6,7};auto w=weights(ids);Plane sy{};for(int t=0;t<7;t++){auto p=planes(plant[t]);for(int b=0;b<8;b++)sy[b]^=multiply_small(p[b],w[t]);}
    int plant_rank=rank_full(sy);std::cout<<"positive known IDs rank="<<plant_rank<<std::endl;assert(plant_rank==63);
    const auto matrix=sole_dependency(sy);const auto offset=byte_map(encode_byte(0),matrix);
    for(int x=0;x<256;x++)assert((byte_map(encode_byte(uint8_t(x)),matrix)^offset)==x);
    auto recovered=plant[7];for(auto& x:recovered)x=byte_map(x,matrix)^offset;
    assert(recovered==bytes(field_eval(coeff,8)));
    std::cout<<"positive inverse linear byte map: all 256 byte values and 32 untouched eighth-share bytes recovered after accounting for the unavoidable constant-byte gauge\n";
    // stdin: two exact 256-byte streams, radix59 then radix60.
    for(int radix:{59,60}){
        std::array<uint8_t,256> g{};for(auto& x:g){int n;assert(std::cin>>n);assert(n>=0&&n<=255);x=uint8_t(n);}
        for(int layout=0;layout<2;layout++)for(int reverse=0;reverse<2;reverse++){
            if(argc>1 && std::stoi(argv[1])!=4*(radix==60)+2*layout+reverse)continue;
            Shares s{};for(int i=0;i<8;i++)for(int j=0;j<32;j++)s[i][j]=g[layout==0?8*j+i:32*i+j];if(reverse)for(auto& b:s)std::reverse(b.begin(),b.end());
            auto out=test(s);std::cout<<"radix="<<radix<<" layout="<<layout<<" reverse="<<reverse<<" trials="<<out.trials<<" full_rank="<<out.ranks[64]<<" fallback="<<out.full_fallback<<"\n";std::cout.flush();
        }
    }
}
