#include <array>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <stdexcept>
#include <algorithm>
#include <chrono>
#include <cassert>
constexpr uint32_t M=2147483647u,A=16807u;
using Title=std::array<int,13>;
const Title Original{15,8,18,3,6,19,27,0,15,26,18,21,5};
const Title Crib{18,13,10,13,8,24,9,26,15,18,18,5,15};
inline uint32_t step(uint32_t x){uint64_t v=uint64_t(x)*A;uint32_t y=(v&M)+(v>>31);return y>=M?y-M:y;}
inline int mod29(int x){return x<0?x+29:(x>=29?x-29:x);}
template<bool Scale> inline int key(uint32_t x){if constexpr(Scale)return uint64_t(x)*29/M;else return x%29;}
struct Node {std::array<uint32_t,29> edge{};std::string word,code; int edit=0;};
struct Trie {
 std::vector<Node> n{Node{}}; uint32_t root8=add(), root5=add();
 uint32_t add(){n.emplace_back();return n.size()-1;}
 void insert(const std::string&s,const std::string&w,int edit){uint32_t p=s.size()==8?root8:root5;for(char c:s){int k=c-'A';if(k<0||k>=29)throw std::runtime_error("bad GP code");uint32_t v=n[p].edge[k];if(!v){v=add();n[p].edge[k]=v;}p=v;}if(!n[p].word.empty())throw std::runtime_error("duplicate GP code");n[p].word=w;n[p].code=s;n[p].edit=edit;}
};
struct Match{uint32_t seed,nextState;std::string first,second,code1,code2;int skips,edits;};
template<bool Scale,int Sign> struct Search {
 const Title&c;const Trie&t;std::vector<Match> matches;uint64_t firstWord=0;uint32_t seed=0;
 Search(const Title&c,const Trie&t):c(c),t(t){}
 inline void walk(int i,uint32_t node,uint32_t x,int skips,const Node*first){
   int k=key<Scale>(x),p=mod29(c[i]-Sign*k);uint32_t q=t.n[node].edge[p];
   if(q)advance(i,q,step(x),skips,first);
   if(i>0&&c[i]!=c[i-1]){
     int rejectedPlain=mod29(c[i-1]-Sign*k);uint32_t q2=t.n[node].edge[rejectedPlain];
     if(q2){uint32_t y=step(x);int nskip=1;while(key<Scale>(y)==k){y=step(y);++nskip;}
       if(mod29(rejectedPlain+Sign*key<Scale>(y))==c[i])advance(i,q2,step(y),skips+nskip,first);}
   }
 }
 inline void advance(int i,uint32_t q,uint32_t next,int skips,const Node*first){
   if(i==7){if(t.n[q].word.empty())return;++firstWord;walk(8,t.root5,next,skips,&t.n[q]);}
   else if(i==12){if(!t.n[q].word.empty()&&first->edit+t.n[q].edit<=1)matches.push_back({seed,next,first->word,t.n[q].word,first->code,t.n[q].code,skips,first->edit+t.n[q].edit});}
   else walk(i+1,q,next,skips,first);
 }
 void run(uint32_t lo,uint32_t hi){for(uint32_t x=lo;x<=hi;++x){seed=x;int p=mod29(c[0]-Sign*key<Scale>(x));uint32_t q=t.n[t.root8].edge[p];if(q)walk(1,q,step(x),0,nullptr);}}
};
template<bool Scale,int Sign> Title encrypt(const Title&p,uint32_t seed,int&skips){Title c{};uint32_t x=seed;skips=0;for(int i=0;i<13;i++){int z=mod29(p[i]+Sign*key<Scale>(x));while(i&&z==c[i-1]){x=step(x);++skips;z=mod29(p[i]+Sign*key<Scale>(x));}c[i]=z;x=step(x);}return c;}
template<bool Scale,int Sign> void runCrib(const Title&c,const Title&p){
 int k=mod29(Sign*(c[0]-p[0]));uint64_t lo,hi,inc;
 if constexpr(Scale){lo=std::max<uint64_t>(1,(uint64_t(k)*M+28)/29);hi=std::min<uint64_t>(M-1,(uint64_t(k+1)*M+28)/29-1);inc=1;}else{lo=k?k:29;hi=M-1;inc=29;}
 std::array<uint64_t,14> count{};std::vector<uint32_t> full;
 for(uint64_t raw=lo;raw<=hi;raw+=inc){uint32_t x=raw;int i=1;while(i<13){x=step(x);int z=mod29(p[i]+Sign*key<Scale>(x));while(z==c[i-1]&&z!=c[i]){x=step(x);z=mod29(p[i]+Sign*key<Scale>(x));}if(z!=c[i])break;++i;}for(int j=1;j<=i;j++)++count[j];if(i==13)full.push_back(raw);}
 std::cout<<"CRIB "<<(Scale?"scale":"mod")<<" sign="<<Sign<<" counts=";for(int i=1;i<=13;i++)std::cout<<count[i]<<",";std::cout<<" full="<<full.size();for(auto x:full)std::cout<<" seed="<<x;std::cout<<std::endl;
}
template<bool Scale,int Sign> void runDict(const Trie&t,uint32_t lo,uint32_t hi){auto start=std::chrono::steady_clock::now();Search<Scale,Sign>s(Original,t);s.run(lo,hi);std::cout<<"DICT "<<(Scale?"scale":"mod")<<" sign="<<Sign<<" seeds="<<lo<<".."<<hi<<" first8paths="<<s.firstWord<<" titlepaths="<<s.matches.size()<<" seconds="<<std::chrono::duration<double>(std::chrono::steady_clock::now()-start).count()<<std::endl;for(auto&m:s.matches)std::cout<<"MATCH seed="<<m.seed<<" next="<<m.nextState<<" skips="<<m.skips<<" title="<<m.first<<" "<<m.second<<" codes="<<m.code1<<"/"<<m.code2<<" edits="<<m.edits<<std::endl;}
void positive(const Trie&t){uint32_t seed=3301;int skips=0;Title c;do{c=encrypt<false,1>(Crib,seed++,skips);}while(skips==0);--seed;Search<false,1>s(c,t);s.run(1,1000000);bool found=false;for(auto&m:s.matches)if(m.seed==seed&&m.skips==skips){found=true;std::cout<<"POSITIVE seed="<<seed<<" skips="<<skips<<" title="<<m.first<<" "<<m.second<<" next="<<m.nextState<<std::endl;}if(!found)throw std::runtime_error("positive seed missing");}
int main(int argc,char**argv){if(argc<2)return 2;std::string mode=argv[1];if(mode=="crib"){runCrib<false,1>(Original,Crib);runCrib<false,-1>(Original,Crib);runCrib<true,1>(Original,Crib);runCrib<true,-1>(Original,Crib);return 0;}
 if(argc<3)throw std::runtime_error("lexicon path needed");Trie t;std::ifstream in(argv[2]);if(!in)throw std::runtime_error("lexicon missing");std::string line;int n5=0,n8=0;while(std::getline(in,line)){auto z=line.find('\t');if(z!=5&&z!=8)throw std::runtime_error("wrong length");auto z2=line.find('\t',z+1);t.insert(line.substr(0,z),line.substr(z+1,z2==std::string::npos?z2:z2-z-1),z2==std::string::npos?0:std::stoi(line.substr(z2+1)));(z==5?n5:n8)++;}std::cout<<"LEXICON n5="<<n5<<" n8="<<n8<<" nodes="<<t.n.size()<<std::endl;
 if(mode=="positive"){positive(t);return 0;}uint32_t lo=argc>3?std::stoul(argv[3]):1,hi=argc>4?std::stoul(argv[4]):M-1;if(lo<1||hi>=M||lo>hi)throw std::runtime_error("bad seed bounds");
 if(mode=="mod+")runDict<false,1>(t,lo,hi);else if(mode=="mod-")runDict<false,-1>(t,lo,hi);else if(mode=="scale+")runDict<true,1>(t,lo,hi);else if(mode=="scale-")runDict<true,-1>(t,lo,hi);else throw std::runtime_error("bad mode");}
