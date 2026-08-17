"""Constants for Smart Support Panel."""

DOMAIN = "smart_support_panel"
VERSION = "1.1.2"

STORAGE_KEY = "smart_support_panel.config"
STORAGE_VERSION = 1
SESSION_STORAGE_KEY = "smart_support_panel.session"
SESSION_STORAGE_VERSION = 1

SIGNAL_SUPPORT_UPDATE = f"{DOMAIN}_support_update"

SERVICE_START_SUPPORT = "start_support"
SERVICE_STOP_SUPPORT = "stop_support"
SERVICE_EXTEND_SUPPORT = "extend_support"
SERVICE_VERIFY_SUPPORT = "verify_support"

DEFAULT_MIN_HOURS = 2.0
DEFAULT_HOURS = 4.0
DEFAULT_MAX_HOURS = 24.0
DEFAULT_EXTENSION_HOURS = 2.0
HARD_MIN_HOURS = 2.0
HARD_MAX_HOURS = 168.0
