#!/bin/bash
GCS_BUCKET="gs://peddy-ai-models/"
gsutil cors set $1 $GCS_BUCKET
