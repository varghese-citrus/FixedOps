cd /fixedops/data-validatio
export FOPC_SITE_ID="suntrup2022" ROLE="admin" STORE="Suntrup Ford Westport" LOG="disable"
deno test -A --unstable --parallel --filter "AEC-FOCP-UI-FN-LD" *.ts