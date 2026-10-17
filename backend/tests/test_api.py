"""api coverage for auth, notes feed, mood log and habit streaks."""

from datetime import date, timedelta


class TestAuth:
    def test_register_login_me_roundtrip(self, client, garden_password):
        res = client.post("/api/auth/register", json={
            "username": "gardenguest",
            "email": "guest@mindgarden.local",
            "password": garden_password,
        })
        assert res.status_code == 201
        assert res.json()["username"] == "gardenguest"

        login = client.post("/api/auth/login", json={
            "username": "gardenguest",
            "password": garden_password,
        })
        assert login.status_code == 200
        token = login.json()["access_token"]
        assert token

        me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200
        assert me.json()["username"] == "gardenguest"

    def test_register_rejects_short_password(self, client):
        res = client.post("/api/auth/register", json={
            "username": "shorty",
            "email": "short@mindgarden.local",
            "password": "tiny",
        })
        assert res.status_code == 422

    def test_register_rejects_duplicate_username(self, client, garden_password):
        payload = {
            "username": "twin",
            "email": "twin@mindgarden.local",
            "password": garden_password,
        }
        assert client.post("/api/auth/register", json=payload).status_code == 201
        again = client.post("/api/auth/register", json={**payload, "email": "other@mindgarden.local"})
        assert again.status_code == 409

    def test_me_requires_token(self, client):
        assert client.get("/api/auth/me").status_code == 401
        bad = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-jwt"})
        assert bad.status_code == 401

    def test_login_rejects_wrong_password(self, client, garden_password):
        client.post("/api/auth/register", json={
            "username": "sleepy",
            "email": "sleepy@mindgarden.local",
            "password": garden_password,
        })
        res = client.post("/api/auth/login", json={"username": "sleepy", "password": "wrong"})
        assert res.status_code == 401


class TestNotes:
    def test_note_crud_roundtrip(self, client, auth_headers):
        created = client.post("/api/notes", json={
            "title": "compost basics",
            "content": "layer greens and browns",
            "tags": ["soil"],
            "mood_score": 8,
        }, headers=auth_headers)
        assert created.status_code == 201
        note_id = created.json()["id"]
        assert created.json()["mood_score"] == 8

        listing = client.get("/api/notes", headers=auth_headers)
        assert any(n["id"] == note_id for n in listing.json())

        updated = client.put(f"/api/notes/{note_id}", json={
            "status": "evergreen",
            "mood_score": 9,
        }, headers=auth_headers)
        assert updated.json()["status"] == "evergreen"

        assert client.delete(f"/api/notes/{note_id}", headers=auth_headers).status_code == 204
        assert client.get(f"/api/notes/{note_id}").status_code == 404

    def test_note_mood_score_range(self, client, auth_headers):
        assert client.post("/api/notes", json={"title": "x", "mood_score": 11}, headers=auth_headers).status_code == 422
        assert client.post("/api/notes", json={"title": "x", "mood_score": 0}, headers=auth_headers).status_code == 422

    def test_feed_pagination(self, client, auth_headers):
        for i in range(5):
            client.post("/api/notes", json={"title": f"sprout {i}"}, headers=auth_headers)

        page = client.get("/api/feed?limit=2&offset=0", headers=auth_headers).json()
        assert page["total"] == 5
        assert len(page["items"]) == 2
        assert page["has_more"] is True

        tail = client.get("/api/feed?limit=2&offset=4", headers=auth_headers).json()
        assert len(tail["items"]) == 1
        assert tail["has_more"] is False

    def test_feed_sort_and_date_window(self, client, auth_headers):
        client.post("/api/notes", json={"title": "banana"}, headers=auth_headers)
        client.post("/api/notes", json={"title": "apple"}, headers=auth_headers)

        by_title = client.get("/api/feed?sort=title&limit=10", headers=auth_headers).json()
        titles = [i["title"] for i in by_title["items"]]
        assert titles == sorted(titles)

        future = client.get(
            "/api/feed?date_from=2031-01-01", headers=auth_headers
        ).json()
        assert future["total"] == 0

    def test_search_matches_tags_and_requires_all_words(self, client, auth_headers):
        client.post("/api/notes", json={
            "title": "watering schedule",
            "content": "morning rounds through the beds",
            "tags": ["greenhouse"],
        }, headers=auth_headers)
        client.post("/api/notes", json={"title": "compost notes"}, headers=auth_headers)

        by_tag = client.get("/api/feed?search=greenhouse", headers=auth_headers).json()
        assert by_tag["total"] == 1
        assert by_tag["items"][0]["title"] == "watering schedule"

        both_words = client.get("/api/feed?search=watering schedule", headers=auth_headers).json()
        assert both_words["total"] == 1

        missing_word = client.get("/api/feed?search=watering moonlight", headers=auth_headers).json()
        assert missing_word["total"] == 0

    def test_deleting_last_note_retires_orphan_tag(self, client, auth_headers):
        created = client.post("/api/notes", json={
            "title": "lonely sprout",
            "tags": ["solo-tag"],
        }, headers=auth_headers).json()
        assert any(t["name"] == "solo-tag" for t in client.get("/api/tags").json())

        client.delete(f"/api/notes/{created['id']}", headers=auth_headers)

        assert all(t["name"] != "solo-tag" for t in client.get("/api/tags").json())

    def test_token_scoping_hides_other_gardens(self, client, auth_headers, garden_password):
        client.post("/api/notes", json={"title": "mine only"}, headers=auth_headers)

        # a second registered gardener must not see tester's private plot
        client.post("/api/auth/register", json={
            "username": "neighbor",
            "email": "neighbor@mindgarden.local",
            "password": garden_password,
        })
        login = client.post("/api/auth/login", json={"username": "neighbor", "password": garden_password})
        neighbor_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

        neighbor_view = client.get("/api/notes", headers=neighbor_headers).json()
        assert all(n["title"] != "mine only" for n in neighbor_view)


