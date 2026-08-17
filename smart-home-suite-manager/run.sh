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
  bashio::log.info "Smart Home Suite Manager 1.0.0"
  bashio::log.info "Action: ${ACTION}"
}

component_version() {
  local path="$1"
  sed -n 's/^[[:space:]]*"version":[[:space:]]*"\([^"]*\)".*/\1/p' \
    "${path}/manifest.json" | head -n 1
}

validate_component() {
  local path="$1"
  local version module_count duplicate_paths module_dir descriptor suite_version

  test -f "${path}/manifest.json"
  test -f "${path}/__init__.py"
  test -f "${path}/config_flow.py"
  test -f "${path}/const.py"
  test -f "${path}/module_catalog.py"
  test -f "${path}/module_manager.py"
  test -f "${path}/diagnostics.py"
  test -f "${path}/sensor.py"
  test -f "${path}/binary_sensor.py"

  test -f "${path}/brand/icon.png"
  test -f "${path}/brand/logo.png"

  test -f "${path}/frontend/smart-lighting-panel.js"
  test -f "${path}/frontend/smart-energy-advanced-panel.js"
  test -f "${path}/frontend/smart-support-panel.js"
  test -f "${path}/frontend/smart-home-native.js"
  test -f "${path}/frontend/smart-home-panel.js"
  grep -Fq 'PANEL_VERSION = "2.0.5"' "${path}/frontend/smart-home-panel.js"

  test -f "${path}/legacy/smart_home_panel/__init__.py"
  test -f "${path}/legacy/smart_home_panel/const.py"
  test -f "${path}/translations/en.json"
  test -f "${path}/translations/es.json"

  version="$(component_version "${path}")"
  test -n "${version}"

  # Smart Support provider supervision was introduced in Suite 1.0.0.
  # Keep structural validation backward-compatible so a verified 0.x backup
  # can still be inspected/restored by a 1.x Manager.
  case "${version}" in
    0.*)
      ;;
    *)
      test -f "${path}/support_health.py"
      ;;
  esac

  module_count=0
  : > /tmp/smart-home-suite-panel-paths.$$
  for module_dir in "${path}"/modules/*; do
    test -d "${module_dir}" || continue
    descriptor="${module_dir}/module.json"
    test -f "${descriptor}" || continue
    test -f "${module_dir}/__init__.py"

    suite_version="$(
      sed -n 's/^[[:space:]]*"suite_version":[[:space:]]*"\([^"]*\)".*/\1/p' \
        "${descriptor}" | head -n 1
    )"
    test "${suite_version}" = "${version}"

    sed -n 's/^[[:space:]]*"panel_path":[[:space:]]*"\([^"]*\)".*/\1/p' \
      "${descriptor}" | head -n 1 >> /tmp/smart-home-suite-panel-paths.$$

    module_count=$((module_count + 1))
  done

  test "${module_count}" -ge 4

  duplicate_paths="$(
    sort /tmp/smart-home-suite-panel-paths.$$ | uniq -d | head -n 1 || true
  )"
  rm -f /tmp/smart-home-suite-panel-paths.$$
  test -z "${duplicate_paths}"
}

recover_interrupted_replace() {
  local previous newest_previous

  mkdir -p "${CUSTOM_COMPONENTS}"

  # Clean abandoned staging directories; they were never active.
  rm -rf "${CUSTOM_COMPONENTS}"/.smart_home_suite.new.* 2>/dev/null || true

  # If a previous installation was moved aside and the active target disappeared,
  # restore the newest valid previous copy automatically.
  if [ ! -d "${TARGET}" ]; then
    newest_previous="$(
      ls -1td "${CUSTOM_COMPONENTS}"/.smart_home_suite.previous.* 2>/dev/null \
        | head -n 1 || true
    )"
    if [ -n "${newest_previous}" ] && validate_component "${newest_previous}"; then
      bashio::log.warning "Recovering interrupted Suite replacement from ${newest_previous}."
      mv "${newest_previous}" "${TARGET}"
      bashio::log.info "INTERRUPTED_REPLACE_RECOVERED"
    fi
  fi

  # Old valid previous directories are never needed once TARGET exists.
  if [ -d "${TARGET}" ]; then
    for previous in "${CUSTOM_COMPONENTS}"/.smart_home_suite.previous.*; do
      [ -d "${previous}" ] || continue
      rm -rf "${previous}"
    done
  fi
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

  if ! tar -tzf "${backup_file}" >/dev/null; then
    bashio::log.error "Backup integrity check failed: ${backup_file}"
    rm -f "${backup_file}"
    return 1
  fi

  bashio::log.info "BACKUP_VERIFIED"
  prune_backups
}

