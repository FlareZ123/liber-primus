#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <numeric>
#include <random>
#include <sstream>
#include <string>
#include <unordered_set>
#include <vector>
using namespace std;
using Word=vector<uint8_t>;
constexpr int Q=29;
bool FAST=true;
const string alphabet="0123456789ABCDEFGHIJKLMNOPQRS";
int mod(int x){return (x+Q*Q)%Q;}
Word word(const string&s){Word w;for(char c:s){size_t i=alphabet.find(c);assert(i<Q);w.push_back(i);}return w;}
string str(const Word&w){string s;for(auto x:w)s+=alphabet[x];return s;}
vector<Word> read_words(const string&line){istringstream in(line);string s;vector<Word> w;while(in>>s)w.push_back(word(s));return w;}
vector<int> key(int n){vector<int> p;for(int x=2;(int)p.size()<n;x++){bool ok=true;for(int y=2;y*y<=x;y++)if(x%y==0){ok=false;break;}if(ok)p.push_back((x-1)%Q);}return p;}
struct State{
 array<uint8_t,Q> root{},d{};
 array<uint32_t,Q> mask{};
 int groups=Q;
 State(){for(int i=0;i<Q;i++){root[i]=i;mask[i]=1;}}
 bool add(int a,int b,int delta){ // coord[b]-coord[a]=delta
   int ra=root[a],rb=root[b];if(ra==rb)return mod(d[b]-d[a])==delta;
   int s=mod(delta+d[a]-d[b]);
   if(__builtin_popcount(mask[ra])<__builtin_popcount(mask[rb])){swap(ra,rb);s=mod(-s);}
   uint32_t rot=s?((mask[rb]<<s)|(mask[rb]>>(Q-s)))&((1u<<Q)-1):mask[rb];
   if(mask[ra]&rot)return false;
   for(int i=0;i<Q;i++)if(root[i]==rb){root[i]=ra;d[i]=mod(d[i]+s);}
   mask[ra]|=rot;mask[rb]=0;groups--;return true;
 }
 bool merge(const State&b){for(int v=0;v<Q;v++)if(b.root[v]!=v&&!add(b.root[v],v,b.d[v]))return false;return true;}
};
uint32_t rot(uint32_t m,int d){return d?((m<<d)|(m>>(Q-d)))&((1u<<Q)-1):m;}
uint32_t diffmask(uint32_t a,uint32_t b){uint32_t rev=0;for(uint32_t x=b;x;x&=x-1)rev|=1u<<mod(-__builtin_ctz(x));uint32_t out=0;for(uint32_t x=a;x;x&=x-1)out|=rot(rev,__builtin_ctz(x));return out;}
struct PackingCheck{
 vector<array<uint32_t,Q>> rs;
 bool rec(uint32_t left,uint32_t occupied){if(!left)return true;int best=-1;uint32_t allowed=0;int count=30;for(uint32_t x=left;x;x&=x-1){int i=__builtin_ctz(x);uint32_t a=0;for(int k=0;k<Q;k++)if(!(rs[i][k]&occupied))a|=1u<<k;int c=__builtin_popcount(a);if(!c)return false;if(c<count){count=c;best=i;allowed=a;if(c==1)break;}}for(uint32_t x=allowed;x;x&=x-1)if(rec(left^(1u<<best),occupied|rs[best][__builtin_ctz(x)]))return true;return false;}
 bool operator()(const State&s){vector<uint32_t> m;for(auto x:s.mask)if(__builtin_popcount(x)>1)m.push_back(x);if(m.size()<2)return true;sort(m.begin(),m.end(),[](uint32_t a,uint32_t b){return __builtin_popcount(a)>__builtin_popcount(b);});for(size_t i=1;i<m.size();i++)for(size_t j=0;j<i;j++)if(diffmask(m[i],m[j])==((1u<<Q)-1))return false;rs.clear();for(size_t i=1;i<m.size();i++){array<uint32_t,Q>a;for(int k=0;k<Q;k++)a[k]=rot(m[i],k);rs.push_back(a);}return rec((1u<<rs.size())-1,m[0]);}
};
struct Opt{State st;uint16_t start,wordid,end;};
struct Domain{int group;vector<Opt> o;};
vector<Word> dic[40];
vector<int> K;
int consume(const Word&w){return count_if(w.begin(),w.end(),[](int a){return a!=0;});}
Word encode(const Word&p,const array<int,Q>&pi,int start){array<int,Q> inv;for(int i=0;i<Q;i++)inv[pi[i]]=i;Word c;for(int a:p){if(a==0)c.push_back(0);else c.push_back(inv[mod(pi[a]+K[start++])]);}return c;}
Domain build(const Word&c,int gi,int n){Domain D{gi,{}};PackingCheck pack;const auto& wlist=dic[c.size()];for(size_t wi=0;wi<wlist.size();wi++){const Word&p=wlist[wi];bool good=true;for(size_t i=0;i<c.size();i++)if(p[i]==0&&c[i]!=0){good=false;break;}if(!good)continue;int m=consume(p);for(int start=0;start+m<=n;start++){State s;int pos=start;bool ok=true;for(size_t i=0;i<c.size();i++)if(p[i]!=0&&!s.add(p[i],c[i],K[pos++])){ok=false;break;}if(ok&&(!FAST||pack(s)))D.o.push_back({s,(uint16_t)start,(uint16_t)wi,(uint16_t)(start+m)});}}return D;}
struct Plant{vector<Word> c;array<int,Q> pi;vector<int> starts;};
Plant plant(const vector<Word>&p,unsigned seed){mt19937 rng(seed);Plant t; iota(t.pi.begin(),t.pi.end(),0);shuffle(t.pi.begin()+1,t.pi.end(),rng);vector<int> order(p.size());iota(order.begin(),order.end(),0);shuffle(order.begin(),order.end(),rng);t.c.resize(p.size());t.starts.resize(p.size());int start=0;for(int i:order){t.starts[i]=start;t.c[i]=encode(p[i],t.pi,start);start+=consume(p[i]);}return t;}
struct Pair{int a,b;};
vector<Pair> pairs;
struct Index{
 const Domain& dom;int blocks;vector<uint64_t> bits;vector<int> count;
 Index(const Domain&D):dom(D),blocks((D.o.size()+63)/64),bits(pairs.size()*30ull*blocks),count(pairs.size()){
   for(size_t j=0;j<D.o.size();j++)for(size_t i=0;i<pairs.size();i++){
     auto [a,b]=pairs[i];auto&s=D.o[j].st;if(s.root[a]!=s.root[b])continue;int d=mod(s.d[b]-s.d[a]);bits[(i*30+d)*blocks+j/64]|=1ull<<(j%64);bits[(i*30+29)*blocks+j/64]|=1ull<<(j%64);count[i]++;
   }
 }
 template<class F> void baseline(const State&s,F fn){
   vector<pair<int,int>> rel;for(size_t i=0;i<pairs.size();i++){auto [a,b]=pairs[i];if(s.root[a]==s.root[b]&&count[i])rel.push_back({i,mod(s.d[b]-s.d[a])});}
   sort(rel.begin(),rel.end(),[&](auto a,auto b){return count[a.first]>count[b.first];});
   vector<uint64_t> alive(blocks,~0ull);if(dom.o.size()%64)alive.back()=(1ull<<(dom.o.size()%64))-1;
   vector<int> active(blocks);iota(active.begin(),active.end(),0);
   for(auto [i,d]:rel){const uint64_t*eq=&bits[(i*30+d)*blocks],*any=&bits[(i*30+29)*blocks];int n=0;for(int z:active){alive[z]&=~any[z]|eq[z];if(alive[z])active[n++]=z;}active.resize(n);if(n==0)return;}
   for(int z:active){uint64_t w=alive[z];while(w){int k=__builtin_ctzll(w);w&=w-1;fn(dom.o[z*64+k]);}}
 }
 template<class F> void each(const State&s,F fn){
   if(!FAST){baseline(s,fn);return;}
   struct Rel{int i;uint32_t allowed;int score;};vector<Rel> rel;
   constexpr uint32_t NZ=((1u<<Q)-1)^1u;
   uint32_t fm[Q][Q]={};for(int a=0;a<Q;a++)if(s.mask[a])for(int b=a+1;b<Q;b++)if(s.mask[b]&&(__builtin_popcount(s.mask[a])>1||__builtin_popcount(s.mask[b])>1)){fm[a][b]=diffmask(s.mask[a],s.mask[b]);fm[b][a]=diffmask(s.mask[b],s.mask[a]);}
   for(size_t i=0;i<pairs.size();i++){if(!count[i])continue;auto[a,b]=pairs[i];int ra=s.root[a],rb=s.root[b];uint32_t allow=NZ;if(ra==rb)allow=1u<<mod(s.d[b]-s.d[a]);else if(fm[ra][rb])allow=NZ&~rot(fm[ra][rb],mod(s.d[b]-s.d[a]));int n=__builtin_popcount(allow);if(n<28)rel.push_back({(int)i,allow,count[i]*(28-n)});}
   sort(rel.begin(),rel.end(),[](auto a,auto b){return a.score>b.score;});
   vector<uint64_t> alive(blocks,~0ull);if(dom.o.size()%64)alive.back()=(1ull<<(dom.o.size()%64))-1;
   vector<int> active(blocks);iota(active.begin(),active.end(),0);
   // Optional 40-relation filter is only a necessary prefilter; exact merge checks everything.
   if(rel.size()>40)rel.resize(40);
   for(auto r:rel){int i=r.i,n=0;const uint64_t* any=&bits[(i*30+29)*blocks];uint32_t f=NZ^r.allowed;bool inv=__builtin_popcount(r.allowed)<=__builtin_popcount(f);uint32_t m=inv?r.allowed:f;vector<const uint64_t*> ps;for(uint32_t x=m;x;x&=x-1)ps.push_back(&bits[(i*30+__builtin_ctz(x))*blocks]);for(int z:active){uint64_t u=0;for(auto p:ps)u|=p[z];alive[z]&=inv?(~any[z]|u):~u;if(alive[z])active[n++]=z;}active.resize(n);if(n==0)return;}
   for(int z:active){uint64_t w=alive[z];while(w){int k=__builtin_ctzll(w);w&=w-1;fn(dom.o[z*64+k]);}}
 }
};
bool overlap(const Opt&a,const Opt&b){return a.start<b.end&&b.start<a.end;}
struct Packer{
 const State&s;vector<int> roots;array<int,Q> shift{},pi{};
 Packer(const State&st):s(st){for(int i=0;i<Q;i++)if(s.mask[i]&&i!=s.root[0])roots.push_back(i);sort(roots.begin(),roots.end(),[&](int a,int b){return __builtin_popcount(s.mask[a])>__builtin_popcount(s.mask[b]);});shift[s.root[0]]=mod(-s.d[0]);}
 template<class F>void rec(int i,uint32_t mask,F&f){if(i==(int)roots.size()){for(int v=0;v<Q;v++)pi[v]=mod(s.d[v]+shift[s.root[v]]);f(pi);return;}int r=roots[i];for(int k=0;k<Q;k++){uint32_t m=rot(s.mask[r],k);if(mask&m)continue;shift[r]=k;rec(i+1,mask|m,f);}}
 template<class F>void run(F f){rec(0,rot(s.mask[s.root[0]],shift[s.root[0]]),f);}
};
struct Node{array<int,Q> next;bool end=false;Node(){next.fill(-1);}};
vector<Node> trie(1);
void insert(const Word&w){int v=0;for(int x:w){int p=trie[v].next[x];if(p<0){p=trie.size();trie[v].next[x]=p;trie.emplace_back();}v=p;}trie[v].end=true;}
struct Decode{array<array<uint8_t,Q>,Q> map;Decode(const array<int,Q>&p){array<int,Q> inv;for(int i=0;i<Q;i++)inv[p[i]]=i;for(int k=0;k<Q;k++)for(int c=0;c<Q;c++)map[k][c]=inv[mod(p[c]-k)];}};
struct Edge{int start,end;Word p;};
void recEdges(const Word&c,const Decode&D,int i,int start,int pos,int v,Word&p,vector<Edge>&es,int n){if(i==(int)c.size()){if(trie[v].end)es.push_back({start,pos,p});return;}if(c[i]==0&&trie[v].next[0]>=0){p.push_back(0);recEdges(c,D,i+1,start,pos,trie[v].next[0],p,es,n);p.pop_back();}if(pos>=n)return;int a=D.map[K[pos]][c[i]];if(a&&trie[v].next[a]>=0){p.push_back(a);recEdges(c,D,i+1,start,pos+1,trie[v].next[a],p,es,n);p.pop_back();}}
vector<Edge> decode(const Word&c,const Decode&D,int n){vector<Edge> es;Word p;for(int i=0;i<n;i++)recEdges(c,D,0,i,i,0,p,es,n);return es;}
int main(int argc,char**argv){string base=argc>1?argv[1]:".";int target=argc>2?stoi(argv[2]):0;int skip=argc>3?stoi(argv[3]):0;int take=argc>4?stoi(argv[4]):1000000;int ga=argc>5?stoi(argv[5]):56,gb=argc>6?stoi(argv[6]):49,gc=argc>7?stoi(argv[7]):47;FAST=argc<=8||string(argv[8])!="baseline";ifstream fd(base+"/dict.txt"),fi(base+"/input.txt");string s;while(fd>>s){auto w=word(s);dic[w.size()].push_back(w);insert(w);}vector<vector<Word>> inputs;while(getline(fi,s))inputs.push_back(read_words(s));K=key(500);vector<Word> c;Plant p;int n=308;if(target==0)c=inputs[0];else{p=plant(inputs[target],3301+target);c=p.c;n=0;for(auto&w:inputs[target])n+=consume(w);}for(int a=0;a<Q;a++)for(int b=a+1;b<Q;b++)pairs.push_back({a,b});
 PackingCheck packable;auto t0=chrono::steady_clock::now();auto A=build(c[ga],ga,308),B=build(c[gb],gb,308),C=build(c[gc],gc,308);cerr<<"target="<<target<<" domain="<<A.o.size()<<","<<B.o.size()<<","<<C.o.size()<<" n="<<n<<"\n";Index bi(B),ci(C);cerr<<"indices built\n";
 long long pairFilter=0,pairGood=0,triFilter=0,triGood=0,packs=0,unique=0,hit7=0,truth=0;array<long long,11> hits{};unordered_set<string> seen;vector<int> hold;for(int i=0;i<(int)c.size();i++)if(c[i].size()>=8&&i!=ga&&i!=gb&&i!=gc)hold.push_back(i);
 for(int ai=skip;ai<(int)A.o.size()&&ai<skip+take;ai++){auto&a=A.o[ai];bi.each(a.st,[&](const Opt&b){pairFilter++;if(overlap(a,b))return;auto st=a.st;if(!st.merge(b.st)||(FAST&&!packable(st)))return;pairGood++;ci.each(st,[&](const Opt&d){triFilter++;if(overlap(a,d)||overlap(b,d))return;auto st3=st;if(!st3.merge(d.st)||(FAST&&!packable(st3)))return;triGood++;Packer pack(st3);pack.run([&](const array<int,Q>&pi){packs++;string id;for(int x:pi)id+=char(x);if(!seen.insert(id).second)return;unique++;Decode m(pi);int hit=3;for(int g:hold)if(!decode(c[g],m,308).empty())hit++;hits[hit]++;if(hit<7)return;hit7++;bool correct=target&&pi==p.pi;if(correct)truth++;assert(encode(dic[c[ga].size()][a.wordid],pi,a.start)==c[ga]);assert(encode(dic[c[gb].size()][b.wordid],pi,b.start)==c[gb]);assert(encode(dic[c[gc].size()][d.wordid],pi,d.start)==c[gc]);cout<<"CANDIDATE hit="<<hit<<" true="<<correct<<" pi=";for(int x:pi)cout<<alphabet[x];cout<<" train="<<a.start<<":"<<str(dic[c[ga].size()][a.wordid])<<","<<b.start<<":"<<str(dic[c[gb].size()][b.wordid])<<","<<d.start<<":"<<str(dic[c[gc].size()][d.wordid])<<"\n";for(int g:hold){auto e=decode(c[g],m,308);cout<<"  "<<g<<" edges="<<e.size();for(auto&x:e){assert(encode(x.p,pi,x.start)==c[g]);cout<<" "<<x.start<<":"<<str(x.p);}cout<<"\n";}cout.flush();});});});if((ai+1)%1000==0){cerr<<"progress "<<ai+1<<" pairFilter="<<pairFilter<<" pairGood="<<pairGood<<" triFilter="<<triFilter<<" triGood="<<triGood<<" packs="<<packs<<" unique="<<unique<<" seconds="<<chrono::duration<double>(chrono::steady_clock::now()-t0).count()<<"\n";}}
 cout<<"target="<<target<<" tested="<<min((int)A.o.size(),skip+take)-skip<<" pairFilter="<<pairFilter<<" pairGood="<<pairGood<<" triFilter="<<triFilter<<" triGood="<<triGood<<" packs="<<packs<<" unique="<<unique<<" hits=";for(int i=0;i<=10;i++)cout<<i<<":"<<hits[i]<<",";cout<<" hit7="<<hit7<<" true="<<truth<<" sec="<<chrono::duration<double>(chrono::steady_clock::now()-t0).count()<<"\n";
}
