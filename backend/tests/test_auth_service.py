"""AuthService unit tests."""

import pytest
import bcrypt

from backend.data.datastore import DataStore
from backend.exceptions import AuthenticationError
from backend.services.auth_service import AuthService


@pytest.fixture
async def ds(tmp_path):
    return DataStore(base_path=str(tmp_path / "data"))


@pytest.fixture
async def auth_svc(ds):
    return AuthService(datastore=ds)


@pytest.fixture
async def seeded_ds(ds):
    """관리자 + 테이블 + 세션 시드 데이터."""
    pw_hash = bcrypt.hashpw(b"admin123", bcrypt.gensalt(rounds=4)).decode()
    await ds.append("users", "store001", {
        "id": "admin-001",
        "store_id": "store001",
        "username": "admin",
        "password_hash": pw_hash,
        "role": "admin",
    })

    table_hash = bcrypt.hashpw(b"1234", bcrypt.gensalt(rounds=4)).decode()
    await ds.append("tables", "store001", {
        "id": "table-001",
        "store_id": "store001",
        "table_number": 1,
        "password_hash": table_hash,
        "is_active": True,
    })

    await ds.append("sessions", "store001", {
        "id": "T01-20260209120000",
        "store_id": "store001",
        "table_number": 1,
        "status": "active",
        "started_at": "2026-02-09T12:00:00Z",
        "expires_at": "2099-12-31T23:59:59Z",
    })
    return ds


@pytest.mark.asyncio
async def test_login_admin_success(seeded_ds):
    svc = AuthService(datastore=seeded_ds)
    result = await svc.login_admin("store001", "admin", "admin123")
    assert "token" in result
    assert result["user"]["username"] == "admin"


@pytest.mark.asyncio
async def test_login_admin_wrong_password(seeded_ds):
    svc = AuthService(datastore=seeded_ds)
    with pytest.raises(AuthenticationError):
        await svc.login_admin("store001", "admin", "wrong")


@pytest.mark.asyncio
async def test_login_admin_unknown_user(seeded_ds):
    svc = AuthService(datastore=seeded_ds)
    with pytest.raises(AuthenticationError):
        await svc.login_admin("store001", "nobody", "admin123")


@pytest.mark.asyncio
async def test_verify_and_logout(seeded_ds):
    svc = AuthService(datastore=seeded_ds)
    result = await svc.login_admin("store001", "admin", "admin123")
    token = result["token"]

    # 검증 성공
    user = await svc.verify_admin_token(token)
    assert user["username"] == "admin"

    # 로그아웃
    await svc.logout_admin(token)

    # 블랙리스트에 의해 실패
    with pytest.raises(AuthenticationError, match="revoked"):
        await svc.verify_admin_token(token)


@pytest.mark.asyncio
async def test_authenticate_table_success(seeded_ds):
    svc = AuthService(datastore=seeded_ds)
    result = await svc.authenticate_table("store001", 1, "1234")
    assert result["session_id"] == "T01-20260209120000"
    assert result["table_number"] == 1


@pytest.mark.asyncio
async def test_authenticate_table_wrong_password(seeded_ds):
    svc = AuthService(datastore=seeded_ds)
    with pytest.raises(AuthenticationError):
        await svc.authenticate_table("store001", 1, "wrong")


@pytest.mark.asyncio
async def test_authenticate_table_no_session(ds):
    """세션 없는 테이블 인증 실패."""
    table_hash = bcrypt.hashpw(b"1234", bcrypt.gensalt(rounds=4)).decode()
    await ds.append("tables", "store001", {
        "id": "table-002",
        "store_id": "store001",
        "table_number": 2,
        "password_hash": table_hash,
        "is_active": True,
    })
    svc = AuthService(datastore=ds)
    with pytest.raises(AuthenticationError, match="No active session"):
        await svc.authenticate_table("store001", 2, "1234")


@pytest.mark.asyncio
async def test_verify_table_session(seeded_ds):
    svc = AuthService(datastore=seeded_ds)
    session = await svc.verify_table_session("T01-20260209120000", "store001")
    assert session["status"] == "active"
