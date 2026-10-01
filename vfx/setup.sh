#!/usr/bin/env bash
# One-time setup for the VFX pipeline on a fresh cloud container (CPU only).
set -euo pipefail
cd "$(dirname "$0")"
apt-get install -y -q libegl1 libgles2 >/dev/null 2>&1 || (apt-get update -q >/dev/null && apt-get install -y -q libegl1 libgles2 >/dev/null)
pip install -q opencv-contrib-python-headless mediapipe onnxruntime gradio_client imageio-ffmpeg
mkdir -p models && cd models
get() { [ -s "$2" ] || curl -sS -L -o "$2" "$1"; }
get https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task face_landmarker.task
get https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite selfie_multiclass_256x256.tflite
get https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task hand_landmarker.task
get https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3_fp32.onnx rvm_mobilenetv3_fp32.onnx
get https://raw.githubusercontent.com/fannymonori/TF-ESPCN/master/export/ESPCN_x2.pb ESPCN_x2.pb
get https://raw.githubusercontent.com/Saafke/FSRCNN_Tensorflow/master/models/FSRCNN_x2.pb FSRCNN_x2.pb
echo "VFX pipeline ready"
