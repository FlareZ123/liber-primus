// Exact fixed-key inverse for transposition BEFORE physical continuous F-hold encryption.
#define main known_main
#include "solver_generic.cpp"
#undef main
#include <functional>
struct Variant{array<int,R> p{};int start=0,end=0,mask=0;};
// R=37, masks for all rows use uint64_t in generic search below.
struct V{Tape p;int start=0,end=0;uint64_t mask=0;};
vector<V> variants(const Tape&c,const Key&k,int start=-1,int penalty=0){
 vector<V> out; Tape p(c.size());
 function<void(int,int,int,uint64_t)> rec=[&](int i,int ph,int st,uint64_t mask){if(i==(int)c.size()){out.push_back({p,st,ph,mask});return;}int x=mod(c[i]-k[ph],A);if(x||penalty){p[i]=x?x:29;rec(i+1,(ph+1)%Q,st,mask);}if(!c[i]){p[i]=0;rec(i+1,ph,st,mask|(uint64_t(1)<<i));}};
 assert(c.size()<64);for(int ph=0;ph<Q;ph++)if(start<0||start==ph)rec(0,ph,ph,0);return out;
}
struct Choice{int col,var;};
struct Fit{int score=BAD;vector<Choice> order;vector<V> paths;long long states=0;};
int unary(const V&v,const LM&m,int pen=0){int s=0;for(int x:v.p)s+=m.u[x%29]-(x==29?pen:0);return s;}
int pairScore(const V&a,const V&b,const LM&m,int pen=0){int s=0;assert(a.p.size()==b.p.size());for(size_t r=0;r<a.p.size();r++)s+=m.b[a.p[r]%29][b.p[r]%29]-(b.p[r]==29?pen:0);return s;}
Fit exactOrder(const array<vector<V>,W>& vs,int lc,const LM&m,int penalty=0){
 Fit f;array<int,W+1>off{};for(int j=0;j<W;j++){if(vs[j].empty())return f;off[j+1]=off[j]+vs[j].size();}int n=off[W];vector<Choice> ids;for(int j=0;j<W;j++)for(int k=0;k<(int)vs[j].size();k++)ids.push_back({j,k});vector<int> edges((size_t)n*n);for(int a=0;a<n;a++)for(int b=0;b<n;b++)if(ids[a].col!=ids[b].col)edges[(size_t)a*n+b]=pairScore(vs[ids[a].col][ids[a].var],vs[ids[b].col][ids[b].var],m,penalty);
 vector<int> d((size_t)(ALL+1)*n,BAD),back(d.size(),-1);int first=1<<lc;for(int a=off[lc];a<off[lc+1];a++)d[(size_t)first*n+a]=unary(vs[lc][ids[a].var],m,penalty);
 for(int mask=first;mask<ALL;mask++)if(mask&first){for(unsigned i=mask;i;i&=i-1){int j=__builtin_ctz(i);for(int a=off[j];a<off[j+1];a++){int v=d[(size_t)mask*n+a];if(v==BAD)continue;f.states++;for(unsigned k=ALL^mask;k;k&=k-1){int col=__builtin_ctz(k),mm=mask|(1<<col);for(int b=off[col];b<off[col+1];b++){size_t ix=(size_t)mm*n+b;int sc=v+edges[(size_t)a*n+b];if(sc>d[ix]){d[ix]=sc;back[ix]=a;}}}}}}
 auto it=max_element(d.begin()+(size_t)ALL*n,d.end());f.score=*it;int a=it-(d.begin()+(size_t)ALL*n),mask=ALL;f.order.resize(W);f.paths.resize(W);for(int i=W-1;i>=0;i--){Choice x=ids[a];f.order[i]=x;f.paths[i]=vs[x.col][x.var];int b=back[(size_t)mask*n+a];mask^=1<<x.col;a=b;}assert(mask==0&&f.order[0].col==lc);return f;
}
Fit exactChain(const array<vector<V>,W>&vs,const Order&o,const LM&m,int penalty=0){
 Fit f;vector<int>d;vector<vector<int>>back(W);for(int i=0;i<W;i++){int col=o[i];if(vs[col].empty())return f;vector<int>n(vs[col].size(),BAD);back[i].resize(n.size(),-1);if(!i){for(int a=0;a<(int)n.size();a++)n[a]=unary(vs[col][a],m,penalty);}else for(int a=0;a<(int)d.size();a++)for(int b=0;b<(int)n.size();b++){int sc=d[a]+pairScore(vs[o[i-1]][a],vs[col][b],m,penalty);if(sc>n[b]){n[b]=sc;back[i][b]=a;}}d=move(n);}
 int a=max_element(d.begin(),d.end())-d.begin();f.score=d[a];f.order.resize(W);f.paths.resize(W);for(int i=W-1;i>=0;i--){f.order[i]={o[i],a};f.paths[i]=vs[o[i]][a];a=back[i][a];}return f;
}
Order orderOf(const Fit&f){Order o;for(int j=0;j<W;j++)o[j]=f.order[j].col;return o;}
Tape rowTape(const Fit&f){Tape t;if(f.score==BAD)return t;int rows=f.paths[0].p.size();for(int r=0;r<rows;r++)for(int j=0;j<W;j++)t.push_back(f.paths[j].p[r]);return t;}
Fit trainFit(const Tape&c,const Key&k,const LM&m,int lc){auto cols=columns(c,lc);array<vector<V>,W> vs;for(int j=0;j<W;j++)vs[j]=variants(sub(cols[j],1,38),k);return exactOrder(vs,lc,m);}
Fit holdFit(const Tape&c,const Key&k,const LM&m,const Fit&train){Order o=orderOf(train);auto cols=columns(c,o[0]);array<vector<V>,W> vs;for(int j=0;j<W;j++)vs[o[j]]=variants(sub(cols[o[j]],38,55),k,train.paths[j].end);return exactChain(vs,o,m);}
// Enforce all frozen training and predicted held runes in physical order. Enumerate legal full path with any start phase.
struct Physical{long long paths=0;Tape p;int start=-1;};
Physical fullCheck(const Tape&c,const Key&k,const Fit&train,const Fit&hold){Order o=orderOf(train);auto cols=columns(c,o[0]);array<int,W> pos{};for(int j=0;j<W;j++)pos[o[j]]=j;Tape expected;for(int col=0;col<W;col++)for(int r=0;r<(int)cols[col].size();r++){int j=pos[col];if(r>=1&&r<38)expected.push_back(train.paths[j].p[r-1]);else if(r>=38&&r<55&&hold.score>BAD)expected.push_back(hold.paths[j].p[r-38]);else expected.push_back(-1);}assert(expected.size()==c.size());array<long long,Q> count{},next;count.fill(1);vector<array<int,Q>>back(c.size()),symbol(c.size());for(size_t i=0;i<c.size();i++){next.fill(0);back[i].fill(-1);for(int ph=0;ph<Q;ph++)if(count[ph]){auto put=[&](int p,int np){if(expected[i]>=0&&expected[i]!=p)return;next[np]=min(1000000000000000000LL,next[np]+count[ph]);back[i][np]=ph;symbol[i][np]=p;};int y=mod(c[i]-k[ph],A);if(y)put(y,(ph+1)%Q);if(!c[i])put(0,ph);}count=next;}Physical f;for(long long x:count)f.paths=min(1000000000000000000LL,f.paths+x);if(!f.paths)return f;int ph=find_if(count.begin(),count.end(),[](long long n){return n>0;})-count.begin();Tape p(c.size());for(int i=(int)c.size()-1;i>=0;i--){p[i]=symbol[i][ph];ph=back[i][ph];assert(ph>=0);}assert(encrypt(p,k,ph)==c);f.start=ph;f.p=untranspose(p,o);return f;}
// With frozen key/order, solve the global physical clock; rank full legal paths using ONLY training rows.
Physical globalFit(const Tape&c,const Key&k,const Order&o,const LM&m){
 const long long CAP=1000000000000000000LL;
 vector<array<long long,Q>>suffix(c.size()+1);suffix.back().fill(1);
 for(int i=(int)c.size()-1;i>=0;i--)for(int ph=0;ph<Q;ph++){
  long long n=0;if(c[i]!=k[ph])n+=suffix[i+1][(ph+1)%Q];if(!c[i])n=min(CAP,n+suffix[i+1][ph]);suffix[i][ph]=n;}
 Physical out;for(auto n:suffix[0])out.paths=min(CAP,out.paths+n);if(!out.paths)return out;
 if(out.paths>10000000)throw runtime_error("full enumeration cap");
 Tape p(c.size());int best=BAD;
 function<void(int,int,int)>rec=[&](int i,int ph,int st){if(i==(int)c.size()){
   Tape t=untranspose(p,o);int sc=0;for(int r=1;r<38;r++)for(int j=0;j<W;j++){int y=t[r*W+j];sc+=j?m.b[t[r*W+j-1]][y]:m.u[y];}if(sc>best){best=sc;out.p=move(t);out.start=st;}return;}
   int y=mod(c[i]-k[ph],A);if(y&&suffix[i+1][(ph+1)%Q]){p[i]=y;rec(i+1,(ph+1)%Q,st);}if(!c[i]&&suffix[i+1][ph]){p[i]=0;rec(i+1,ph,st);}};
 for(int ph=0;ph<Q;ph++)if(suffix[0][ph])rec(0,ph,ph);assert(transpose(out.p,o).size()==c.size()&&encrypt(transpose(out.p,o),k,out.start)==c);return out;
}
struct CCase{Tape c,p;Key k;Order o;LM lm;bool planted=false;};
CCase make(const vector<Source>&src,string mode){CCase a;a.k=historical;a.lm=model(src,"");if(mode=="original-historical"||mode=="original-red"||mode=="original-title"){a.c=src[0].t;if(mode!="original-historical"){a.k=red;if(mode=="original-title")for(int i=0;i<Q;i++)a.k[i]=mod(red[i]-titlePlain[i],A);}return a;}a.planted=true;string name=mode=="control1"?"0_koan_1":"0_loss_of_divinity";auto it=find_if(src.begin(),src.end(),[&](const Source&s){return s.name==name;});a.p=sub(it->t,0,N);a.lm=model(src,name);iota(a.o.begin(),a.o.end(),0);mt19937 rng(mode=="control1"?3301:3302);shuffle(a.o.begin(),a.o.end(),rng);if(mode=="control2")for(int&v:a.k)v=rng()%A;a.c=encrypt(transpose(a.p,a.o),a.k);return a;}
#ifndef REVERSE_LIBRARY
int main(int argc,char**argv){if(argc!=3){cerr<<"usage: reverse tapes.txt control1|control2|original-historical|original-red|original-title\n";return 1;}auto src=load(argv[1]);string mode=argv[2];CCase a=make(src,mode);Fit best;int split=-1;cout<<"MODE "<<mode<<" q "<<Q<<" key "<<ordstr(a.k)<<"\n";for(int lc=0;lc<W;lc++){auto f=trainFit(a.c,a.k,a.lm,lc);cout<<"SPLIT "<<lc<<" score "<<f.score<<" states "<<f.states<<"\n"<<flush;if(f.score>best.score){best=move(f);split=lc;}}if(split<0){cout<<"NO_TRAIN_PATH\n";return 0;}Order o=orderOf(best);auto ho=holdFit(a.c,a.k,a.lm,best);auto full=fullCheck(a.c,a.k,best,ho);auto global=globalFit(a.c,a.k,o,a.lm);cout<<"WIN "<<split<<" score "<<best.score<<" order "<<ordstr(o)<<" holdout "<<ho.score<<" fullPaths "<<full.paths<<"\n";cout<<"TRAIN "<<enc(rowTape(best))<<"\nHELD_BRIDGE "<<enc(rowTape(ho))<<"\nFULL "<<enc(full.p)<<"\n";cout<<"GLOBAL paths "<<global.paths<<" start "<<global.start<<" tape "<<enc(global.p)<<"\n";cout<<"PHASES ";for(auto v:best.paths)cout<<v.start<<":"<<v.end<<",";cout<<"\n";if(a.planted)cout<<"PLANT order "<<(o==a.o)<<" train_exact "<<same(rowTape(best),sub(a.p,W,38*W))<<" held_exact "<<(ho.score==BAD?-1:same(sub(rowTape(ho),W,17*W),sub(a.p,39*W,55*W)))<<" full_exact "<<same(full.p,a.p)<<" global_exact "<<same(global.p,a.p)<<" true_order "<<ordstr(a.o)<<"\n";}

#endif
