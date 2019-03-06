#!/bin/sh

# Embed current date and git revision in a file.
# Usage: embed_revision.sh /path/to/file

built="$(date -R)"
revision="$(git rev-parse --verify HEAD | head -c7)"

sed -e "s/@BUILT/$built/" -e "s/@REVISION/$revision/" -i "$1"
