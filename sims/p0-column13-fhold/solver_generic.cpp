// C++17: known-cycle transparent-F followed by an unknown width-13 columnar transposition.
#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cctype>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <numeric>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;
#ifndef PERIOD
#define PERIOD 13
#endif
constexpr int Q=PERIOD,W=13,A=29,N=716,R=37,ALL=(1<<W)-1,NEG=-30000,BAD=-1000000000,SCALE=128;
static_assert(Q==13||Q==8);
using Key=array<int,Q>;using Order=array<int,W>;using Tape=vector<int>;
const string alphabet="0123456789abcdefghijklmnopqrs";
#if PERIOD == 13
const Key historical={0,10,4,0,1,19,0,18,4,18,9,0,18},red={15,8,18,3,6,19,27,0,15,26,18,21,5},titlePlain={18,13,10,13,8,24,9,26,15,18,18,5,15};
#elif PERIOD == 8
const Key historical={23,10,1,10,9,10,16,26},red={15,8,18,3,6,19,27,0},titlePlain={18,13,10,13,8,24,9,26};
#endif
int mod(int a,int b){return (a%b+b)%b;}
string enc(const Tape& t){string s;for(int x:t)s+=alphabet.at(x);return s;}
struct Source{string name;Tape t;};
vector<Source> load(const string& f){ifstream in(f);if(!in)throw runtime_error("input");vector<Source> z;string n,t;while(in>>n>>t){for(char&ch:n)ch=(char)tolower((unsigned char)ch);Tape p;for(char c:t){auto i=alphabet.find((char)tolower((unsigned char)c));if(i==string::npos)throw runtime_error("bad rune");p.push_back(i);}z.push_back({n,p});}if(z.size()!=10||z[0].t.size()!=N)throw runtime_error("source length");return z;}
struct LM {array<int,A> u{};array<array<int,A>,A> b{};};
LM model(const vector<Source>& src,const string& exclude){array<double,A> u{},total{};array<array<double,A>,A> b{};double n=0;for(const auto&s:src){if(s.name=="original"||s.name==exclude)continue;for(size_t i=0;i<s.t.size();i++){u[s.t[i]]++;n++;if(i){b[s.t[i-1]][s.t[i]]++;total[s.t[i-1]]++;}}}LM m;for(int y=0;y<A;y++){double p=(u[y]+0.2)/(n+0.2*A);m.u[y]=lround(SCALE*log(p));for(int x=0;x<A;x++)m.b[x][y]=lround(SCALE*log((b[x][y]+8*p)/(total[x]+8)));}return m;}
Tape encrypt(const Tape&p,const Key&k,int phase=0){Tape e;for(int x:p){if(x==0)e.push_back(0);else{e.push_back((x+k[phase])%A);phase=(phase+1)%Q;}}return e;}
Tape transpose(const Tape&e,const Order&o){Order inv;for(int j=0;j<W;j++)inv[o[j]]=j;Tape c;for(int physical=0;physical<W;physical++)for(size_t i=inv[physical];i<e.size();i+=W)c.push_back(e[i]);return c;}
array<Tape,W> columns(const Tape&c,int longCol){array<Tape,W>a;size_t at=0;for(int j=0;j<W;j++){int len=N/W+(j==longCol);a[j]=Tape(c.begin()+at,c.begin()+at+len);at+=len;}if(at!=N)throw runtime_error("column split");return a;}
Tape untranspose(const Tape&c,const Order&o){auto a=columns(c,o[0]);Tape e;for(int r=0;r<=N/W;r++)for(int j=0;j<W;j++)if(r<(int)a[o[j]].size())e.push_back(a[o[j]][r]);return e;}
struct Decode{int score=BAD,phase=-1,start=-1;Tape plain;};
Decode decode(const Tape&c,const Key&key,const LM&lm,int fixedStart=-1){constexpr int S=Q*A;array<int,S>d,n;d.fill(BAD);for(int p=0;p<Q;p++)if(fixedStart<0||p==fixedStart)d[p*A]=0;vector<array<int16_t,S>>back(c.size());for(size_t i=0;i<c.size();i++){n.fill(BAD);back[i].fill(-1);bool first=i%W==0;for(int st=0;st<S;st++)if(d[st]>BAD){int p=st/A,prev=st%A;auto put=[&](int y,int np){int ns=np*A+y,sc=d[st]+(first?lm.u[y]:lm.b[prev][y]);if(sc>n[ns]){n[ns]=sc;back[i][ns]=st;}};int y=mod(c[i]-key[p],A);if(y)put(y,(p+1)%Q);if(c[i]==0)put(0,p);}d=n;}int st=max_element(d.begin(),d.end())-d.begin();Decode out;out.score=d[st];if(out.score==BAD)return out;out.phase=st/A;out.plain.resize(c.size());for(int i=(int)c.size()-1;i>=0;i--){out.plain[i]=st%A;st=back[i][st];assert(st>=0);}out.start=st/A;assert(encrypt(out.plain,key,out.start)==c);return out;}
struct Node{Order o{};int mask=0,rank=BAD;vector<int16_t> s;};
struct Search {
 const Key& key;const LM& lm;int width;array<array<int,W>,R> c{};array<int,R> zero{};int maxz=0,H=0,states=0;vector<uint16_t> suf;
 Search(const Tape&t,int longCol,const Key&k,const LM&m,int bw):key(k),lm(m),width(bw){auto cols=columns(t,longCol);for(int r=0;r<R;r++){for(int j=0;j<W;j++){c[r][j]=cols[j][r+1];if(!c[r][j])zero[r]|=1<<j;}maxz=max(maxz,__builtin_popcount((unsigned)zero[r]));}H=maxz+1;states=R*Q*H*2;suf.resize((ALL+1)*R*Q);for(int r=0;r<R;r++)for(int p=0;p<Q;p++)suf[idx(0,r,p)]=1<<p;for(int mask=1;mask<=ALL;mask++)for(int r=0;r<R;r++)for(int p=0;p<Q;p++){uint16_t v=0;for(int bits=mask;bits;bits&=bits-1){int j=__builtin_ctz((unsigned)bits),rem=mask^(1<<j),x=c[r][j];if(x!=key[p])v|=suf[idx(rem,r,(p+1)%Q)];if(!x)v|=suf[idx(rem,r,p)];}suf[idx(mask,r,p)]=v;}}
 size_t idx(int m,int r,int p)const{return ((size_t)m*R+r)*Q+p;}
 size_t si(int r,int p,int h,int held)const{return (((size_t)r*Q+p)*H+h)*2+held;}
 // Relax only the remaining column order independently in each row; exact feasibility of all phase paths.
 int score(const Node&n,int depth)const{array<int,Q> enter,next;enter.fill(0);int rem=ALL^n.mask;for(int r=0;r<R;r++){next.fill(BAD);int z=__builtin_popcount((unsigned)(zero[r]&n.mask));for(int p=0;p<Q;p++)if(enter[p]>BAD)for(int h=0;h<=z;h++){int v=max(n.s[si(r,p,h,0)],n.s[si(r,p,h,1)]);if(v==NEG)continue;int a=enter[p]+v,phase=mod(p+depth-h,Q);for(unsigned bits=suf[idx(rem,r,phase)];bits;bits&=bits-1){int q=__builtin_ctz(bits);next[q]=max(next[q],a);}}enter=next;if(*max_element(enter.begin(),enter.end())==BAD)return BAD;}return *max_element(enter.begin(),enter.end());}
 Node first(int j)const{Node n;n.o[0]=j;n.mask=1<<j;n.s.assign(states,NEG);for(int r=0;r<R;r++)for(int p=0;p<Q;p++){int x=c[r][j],y=mod(x-key[p],A);if(y)n.s[si(r,p,0,0)]=lm.u[y];if(!x)n.s[si(r,p,1,1)]=lm.u[0];}n.rank=score(n,1);return n;}
 Node extend(const Node&prev,int j,int depth)const{Node n;n.o=prev.o;n.o[depth]=j;n.mask=prev.mask|(1<<j);n.s.assign(states,NEG);int last=prev.o[depth-1];for(int r=0;r<R;r++){int z=__builtin_popcount((unsigned)(zero[r]&prev.mask)),x=c[r][j],old=c[r][last];for(int p=0;p<Q;p++)for(int h=0;h<=z;h++){int phase=mod(p+depth-h,Q),pc=mod(old-key[(phase+Q-1)%Q],A),y=mod(x-key[phase],A);int a=prev.s[si(r,p,h,0)],b=prev.s[si(r,p,h,1)];if(a==NEG&&b==NEG)continue;auto add=[&](int dest,int hh,int held){int v=NEG;if(a!=NEG)v=max(v,a+lm.b[pc][dest]);if(b!=NEG)v=max(v,b+lm.b[0][dest]);auto& w=n.s[si(r,p,hh,held)];w=max((int)w,v);};if(y)add(y,h,0);if(!x)add(0,h+1,1);}}n.rank=score(n,depth+1);return n;}
 Node run(int longCol,const Order* truth=nullptr)const{vector<Node> beam;auto init=first(longCol);if(init.rank==BAD)return init;beam.push_back(move(init));auto better=[](const Node&a,const Node&b){if(a.rank!=b.rank)return a.rank>b.rank;return a.o<b.o;};for(int depth=1;depth<W;depth++){vector<Node> next;next.reserve(width+1);long long expanded=0,legal=0;bool trueIn=false;for(const auto& p:beam)for(unsigned bits=ALL^p.mask;bits;bits&=bits-1){int j=__builtin_ctz(bits);expanded++;Node n=extend(p,j,depth);if(n.rank==BAD)continue;legal++;if((int)next.size()<width){next.push_back(move(n));push_heap(next.begin(),next.end(),better);}else if(better(n,next.front())){pop_heap(next.begin(),next.end(),better);next.back()=move(n);push_heap(next.begin(),next.end(),better);}}if(next.empty()){Node n;n.rank=BAD;return n;}if(truth&&(*truth)[0]==longCol){for(auto&n:next)if(equal(n.o.begin(),n.o.begin()+depth+1,truth->begin()))trueIn=true;cerr<<"truth split "<<longCol<<" depth "<<depth+1<<" kept "<<trueIn<<" legal "<<legal<<"/"<<expanded<<"\n";}beam=move(next);}return move(*max_element(beam.begin(),beam.end(),[](const Node&a,const Node&b){return a.rank<b.rank;}));}
};
template<size_t L> string ordstr(const array<int,L>&o){string s;for(int x:o){if(!s.empty())s+=",";s+=to_string(x);}return s;}
int same(const Tape&a,const Tape&b){if(a.size()!=b.size())return -1;int n=0;for(size_t i=0;i<a.size();i++)n+=a[i]==b[i];return n;}
Tape sub(const Tape&t,int a,int b){return Tape(t.begin()+a,t.begin()+b);}
void runCase(const string&name,const Tape&c,const Key&k,const LM&m,int width,const Tape*truth=nullptr,const Order*order=nullptr){cout<<"CASE "<<name<<" beam "<<width<<" key "<<ordstr(k)<<"\n"<<flush;Node best;for(int longCol=0;longCol<W;longCol++){auto t0=chrono::steady_clock::now();Search s(c,longCol,k,m,width);Node n=s.run(longCol,order);double secs=chrono::duration<double>(chrono::steady_clock::now()-t0).count();cout<<"split "<<longCol<<" score "<<n.rank<<" order "<<ordstr(n.o)<<" seconds "<<secs<<"\n"<<flush;if(n.rank>best.rank)best=move(n);}if(best.rank==BAD){cout<<"NO BEAM SURVIVOR\n"<<flush;return;}Tape e=untranspose(c,best.o);auto tr=decode(sub(e,W,38*W),k,m);assert(tr.score==best.rank);auto ho=decode(sub(e,38*W,55*W),k,m,tr.phase);auto full=decode(e,k,m);cout<<"WIN "<<ordstr(best.o)<<" train_score "<<double(tr.score)/(SCALE*tr.plain.size())<<" start "<<tr.start<<" end "<<tr.phase<<" held_with_bridge_score "<<(ho.phase<0?-999.0:double(ho.score)/(SCALE*ho.plain.size()))<<" full_legal "<<(full.phase>=0)<<"\n";cout<<"TRAIN "<<enc(tr.plain)<<"\nHELD_BRIDGE "<<enc(ho.plain)<<"\nFULL "<<enc(full.plain)<<"\n";if(full.phase>=0){assert(transpose(encrypt(full.plain,k,full.start),best.o)==c);cout<<"FULL_REPLAY "<<c.size()<<" start "<<full.start<<"\n";}if(truth&&order){cout<<"TRUE_ORDER "<<ordstr(*order)<<" correct "<<(best.o==*order)<<" train_exact "<<same(tr.plain,sub(*truth,W,38*W))<<" held_exact "<<(ho.phase<0?-1:same(sub(ho.plain,W,ho.plain.size()),sub(*truth,39*W,55*W)))<<" full_exact "<<same(full.plain,*truth)<<"\n";}cout<<flush;}
int main(int argc,char**argv){if(argc<4){cerr<<"usage: solver tapes.txt beam control1|control2|original-historical|original-red|original-title|all\n";return 1;}auto src=load(argv[1]);int width=stoi(argv[2]);string mode=argv[3];if(width<1)throw runtime_error("beam width");for(int j=0;j<2;j++){string name=j?"0_loss_of_divinity":"0_koan_1";if(mode!="all"&&mode!="control"+to_string(j+1))continue;auto it=find_if(src.begin(),src.end(),[&](const Source&s){return s.name==name;});Tape p=sub(it->t,0,N);Order o;iota(o.begin(),o.end(),0);mt19937 rng(3301+j);shuffle(o.begin(),o.end(),rng);Tape c=transpose(encrypt(p,historical),o);runCase(name,c,historical,model(src,name),width,&p,&o);}for(int j=0;j<3;j++){string n=j==0?"original-historical":j==1?"original-red":"original-title";if(mode!="all"&&mode!=n)continue;Key k=j==0?historical:red;if(j==2)for(int x=0;x<Q;x++)k[x]=mod(red[x]-titlePlain[x],A);runCase(n,src[0].t,k,model(src,""),width);}return 0;}
