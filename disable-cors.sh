#!/bin/bash -x

cd "$(dirname "$0")"
/usr/bin/google-chrome-stable ./index.html --disable-web-security --enable-features=Vulkan --user-data-dir="./temp"

# 動かない場合はwebGPUが有効になってるか確認すること 
# chrome://flags/
