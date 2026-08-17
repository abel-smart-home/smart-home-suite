#!/usr/bin/with-contenv bashio
set -Eeuo pipefail

PAYLOAD="/opt/smart-home-suite/smart_home_suite"
HA_CONFIG="/homeassistant"
CUSTOM_COMPONENTS="${HA_CONFIG}/custom_components"
TARGET="${CUSTOM_COMPONENTS}/smart_home_suite"
BACKUP_DIR="/data/backups"
SOURCE_CACHE="/data/source-cache"

ACTION="$(bashio::config 'action')"
CREATE_BACKUP="$(bashio::config 'create_backup')"
KEEP_BACKUPS="$(bashio::config 'keep_backups')"

log_header() {
  bashio::log.info "Smart Home Suite Manager 0.3.0 TEST"
  bashio::log.info "Action: ${ACTION}"
}

validate_component() {
  local path="$1"
  test -f "${path}/manifest.json"
  test -f "${path}/__init__.py"
  test -f "${path}/config_flow.py"
  test -f "${path}/const.py"
  test -f "${path}/module_manager.py"
  test -f "${path}/frontend/smart-lighting-panel.js"
  test -f "${path}/frontend/smart-energy-advanced-panel.js"
  test -f "${path}/frontend/smart-support-panel.js"
  test -f "${path}/frontend/smart-home-native.js"
  test -f "${path}/translations/en.json"
  test -f "${path}/translations/es.json"
}

prune_backups() {
  local count=0
  local file
  for file in $(ls -1t "${BACKUP_DIR}"/smart_home_suite-*.tar.gz 2>/dev/null || true); do
    count=$((count + 1))
    if [ "${count}" -gt "${KEEP_BACKUPS}" ]; then
      rm -f "${file}"
    fi
  done
}

create_backup() {
  if [ ! -d "${TARGET}" ]; then
    return 0
  fi

  mkdir -p "${BACKUP_DIR}"
  local stamp backup_file
  stamp="$(date -u +'%Y%m%dT%H%M%SZ')"
  backup_file="${BACKUP_DIR}/smart_home_suite-${stamp}.tar.gz"

  bashio::log.info "Creating backup: ${backup_file}"
  tar -czf "${backup_file}" -C "${CUSTOM_COMPONENTS}" smart_home_suite
  prune_backups
}

is_exact_smart_home_205() {
  local file="$1"
  test -f "${file}" && grep -Fq 'PANEL_VERSION = "2.0.5"' "${file}"
}

capture_smart_home_205() {
  local staged="$1"
  local dst="${staged}/frontend/smart-home-panel.js"
  local backend_dst="${staged}/legacy/smart_home_panel"
  local source=""
  local backend_source=""

  mkdir -p "${SOURCE_CACHE}" "${staged}/legacy"

  # Prefer an already captured exact source on Suite upgrades.
  if is_exact_smart_home_205 "${TARGET}/frontend/smart-home-panel.js"; then
    source="${TARGET}/frontend/smart-home-panel.js"
  elif is_exact_smart_home_205 "${SOURCE_CACHE}/smart-home-panel-v2.0.5.js"; then
    source="${SOURCE_CACHE}/smart-home-panel-v2.0.5.js"
  elif is_exact_smart_home_205 "${HA_CONFIG}/www/smart-home-panel/smart-home-panel.js"; then
    source="${HA_CONFIG}/www/smart-home-panel/smart-home-panel.js"
  fi

  if [ -n "${source}" ]; then
    cp -a "${source}" "${dst}"
    cp -a "${source}" "${SOURCE_CACHE}/smart-home-panel-v2.0.5.js"
    bashio::log.info "Captured exact Smart Home Panel V2.0.5 frontend."
    bashio::log.info "Smart Home V2.0.5 SHA256: $(sha256sum "${dst}" | awk '{print $1}')"
  else
    bashio::log.warning "Exact Smart Home Panel V2.0.5 frontend was not found."
    bashio::log.warning "Smart Home module will remain unavailable; other modules can still load."
  fi

  # Preserve the exact legacy backend package when available.
  if [ -f "${TARGET}/legacy/smart_home_panel/__init__.py" ]; then
    backend_source="${TARGET}/legacy/smart_home_panel"
  elif [ -f "${SOURCE_CACHE}/smart_home_panel/__init__.py" ]; then
    backend_source="${SOURCE_CACHE}/smart_home_panel"
  elif [ -f "${CUSTOM_COMPONENTS}/smart_home_panel/__init__.py" ]; then
    backend_source="${CUSTOM_COMPONENTS}/smart_home_panel"
  fi

  if [ -n "${backend_source}" ]; then
    rm -rf "${backend_dst}" "${SOURCE_CACHE}/smart_home_panel"
    mkdir -p "${backend_dst}" "${SOURCE_CACHE}/smart_home_panel"
    cp -a "${backend_source}/." "${backend_dst}/"
    cp -a "${backend_source}/." "${SOURCE_CACHE}/smart_home_panel/"
    bashio::log.info "Captured Smart Home legacy backend package."
  else
    bashio::log.warning "Smart Home legacy backend was not found; Suite compatibility backend will be used."
  fi
}

