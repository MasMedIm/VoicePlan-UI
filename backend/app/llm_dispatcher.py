"""Maps LLM function-call events to actual CRUD operations."""

from __future__ import annotations

from datetime import date
from typing import Any

from sqlalchemy.orm import Session

from .crud import create_move, create_task, get_moves, get_tasks
from .models import Move, Task, User


class FunctionCallError(Exception):
    """Raised when an LLM function-call event is invalid or unsupported."""


def _parse_date(val: str | None) -> date | None:
    if val is None:
        return None
    try:
        return date.fromisoformat(val)
    except (TypeError, ValueError):
        raise FunctionCallError(f"Invalid date format: {val!r} – expected YYYY-MM-DD")


def handle_function_call(name: str, args: dict[str, Any], *, db: Session, user: User) -> Any:
    """Dispatch an LLM function call to the appropriate CRUD helper.

    Parameters
    ----------
    name: str
        Name of the function (as emitted by the LLM)
    args: dict
        Arguments payload.
    db: Session
    user: User

    Returns
    -------
    Any – typically a SQLAlchemy model instance.
    """

    if name == "create_move":
        required = {"origin_country", "destination_country"}
        if not required.issubset(args):
            missing = required - set(args)
            raise FunctionCallError(f"create_move missing args: {', '.join(missing)}")
        return create_move(
            db,
            user=user,
            origin_country=args["origin_country"],
            destination_country=args["destination_country"],
            start_date=_parse_date(args.get("start_date")),
        )

    elif name == "create_task":
        required = {"move_id", "title"}
        if not required.issubset(args):
            missing = required - set(args)
            raise FunctionCallError(f"create_task missing args: {', '.join(missing)}")

        # Validate move belongs to user
        move: Move | None = db.query(Move).filter(Move.id == args["move_id"], Move.user_id == user.id).first()
        if not move:
            raise FunctionCallError("Move not found or does not belong to user")

        return create_task(
            db,
            move,
            title=args["title"],
            description=args.get("description"),
            category=args.get("category"),
            due_date=_parse_date(args.get("due_date")),
        )

    # Extend with more operations here ...

    else:
        raise FunctionCallError(f"Unsupported function name: {name}")
