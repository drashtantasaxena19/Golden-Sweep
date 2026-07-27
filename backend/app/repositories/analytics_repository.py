from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any, Literal

from app.core.database import get_database


AnalyticsGranularity = Literal["hour", "day", "week", "month"]


class AnalyticsRepository:
    USER_COLLECTION = "users"
    WALLET_COLLECTION = "wallets"
    TRANSACTION_COLLECTION = "wallet_transactions"
    GAME_COLLECTION = "games"
    RECHARGE_COLLECTION = "recharge_packages"

    CREDIT_TRANSACTION_TYPES = (
        "purchase",
        "admin_credit",
        "refund",
    )

    DEBIT_TRANSACTION_TYPES = (
        "game_entry",
        "admin_debit",
    )

    @property
    def database(self):
        return get_database()

    @property
    def users(self):
        return self.database[self.USER_COLLECTION]

    @property
    def wallets(self):
        return self.database[self.WALLET_COLLECTION]

    @property
    def transactions(self):
        return self.database[self.TRANSACTION_COLLECTION]

    @property
    def games(self):
        return self.database[self.GAME_COLLECTION]

    @property
    def recharge_packages(self):
        return self.database[self.RECHARGE_COLLECTION]

    async def create_indexes(self) -> None:
        await asyncio.gather(
            self.users.create_index(
                [("created_at", 1)],
                name="idx_analytics_users_created_at",
            ),
            self.users.create_index(
                [("last_login_at", 1)],
                sparse=True,
                name="idx_analytics_users_last_login",
            ),
            self.users.create_index(
                [("country", 1)],
                name="idx_analytics_users_country",
            ),
            self.users.create_index(
                [("preferred_language", 1)],
                name="idx_analytics_users_language",
            ),
            self.wallets.create_index(
                [("created_at", 1)],
                name="idx_analytics_wallets_created_at",
            ),
            self.transactions.create_index(
                [("created_at", 1), ("transaction_type", 1)],
                name="idx_analytics_transactions_created_type",
            ),
            self.games.create_index(
                [("created_at", 1)],
                name="idx_analytics_games_created_at",
            ),
            self.games.create_index(
                [("play_count", -1)],
                name="idx_analytics_games_play_count",
            ),
        )

    @staticmethod
    def _date_match(
        field: str,
        start_date: datetime | None,
        end_date: datetime | None,
    ) -> dict[str, Any]:
        date_filter: dict[str, Any] = {}

        if start_date is not None:
            date_filter["$gte"] = start_date

        if end_date is not None:
            date_filter["$lte"] = end_date

        if not date_filter:
            return {}

        return {field: date_filter}

    @staticmethod
    def _number_expression(
        field: str,
        *,
        default: int | float = 0,
    ) -> dict[str, Any]:
        return {
            "$convert": {
                "input": field,
                "to": "double",
                "onError": default,
                "onNull": default,
            }
        }

    @staticmethod
    def _integer_expression(
        field: str,
        *,
        default: int = 0,
    ) -> dict[str, Any]:
        return {
            "$convert": {
                "input": field,
                "to": "long",
                "onError": default,
                "onNull": default,
            }
        }

    @staticmethod
    def _date_bucket_expression(
        field: str,
        granularity: AnalyticsGranularity,
    ) -> dict[str, Any]:
        formats: dict[AnalyticsGranularity, str] = {
            "hour": "%Y-%m-%dT%H:00:00Z",
            "day": "%Y-%m-%dT00:00:00Z",
            "week": "%G-W%V",
            "month": "%Y-%m-01T00:00:00Z",
        }

        return {
            "$dateToString": {
                "format": formats[granularity],
                "date": field,
                "timezone": "UTC",
            }
        }

    @staticmethod
    def _date_label_expression(
        field: str,
        granularity: AnalyticsGranularity,
    ) -> dict[str, Any]:
        formats: dict[AnalyticsGranularity, str] = {
            "hour": "%Y-%m-%d %H:00",
            "day": "%Y-%m-%d",
            "week": "%G-W%V",
            "month": "%Y-%m",
        }

        return {
            "$dateToString": {
                "format": formats[granularity],
                "date": field,
                "timezone": "UTC",
            }
        }

    @staticmethod
    async def _first_aggregation_row(
        collection,
        pipeline: list[dict[str, Any]],
        defaults: dict[str, Any],
    ) -> dict[str, Any]:
        cursor = await collection.aggregate(pipeline)
        rows = await cursor.to_list(length=1)

        if not rows:
            return dict(defaults)

        result = dict(defaults)
        result.update(rows[0])
        result.pop("_id", None)

        return result

    async def get_overview(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        previous_start_date: datetime,
        previous_end_date: datetime,
        today_start: datetime,
        month_start: datetime,
    ) -> dict[str, Any]:
        (
            users,
            previous_users,
            wallets,
            transactions,
            games,
            recharge,
        ) = await asyncio.gather(
            self.get_user_summary(
                start_date=start_date,
                end_date=end_date,
                today_start=today_start,
                month_start=month_start,
            ),
            self.get_user_period_count(
                start_date=previous_start_date,
                end_date=previous_end_date,
            ),
            self.get_wallet_summary(),
            self.get_transaction_summary(
                start_date=start_date,
                end_date=end_date,
                today_start=today_start,
            ),
            self.get_game_summary(),
            self.get_recharge_summary(),
        )

        users["previous_period_new_users"] = previous_users

        return {
            "users": users,
            "wallet": wallets,
            "transactions": transactions,
            "games": games,
            "recharge": recharge,
        }

    async def get_user_period_count(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
    ) -> int:
        return await self.users.count_documents(
            self._date_match(
                "created_at",
                start_date,
                end_date,
            )
        )

    async def get_user_summary(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        today_start: datetime,
        month_start: datetime,
    ) -> dict[str, Any]:
        defaults = {
            "total_users": 0,
            "total_players": 0,
            "admin_users": 0,
            "super_admin_users": 0,
            "active_users": 0,
            "pending_users": 0,
            "suspended_users": 0,
            "blocked_users": 0,
            "verified_users": 0,
            "unverified_users": 0,
            "new_users_today": 0,
            "new_users_in_range": 0,
            "returning_users": 0,
            "daily_active_users": 0,
            "monthly_active_users": 0,
        }

        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_users": {"$sum": 1},
                    "total_players": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        {"$ifNull": ["$role", "player"]},
                                        "player",
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "admin_users": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$role", "admin"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "super_admin_users": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$role", "super_admin"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "active_users": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        {
                                            "$ifNull": [
                                                "$account_status",
                                                "active",
                                            ]
                                        },
                                        "active",
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "pending_users": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$account_status", "pending"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "suspended_users": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$account_status", "suspended"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "blocked_users": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$account_status", "blocked"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "verified_users": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$email_verified", True]},
                                1,
                                0,
                            ]
                        }
                    },
                    "unverified_users": {
                        "$sum": {
                            "$cond": [
                                {"$ne": ["$email_verified", True]},
                                1,
                                0,
                            ]
                        }
                    },
                    "new_users_today": {
                        "$sum": {
                            "$cond": [
                                {"$gte": ["$created_at", today_start]},
                                1,
                                0,
                            ]
                        }
                    },
                    "new_users_in_range": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$and": [
                                        {"$gte": ["$created_at", start_date]},
                                        {"$lte": ["$created_at", end_date]},
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "returning_users": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$and": [
                                        {"$lt": ["$created_at", start_date]},
                                        {
                                            "$gte": [
                                                "$last_login_at",
                                                start_date,
                                            ]
                                        },
                                        {
                                            "$lte": [
                                                "$last_login_at",
                                                end_date,
                                            ]
                                        },
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "daily_active_users": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$and": [
                                        {"$ne": ["$last_login_at", None]},
                                        {
                                            "$gte": [
                                                "$last_login_at",
                                                today_start,
                                            ]
                                        },
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "monthly_active_users": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$and": [
                                        {"$ne": ["$last_login_at", None]},
                                        {
                                            "$gte": [
                                                "$last_login_at",
                                                month_start,
                                            ]
                                        },
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                }
            },
            {"$project": {"_id": 0}},
        ]

        result = await self._first_aggregation_row(
            self.users,
            pipeline,
            defaults,
        )

        return {
            key: int(result.get(key, 0) or 0)
            for key in defaults
        }

    async def get_user_analytics(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        previous_start_date: datetime,
        previous_end_date: datetime,
        today_start: datetime,
        month_start: datetime,
        granularity: AnalyticsGranularity,
    ) -> dict[str, Any]:
        (
            summary,
            previous_period_new_users,
            registration_growth,
            users_by_role,
            users_by_status,
            users_by_country,
            users_by_language,
            verification_distribution,
        ) = await asyncio.gather(
            self.get_user_summary(
                start_date=start_date,
                end_date=end_date,
                today_start=today_start,
                month_start=month_start,
            ),
            self.get_user_period_count(
                start_date=previous_start_date,
                end_date=previous_end_date,
            ),
            self.get_user_registration_growth(
                start_date=start_date,
                end_date=end_date,
                granularity=granularity,
            ),
            self.get_user_group_distribution("role"),
            self.get_user_group_distribution("account_status"),
            self.get_user_group_distribution("country"),
            self.get_user_group_distribution("preferred_language"),
            self.get_verification_distribution(),
        )

        summary["previous_period_new_users"] = previous_period_new_users

        return {
            "summary": summary,
            "registration_growth": registration_growth,
            "users_by_role": users_by_role,
            "users_by_status": users_by_status,
            "users_by_country": users_by_country,
            "users_by_language": users_by_language,
            "verification_distribution": verification_distribution,
        }

    async def get_user_registration_growth(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        granularity: AnalyticsGranularity,
    ) -> list[dict[str, Any]]:
        pipeline = [
            {
                "$match": {
                    **self._date_match(
                        "created_at",
                        start_date,
                        end_date,
                    ),
                    "created_at": {
                        "$type": "date",
                        "$gte": start_date,
                        "$lte": end_date,
                    },
                }
            },
            {
                "$group": {
                    "_id": self._date_bucket_expression(
                        "$created_at",
                        granularity,
                    ),
                    "label": {
                        "$first": self._date_label_expression(
                            "$created_at",
                            granularity,
                        )
                    },
                    "value": {"$sum": 1},
                    "date": {"$min": "$created_at"},
                }
            },
            {"$sort": {"date": 1}},
            {
                "$project": {
                    "_id": 0,
                    "label": 1,
                    "date": 1,
                    "value": 1,
                }
            },
        ]

        cursor = await self.users.aggregate(pipeline)
        rows = await cursor.to_list(length=None)

        return [
            {
                "label": str(row.get("label") or ""),
                "date": row.get("date"),
                "value": int(row.get("value", 0) or 0),
            }
            for row in rows
        ]

    async def get_user_group_distribution(
        self,
        field: str,
    ) -> list[dict[str, Any]]:
        default_labels = {
            "role": "player",
            "account_status": "active",
            "country": "Unknown",
            "preferred_language": "Unknown",
        }

        default_label = default_labels.get(field, "Unknown")

        pipeline = [
            {
                "$group": {
                    "_id": {
                        "$let": {
                            "vars": {
                                "normalized": {
                                    "$trim": {
                                        "input": {
                                            "$convert": {
                                                "input": {
                                                    "$ifNull": [
                                                        f"${field}",
                                                        default_label,
                                                    ]
                                                },
                                                "to": "string",
                                                "onError": default_label,
                                                "onNull": default_label,
                                            }
                                        }
                                    }
                                }
                            },
                            "in": {
                                "$cond": [
                                    {"$eq": ["$$normalized", ""]},
                                    default_label,
                                    "$$normalized",
                                ]
                            },
                        }
                    },
                    "value": {"$sum": 1},
                }
            },
            {"$sort": {"value": -1, "_id": 1}},
            {
                "$project": {
                    "_id": 0,
                    "label": "$_id",
                    "value": 1,
                }
            },
        ]

        cursor = await self.users.aggregate(pipeline)
        rows = await cursor.to_list(length=None)

        return [
            {
                "label": str(row.get("label") or default_label),
                "value": int(row.get("value", 0) or 0),
            }
            for row in rows
        ]

    async def get_verification_distribution(self) -> list[dict[str, Any]]:
        pipeline = [
            {
                "$group": {
                    "_id": {
                        "$cond": [
                            {"$eq": ["$email_verified", True]},
                            "Verified",
                            "Unverified",
                        ]
                    },
                    "value": {"$sum": 1},
                }
            },
            {"$sort": {"value": -1}},
            {
                "$project": {
                    "_id": 0,
                    "label": "$_id",
                    "value": 1,
                }
            },
        ]

        cursor = await self.users.aggregate(pipeline)
        rows = await cursor.to_list(length=2)

        return [
            {
                "label": str(row.get("label") or "Unverified"),
                "value": int(row.get("value", 0) or 0),
            }
            for row in rows
        ]

    async def get_wallet_summary(self) -> dict[str, Any]:
        defaults = {
            "total_wallets": 0,
            "active_wallets": 0,
            "frozen_wallets": 0,
            "zero_balance_wallets": 0,
            "positive_balance_wallets": 0,
            "total_coins_in_circulation": 0,
            "average_wallet_balance": 0.0,
            "minimum_wallet_balance": 0,
            "maximum_wallet_balance": 0,
        }

        balance = self._integer_expression("$balance")

        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_wallets": {"$sum": 1},
                    "active_wallets": {
                        "$sum": {
                            "$cond": [
                                {"$ne": ["$is_frozen", True]},
                                1,
                                0,
                            ]
                        }
                    },
                    "frozen_wallets": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$is_frozen", True]},
                                1,
                                0,
                            ]
                        }
                    },
                    "zero_balance_wallets": {
                        "$sum": {
                            "$cond": [
                                {"$eq": [balance, 0]},
                                1,
                                0,
                            ]
                        }
                    },
                    "positive_balance_wallets": {
                        "$sum": {
                            "$cond": [
                                {"$gt": [balance, 0]},
                                1,
                                0,
                            ]
                        }
                    },
                    "total_coins_in_circulation": {
                        "$sum": balance
                    },
                    "average_wallet_balance": {
                        "$avg": balance
                    },
                    "minimum_wallet_balance": {
                        "$min": balance
                    },
                    "maximum_wallet_balance": {
                        "$max": balance
                    },
                }
            },
            {"$project": {"_id": 0}},
        ]

        result = await self._first_aggregation_row(
            self.wallets,
            pipeline,
            defaults,
        )

        return {
            "total_wallets": int(result.get("total_wallets", 0) or 0),
            "active_wallets": int(result.get("active_wallets", 0) or 0),
            "frozen_wallets": int(result.get("frozen_wallets", 0) or 0),
            "zero_balance_wallets": int(
                result.get("zero_balance_wallets", 0) or 0
            ),
            "positive_balance_wallets": int(
                result.get("positive_balance_wallets", 0) or 0
            ),
            "total_coins_in_circulation": int(
                result.get("total_coins_in_circulation", 0) or 0
            ),
            "average_wallet_balance": float(
                result.get("average_wallet_balance", 0) or 0
            ),
            "minimum_wallet_balance": max(
                int(result.get("minimum_wallet_balance", 0) or 0),
                0,
            ),
            "maximum_wallet_balance": max(
                int(result.get("maximum_wallet_balance", 0) or 0),
                0,
            ),
        }

    async def get_wallet_analytics(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        granularity: AnalyticsGranularity,
    ) -> dict[str, Any]:
        summary, growth, balance_trend, balance_distribution = (
            await asyncio.gather(
                self.get_wallet_summary(),
                self.get_wallet_growth(
                    start_date=start_date,
                    end_date=end_date,
                    granularity=granularity,
                ),
                self.get_wallet_balance_trend(
                    start_date=start_date,
                    end_date=end_date,
                    granularity=granularity,
                ),
                self.get_wallet_balance_distribution(),
            )
        )

        return {
            "summary": summary,
            "wallet_growth": growth,
            "balance_trend": balance_trend,
            "balance_distribution": balance_distribution,
        }

    async def get_wallet_growth(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        granularity: AnalyticsGranularity,
    ) -> list[dict[str, Any]]:
        pipeline = [
            {
                "$match": {
                    "created_at": {
                        "$type": "date",
                        "$gte": start_date,
                        "$lte": end_date,
                    }
                }
            },
            {
                "$group": {
                    "_id": self._date_bucket_expression(
                        "$created_at",
                        granularity,
                    ),
                    "label": {
                        "$first": self._date_label_expression(
                            "$created_at",
                            granularity,
                        )
                    },
                    "date": {"$min": "$created_at"},
                    "value": {"$sum": 1},
                }
            },
            {"$sort": {"date": 1}},
            {
                "$project": {
                    "_id": 0,
                    "label": 1,
                    "date": 1,
                    "value": 1,
                }
            },
        ]

        cursor = await self.wallets.aggregate(pipeline)
        rows = await cursor.to_list(length=None)

        return [
            {
                "label": str(row.get("label") or ""),
                "date": row.get("date"),
                "value": int(row.get("value", 0) or 0),
            }
            for row in rows
        ]

    async def get_wallet_balance_trend(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        granularity: AnalyticsGranularity,
    ) -> list[dict[str, Any]]:
        amount = self._number_expression("$amount")

        signed_amount = {
            "$switch": {
                "branches": [
                    {
                        "case": {
                            "$in": [
                                "$transaction_type",
                                list(self.CREDIT_TRANSACTION_TYPES),
                            ]
                        },
                        "then": amount,
                    },
                    {
                        "case": {
                            "$in": [
                                "$transaction_type",
                                list(self.DEBIT_TRANSACTION_TYPES),
                            ]
                        },
                        "then": {"$multiply": [amount, -1]},
                    },
                ],
                "default": 0,
            }
        }

        pipeline = [
            {
                "$match": {
                    "created_at": {
                        "$type": "date",
                        "$gte": start_date,
                        "$lte": end_date,
                    }
                }
            },
            {
                "$group": {
                    "_id": self._date_bucket_expression(
                        "$created_at",
                        granularity,
                    ),
                    "label": {
                        "$first": self._date_label_expression(
                            "$created_at",
                            granularity,
                        )
                    },
                    "date": {"$min": "$created_at"},
                    "value": {"$sum": signed_amount},
                }
            },
            {"$sort": {"date": 1}},
            {
                "$project": {
                    "_id": 0,
                    "label": 1,
                    "date": 1,
                    "value": 1,
                }
            },
        ]

        cursor = await self.transactions.aggregate(pipeline)
        rows = await cursor.to_list(length=None)

        return [
            {
                "label": str(row.get("label") or ""),
                "date": row.get("date"),
                "value": float(row.get("value", 0) or 0),
            }
            for row in rows
        ]

    async def get_wallet_balance_distribution(
        self,
    ) -> list[dict[str, Any]]:
        balance = self._integer_expression("$balance")

        pipeline = [
            {
                "$project": {
                    "balance": balance,
                }
            },
            {
                "$bucket": {
                    "groupBy": "$balance",
                    "boundaries": [
                        0,
                        1,
                        101,
                        501,
                        1001,
                        5001,
                        10001,
                        50001,
                    ],
                    "default": "50001+",
                    "output": {
                        "wallet_count": {"$sum": 1},
                    },
                }
            },
            {"$sort": {"_id": 1}},
        ]

        cursor = await self.wallets.aggregate(pipeline)
        rows = await cursor.to_list(length=None)

        bucket_map: dict[Any, dict[str, Any]] = {
            0: {
                "label": "0",
                "minimum_balance": 0,
                "maximum_balance": 0,
            },
            1: {
                "label": "1â€“100",
                "minimum_balance": 1,
                "maximum_balance": 100,
            },
            101: {
                "label": "101â€“500",
                "minimum_balance": 101,
                "maximum_balance": 500,
            },
            501: {
                "label": "501â€“1,000",
                "minimum_balance": 501,
                "maximum_balance": 1000,
            },
            1001: {
                "label": "1,001â€“5,000",
                "minimum_balance": 1001,
                "maximum_balance": 5000,
            },
            5001: {
                "label": "5,001â€“10,000",
                "minimum_balance": 5001,
                "maximum_balance": 10000,
            },
            10001: {
                "label": "10,001â€“50,000",
                "minimum_balance": 10001,
                "maximum_balance": 50000,
            },
            "50001+": {
                "label": "50,001+",
                "minimum_balance": 50001,
                "maximum_balance": None,
            },
        }

        result: list[dict[str, Any]] = []

        for row in rows:
            bucket = bucket_map.get(row.get("_id"))

            if bucket is None:
                continue

            result.append(
                {
                    **bucket,
                    "wallet_count": int(
                        row.get("wallet_count", 0) or 0
                    ),
                }
            )

        return result

    async def get_transaction_summary(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        today_start: datetime | None = None,
    ) -> dict[str, Any]:
        defaults = {
            "total_transactions": 0,
            "purchase_transactions": 0,
            "game_entry_transactions": 0,
            "admin_credit_transactions": 0,
            "admin_debit_transactions": 0,
            "refund_transactions": 0,
            "total_credited_coins": 0,
            "total_debited_coins": 0,
            "net_coin_flow": 0,
            "average_transaction_amount": 0.0,
            "minimum_transaction_amount": 0,
            "maximum_transaction_amount": 0,
            "transactions_today": 0,
        }

        amount = self._integer_expression("$amount")

        pipeline = [
            {
                "$match": {
                    "created_at": {
                        "$gte": start_date,
                        "$lte": end_date,
                    }
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_transactions": {"$sum": 1},
                    "purchase_transactions": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$transaction_type",
                                        "purchase",
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "game_entry_transactions": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$transaction_type",
                                        "game_entry",
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "admin_credit_transactions": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$transaction_type",
                                        "admin_credit",
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "admin_debit_transactions": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$transaction_type",
                                        "admin_debit",
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "refund_transactions": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$transaction_type",
                                        "refund",
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "total_credited_coins": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$in": [
                                        "$transaction_type",
                                        list(
                                            self.CREDIT_TRANSACTION_TYPES
                                        ),
                                    ]
                                },
                                amount,
                                0,
                            ]
                        }
                    },
                    "total_debited_coins": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$in": [
                                        "$transaction_type",
                                        list(
                                            self.DEBIT_TRANSACTION_TYPES
                                        ),
                                    ]
                                },
                                amount,
                                0,
                            ]
                        }
                    },
                    "average_transaction_amount": {
                        "$avg": amount
                    },
                    "minimum_transaction_amount": {
                        "$min": amount
                    },
                    "maximum_transaction_amount": {
                        "$max": amount
                    },
                    "transactions_today": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$and": [
                                        {
                                            "$ne": [
                                                today_start,
                                                None,
                                            ]
                                        },
                                        {
                                            "$gte": [
                                                "$created_at",
                                                today_start,
                                            ]
                                        },
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                }
            },
            {
                "$addFields": {
                    "net_coin_flow": {
                        "$subtract": [
                            "$total_credited_coins",
                            "$total_debited_coins",
                        ]
                    }
                }
            },
            {"$project": {"_id": 0}},
        ]

        result = await self._first_aggregation_row(
            self.transactions,
            pipeline,
            defaults,
        )

        return {
            "total_transactions": int(
                result.get("total_transactions", 0) or 0
            ),
            "purchase_transactions": int(
                result.get("purchase_transactions", 0) or 0
            ),
            "game_entry_transactions": int(
                result.get("game_entry_transactions", 0) or 0
            ),
            "admin_credit_transactions": int(
                result.get("admin_credit_transactions", 0) or 0
            ),
            "admin_debit_transactions": int(
                result.get("admin_debit_transactions", 0) or 0
            ),
            "refund_transactions": int(
                result.get("refund_transactions", 0) or 0
            ),
            "total_credited_coins": int(
                result.get("total_credited_coins", 0) or 0
            ),
            "total_debited_coins": int(
                result.get("total_debited_coins", 0) or 0
            ),
            "net_coin_flow": int(
                result.get("net_coin_flow", 0) or 0
            ),
            "average_transaction_amount": float(
                result.get("average_transaction_amount", 0) or 0
            ),
            "minimum_transaction_amount": max(
                int(
                    result.get(
                        "minimum_transaction_amount",
                        0,
                    )
                    or 0
                ),
                0,
            ),
            "maximum_transaction_amount": max(
                int(
                    result.get(
                        "maximum_transaction_amount",
                        0,
                    )
                    or 0
                ),
                0,
            ),
            "transactions_today": int(
                result.get("transactions_today", 0) or 0
            ),
        }

    async def get_transaction_analytics(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        granularity: AnalyticsGranularity,
    ) -> dict[str, Any]:
        (
            summary,
            transaction_trend,
            amount_trend,
            transactions_by_type,
            amount_by_type,
            hourly_distribution,
        ) = await asyncio.gather(
            self.get_transaction_summary(
                start_date=start_date,
                end_date=end_date,
            ),
            self.get_transaction_count_trend(
                start_date=start_date,
                end_date=end_date,
                granularity=granularity,
            ),
            self.get_transaction_amount_trend(
                start_date=start_date,
                end_date=end_date,
                granularity=granularity,
            ),
            self.get_transactions_by_type(
                start_date=start_date,
                end_date=end_date,
                count_values=True,
            ),
            self.get_transactions_by_type(
                start_date=start_date,
                end_date=end_date,
                count_values=False,
            ),
            self.get_hourly_transaction_distribution(
                start_date=start_date,
                end_date=end_date,
            ),
        )

        return {
            "summary": summary,
            "transaction_trend": transaction_trend,
            "amount_trend": amount_trend,
            "transactions_by_type": transactions_by_type,
            "amount_by_type": amount_by_type,
            "hourly_distribution": hourly_distribution,
        }

    async def get_transaction_count_trend(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        granularity: AnalyticsGranularity,
    ) -> list[dict[str, Any]]:
        pipeline = [
            {
                "$match": {
                    "created_at": {
                        "$type": "date",
                        "$gte": start_date,
                        "$lte": end_date,
                    }
                }
            },
            {
                "$group": {
                    "_id": self._date_bucket_expression(
                        "$created_at",
                        granularity,
                    ),
                    "label": {
                        "$first": self._date_label_expression(
                            "$created_at",
                            granularity,
                        )
                    },
                    "date": {"$min": "$created_at"},
                    "value": {"$sum": 1},
                }
            },
            {"$sort": {"date": 1}},
            {
                "$project": {
                    "_id": 0,
                    "label": 1,
                    "date": 1,
                    "value": 1,
                }
            },
        ]

        cursor = await self.transactions.aggregate(pipeline)
        rows = await cursor.to_list(length=None)

        return [
            {
                "label": str(row.get("label") or ""),
                "date": row.get("date"),
                "value": int(row.get("value", 0) or 0),
            }
            for row in rows
        ]

    async def get_transaction_amount_trend(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        granularity: AnalyticsGranularity,
    ) -> list[dict[str, Any]]:
        amount = self._number_expression("$amount")

        pipeline = [
            {
                "$match": {
                    "created_at": {
                        "$type": "date",
                        "$gte": start_date,
                        "$lte": end_date,
                    }
                }
            },
            {
                "$group": {
                    "_id": self._date_bucket_expression(
                        "$created_at",
                        granularity,
                    ),
                    "label": {
                        "$first": self._date_label_expression(
                            "$created_at",
                            granularity,
                        )
                    },
                    "date": {"$min": "$created_at"},
                    "value": {"$sum": amount},
                }
            },
            {"$sort": {"date": 1}},
            {
                "$project": {
                    "_id": 0,
                    "label": 1,
                    "date": 1,
                    "value": 1,
                }
            },
        ]

        cursor = await self.transactions.aggregate(pipeline)
        rows = await cursor.to_list(length=None)

        return [
            {
                "label": str(row.get("label") or ""),
                "date": row.get("date"),
                "value": float(row.get("value", 0) or 0),
            }
            for row in rows
        ]

    async def get_transactions_by_type(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        count_values: bool,
    ) -> list[dict[str, Any]]:
        amount = self._number_expression("$amount")

        value_expression: dict[str, Any] | int

        if count_values:
            value_expression = 1
        else:
            value_expression = amount

        pipeline = [
            {
                "$match": {
                    "created_at": {
                        "$gte": start_date,
                        "$lte": end_date,
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "$ifNull": [
                            "$transaction_type",
                            "unknown",
                        ]
                    },
                    "value": {
                        "$sum": value_expression
                    },
                }
            },
            {"$sort": {"value": -1, "_id": 1}},
            {
                "$project": {
                    "_id": 0,
                    "label": "$_id",
                    "value": 1,
                }
            },
        ]

        cursor = await self.transactions.aggregate(pipeline)
        rows = await cursor.to_list(length=None)

        return [
            {
                "label": str(row.get("label") or "unknown"),
                "value": (
                    int(row.get("value", 0) or 0)
                    if count_values
                    else float(row.get("value", 0) or 0)
                ),
            }
            for row in rows
        ]

    async def get_hourly_transaction_distribution(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
    ) -> list[dict[str, Any]]:
        amount = self._integer_expression("$amount")

        pipeline = [
            {
                "$match": {
                    "created_at": {
                        "$type": "date",
                        "$gte": start_date,
                        "$lte": end_date,
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "$hour": {
                            "date": "$created_at",
                            "timezone": "UTC",
                        }
                    },
                    "transaction_count": {"$sum": 1},
                    "total_amount": {"$sum": amount},
                }
            },
            {"$sort": {"_id": 1}},
            {
                "$project": {
                    "_id": 0,
                    "hour": "$_id",
                    "transaction_count": 1,
                    "total_amount": 1,
                }
            },
        ]

        cursor = await self.transactions.aggregate(pipeline)
        rows = await cursor.to_list(length=24)

        row_map = {
            int(row.get("hour", 0)): row
            for row in rows
        }

        return [
            {
                "hour": hour,
                "label": f"{hour:02d}:00",
                "transaction_count": int(
                    row_map.get(hour, {}).get(
                        "transaction_count",
                        0,
                    )
                    or 0
                ),
                "total_amount": int(
                    row_map.get(hour, {}).get(
                        "total_amount",
                        0,
                    )
                    or 0
                ),
            }
            for hour in range(24)
        ]

    async def get_revenue_analytics(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        previous_start_date: datetime,
        previous_end_date: datetime,
        granularity: AnalyticsGranularity,
    ) -> dict[str, Any]:
        (
            current_summary,
            previous_summary,
            revenue_trend,
            credit_trend,
            debit_trend,
            revenue_by_transaction_type,
        ) = await asyncio.gather(
            self.get_revenue_summary(
                start_date=start_date,
                end_date=end_date,
            ),
            self.get_revenue_summary(
                start_date=previous_start_date,
                end_date=previous_end_date,
            ),
            self.get_revenue_trend(
                start_date=start_date,
                end_date=end_date,
                granularity=granularity,
                trend_type="net",
            ),
            self.get_revenue_trend(
                start_date=start_date,
                end_date=end_date,
                granularity=granularity,
                trend_type="credit",
            ),
            self.get_revenue_trend(
                start_date=start_date,
                end_date=end_date,
                granularity=granularity,
                trend_type="debit",
            ),
            self.get_transactions_by_type(
                start_date=start_date,
                end_date=end_date,
                count_values=False,
            ),
        )

        current_summary["previous_net_coin_flow"] = int(
            previous_summary.get("net_coin_flow", 0) or 0
        )

        return {
            "summary": current_summary,
            "revenue_trend": revenue_trend,
            "credit_trend": credit_trend,
            "debit_trend": debit_trend,
            "revenue_by_transaction_type": revenue_by_transaction_type,
        }

    async def get_revenue_summary(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
    ) -> dict[str, Any]:
        defaults = {
            "total_credited_coins": 0,
            "total_debited_coins": 0,
            "purchase_coins": 0,
            "refund_coins": 0,
            "game_entry_coins": 0,
            "admin_credit_coins": 0,
            "admin_debit_coins": 0,
            "net_coin_flow": 0,
            "average_credit_amount": 0.0,
            "average_debit_amount": 0.0,
            "credit_transaction_count": 0,
            "debit_transaction_count": 0,
        }

        amount = self._number_expression("$amount")

        pipeline = [
            {
                "$match": {
                    "created_at": {
                        "$gte": start_date,
                        "$lte": end_date,
                    }
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_credited_coins": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$in": [
                                        "$transaction_type",
                                        list(
                                            self.CREDIT_TRANSACTION_TYPES
                                        ),
                                    ]
                                },
                                amount,
                                0,
                            ]
                        }
                    },
                    "total_debited_coins": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$in": [
                                        "$transaction_type",
                                        list(
                                            self.DEBIT_TRANSACTION_TYPES
                                        ),
                                    ]
                                },
                                amount,
                                0,
                            ]
                        }
                    },
                    "purchase_coins": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$transaction_type",
                                        "purchase",
                                    ]
                                },
                                amount,
                                0,
                            ]
                        }
                    },
                    "refund_coins": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$transaction_type",
                                        "refund",
                                    ]
                                },
                                amount,
                                0,
                            ]
                        }
                    },
                    "game_entry_coins": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$transaction_type",
                                        "game_entry",
                                    ]
                                },
                                amount,
                                0,
                            ]
                        }
                    },
                    "admin_credit_coins": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$transaction_type",
                                        "admin_credit",
                                    ]
                                },
                                amount,
                                0,
                            ]
                        }
                    },
                    "admin_debit_coins": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$transaction_type",
                                        "admin_debit",
                                    ]
                                },
                                amount,
                                0,
                            ]
                        }
                    },
                    "credit_transaction_count": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$in": [
                                        "$transaction_type",
                                        list(
                                            self.CREDIT_TRANSACTION_TYPES
                                        ),
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "debit_transaction_count": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$in": [
                                        "$transaction_type",
                                        list(
                                            self.DEBIT_TRANSACTION_TYPES
                                        ),
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                }
            },
            {
                "$addFields": {
                    "net_coin_flow": {
                        "$subtract": [
                            "$total_credited_coins",
                            "$total_debited_coins",
                        ]
                    },
                    "average_credit_amount": {
                        "$cond": [
                            {
                                "$gt": [
                                    "$credit_transaction_count",
                                    0,
                                ]
                            },
                            {
                                "$divide": [
                                    "$total_credited_coins",
                                    "$credit_transaction_count",
                                ]
                            },
                            0,
                        ]
                    },
                    "average_debit_amount": {
                        "$cond": [
                            {
                                "$gt": [
                                    "$debit_transaction_count",
                                    0,
                                ]
                            },
                            {
                                "$divide": [
                                    "$total_debited_coins",
                                    "$debit_transaction_count",
                                ]
                            },
                            0,
                        ]
                    },
                }
            },
            {"$project": {"_id": 0}},
        ]

        result = await self._first_aggregation_row(
            self.transactions,
            pipeline,
            defaults,
        )

        return {
            "total_credited_coins": int(
                result.get("total_credited_coins", 0) or 0
            ),
            "total_debited_coins": int(
                result.get("total_debited_coins", 0) or 0
            ),
            "purchase_coins": int(
                result.get("purchase_coins", 0) or 0
            ),
            "refund_coins": int(
                result.get("refund_coins", 0) or 0
            ),
            "game_entry_coins": int(
                result.get("game_entry_coins", 0) or 0
            ),
            "admin_credit_coins": int(
                result.get("admin_credit_coins", 0) or 0
            ),
            "admin_debit_coins": int(
                result.get("admin_debit_coins", 0) or 0
            ),
            "net_coin_flow": int(
                result.get("net_coin_flow", 0) or 0
            ),
            "average_credit_amount": float(
                result.get("average_credit_amount", 0) or 0
            ),
            "average_debit_amount": float(
                result.get("average_debit_amount", 0) or 0
            ),
        }

    async def get_revenue_trend(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        granularity: AnalyticsGranularity,
        trend_type: Literal["credit", "debit", "net"],
    ) -> list[dict[str, Any]]:
        amount = self._number_expression("$amount")

        credit_amount = {
            "$cond": [
                {
                    "$in": [
                        "$transaction_type",
                        list(self.CREDIT_TRANSACTION_TYPES),
                    ]
                },
                amount,
                0,
            ]
        }

        debit_amount = {
            "$cond": [
                {
                    "$in": [
                        "$transaction_type",
                        list(self.DEBIT_TRANSACTION_TYPES),
                    ]
                },
                amount,
                0,
            ]
        }

        if trend_type == "credit":
            value_expression = credit_amount
        elif trend_type == "debit":
            value_expression = debit_amount
        else:
            value_expression = {
                "$subtract": [
                    credit_amount,
                    debit_amount,
                ]
            }

        pipeline = [
            {
                "$match": {
                    "created_at": {
                        "$type": "date",
                        "$gte": start_date,
                        "$lte": end_date,
                    }
                }
            },
            {
                "$group": {
                    "_id": self._date_bucket_expression(
                        "$created_at",
                        granularity,
                    ),
                    "label": {
                        "$first": self._date_label_expression(
                            "$created_at",
                            granularity,
                        )
                    },
                    "date": {"$min": "$created_at"},
                    "value": {
                        "$sum": value_expression
                    },
                }
            },
            {"$sort": {"date": 1}},
            {
                "$project": {
                    "_id": 0,
                    "label": 1,
                    "date": 1,
                    "value": 1,
                }
            },
        ]

        cursor = await self.transactions.aggregate(pipeline)
        rows = await cursor.to_list(length=None)

        return [
            {
                "label": str(row.get("label") or ""),
                "date": row.get("date"),
                "value": float(row.get("value", 0) or 0),
            }
            for row in rows
        ]

    async def get_game_summary(self) -> dict[str, Any]:
        defaults = {
            "total_games": 0,
            "published_games": 0,
            "draft_games": 0,
            "maintenance_games": 0,
            "disabled_games": 0,
            "featured_games": 0,
            "landing_page_games": 0,
            "total_play_count": 0,
            "games_played_today": 0,
        }

        play_count = self._integer_expression("$play_count")

        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_games": {"$sum": 1},
                    "published_games": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$status", "published"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "draft_games": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        {
                                            "$ifNull": [
                                                "$status",
                                                "draft",
                                            ]
                                        },
                                        "draft",
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "maintenance_games": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$status",
                                        "maintenance",
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "disabled_games": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$status", "disabled"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "featured_games": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$is_featured", True]},
                                1,
                                0,
                            ]
                        }
                    },
                    "landing_page_games": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$show_on_landing_page",
                                        True,
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "total_play_count": {
                        "$sum": play_count
                    },
                }
            },
            {
                "$addFields": {
                    "games_played_today": 0
                }
            },
            {"$project": {"_id": 0}},
        ]

        result = await self._first_aggregation_row(
            self.games,
            pipeline,
            defaults,
        )

        return {
            key: int(result.get(key, 0) or 0)
            for key in defaults
        }

    async def get_game_analytics(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        granularity: AnalyticsGranularity,
        top_limit: int = 10,
    ) -> dict[str, Any]:
        (
            summary,
            creation_trend,
            games_by_status,
            games_by_category,
            games_by_provider,
            plays_by_category,
            plays_by_provider,
            top_games,
            least_played_games,
        ) = await asyncio.gather(
            self.get_game_summary(),
            self.get_game_creation_trend(
                start_date=start_date,
                end_date=end_date,
                granularity=granularity,
            ),
            self.get_game_distribution(
                group_field="status",
                value_type="count",
            ),
            self.get_game_distribution(
                group_field="category",
                value_type="count",
            ),
            self.get_game_distribution(
                group_field="provider_name",
                value_type="count",
            ),
            self.get_game_distribution(
                group_field="category",
                value_type="plays",
            ),
            self.get_game_distribution(
                group_field="provider_name",
                value_type="plays",
            ),
            self.get_game_performance(
                limit=top_limit,
                ascending=False,
            ),
            self.get_game_performance(
                limit=top_limit,
                ascending=True,
            ),
        )

        return {
            "summary": summary,
            "game_creation_trend": creation_trend,
            "games_by_status": games_by_status,
            "games_by_category": games_by_category,
            "games_by_provider": games_by_provider,
            "plays_by_category": plays_by_category,
            "plays_by_provider": plays_by_provider,
            "top_games": top_games,
            "least_played_games": least_played_games,
        }

    async def get_game_creation_trend(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        granularity: AnalyticsGranularity,
    ) -> list[dict[str, Any]]:
        pipeline = [
            {
                "$match": {
                    "created_at": {
                        "$type": "date",
                        "$gte": start_date,
                        "$lte": end_date,
                    }
                }
            },
            {
                "$group": {
                    "_id": self._date_bucket_expression(
                        "$created_at",
                        granularity,
                    ),
                    "label": {
                        "$first": self._date_label_expression(
                            "$created_at",
                            granularity,
                        )
                    },
                    "date": {"$min": "$created_at"},
                    "value": {"$sum": 1},
                }
            },
            {"$sort": {"date": 1}},
            {
                "$project": {
                    "_id": 0,
                    "label": 1,
                    "date": 1,
                    "value": 1,
                }
            },
        ]

        cursor = await self.games.aggregate(pipeline)
        rows = await cursor.to_list(length=None)

        return [
            {
                "label": str(row.get("label") or ""),
                "date": row.get("date"),
                "value": int(row.get("value", 0) or 0),
            }
            for row in rows
        ]

    async def get_game_distribution(
        self,
        *,
        group_field: Literal[
            "status",
            "category",
            "provider_name",
        ],
        value_type: Literal["count", "plays"],
    ) -> list[dict[str, Any]]:
        defaults = {
            "status": "draft",
            "category": "other",
            "provider_name": "Unknown",
        }

        default_label = defaults[group_field]

        if value_type == "count":
            value_expression: int | dict[str, Any] = 1
        else:
            value_expression = self._integer_expression(
                "$play_count"
            )

        pipeline = [
            {
                "$group": {
                    "_id": {
                        "$let": {
                            "vars": {
                                "normalized": {
                                    "$trim": {
                                        "input": {
                                            "$convert": {
                                                "input": {
                                                    "$ifNull": [
                                                        f"${group_field}",
                                                        default_label,
                                                    ]
                                                },
                                                "to": "string",
                                                "onError": default_label,
                                                "onNull": default_label,
                                            }
                                        }
                                    }
                                }
                            },
                            "in": {
                                "$cond": [
                                    {"$eq": ["$$normalized", ""]},
                                    default_label,
                                    "$$normalized",
                                ]
                            },
                        }
                    },
                    "value": {
                        "$sum": value_expression
                    },
                }
            },
            {"$sort": {"value": -1, "_id": 1}},
            {
                "$project": {
                    "_id": 0,
                    "label": "$_id",
                    "value": 1,
                }
            },
        ]

        cursor = await self.games.aggregate(pipeline)
        rows = await cursor.to_list(length=None)

        return [
            {
                "label": str(row.get("label") or default_label),
                "value": (
                    int(row.get("value", 0) or 0)
                    if value_type == "count"
                    else float(row.get("value", 0) or 0)
                ),
            }
            for row in rows
        ]

    async def get_game_performance(
        self,
        *,
        limit: int,
        ascending: bool,
    ) -> list[dict[str, Any]]:
        direction = 1 if ascending else -1

        pipeline = [
            {
                "$addFields": {
                    "_analytics_play_count": self._integer_expression(
                        "$play_count"
                    )
                }
            },
            {
                "$sort": {
                    "_analytics_play_count": direction,
                    "name": 1,
                }
            },
            {"$limit": max(1, min(limit, 100))},
            {
                "$project": {
                    "_id": 1,
                    "name": {"$ifNull": ["$name", "Unnamed Game"]},
                    "slug": {"$ifNull": ["$slug", "unknown-game"]},
                    "category": {
                        "$ifNull": ["$category", "other"]
                    },
                    "provider_name": 1,
                    "status": {
                        "$ifNull": ["$status", "draft"]
                    },
                    "is_featured": {
                        "$ifNull": ["$is_featured", False]
                    },
                    "show_on_landing_page": {
                        "$ifNull": [
                            "$show_on_landing_page",
                            False,
                        ]
                    },
                    "play_count": "$_analytics_play_count",
                }
            },
        ]

        cursor = await self.games.aggregate(pipeline)
        rows = await cursor.to_list(length=limit)

        return [
            {
                "game_id": str(row.get("_id")),
                "name": str(
                    row.get("name") or "Unnamed Game"
                ),
                "slug": str(
                    row.get("slug") or "unknown-game"
                ),
                "category": str(
                    row.get("category") or "other"
                ),
                "provider_name": (
                    str(row["provider_name"])
                    if row.get("provider_name")
                    else None
                ),
                "status": str(
                    row.get("status") or "draft"
                ),
                "is_featured": bool(
                    row.get("is_featured", False)
                ),
                "show_on_landing_page": bool(
                    row.get(
                        "show_on_landing_page",
                        False,
                    )
                ),
                "play_count": max(
                    int(row.get("play_count", 0) or 0),
                    0,
                ),
            }
            for row in rows
        ]

    async def get_recharge_summary(self) -> dict[str, Any]:
        defaults = {
            "total_packages": 0,
            "active_packages": 0,
            "inactive_packages": 0,
            "lowest_price": 0.0,
            "highest_price": 0.0,
            "total_base_coins": 0,
            "total_bonus_coins": 0,
        }

        price = self._number_expression("$price")
        coins = self._integer_expression("$coins")
        bonus_coins = self._integer_expression("$bonus_coins")

        pipeline = [
            {
                "$match": {
                    "$or": [
                        {"deleted_at": None},
                        {"deleted_at": {"$exists": False}},
                    ]
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_packages": {"$sum": 1},
                    "active_packages": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$is_active", True]},
                                1,
                                0,
                            ]
                        }
                    },
                    "inactive_packages": {
                        "$sum": {
                            "$cond": [
                                {"$ne": ["$is_active", True]},
                                1,
                                0,
                            ]
                        }
                    },
                    "lowest_price": {"$min": price},
                    "highest_price": {"$max": price},
                    "total_base_coins": {"$sum": coins},
                    "total_bonus_coins": {
                        "$sum": bonus_coins
                    },
                }
            },
            {"$project": {"_id": 0}},
        ]

        result = await self._first_aggregation_row(
            self.recharge_packages,
            pipeline,
            defaults,
        )

        return {
            "total_packages": int(
                result.get("total_packages", 0) or 0
            ),
            "active_packages": int(
                result.get("active_packages", 0) or 0
            ),
            "inactive_packages": int(
                result.get("inactive_packages", 0) or 0
            ),
            "lowest_price": max(
                float(result.get("lowest_price", 0) or 0),
                0,
            ),
            "highest_price": max(
                float(result.get("highest_price", 0) or 0),
                0,
            ),
            "total_base_coins": max(
                int(result.get("total_base_coins", 0) or 0),
                0,
            ),
            "total_bonus_coins": max(
                int(result.get("total_bonus_coins", 0) or 0),
                0,
            ),
        }


analytics_repository = AnalyticsRepository()


__all__ = [
    "AnalyticsGranularity",
    "AnalyticsRepository",
    "analytics_repository",
]
