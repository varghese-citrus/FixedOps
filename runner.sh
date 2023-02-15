#!/bin/bash
cd fixedops/data-validation
export FOPC_SITE_ID="suntrup2022" ROLE="admin" STORE="Suntrup Ford Westport" LOG="enable"
deno test -A --unstable home-kpi-report-data-validation.ts

