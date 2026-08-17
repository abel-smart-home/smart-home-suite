#!/usr/bin/with-contenv bashio
set -Eeuo pipefail

PAYLOAD="/opt/smart-home-suite/smart_home_suite"
HA_CONFIG="/homeassistant"
CUSTOM_COMPONENTS="${HA_CONFIG}/custom_components"
TARGET="${CUSTOM_COMPONENTS}/smart_home_suite"
BACKUP_DIR="/data/backups"

ACTION="$(bashio::config 'action')"
CREATE_BACKUP="$(bashio::config 'create_backup')"
KEEP_BACKUPS="$(bashio::config 'keep_backups')"

log_header() {
  bashio::log.info "Smart Home Suite Manager 0.2.1"
  bashio::log.info "Action: ${ACTION}"
}

validate_component() {
  local path="$1"
  test -f "${path}/manifest.json"
  test -f "${path}/__init__.py"
  test -f "${path}/config_flow.py"
  test -f "${path}/const.py"
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
  local stamp
  local backup_file
  stamp="$(date -u +'%Y%m%dT%H%M%SZ')"
  backup_file="${BACKUP_DIR}/smart_home_suite-${stamp}.tar.gz"

  bashio::log.info "Creating backup: ${backup_file}"
  tar -czf "${backup_file}" -C "${CUSTOM_COMPONENTS}" smart_home_suite
  prune_backups
}

atomic_replace() {
  local source="$1"
  local new_path="${CUSTOM_COMPONENTS}/.smart_home_suite.new.$$"
  local previous_path="${CUSTOM_COMPONENTS}/.smart_home_suite.previous.$$"

  rm -rf "${new_path}" "${previous_path}"
  mkdir -p "${new_path}"
  cp -a "${source}/." "${new_path}/"

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

  bashio::log.info "Installed Smart Home Suite 0.2.1 at ${TARGET}."
  bashio::log.info "Restart Home Assistant, then add the Smart Home Suite integration from Settings > Devices & services."
  bashio::log.info "INSTALLATION_OK"
}

restore_latest() {
  mkdir -p "${BACKUP_DIR}" "${CUSTOM_COMPONENTS}"
  local latest
  local stage
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