atomic_replace() {
  local source="$1"
  local new_path="${CUSTOM_COMPONENTS}/.smart_home_suite.new.$$"
  local previous_path="${CUSTOM_COMPONENTS}/.smart_home_suite.previous.$$"

  rm -rf "${new_path}" "${previous_path}"
  mkdir -p "${new_path}"
  cp -a "${source}/." "${new_path}/"

  # The bridge package intentionally does not contain Smart Home Panel V2.0.5.
  # Capture the exact validated deployment before replacing the Suite.
  capture_smart_home_205 "${new_path}"

  if ! validate_component "${new_path}"; then
    bashio::log.error "Staged component failed validation. Existing installation was not changed."
    rm -rf "${new_path}"
    return 1
  fi

  if [ -d "${TARGET}" ]; then
    mv "${TARGET}" "${previous_path}"
  fi

  if mv "${new_path}" "${TARGET}"; then
    rm -rf "${previous_path}"
  else
    bashio::log.error "Could not activate the new component. Restoring previous installation."
    rm -rf "${TARGET}" "${new_path}"
    if [ -d "${previous_path}" ]; then
      mv "${previous_path}" "${TARGET}"
    fi
    return 1
  fi

  if ! validate_component "${TARGET}"; then
    bashio::log.error "Post-install validation failed."
    return 1
  fi
}

install_repair() {
  if [ ! -d "${HA_CONFIG}" ] || [ ! -w "${HA_CONFIG}" ]; then
    bashio::log.error "Home Assistant configuration is not mounted read/write at ${HA_CONFIG}."
    exit 20
  fi

  if ! validate_component "${PAYLOAD}"; then
    bashio::log.error "Bundled Smart Home Suite payload is incomplete."
    exit 21
  fi

  mkdir -p "${CUSTOM_COMPONENTS}"

  if [ "${CREATE_BACKUP}" = "true" ]; then
    create_backup
  fi

  atomic_replace "${PAYLOAD}"
  sync

  bashio::log.info "Installed Smart Home Suite 0.3.0 TEST at ${TARGET}."
  bashio::log.info "Restart Home Assistant after removing legacy YAML registrations listed in MIGRATION-STEPS-0.3.0.md."
  bashio::log.info "INSTALLATION_OK"
}

restore_latest() {
  mkdir -p "${BACKUP_DIR}" "${CUSTOM_COMPONENTS}"
  local latest stage
  latest="$(ls -1t "${BACKUP_DIR}"/smart_home_suite-*.tar.gz 2>/dev/null | head -n 1 || true)"

  if [ -z "${latest}" ]; then
    bashio::log.error "No Smart Home Suite backup is available."
    exit 30
  fi

  stage="/tmp/smart-home-suite-restore.$$"
  rm -rf "${stage}"
  mkdir -p "${stage}"
  tar -xzf "${latest}" -C "${stage}"

  if ! validate_component "${stage}/smart_home_suite"; then
    bashio::log.error "The latest backup is invalid: ${latest}"
    rm -rf "${stage}"
    exit 31
  fi

  atomic_replace "${stage}/smart_home_suite"
  rm -rf "${stage}"
  sync

  bashio::log.info "Restored backup: ${latest}"
  bashio::log.info "Restart Home Assistant to load the restored version."
  bashio::log.info "RESTORE_OK"
}

log_header
case "${ACTION}" in
  install_repair)
    install_repair
    ;;
  restore_latest)
    restore_latest
    ;;
  *)
    bashio::log.error "Unsupported action: ${ACTION}"
    exit 10
    ;;
esac
