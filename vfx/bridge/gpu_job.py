#!/usr/bin/env python3
"""GPU bridge: runs a Hugging Face Space job from a machine with open network access.

  python3 gpu_job.py check                 # reachability + Space API listing, no GPU used
  python3 gpu_job.py run jobs/<name>.json  # upload inputs, run, download outputs to outputs/<name>/

Job JSON: {"space": "owner/space", "api_name": "/fn", "files": {"param": "path"}, "params": {...}}
HF_TOKEN in the environment bills ZeroGPU time to that account (free accounts: 5 min/day).
"""
import json
import os
import shutil
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))


def pip(*pk):
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", *pk], check=False)


def check():
    import urllib.request

    report = {}
    for u in ["https://huggingface.co", "https://alexnasa-wan2-2-animate-zerogpu.hf.space", "https://cdn-lfs.hf.co", "https://raw.githubusercontent.com"]:
        try:
            urllib.request.urlopen(urllib.request.Request(u, method="HEAD"), timeout=15)
            report[u] = "ok"
        except Exception as e:  # an HTTP error still proves the host is reachable
            report[u] = "ok (http %s)" % e.code if hasattr(e, "code") else "BLOCKED: %s" % e
    pip("gradio_client")
    try:
        from gradio_client import Client

        for sp in ["alexnasa/Wan2.2-Animate-ZEROGPU", "Qwen/Qwen-Image-Edit-2511"]:
            c = Client(sp, hf_token=os.environ.get("HF_TOKEN") or None, verbose=False)
            report["api:" + sp] = c.view_api(return_format="dict", print_info=False)
    except Exception as e:
        report["gradio_client_error"] = repr(e)[:800]
    os.makedirs(os.path.join(HERE, "outputs"), exist_ok=True)
    with open(os.path.join(HERE, "outputs", "check.json"), "w") as f:
        json.dump(report, f, indent=1, default=str)
    print(json.dumps({k: (v if isinstance(v, str) else "listed") for k, v in report.items()}, indent=1))


def run(job_path):
    pip("gradio_client")
    from gradio_client import Client, handle_file

    job = json.load(open(job_path))
    name = os.path.splitext(os.path.basename(job_path))[0]
    out_dir = os.path.join(HERE, "outputs", name)
    os.makedirs(out_dir, exist_ok=True)
    c = Client(job["space"], hf_token=os.environ.get("HF_TOKEN") or None, verbose=False)
    args = dict(job.get("params", {}))
    for k, p in job.get("files", {}).items():
        args[k] = handle_file(p if p.startswith("http") else os.path.join(HERE, p))
    t = time.time()
    status = {"job": name, "space": job["space"]}
    try:
        res = c.predict(api_name=job["api_name"], **args)
        status["seconds"] = round(time.time() - t, 1)
        saved = []
        for i, it in enumerate(res if isinstance(res, (list, tuple)) else [res]):
            p = it.get("video") if isinstance(it, dict) else it
            if isinstance(p, dict):
                p = p.get("path") or p.get("url")
            if isinstance(p, str) and os.path.exists(p):
                dst = os.path.join(out_dir, "%02d_%s" % (i, os.path.basename(p)))
                shutil.copy(p, dst)
                saved.append(os.path.basename(dst))
            else:
                saved.append(repr(it)[:300])
        status["outputs"] = saved
    except Exception as e:
        status["error"] = repr(e)[:2000]
    json.dump(status, open(os.path.join(out_dir, "status.json"), "w"), indent=1)
    print(json.dumps(status, indent=1))


if __name__ == "__main__":
    check() if sys.argv[1] == "check" else run(sys.argv[2])
