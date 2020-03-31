#!/bin/bash
# Zips and uploads all files in <directory> to the dataset GCS bucket

USAGE="Usage: $0 <dataset_directory>"

[[ $# -eq 1 ]] || { echo $USAGE; exit 1; }
[ -d $1 ] || { echo "Invalid directory:" $1; exit 1; }

BUCKET=peddy-ai-dl-data
DATASET_PATH=deeplearning-repo/hands-down
ZIPFILE=`date +%d_%m_%y`.zip

zip $ZIPFILE -j $1/*json

# Copy and set world-readable ACLs on objects written
gsutil cp $ZIPFILE gs://${BUCKET}/${DATASET_PATH}
gsutil acl set -a public-read gs://${BUCKET}/${DATASET_PATH}/${ZIPFILE}
