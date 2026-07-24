#!/usr/bin/env bash

set -Eeuo pipefail

DEPLOY_ROOT="${1:?Path root deployment wajib diisi}"
RELEASE_ID="${2:?ID release wajib diisi}"
ARCHIVE_PATH="${3:?Path arsip release wajib diisi}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"

if [[ "$DEPLOY_ROOT" != /* || "$DEPLOY_ROOT" == "/" ]]; then
  echo "[Deploy] DEPLOY_ROOT harus berupa path absolut dan tidak boleh root (/)."
  exit 1
fi

if [[ ! "$RELEASE_ID" =~ ^[a-zA-Z0-9._-]+$ ]]; then
  echo "[Deploy] RELEASE_ID mengandung karakter yang tidak valid."
  exit 1
fi

if [[ ! -f "$ARCHIVE_PATH" ]]; then
  echo "[Deploy] Arsip release tidak ditemukan: $ARCHIVE_PATH"
  exit 1
fi

RELEASES_DIR="$DEPLOY_ROOT/releases"
RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"
CURRENT_LINK="$DEPLOY_ROOT/current"
TEMP_LINK="$DEPLOY_ROOT/.current-$RELEASE_ID"
LOCK_FILE="$DEPLOY_ROOT/.deploy.lock"

mkdir -p "$RELEASES_DIR"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "[Deploy] Deployment lain sedang berjalan."
  exit 1
fi

deploy_succeeded=false

cleanup_failed_release() {
  rm -f "$TEMP_LINK"

  if [[ "$deploy_succeeded" != true && (! -L "$CURRENT_LINK" || "$(readlink -f "$CURRENT_LINK")" != "$RELEASE_DIR") ]]; then
    rm -rf "$RELEASE_DIR"
  fi
}

trap cleanup_failed_release EXIT

echo "[Deploy] Menyiapkan release $RELEASE_ID"

if [[ -e "$RELEASE_DIR" ]]; then
  echo "[Deploy] Direktori release sudah ada: $RELEASE_DIR"
  exit 1
fi

mkdir -p "$RELEASE_DIR"
tar -xzf "$ARCHIVE_PATH" -C "$RELEASE_DIR"

required_files=(
  "index.html"
  "manifest.json"
  "sw.js"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -s "$RELEASE_DIR/$required_file" ]]; then
    echo "[Deploy] File wajib tidak ditemukan atau kosong: $required_file"
    exit 1
  fi
done

if [[ ! -d "$RELEASE_DIR/assets" ]]; then
  echo "[Deploy] Direktori assets tidak ditemukan."
  exit 1
fi

mapfile -t referenced_assets < <(
  grep -oE '(/assets/[^"[:space:]]+)' "$RELEASE_DIR/index.html" | sed 's#^/##' | sort -u
)

if [[ "${#referenced_assets[@]}" -eq 0 ]]; then
  echo "[Deploy] index.html tidak mereferensikan asset build."
  exit 1
fi

for asset in "${referenced_assets[@]}"; do
  if [[ ! -s "$RELEASE_DIR/$asset" ]]; then
    echo "[Deploy] Asset yang direferensikan tidak ditemukan: $asset"
    exit 1
  fi
done

ln -s "$RELEASE_DIR" "$TEMP_LINK"
mv -Tf "$TEMP_LINK" "$CURRENT_LINK"
rm -f "$ARCHIVE_PATH"

echo "[Deploy] Release $RELEASE_ID sekarang aktif."

mapfile -t old_releases < <(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -rn | tail -n "+$((KEEP_RELEASES + 1))" | cut -d' ' -f2-)

for old_release in "${old_releases[@]}"; do
  resolved_release="$(readlink -f "$old_release")"

  if [[ "$resolved_release" == "$RELEASES_DIR/"* && "$resolved_release" != "$(readlink -f "$CURRENT_LINK")" ]]; then
    echo "[Deploy] Menghapus release lama: $(basename "$resolved_release")"
    rm -rf "$resolved_release"
  fi
done

deploy_succeeded=true
trap - EXIT
echo "[Deploy] Deployment selesai."
