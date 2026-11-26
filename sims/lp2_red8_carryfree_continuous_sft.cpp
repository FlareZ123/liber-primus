#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <numeric>
#include <random>
#include <regex>
#include <sstream>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;
using Clock=chrono::steady_clock;
constexpr int Q=29; constexpr uint32_t FULL=(1u<<Q)-1;
const string S="0123456789abcdefghijklmnopqrs";
const vector<string> GP={"F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"};
const array<array<int,8>,2> KEYS={{{19,21,23,27,2,14,10,19},{13,21,2,20,5,18,2,13}}};
int mod(int x){x%=Q;return x<0?x+Q:x;}
int ord(char c){auto i=S.find(c);if(i==string::npos)throw runtime_error("bad rune");return int(i);}
vector<string> words(const string& s){istringstream in(s);vector<string> a;for(string w;in>>w;)a.push_back(w);return a;}
// resources/liber-primus/lp2-page-groups-54-55-derived.json, first 47 complete p54 black groups only.
const string ORIGINAL="rndl17oj gol l2r7f8 a5 pdp63 jao i3 g73 0q1gb 2bsi59s 5si 431e n78hl0o5b1 3brsak68 h1b eo57r j3dqnrkd ca24 q6j em6f jdbmn mgrm gla jlqop l 4qb 9k1eh 8db3s 6p7 efn5 1g m8c9dg sqh16 6oc 963ikjh2 qrmcq j5m2 ik4cd4nq en lqd fie7 560n4i ni73cm 83m hf 8so5ajebji jk";
// resources/external/relikd-solved-gp29-native-v1.json, section 0_loss_of_divinity.
const string NATIVE="2i k3ff 30 na1a9agq 2i 5a451j0i4i95i d4o5ga5if 24ii hi8o1r4f 78a58 5o1fi 2i k3ff 30 na1a9agq 539f1jdgr9 7i 539f1ji g33 j158 hi5o1fi 7i hikia1i 2i 03kk37l g73 i4434f 7a2a9 2i ni5idgr9 7i n3 93g 8o1i i93168 34 2i4i af 93g i93168 7i 8o1i 78og 7i 8o1i 937 hq k155 o9n 7i 7akk 93g hi fg43l i93168 kogi4 g3 3hgoa9 78og 7i 9iin j3fg 2lf o4i 93g 7342 539f1jl d4ifi41ogr9 7i d4ifi41i 2lf hi5o1fi 7i hikai1i 7i o4i 7s5 a0 7i k3fi 2ij 7i 7akk 93g hi fg43l i93168 g3 6oa9 2ij o6oa9 2af af 2i ni5idgr9 j3fg 2lf o4i 93g 7342 d4ifi41l on8i4i95i 7i 03kk37 n36jo f3 2og 7i 5o9 hik3l o9n hi 4a68g 34 7i 03kk37 4sf39 f3 7i 5o9 hik3l o9n hi 4a68g 2i4i af 932l g3 hi 4a68g oh31g g3 hik3l af ns2 ag af 2i hi8o1r4f 30 539f1jdgr9 d4ifi41ogr9 o9n on8i4i95i 2og 8o1i 1f k3fi 314 d4ajokagq o9n 21f 314 na1a9agq f3ji 7afn3j ojoff 64sg 7sk2 9i1i4 hi53ji oggo58in g3 78og q31 379 hi d4ido4in g3 nifg43q okk 2og q31 379 o9 a9fg415gr9 d4364oj q314 ja9n d4364oj 4skagq";
struct Lex {
 unordered_map<string,int> counts;unordered_set<string> all;array<vector<string>,50> by;
 void expand(const string& w,int i,string& out,int count){if(i==(int)w.size()){auto& v=counts[out];v=max(v,count);return;}for(int n=1;n<=3&&i+n<=(int)w.size();n++){string t=w.substr(i,n);int a=-1;if(n==3){if(t=="ING")a=21;}else{auto it=find(GP.begin(),GP.end(),t);if(it!=GP.end())a=int(it-GP.begin());}if(a>=0){out+=S[a];expand(w,i+n,out,count);out.pop_back();}}}
 explicit Lex(const string& path){ifstream f(path);if(!f)throw runtime_error("missing dictionary");regex line("^([a-z]+)[[:space:]]+([0-9]+)[[:space:]]*$");smatch m;uint32_t hash=2166136261u;int n=0;for(string l;getline(f,l);){if(!l.empty()&&l.back()=='\r')l.pop_back();if(!regex_match(l,m,line))continue;if(n++)hash=(hash^'\n')*16777619u;for(unsigned char c:l)hash=(hash^c)*16777619u;string w=m[1],u;for(size_t i=0;i<w.size();i++){char c=w[i];if(c=='q'&&i+1<w.size()&&w[i+1]=='u'){u+="CW";i++;continue;}if(c=='v')c='u';if(c=='k'||c=='q')c='c';if(c=='z')c='s';u+=char(toupper(c));}string s;expand(u,0,s,stoi(m[2]));}if(n!=29157||hash!=3351310445u||counts.size()!=38910)throw runtime_error("wrong lexical register");for(auto& [w,c]:counts){all.insert(w);if(w.size()<by.size())by[w.size()].push_back(w);}for(auto& v:by)sort(v.begin(),v.end(),[&](auto& a,auto& b){return counts[a]!=counts[b]?counts[a]>counts[b]:a<b;});}
};
uint32_t rotate(uint32_t m,int d){return d?((m<<d)|(m>>(Q-d)))&FULL:m;}
struct Graph {array<uint8_t,Q> root,off{},size;array<uint32_t,Q> mask;int n=Q;Graph(){iota(root.begin(),root.end(),0);size.fill(1);mask.fill(1);}bool add(int p,int c,int k){int a=root[p],b=root[c],d=mod(k+off[p]-off[c]);if(a==b)return d==0;if(size[a]<size[b]){swap(a,b);d=mod(-d);}uint32_t m=rotate(mask[b],d);if(mask[a]&m)return false;for(int v=0;v<Q;v++)if(root[v]==b){root[v]=a;off[v]=mod(off[v]+d);}mask[a]|=m;mask[b]=0;size[a]+=size[b];size[b]=0;n--;return true;}};
struct Edge{uint8_t p,c,k;};using Option=vector<Edge>;struct Step{int c,k;};
struct Schedule{vector<vector<Step>> spec;array<uint32_t,Q> forbidden{};int endPhase;int fpos=0;
 Schedule(const vector<string>& gs,const array<int,8>& key,int phase,uint64_t history){for(auto& w:gs){vector<Step> v;for(char ch:w){int c=ord(ch);if(c==0){if(fpos>=64)throw runtime_error("too many F");if((history>>fpos++)&1){v.push_back({c,-1});continue;}}int k=key[phase];phase=(phase+1)%8;if(c)forbidden[c]|=1u<<k;v.push_back({c,k});}spec.push_back(move(v));}endPhase=phase;}
 bool validZero(const Graph& g)const{int root=g.root[0],base=g.off[0];for(int v=1;v<Q;v++)if(g.root[v]==root&&(forbidden[v]&(1u<<mod(g.off[v]-base))))return false;return true;}
 bool apply(Graph& g,const Option& op)const{for(auto e:op)if(!g.add(e.p,e.c,e.k))return false;return validZero(g);}
 // Exact propagation of a unique legal component placement relative to the fixed zero component.
 bool propagate(Graph& g)const{for(;;){bool change=false;int r0=g.root[0],b0=mod(-g.off[0]);uint32_t m0=rotate(g.mask[r0],b0);if(!validZero(g))return false;for(int r=0;r<Q;r++)if(g.size[r]&&r!=r0){int n=0,last=-1;for(int d=0;d<Q;d++){if(rotate(g.mask[r],d)&m0)continue;bool ok=true;for(int v=1;v<Q;v++)if(g.root[v]==r&&(forbidden[v]&(1u<<mod(g.off[v]+d)))){ok=false;break;}if(ok){n++;last=d;if(n==2)break;}}if(!n)return false;if(n==1){if(!g.add(0,r,mod(g.off[r]+last)))return false;change=true;break;}}if(!change)return true;}}
};
struct Domain{int i,n,count;vector<uint64_t> bits;};
struct Index{int blocks=0;vector<Step> pos;vector<uint32_t> active;vector<uint64_t> data;
 Index(const vector<Option>& ops,const vector<Step>& spec){blocks=(ops.size()+63)/64;for(auto x:spec)if(x.k>=0)pos.push_back(x);active.resize(pos.size());data.resize(pos.size()*Q*blocks);for(int i=0;i<(int)ops.size();i++)for(int j=0;j<(int)pos.size();j++){int p=ops[i][j].p;active[j]|=1u<<p;data[(j*Q+p)*blocks+i/64]|=1ull<<(i%64);}}
 const uint64_t* at(int j,int p)const{return data.data()+(j*Q+p)*blocks;}
};struct Candidate{array<int,Q> pi;vector<string> decoded;int oov;};
struct Solver{const Lex& lex;Schedule sched;vector<vector<Option>> options;vector<Index> indices;vector<int> initial;uint64_t nodes=0,joins=0,packNodes=0,perms=0,forced=0,pruned=0,duplicates=0;uint64_t nodeCap,packCap;int solCap;bool clipped=false;string reason;vector<Candidate> solutions;unordered_set<string> seen;Clock::time_point begin,deadline;int budget;
 Solver(const Lex& l,const vector<string>& gs,const array<int,8>& k,int start,uint64_t h,int b,int secs,uint64_t nc,uint64_t pc,int sc):lex(l),sched(gs,k,start,h),nodeCap(nc),packCap(pc),solCap(sc),begin(Clock::now()),deadline(begin+chrono::seconds(secs)),budget(b){for(auto& spec:sched.spec){vector<Option> opts;for(auto& w:lex.by.at(spec.size())){Option op;bool good=true;for(size_t i=0;i<w.size();i++){auto [c,k]=spec[i];int p=ord(w[i]);if(k<0){if(p)good=false;continue;}if(!p||((p==c)!=(k==0))){good=false;break;}op.push_back({uint8_t(p),uint8_t(c),uint8_t(k)});}if(good){Graph g;if(sched.apply(g,op))opts.push_back(move(op));}}initial.push_back(opts.size());options.push_back(move(opts));indices.emplace_back(options.back(),spec);}}
 void stop(const string& why){clipped=true;reason=why;}bool timeCheck(){if(Clock::now()>deadline){stop("time");return true;}return false;}
 void evaluate(const array<int,Q>& pi){perms++;string sig;for(int x:pi)sig+=S[x];if(!seen.insert(sig).second){duplicates++;return;}array<int,Q> inv;for(int i=0;i<Q;i++)inv[pi[i]]=i;vector<string> dec;int oov=0;for(auto& spec:sched.spec){string w;for(auto [c,k]:spec){if(k<0){w+='0';continue;}int p=inv[mod(pi[c]-k)];if(!p)return;w+=S[p];}if(!lex.all.count(w)&&++oov>budget)return;dec.push_back(move(w));}solutions.push_back({pi,move(dec),oov});if((int)solutions.size()>=solCap)stop("solution cap");}
 struct Move{int d;uint32_t mask;};struct Part{vector<int> members;vector<Move> moves;};
 void pack(const Graph& g){if(!sched.validZero(g))return;int r0=g.root[0],base=mod(-g.off[0]);uint32_t mask0=rotate(g.mask[r0],base);array<int,Q> pi{};vector<Part> parts;for(int v=0;v<Q;v++)if(g.root[v]==r0)pi[v]=mod(g.off[v]+base);for(int r=0;r<Q;r++)if(g.size[r]&&r!=r0){Part p;for(int v=0;v<Q;v++)if(g.root[v]==r)p.members.push_back(v);for(int d=0;d<Q;d++){uint32_t m=rotate(g.mask[r],d);if(m&mask0)continue;bool ok=true;for(int v:p.members)if(sched.forbidden[v]&(1u<<mod(g.off[v]+d))){ok=false;break;}if(ok)p.moves.push_back({d,m});}if(p.moves.empty())return;parts.push_back(move(p));}sort(parts.begin(),parts.end(),[](auto& a,auto& b){return a.moves.size()!=b.moves.size()?a.moves.size()<b.moves.size():a.members.size()>b.members.size();});auto visit=[&](auto&& self,size_t i,uint32_t used)->void{if(clipped)return;if(++packNodes>packCap){stop("packing cap");return;}if((packNodes&4095)==0&&timeCheck())return;if(i==parts.size()){evaluate(pi);return;}auto& p=parts[i];for(auto m:p.moves)if(!(used&m.mask)){for(int v:p.members)pi[v]=mod(g.off[v]+m.d);self(self,i+1,used|m.mask);if(clipped)return;}};visit(visit,0,mask0);}
 // Absolute root-coordinate domains, accounting for F legality and occupied zero component.
 array<uint32_t,Q> placements(const Graph& g)const{
   array<uint32_t,Q> out{};int r0=g.root[0],b0=mod(-g.off[0]);uint32_t used=rotate(g.mask[r0],b0);out[r0]=1u<<b0;
   for(int r=0;r<Q;r++)if(g.size[r]&&r!=r0){uint32_t legal=FULL;for(int v=1;v<Q;v++)if(g.root[v]==r)legal&=~rotate(sched.forbidden[v],mod(-g.off[v]));for(int d=0;d<Q;d++)if((legal&(1u<<d))&&!(rotate(g.mask[r],d)&used))out[r]|=1u<<d;}return out;
 }
 uint32_t allowed(const Graph& g,const array<uint32_t,Q>& places,int c,int k)const{
   uint32_t out=0;int b=g.root[c];for(int p=1;p<Q;p++){int a=g.root[p],d=mod(k+g.off[p]-g.off[c]);if(a==b){if(!d)out|=1u<<p;}else if(!(g.mask[a]&rotate(g.mask[b],d))&&(places[a]&rotate(places[b],mod(-d))))out|=1u<<p;}return out;
 }
 template<class F> void visit(const Domain& d,F fn)const{for(int b=0;b<(int)d.bits.size();b++){uint64_t x=d.bits[b];while(x){int t=__builtin_ctzll(x);if(!fn(64*b+t))return;x&=x-1;}}}
 Domain filter(const Domain& d,const array<array<uint32_t,Q>,Q>& masks){
   Domain q=d;const auto& ix=indices[d.i];
   if(d.count<128){visit(d,[&](int id){joins++;for(auto e:options[d.i][id])if(!(masks[e.c][e.k]&(1u<<e.p))){q.bits[id/64]&=~(1ull<<(id%64));q.count--;break;}return true;});return q;}
   vector<uint64_t> scratch(ix.blocks);for(int j=0;j<d.n;j++){auto [c,k]=ix.pos[j];uint32_t keep=masks[c][k]&ix.active[j],drop=ix.active[j]&~keep;if(!drop)continue;if(!keep){q.count=0;fill(q.bits.begin(),q.bits.end(),0);return q;}
    if(__builtin_popcount(drop)<=__builtin_popcount(keep)){while(drop){int p=__builtin_ctz(drop);drop&=drop-1;const auto* v=ix.at(j,p);for(int b=0;b<ix.blocks;b++)q.bits[b]&=~v[b];}}
    else{fill(scratch.begin(),scratch.end(),0);while(keep){int p=__builtin_ctz(keep);keep&=keep-1;const auto* v=ix.at(j,p);for(int b=0;b<ix.blocks;b++)scratch[b]|=v[b];}for(int b=0;b<ix.blocks;b++)q.bits[b]&=scratch[b];}
    joins+=ix.blocks;
   }q.count=0;for(auto x:q.bits)q.count+=__builtin_popcountll(x);return q;
 }
 void dfs(Graph g,const vector<Domain>& rem,int left){
   if(clipped)return;if(++nodes>nodeCap){stop("node cap");return;}if((nodes&255)==0&&timeCheck())return;
   if(!sched.propagate(g)){pruned++;return;}if(g.n<=4||rem.empty()){pack(g);return;}auto places=placements(g);
   array<array<uint32_t,Q>,Q> masks{};array<array<bool,Q>,Q> done{};
   vector<Domain> next;bool longRemain=any_of(rem.begin(),rem.end(),[](auto& d){return d.n>=2;});
   for(auto& d:rem){if(longRemain&&d.n<2){next.push_back(d);continue;}for(auto [c,k]:indices[d.i].pos)if(!done[c][k]){masks[c][k]=allowed(g,places,c,k);done[c][k]=true;}auto q=filter(d,masks);if(!q.count){forced++;if(--left<0){pruned++;return;}continue;}next.push_back(move(q));}
   if(next.empty()){pack(g);return;}
   // Select a small surviving domain; every retained option is checked exactly before branching.
   int best=-1;double bestScore=1e9;for(int i=0;i<(int)next.size();i++)if(!longRemain||next[i].n>=2){double score=log2(next[i].count+1.0)-0.35*next[i].n;if(score<bestScore){bestScore=score;best=i;}}
   if(best<0){dfs(g,next,left);return;}Domain choice=move(next[best]);next.erase(next.begin()+best);bool any=false;
   visit(choice,[&](int id){Graph h=g;if(!sched.apply(h,options[choice.i][id]))return true;any=true;dfs(h,next,left);return !clipped;});
   if(!clipped&&left>0)dfs(g,next,left-1);else if(!any)pruned++;
 }
 void run(){vector<Domain> ds;for(int i=0;i<(int)options.size();i++){int n=indices[i].pos.size(),count=options[i].size();Domain d{i,n,count,vector<uint64_t>((count+63)/64,~0ull)};if(count%64)d.bits.back()=(1ull<<(count%64))-1;ds.push_back(move(d));}dfs(Graph{},ds,budget);}
 void stats()const{cout<<" nodes="<<nodes<<" joins="<<joins<<" pack="<<packNodes<<" permutations="<<perms<<" duplicates="<<duplicates<<" forced="<<forced<<" pruned="<<pruned<<" solutions="<<solutions.size()<<" clipped="<<clipped<<" reason="<<(reason.empty()?"none":reason)<<" ms="<<chrono::duration_cast<chrono::milliseconds>(Clock::now()-begin).count();}
};
struct Plant{vector<string> truth,train,held,hold;array<int,Q> pi;int start,end,fs=0;uint64_t history=0;};
Plant plant(int idx,int ki,uint32_t seed){auto native=words(NATIVE);if(native.size()!=181)throw runtime_error("native input mismatch");Plant p;p.truth.assign(native.begin()+idx-47,native.begin()+idx);p.held.assign(native.begin()+idx,native.begin()+idx+17);iota(p.pi.begin(),p.pi.end(),0);mt19937 rng(seed);shuffle(p.pi.begin()+1,p.pi.end(),rng);array<int,Q> inv;for(int i=0;i<Q;i++)inv[p.pi[i]]=i;p.start=rng()%8;int phase=p.start;auto encode=[&](const vector<string>& gs,bool rec){vector<string> result;for(auto& w:gs){string out;for(char ch:w){int a=ord(ch);if(!a){if(rec){if(p.fs>=64)throw runtime_error("history overflow");p.history|=1ull<<p.fs++;}out+='0';}else{int c=inv[mod(p.pi[a]+KEYS[ki][phase])];phase=(phase+1)%8;if(rec&&c==0)p.fs++;out+=S[c];}}result.push_back(out);}return result;};p.train=encode(p.truth,true);p.end=phase;p.hold=encode(p.held,false);return p;}
string join(const vector<string>& v){string s;for(auto& w:v){if(!s.empty())s+=' ';s+=w;}return s;}
string label(const array<int,Q>& pi){string s;for(auto x:pi)s+=S[x];return s;}
bool replayHeld(const Plant& p,const Candidate& x,const array<int,8>& k){array<int,Q> inv;for(int i=0;i<Q;i++)inv[x.pi[i]]=i;int phase=p.end;for(size_t j=0;j<p.held.size();j++)for(size_t i=0;i<p.held[j].size();i++){int a=ord(p.held[j][i]),c=ord(p.hold[j][i]);if(a==0){if(c!=0)return false;}else{if(inv[mod(x.pi[a]+k[phase])]!=c)return false;phase=(phase+1)%8;}}return true;}
int main(int argc,char** argv){string path=argc>1?argv[1]:"resources/control/english_wordfreq_textblob.txt",mode=argc>2?argv[2]:"control";int seconds=argc>3?stoi(argv[3]):15;int startID=argc>4?stoi(argv[4]):0,endID=argc>5?stoi(argv[5]):128;Lex lex(path);cout<<"dictionary="<<lex.all.size()<<" source lines=29157 fnv1a=3351310445\n"<<flush;if(mode=="control"){for(int ki=0;ki<2;ki++){int idx=ki?141:67;auto p=plant(idx,ki,ki?0x6cf32b:0x59ba31);int oov=0;for(auto& w:p.truth)if(!lex.all.count(w))oov++;bool absent=true;for(auto& w:lex.by[11])if(w.substr(0,10)==p.held[0].substr(0,10))absent=false;if(!absent||oov!=ki+2)throw runtime_error("control gate fixture mismatch");cout<<"control="<<ki<<" nativeIndex="<<idx<<" OOV="<<oov<<" missingCarryPrefix="<<absent<<" start="<<p.start<<" history="<<p.history<<" visibleF="<<p.fs<<" truthPi="<<label(p.pi)<<"\n"<<flush;Solver s(lex,p.train,KEYS[ki],p.start,p.history,3,seconds,100000000,100000000,1000);s.run();bool hit=false,exact=false,held=false;for(auto& x:s.solutions)if(x.pi==p.pi){hit=true;exact=x.decoded==p.truth;held=replayHeld(p,x,KEYS[ki]);}cout<<"control_result="<<ki<<" truePiRetained="<<hit<<" exactFit="<<exact<<" heldReplay="<<held;s.stats();cout<<"\n"<<flush;if(!hit||!exact||!held)return 2;}return 0;}if(mode!="original")throw runtime_error("mode must be control or original");auto gs=words(ORIGINAL);int f=0,n=0;for(auto& w:gs){f+=count(w.begin(),w.end(),'0');n+=w.size();}if(gs.size()!=47||f!=3||n!=213)throw runtime_error("original profile mismatch");int complete=0,clipped=0,found=0;for(int id=startID;id<endID;id++){int ki=id/64,h=(id%64)/8,st=id%8;Solver s(lex,gs,KEYS[ki],st,h,3,seconds,100000000,100000000,1000);s.run();cout<<"id="<<id<<" key="<<ki<<" history="<<h<<" start="<<st;s.stats();cout<<"\n"<<flush;if(s.clipped)clipped++;else complete++;for(auto& x:s.solutions){found++;cout<<"candidate id="<<id<<" pi="<<label(x.pi)<<" oov="<<x.oov<<" decoded="<<join(x.decoded)<<"\n"<<flush;}}cout<<"complete="<<complete<<" clipped="<<clipped<<" candidates="<<found<<"\n";return clipped?3:0;}
