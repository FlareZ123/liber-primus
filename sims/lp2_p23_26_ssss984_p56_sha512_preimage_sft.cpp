// Repeats the historical 984-bit source SSSS inverse for the actual solved LP2
// p56 SHA512 target, independent of the archived 2014 anend binary witness.
// Compile with C++20, Boost multiprecision and OpenSSL libcrypto.
#include <boost/multiprecision/cpp_int.hpp>
#include <openssl/sha.h>
#include <cstring>
#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <iostream>
#include <string>
#include <vector>

// Self-contained original-cipher SSSS 0.5 GF(2^984) and XTEA plaintext gate.
// Compile with C++20 and Boost multiprecision; no network or other dependencies.
// The 1005 base29 characters below are frozen from original physical pp23–26,
// after excluding exactly 16 red heading runes, using 0-9,A-S for GP29 indices.
using boost::multiprecision::cpp_int;
using boost::multiprecision::msb;
using B=cpp_int;
const B TOP=B(1)<<984;
const B POLY=TOP|(B(1)<<24)|(B(1)<<9)|(B(1)<<3)|B(1);
B mul(B a,B b) {
 B z=0;
 while(b!=0) {
  if((b&1)!=0)z^=a;
  b>>=1;a<<=1;
  if((a&TOP)!=0)a^=POLY;
 }
 return z;
}
B inv(B a) {
 B u=a,v=POLY,g=1,h=0;
 assert(u!=0);
 while(u!=1) {
  assert(u!=0);
  int s=int(msb(u))-int(msb(v));
  if(s<0){std::swap(u,v);std::swap(g,h);s=-s;}
  u^=v<<s;g^=h<<s;
 }
 while(g>=TOP)g^=POLY<<(int(msb(g))-984);
 return g;
}
B gfPow(B x,int n) {B y=1;for(int i=0;i<n;i++)y=mul(y,x);return y;}
int digit(char c) {
 if(c>='0'&&c<='9')return c-'0';
 if(c>='A'&&c<='S')return c-'A'+10;
 return -1;
}
B num29(const std::string& s) {
 B v=0;
 for(char c:s){int d=digit(c);assert(d>=0&&d<29);v=v*29+d;}
 return v;
}
inline void decipher(uint32_t& a,uint32_t& b) {
 uint32_t sum=0xC6EF3720u;
 for(int j=0;j<32;j++) {
  b-=((((a<<4)^(a>>5))+a)^sum);
  sum-=0x9E3779B9u;
  a-=((((b<<4)^(b>>5))+b)^sum);
 }
}
// Historical 16-bit little-word, big-byte XTEA diffusion, including 984-bit
// final half-word handling, exactly as ssss.c v0.5 implements it.
std::string decode(B x,int nbits) {
 const int len=nbits/8,sz=((len+1)/2)*2;
 std::vector<uint8_t> v(sz,0);
 for(int i=0;i<sz;i+=2) {
  uint16_t w=(x&65535).convert_to<uint16_t>();
  v[i]=w>>8;v[i+1]=w&255;x>>=16;
 }
 assert(x==0);
 if(nbits%16==8)v[len-1]=v[len];
 for(int k=40*len-2;k>=0;k-=2) {
  uint32_t a=0,b=0;
  for(int j=0;j<4;j++) {
   a=(a<<8)|v[(k+j)%len];
   b=(b<<8)|v[(k+4+j)%len];
  }
  decipher(a,b);
  for(int j=0;j<4;j++) {
   v[(k+j)%len]=(a>>(24-8*j))&255;
   v[(k+4+j)%len]=(b>>(24-8*j))&255;
  }
 }
 if(nbits%16==8) {v[len]=v[len-1];v[len-1]=0;}
 B y=0;
 for(int i=sz-2;i>=0;i-=2)y=(y<<16)|(uint16_t(v[i])<<8)|v[i+1];
 std::string out(len,'\0');
 for(int i=len-1;i>=0;i--) {out[i]=char((y&255).convert_to<uint8_t>());y>>=8;}
 return out;
}
struct Candidate {
 int printable=0,zeros=0,longest=0,alnums=0,layout=-1;
 std::array<int,5> ids{},assignment{};
 std::string view;
};
int main() {
 const std::string src=
 "S6FPD7JSCBC78A6SH1Q8QL714F3R0RSNM2J59EN2I4C5OBFM174GFIFGQ4SP9NDHRF1NIQ2K7MF6KBPI3527J1360O3RLHS25O4RGM70QL1QAKGPPO4D0J73NSHDLM96JRI39KELARPJ8I7JLDCJRBP3R0QEMP2PH3O2B4B92R0OG9861N52141MN8467GDI0O8S2N40IBP9587CRDS7JK7M7SO9O5O6K2H3716K0F89ELJI21LRDQ1E667NAF2RRD5O31J1E3Q8G3PJ139GSHMH0ADKFLP5PMG13E9RF0IE4J33P012IN9QRFF4KM1819DA8IE2NJDM0D0LPLFMB7SHQM7N0QBAGEK32L0OFRA8H4O1QP1MSOQIMPID0HDBAFLH425CKA1DG5HEIOQ0J5Q487G9REP2M57S0GSL38RSHF8MPASGAFGP848BFR799R7K1IG4L5QOECLFICA8967E5EQFD5M4HQBLIA96OQ6KH1B3LEEOIH2ER4G67BFA0SAR2L9I903JIQO5I57OP7C128E19SK192DF1D4NPM4RPO11JK2SKLDQ3FMO4J2MDKFGA0FI7LJN3SPRHG3FIGO0PHK9FOEM9K7I3KABGHO0EG3MB96F6K6SH6I3O3IN6CJ546DN307CSNQL9A0DKIM15JKPGEB4EAS6K65F3LP2J8M04F52Q3HAP8I1GKKC6MQH928SIBH9AKS4B05FL5D68FJCNCQRIGS1R39S3BQCESOR9NL8DS8R1L82DE1SQDM2FQD0GHAMO6KS8LARKL9NOD69G2FHFFS65SJ1IEH6P03AE0OS4C3ANFK2IHCM6Q696205J3II30H8L5ABO93OD84J4JM26BH42OSEIRN24LBH9GQGFH9P1IA3RBC12K5IKAH10O4SJHNEJ1SGQOBD1DSQ6JRJ1OJLQROIGIFOM58AF0A9DMLC2QGPEIMGNRKIDGOG049OS4S5987HCFA8QF73E73L18LMGK0B6GLBL";
 assert(src.size()==1005);
 B historical("0x65b9c4065cc47a4a48e01d17de166a94252dfbb44e69");
 assert(decode(historical,176)=="p7amjopgric7dfdi.onion");
 std::array<std::array<B,5>,4> ys{};
 const std::array<std::string,4> labels={
   "columns-forward","columns-reverse","blocks-forward","blocks-reverse"};
 for(int k=0;k<4;k++)for(int j=0;j<5;j++) {
  std::string s;
  for(int p=0;p<201;p++)s.push_back(src[k<2?p*5+j:j*201+p]);
  if(k%2==1)std::reverse(s.begin(),s.end());
  ys[k][j]=num29(s);
  assert(ys[k][j]<TOP);
 }
 std::array<B,16> inverses{};
 for(int i=1;i<16;i++) {
  inverses[i]=inv(B(i));
  assert(mul(B(i),inverses[i])==1);
 }
 std::vector<Candidate> leaders;
 long long tested=0;
 int maxPrintable=0,maxZeros=0,maxLongest=0,maxAlnums=0;
 int motifHits=0;
 int p56DecodedHits=0,p56RawHits=0;
 const std::string p56Target="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
 std::array<unsigned char,64> exactP56{};
 auto fromHex=[](char c){return c>='0'&&c<='9'?c-'0':c-'a'+10;};
 assert(p56Target.size()==128);
 for(int i=0;i<64;i++)exactP56[i]=16*fromHex(p56Target[2*i])+fromHex(p56Target[2*i+1]);

 for(int mask=0;mask<1024;mask++) {
  if(__builtin_popcount((unsigned)mask)!=5)continue;
  std::array<int,5> ids{};
  for(int j=0,k=0;j<10;j++)if(mask&(1<<j))ids[k++]=j+1;
  std::array<B,5> weight{};
  for(int i=0;i<5;i++) {
   B b=1;
   for(int j=0;j<5;j++)if(i!=j) {
    b=mul(b,mul(B(ids[j]),inverses[ids[i]^ids[j]]));
   }
   weight[i]=b;
  }
  B correction=0;
  for(int i=0;i<5;i++)correction^=mul(weight[i],gfPow(B(ids[i]),5));
  for(int layout=0;layout<4;layout++) {
   std::array<std::array<B,5>,5> pre{};
   for(int i=0;i<5;i++)for(int j=0;j<5;j++) {
    pre[i][j]=mul(weight[i],ys[layout][j]);
   }
   std::array<int,5> p={0,1,2,3,4};
   do {
    B encoded=correction;
    for(int i=0;i<5;i++)encoded^=pre[i][p[i]];
    std::string secret=decode(encoded,984);
    unsigned char digest[SHA512_DIGEST_LENGTH];
    SHA512(reinterpret_cast<const unsigned char*>(secret.data()),secret.size(),digest);
    if(std::memcmp(digest,exactP56.data(),64)==0)p56DecodedHits++;
    B value=encoded;
    std::array<unsigned char,123> preXtea{};
    for(int k=122;k>=0;k--){preXtea[k]=(value&255).convert_to<unsigned char>();value>>=8;}
    assert(value==0);
    SHA512(preXtea.data(),preXtea.size(),digest);
    if(std::memcmp(digest,exactP56.data(),64)==0)p56RawHits++;

    int printable=0,zeros=0,longest=0,run=0,alnums=0;
    for(unsigned char c:secret) {
     const bool ok=c>=32&&c<127;
     printable+=ok;
     zeros+=c==0;
     alnums+=((c>='A'&&c<='Z')||(c>='a'&&c<='z')||
       (c>='0'&&c<='9'));
     run=ok?run+1:0;
     longest=std::max(longest,run);
    }
    const bool motif=secret.find(".onion")!=std::string::npos||
      secret.find("http")!=std::string::npos||
      secret.find("BEGIN PGP")!=std::string::npos;
    motifHits+=motif;
    maxPrintable=std::max(maxPrintable,printable);
    maxZeros=std::max(maxZeros,zeros);
    maxLongest=std::max(maxLongest,longest);
    maxAlnums=std::max(maxAlnums,alnums);
    if(ids==std::array<int,5>{1,2,3,4,5}&&
       p==std::array<int,5>{0,1,2,3,4}) {
     const std::array<int,4> expected={44,54,48,47};
     assert(printable==expected[layout]);
    }
    if(leaders.size()<5||printable>leaders.back().printable) {
     Candidate cand;
     cand.printable=printable;cand.zeros=zeros;
     cand.longest=longest;cand.alnums=alnums;
     cand.layout=layout;cand.ids=ids;cand.assignment=p;
     cand.view=secret;
     for(char& c:cand.view)
       if((unsigned char)c<32||(unsigned char)c>=127)c='.';
     leaders.push_back(cand);
     std::sort(leaders.begin(),leaders.end(),
       [](const Candidate& a,const Candidate& b){
         return a.printable>b.printable;});
     if(leaders.size()>5)leaders.pop_back();
    }
    tested++;
   }while(std::next_permutation(p.begin(),p.end()));
  }
 }
 assert(tested==120960);
 assert(maxPrintable==72);
 assert(maxZeros==6);
 assert(maxLongest==16);
 assert(maxAlnums==56);
 assert(motifHits==0);
 assert(p56DecodedHits==0);
 assert(p56RawHits==0);
 std::cout<<"Exact original p56 SHA512 target: "<<p56DecodedHits<<" decoded hits and "
  <<p56RawHits<<" pre-XTEA hits across "<<tested<<" assignments (123 bytes each)\n";

 std::cout<<"PASS: "<<tested<<" historical GF(2^984) monic share decodes\n";
 std::cout<<"Historical 176-bit control: p7amjopgric7dfdi.onion\n";
 std::cout<<"Maximum printable bytes of 123: "<<maxPrintable<<"\n";
 std::cout<<"Maximum zero bytes of 123: "<<maxZeros<<"\n";
 std::cout<<"Longest consecutive printable byte run: "<<maxLongest<<"\n";
 std::cout<<"Maximum alphanumeric byte count: "<<maxAlnums<<"\n";
 std::cout<<"Complete .onion, http and PGP header motifs: "<<motifHits<<"\n";
 for(const auto& c:leaders) {
  std::cout<<"Candidate layout="<<labels[c.layout]
    <<" printable="<<c.printable<<" zeros="<<c.zeros
    <<" longest="<<c.longest<<" ids=";
  for(int i:c.ids)std::cout<<i<<",";
  std::cout<<" assignment=";
  for(int i:c.assignment)std::cout<<i;
  std::cout<<" decoded="<<c.view<<"\n";
 }
}
