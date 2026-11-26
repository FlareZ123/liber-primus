// Carry-free heuristic for GP29 common q8 cycle, arbitrary group phases, literal F hold.
// Controls only unless all independent fresh plants recover the exact effective action.
#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <limits>
#include <map>
#include <numeric>
#include <random>
#include <sstream>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;
constexpr int N=29,Q=8,B=29,T=30;
const string sym="0123456789abcdefghijklmnopqrs";
const vector<string> alpha={"F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"};
using Word=vector<int>; using Pi=array<int,N>; using Key=array<int,Q>; using Maps=array<array<int,N>,Q>;
struct Action{Pi pi;Key k;};
struct Entry{Word w;double weight;};
uint64_t code(const Word&w){uint64_t x=0;for(int c:w)x=x*29+c+1;return x;}
string show(const Word&w){string s;for(int x:w)s+=sym[x];return s;}
Word parse(const string&s){Word w;for(char c:s){auto x=sym.find(c);if(x==string::npos)throw runtime_error("invalid compact rune");w.push_back(int(x));}return w;}
int mod(int x){return (x+N)%N;}
struct Lex {
 unordered_map<uint64_t,double> weights;array<vector<Entry>,14> by;array<double,14> total{};double tri[T][T][T]{},bi[T][T]{},uni[T]{};double lm[T][T][T]{};
 void variants(const string&s,size_t i,Word&w,vector<Word>&out){if(i==s.size()){if(w.size()<=13)out.push_back(w);return;}if(w.size()==13)return;for(int n=1;n<=3&&i+n<=s.size();n++){string x=s.substr(i,n);int a=-1;if(x=="ING")a=21;else{auto it=find(alpha.begin(),alpha.end(),x);if(it!=alpha.end())a=int(it-alpha.begin());}if(a>=0){w.push_back(a);variants(s,i+n,w,out);w.pop_back();}}}
 void load(const string&path){ifstream f(path);if(!f)throw runtime_error("missing dictionary");string line;map<string,double> all;while(getline(f,line)){istringstream in(line);string w,c,extra;if(!(in>>w>>c)||in>>extra||!all_of(w.begin(),w.end(),[](char x){return x>='a'&&x<='z';})||!all_of(c.begin(),c.end(),[](char x){return x>='0'&&x<='9';}))continue;string s;for(size_t i=0;i<w.size();i++){char x=toupper(w[i]);if(x=='Q'&&i+1<w.size()&&w[i+1]=='u'){s+="CW";i++;continue;}if(x=='V')x='U';if(x=='K'||x=='Q')x='C';if(x=='Z')x='S';s+=x;}Word a;vector<Word> v;variants(s,0,a,v);if(v.empty())continue;double weight=stod(c)/v.size();for(auto&x:v)all[show(x)]+=weight;}
 for(auto&[s,w]:all){auto a=parse(s);int n=a.size();by[n].push_back({a,w});total[n]+=w;weights[code(a)]=w;int x=B,y=B;for(int z:a){tri[x][y][z]+=w;bi[y][z]+=w;uni[z]+=w;x=y;y=z;}tri[x][y][B]+=w;bi[y][B]+=w;uni[B]+=w;}
 double ut=accumulate(uni,uni+T,0.0);for(int a=0;a<T;a++)for(int b=0;b<T;b++){double bt=accumulate(bi[b],bi[b]+T,0.0),tt=accumulate(tri[a][b],tri[a][b]+T,0.0);for(int c=0;c<T;c++){double p1=(uni[c]+1)/(ut+T);double p2=(bi[b][c]+20*p1)/(bt+20);lm[a][b][c]=log((tri[a][b][c]+20*p2)/(tt+20));}}
 cout<<"dictionary <=13 forms="<<weights.size()<<"\n";
 }
 bool known(const Word&w)const{return weights.count(code(w));}
 double terminal(uint64_t id,int n,double trig)const{auto it=weights.find(id);double back=trig-2.302585093; // 10% fallback
 if(it==weights.end())return back;double p=log(it->second/total[n])-0.105360516;return max(back,p)+log1p(exp(-abs(back-p)));}
 Word sample(int n,mt19937_64&r)const{vector<double> w;for(auto&e:by[n])w.push_back(e.weight);discrete_distribution<int>d(w.begin(),w.end());return by[n][d(r)].w;}
};
Maps decmaps(const Action&a){Pi ip;for(int i=0;i<N;i++)ip[a.pi[i]]=i;Maps m;for(int j=0;j<Q;j++)for(int c=0;c<N;c++)m[j][c]=ip[mod(a.pi[c]-a.k[j])];return m;}
Word encode(const Word&p,const Action&a,int j){Pi ip;for(int i=0;i<N;i++)ip[a.pi[i]]=i;Word c;for(int x:p){if(!x)c.push_back(0);else{c.push_back(ip[mod(a.pi[x]+a.k[j])]);j=(j+1)&7;}}return c;}
struct Eval { const Lex& l; const vector<Word>& c; uint64_t calls=0;
 double walk(const Word&w,const Maps&m,int i,int j,int a,int b,uint64_t id,double s)const{if(i==(int)w.size())return l.terminal(id,w.size(),s+l.lm[a][b][B]);int x=w[i],p=m[j][x];double best=-1e9;if(!x)best=walk(w,m,i+1,j,b,0,id*29+1,s+l.lm[a][b][0]);if(p)best=max(best,walk(w,m,i+1,(j+1)&7,b,p,id*29+p+1,s+l.lm[a][b][p]));return best;}
 double score(const Action&a){calls++;auto m=decmaps(a);double s=0;for(auto&w:c){double best=-1e9;for(int j=0;j<Q;j++)best=max(best,walk(w,m,0,j,B,B,0,0));s+=best;}return s;}
 bool supports(const Word&w,const Maps&m,const Word*truth=nullptr)const{auto visit=[&](auto&&self,int i,int j,uint64_t id)->bool{if(i==(int)w.size())return truth?id==code(*truth):l.weights.count(id);int x=w[i],p=m[j][x];if(!x&&self(self,i+1,j,id*29+1))return true;return p&&self(self,i+1,(j+1)&7,id*29+p+1);};for(int j=0;j<Q;j++)if(visit(visit,0,j,0))return true;return false;}
 int support(const Action&a,const vector<Word>*truth=nullptr)const{auto m=decmaps(a);int n=0;for(size_t i=0;i<c.size();i++)n+=supports(c[i],m,truth?&(*truth)[i]:nullptr);return n;}
};
Action randomAction(mt19937_64&r){Action a;iota(a.pi.begin(),a.pi.end(),0);shuffle(a.pi.begin()+1,a.pi.end(),r);for(int&k:a.k)k=r()%N;return a;}
bool sameAction(const Action&a,const Action&b){auto x=decmaps(a),y=decmaps(b);for(int j=0;j<Q;j++){bool same=true;for(int i=0;i<Q;i++)same&=x[i]==y[(i+j)&7];if(same)return true;}return false;}
struct Search{Action a;double score;};
Search search(Eval&e,mt19937_64&r,int restarts,int steps,const Action*oracle=nullptr,int mode=0){Search best{randomAction(r),-1e99};uniform_real_distribution<double> U(0,1);for(int z=0;z<restarts;z++){Action a=randomAction(r);if(oracle&&mode==1)a.pi=oracle->pi;if(oracle&&mode==2)a.k=oracle->k;double s=e.score(a);for(int t=0;t<steps;t++){Action b=a;bool swapPi=mode==2||(mode==0&&r()%100<65);if(swapPi){int i=1+r()%28,j=1+r()%28;if(i==j)continue;swap(b.pi[i],b.pi[j]);}else{int j=r()%8,v=r()%29;if(v==b.k[j])continue;b.k[j]=v;}double q=e.score(b);double temp=2.5*pow(0.10,double(t)/steps);if(q>=s||U(r)<exp((q-s)/temp)){a=b;s=q;}if(s>best.score)best={a,s};} }return best;}
int main(int argc,char**argv){if(argc!=4){cerr<<"usage: anchor_free_cycle DICTIONARY RESTARTS STEPS\n";return 2;}Lex l;l.load(argv[1]);int restarts=stoi(argv[2]),steps=stoi(argv[3]);const vector<int> shape={8,3,6,2,5,3,2,3,5,7,3,4,10,8,3,5,8,4,3,4,5,4,3,5,1,3,5,5,3,4,2,6,5,3,8,5,4,8,2,3,4,6,6,3,2,10,2};const vector<int> holdShape={4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3};if(accumulate(shape.begin(),shape.end(),0)!=213)throw runtime_error("shape");bool gate=true;
 for(unsigned seed:{113u,527u}){mt19937_64 r(seed);Action truth=randomAction(r);vector<Word> p,c,hp,hc;for(int n:shape)p.push_back(l.sample(n,r)); // 3 authentic native spelling variants, absent from base lexicon
 vector<string> ow={"a9fgo4","h100i4f","539f1jdgr9"};vector<int> used;for(auto&s:ow){Word w=parse(s);if(l.known(w))throw runtime_error("OOV control unexpectedly known"); int k=-1;for(int i=0;i<(int)shape.size();i++)if(shape[i]==(int)w.size()&&find(used.begin(),used.end(),i)==used.end()){k=i;break;}if(k<0)throw runtime_error("no matching OOV length");used.push_back(k);p[k]=w;}
 // 11-rune native misspelling outside dictionary. It is a wholly withheld carry, never an anchor.
 Word carry=parse("d4ifi41ogr9");if(carry.size()!=11||l.known(carry))throw runtime_error("carry control");
 for(auto&w:p)c.push_back(encode(w,truth,r()%8));for(int n:holdShape){hp.push_back(l.sample(n,r));hc.push_back(encode(hp.back(),truth,r()%8));}Word cc=encode(carry,truth,r()%8);hp.insert(hp.begin(),carry);hc.insert(hc.begin(),cc);Eval e{l,c},h{l,hc};int oovs=count_if(p.begin(),p.end(),[&](auto&w){return !l.known(w);});cout<<"CONTROL seed="<<seed<<" bodyOOV="<<oovs<<" carryOOV="<<!l.known(carry)<<" oracleScore="<<e.score(truth)<<" oracleLex="<<e.support(truth)<<" oracleBodyTruth="<<e.support(truth,&p)<<" oracleHeldTruth="<<h.support(truth,&hp)<<endl;
 for(int mode:{0,1,2}){auto x=search(e,r,restarts,steps,&truth,mode);bool exact=sameAction(x.a,truth);cout<<" mode="<<mode<<" score="<<x.score<<" lex="<<e.support(x.a)<<" bodyTruth="<<e.support(x.a,&p)<<" heldTruth="<<h.support(x.a,&hp)<<" exact="<<exact<<" evals="<<e.calls<<endl;if(mode==0)gate&=exact&&h.support(x.a,&hp)==17;}
 }
 cout<<"ORIGINAL_GATE="<<gate<<" (original glyphs not loaded)\n";return 0;}
