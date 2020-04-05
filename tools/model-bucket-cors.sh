#!/bin/bash
# Usage: ./model-bucket-cors.sh <cors_config.json>
GCS_BUCKET="gs://peddy-ai-models/"
gsutil cors set $1 $GCS_BUCKET
