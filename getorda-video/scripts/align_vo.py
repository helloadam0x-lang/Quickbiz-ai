import soundfile as sf, numpy as np, json, re
import os
from kokoro_onnx import Kokoro
MODELS=os.environ.get('KOKORO_DIR','.')
k=Kokoro(os.path.join(MODELS,'kokoro-v1.0.onnx'),os.path.join(MODELS,'voices-v1.0.bin'))
V=os.path.join(os.path.dirname(__file__),'..','public','vo')+'/'
meta=json.load(open(V+'meta.json'))
PLACE={'l01':0.55,'l02':1.75,'c1':4.35,'c2':5.25,'c3':6.05,'c4':7.15,'l03':8.6,'l04':12.25,'l05':13.75,
       'l06':16.9,'l07':22.3,'l08':28.0,'l09':30.9,'l10':33.25,'l11':36.25,'l12':39.15}
PAN={'c1':-0.45,'c2':0.45,'c3':-0.2,'c4':0.3}
out={}
for key,m in meta.items():
    a,sr=sf.read(V+key+'.wav')
    hop=int(0.01*sr); rms=np.array([np.sqrt(np.mean(a[i:i+hop]**2)) for i in range(0,len(a)-hop,hop)])
    voiced=rms>0.06*rms.max()
    # pauses: runs of unvoiced >= 7 frames (70ms) strictly inside the line
    pauses=[]; i=0; n=len(voiced)
    first=np.argmax(voiced); last=n-1-np.argmax(voiced[::-1])
    i=first
    while i<last:
        if not voiced[i]:
            j=i
            while j<last and not voiced[j]: j+=1
            if j-i>=7: pauses.append((i,j))
            i=j
        else: i+=1
    words=m['text'].split()
    # clause split at punctuation
    clauses=[]; cur=[]
    for w in words:
        cur.append(w)
        if re.search(r'[.,?!…]$',w) or w.endswith('...'): clauses.append(cur); cur=[]
    if cur: clauses.append(cur)
    # choose len(clauses)-1 longest pauses as clause boundaries
    bnd=sorted(sorted(pauses,key=lambda p:p[0]-p[1])[:max(0,len(clauses)-1)])
    while len(bnd)<len(clauses)-1: bnd.append((last,last))
    spans=[]; s=first
    for b in bnd: spans.append((s,b[0])); s=b[1]
    spans.append((s,last))
    res=[]
    for cl,(s0,s1) in zip(clauses,spans):
        lens=[max(1,len(k.tokenizer.phonemize(re.sub(r'[^\w\']','',w) or w,'en-us'))) for w in cl]
        tot=sum(lens); t=s0
        for w,L in zip(cl,lens):
            res.append({'w':w,'t':round(t*0.01,3)}); t+=(s1-s0)*L/tot
    out[key]={'start':PLACE[key],'dur':m['dur'],'text':m['text'],'voice':m['voice'],'pan':PAN.get(key,0),'words':res}
    print(key, PLACE[key], m['dur'], ' '.join(f"{r['w']}@{r['t']}" for r in res))
json.dump(out,open(os.path.join(os.path.dirname(__file__),'..','src','vo.json'),'w'),indent=1,ensure_ascii=False)
