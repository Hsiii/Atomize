#!/usr/bin/env bash

if [[ -z "${ROOT_DIR:-}" ]]; then
    echo "ROOT_DIR must be set before sourcing load-local-env.sh" >&2
    exit 1
fi

LOCAL_ENV_FILE="${LOCAL_ENV_FILE:-$ROOT_DIR/.env.local}"

trim_env_value() {
    local value="$1"
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"
    printf '%s' "$value"
}

is_supported_env_key() {
    case "$1" in
        APPLE_TEAM_ID | GODOT_* | IOS_*)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

if [[ -f "$LOCAL_ENV_FILE" ]]; then
    while IFS= read -r line || [[ -n "$line" ]]; do
        line="$(trim_env_value "$line")"

        if [[ -z "$line" || "$line" == \#* || "$line" != *=* ]]; then
            continue
        fi

        key="$(trim_env_value "${line%%=*}")"
        value="$(trim_env_value "${line#*=}")"

        if [[ ! "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || ! is_supported_env_key "$key"; then
            continue
        fi

        if [[ "${value:0:1}" == '"' && "${value: -1}" == '"' ]] ||
            [[ "${value:0:1}" == "'" && "${value: -1}" == "'" ]]; then
            value="${value:1:${#value}-2}"
        fi

        if [[ -z "${!key+x}" ]]; then
            printf -v "$key" '%s' "$value"
            export "$key"
        fi
    done < "$LOCAL_ENV_FILE"
fi
