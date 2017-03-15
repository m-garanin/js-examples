#!/usr/bin/env python
import sys, json
import base64

def parse(fname):
    print fname
    f = open(fname, 'r')
    obj = json.loads( f.read())
    print obj.keys()
    for k, v in obj.items():
        f = open(k, 'w')
        if k.endswith('.png'):
            v = v[22:]
            byt = base64.decodestring(v)
            f.write(byt)
        else:
            f.write(v)
    

    
    
if __name__ == '__main__':
    parse(sys.argv[1])