atomic_replace() {
  local source="$1"
  local new_path="${CUSTOM_COMPONENTS}/.smart_home_suite.new.$$"
  local previous_path="${CUSTOM_COMPONENTS}/.smart_home_suite.previous.$$"
  local had_previous=false

  rm -rf "${new_path}" "${previous_path}"
  mkdir -p "${new_path}"
  cp -a "${source}/." "${new_path}/"

  if ! validate_component "${new_path}"; then
    bashio::log.error "Staged component failed validation. Existing installation was not changed."
    rm -rf "${new_path}"
    return 1
  fi
  bashio::log.info "STAGED_VALIDATION_OK"

  if [ -d "${TARGET}" ]; then
    mv "${TARGET}" "${previous_path}"
    had_previous=true
  fi

  if ! mv "${new_path}" "${TARGET}"; then
    bashio::log.error "Could not activate the new component. Restoring previous installation."
    rm -rf "${TARGET}" "${new_path}"
    if [ "${had_previous}" = true ] && [ -d "${previous_path}" ]; then
      mv "${previous_path}" "${TARGET}"
    fi
    return 1
  fi

  # Keep previous_path until the newly active directory has passed final validation.
  if ! validate_component "${TARGET}"; then
    bashio::log.error "Post-install validation failed. Rolling back automatically."
    rm -rf "${TARGET}"
    if [ "${had_previous}" = true ] && [ -d "${previous_path}" ]; then
      mv "${previous_path}" "${TARGET}"
      bashio::log.warning "AUTOMATIC_ROLLBACK_OK"
    fi
    return 1
  fi

  bashio::log.info "POST_INSTALL_VALIDATION_OK"
  rm -rf "${previous_path}"
}

validate_only() {
  local installed_version payload_version

  if ! validate_component "${PAYLOAD}"; then
    bashio::log.error "Bundled Smart Home Suite payload is invalid."
    exit 40
  fi
  payload_version="$(component_version "${PAYLOAD}")"
  bashio::log.info "Bundled payload version: ${payload_version}"

  if [ -d "${TARGET}" ]; then
    if ! validate_component "${TARGET}"; then
      bashio::log.error "Installed Smart Home Suite failed structural validation."
      exit 41
    fi
    installed_version="$(component_version "${TARGET}")"
    bashio::log.info "Installed Suite version: ${installed_version}"
  else
    bashio::log.warning "Smart Home Suite is not currently installed."
  fi

  bashio::log.info "VALIDATION_OK"
}

install_repair() {
  local installed_version

  if [ ! -d "${HA_CONFIG}" ] || [ ! -w "${HA_CONFIG}" ]; then
    bashio::log.error "Home Assistant configuration is not mounted read/write at ${HA_CONFIG}."
    exit 20
  fi

  recover_interrupted_replace

  if ! validate_component "${PAYLOAD}"; then
    bashio::log.error "Bundled Smart Home Suite payload is incomplete or inconsistent."
    exit 21
  fi
  bashio::log.info "PAYLOAD_VALIDATION_OK"

  mkdir -p "${CUSTOM_COMPONENTS}"

  if [ "${CREATE_BACKUP}" = "true" ]; then
    create_backup
  fi

  atomic_replace "${PAYLOAD}"
  sync

  installed_version="$(component_version "${TARGET}")"
  bashio::log.info "Installed Smart Home Suite ${installed_version} at ${TARGET}."
  bashio::log.info "Restart Home Assistant to load the installed version."
  bashio::log.info "INSTALLATION_OK"
}

restore_latest() {
  mkdir -p "${BACKUP_DIR}" "${CUSTOM_COMPONENTS}"
  recover_interrupted_replace

  local latest stage
  latest="$(ls -1t "${BACKUP_DIR}"/smart_home_suite-*.tar.gz 2>/dev/null | head -n 1 || true)"

  if [ -z "${latest}" ]; then
    bashio::log.error "No Smart Home Suite backup is available."
    exit 30
  fi

  if ! tar -tzf "${latest}" >/dev/null; then
    bashio::log.error "The latest backup archive is corrupt: ${latest}"
    exit 31
  fi

  stage="/tmp/smart-home-suite-restore.$$"
  rm -rf "${stage}"
  mkdir -p "${stage}"
  tar -xzf "${latest}" -C "${stage}"

  if ! validate_component "${stage}/smart_home_suite"; then
    bashio::log.error "The latest backup contains an invalid Suite: ${latest}"
    rm -rf "${stage}"
    exit 32
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
  validate_only)
    validate_only
    ;;
  restore_latest)
    restore_latest
    ;;
  *)
    bashio::log.error "Unsupported action: ${ACTION}"
    exit 10
    ;;
esac
