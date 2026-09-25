#!/bin/sh
set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
source_abi="$project_root/contracts/evm/src/abi/GovernorEvents.abi"
binding_tmp_dir=$(mktemp -d)
trap 'rm -rf "$binding_tmp_dir"' EXIT

cp "$source_abi" "$binding_tmp_dir/GovernorEvents.abi"
cre generate-bindings evm \
	--project-root "$project_root" \
	--abi "$binding_tmp_dir" \
	--language typescript