class TestMoodAndHabits:
    def test_mood_log_upserts_same_day(self, client, auth_headers):
        first = client.post("/api/mood", json={"score": 5, "note": "foggy"}, headers=auth_headers)
        assert first.status_code == 201
        client.post("/api/mood", json={"score": 8, "note": "cleared up"}, headers=auth_headers)

        entries = client.get("/api/mood?days=7", headers=auth_headers).json()
        assert len(entries) == 1
        assert entries[0]["score"] == 8

    def test_habit_checkin_streak(self, client, auth_headers):
        habit = client.post("/api/habits", json={"name": "watering"}, headers=auth_headers).json()
        yesterday = (date.today() - timedelta(days=1)).isoformat()

        client.post(f"/api/habits/{habit['id']}/check-in", headers=auth_headers)
        second = client.post(
            f"/api/habits/{habit['id']}/check-in?day={yesterday}", headers=auth_headers
        ).json()
        assert second["current_streak"] == 2

    def test_habit_double_checkin_is_idempotent(self, client, auth_headers):
        habit = client.post("/api/habits", json={"name": "stretching"}, headers=auth_headers).json()
        client.post(f"/api/habits/{habit['id']}/check-in", headers=auth_headers)
        again = client.post(f"/api/habits/{habit['id']}/check-in", headers=auth_headers).json()
        assert again["current_streak"] == 1

        habits = client.get("/api/habits", headers=auth_headers).json()
        assert habits[0]["total_checkins"] == 1

    def test_habit_rename_and_archive(self, client, auth_headers):
        habit = client.post("/api/habits", json={"name": "evening walk"}, headers=auth_headers).json()

        renamed = client.put(f"/api/habits/{habit['id']}", json={"name": "sunset stroll"}, headers=auth_headers)
        assert renamed.json()["name"] == "sunset stroll"

        archived = client.put(f"/api/habits/{habit['id']}", json={"is_archived": True}, headers=auth_headers)
        assert archived.json()["is_archived"] is True

        # retired rituals leave the default list but stay reachable
        assert client.get("/api/habits", headers=auth_headers).json() == []
        assert len(client.get("/api/habits?include_archived=true", headers=auth_headers).json()) == 1

    def test_habit_delete_cascades_logs(self, client, auth_headers):
        habit = client.post("/api/habits", json={"name": "tea ritual"}, headers=auth_headers).json()
        client.post(f"/api/habits/{habit['id']}/check-in", headers=auth_headers)

        assert client.delete(f"/api/habits/{habit['id']}", headers=auth_headers).status_code == 204
        check = client.post(f"/api/habits/{habit['id']}/check-in", headers=auth_headers)
        assert check.status_code == 404


class TestStats:
    def test_stats_aggregate_the_greenhouse(self, client, auth_headers):
        # pin the note to today's garden day so utc/local boundaries can't flake
        client.post("/api/notes", json={
            "title": "stats probe",
            "tags": ["calm"],
            "entry_date": date.today().isoformat(),
        }, headers=auth_headers)
        client.post("/api/mood", json={"score": 7}, headers=auth_headers)
        habit = client.post("/api/habits", json={"name": "watering"}, headers=auth_headers).json()
        client.post(f"/api/habits/{habit['id']}/check-in", headers=auth_headers)

        stats = client.get("/api/stats?days=14", headers=auth_headers).json()
        assert stats["totals"]["notes"] >= 1
        assert stats["totals"]["habits"] >= 1
        assert stats["totals"]["avg_mood"] == 7.0
        assert any(t["name"] == "calm" for t in stats["top_tags"])

        today_entry = [m for m in stats["mood"] if m["avg_score"] is not None]
        assert today_entry, "today's mood should appear in the series"

        today = max(stats["activity"], key=lambda d: d["date"])
        assert today["notes"] >= 1 and today["checkins"] >= 1 and today["moods"] == 1

    def test_stats_etag_revalidation(self, client, auth_headers):
        first = client.get("/api/stats?days=14", headers=auth_headers)
        etag = first.headers["etag"]
        assert etag

        revalidated = client.get(
            "/api/stats?days=14", headers={**auth_headers, "If-None-Match": etag}
        )
        assert revalidated.status_code == 304

    def test_feed_window_uses_garden_day(self, client, auth_headers):
        client.post("/api/notes", json={
            "title": "old memory",
            "entry_date": "2026-01-15",
        }, headers=auth_headers)

        in_window = client.get(
            "/api/feed?date_from=2026-01-14&date_to=2026-01-16", headers=auth_headers
        ).json()
        assert in_window["total"] == 1
        assert in_window["items"][0]["title"] == "old memory"
