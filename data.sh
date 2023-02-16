#!/bin/bash
cd fixedops/data-validation
export FOPC_SITE_ID="suntrup2022" ROLE="admin" STORE="Suntrup Ford Westport" LOG="disable"
deno test -A --unstable home-kpi-report-data-validation.ts


