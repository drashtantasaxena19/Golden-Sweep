from enum import Enum


class UserRole(str, Enum):
    PLAYER = "player"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class AdminPermission(str, Enum):
    VIEW_DASHBOARD = "view_dashboard"

    VIEW_USERS = "view_users"
    MANAGE_USERS = "manage_users"

    VIEW_GAMES = "view_games"
    MANAGE_GAMES = "manage_games"

    VIEW_TRANSACTIONS = "view_transactions"

    VIEW_WALLETS = "view_wallets"
    MANAGE_WALLETS = "manage_wallets"

    VIEW_CREDIT_PACKAGES = "view_credit_packages"
    MANAGE_CREDIT_PACKAGES = "manage_credit_packages"

    VIEW_RECHARGES = "view_recharges"
    MANAGE_RECHARGES = "manage_recharges"

    VIEW_ANALYTICS = "view_analytics"

    VIEW_ADMINS = "view_admins"
    MANAGE_ADMINS = "manage_admins"

    VIEW_AUDIT_LOGS = "view_audit_logs"
    MANAGE_SETTINGS = "manage_settings"


ADMIN_DEFAULT_PERMISSIONS = [
    permission.value
    for permission in AdminPermission
]


SUPER_ADMIN_PERMISSIONS = ADMIN_DEFAULT_PERMISSIONS.copy()