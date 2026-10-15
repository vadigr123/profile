"""Offline regression tests (do not need an X token or live network)."""
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from sync_twitter_art import extract_photos, extract_fx_photos, parse_timeline_html, read_previous, read_links_file, sync  # noqa: E402


def tweet(id_, media=None, user="poyo_a1", text="My art!", **extras):
    result = {
        "id_str": str(id_), "user": {"screen_name": user}, "full_text": text,
        "created_at": "Wed Oct 14 10:11:12 +0000 2026",
        "entities": {"media": media or []},
    }
    result.update(extras)
    return {"type": "tweet", "content": {"tweet": result}}


PHOTO = {"id_str": "999111222333444555", "type": "photo", "media_url_https": "https://pbs.twimg.com/media/ABC123.jpg"}
VIDEO = {"id_str": "999111222333444556", "type": "video", "media_url_https": "https://pbs.twimg.com/media/XYZ.jpg"}


class TwitterArtTests(unittest.TestCase):
    def test_extract_only_author_photos(self):
        entries = [
            tweet("1234567890123456789", [PHOTO, VIDEO]),
            tweet("1234567890123456790", [PHOTO], user="someone_else"),
            tweet("1234567890123456791", [PHOTO], text="RT @someone_else fake"),
            tweet("1234567890123456792", [{"type": "photo", "media_url_https": "https://evil.test/media/ABC.jpg"}]),
            {"type": "tweet", "content": {"tweet": None}},
        ]
        result = extract_photos(entries, "poyo_a1")
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["tweet_id"], "1234567890123456789")
        self.assertEqual(result[0]["post_url"], "https://x.com/poyo_a1/status/1234567890123456789")

    def test_extended_entities_photos(self):
        e = tweet("1234567890123456789", [VIDEO], extended_entities={"media": [PHOTO]})
        result = extract_photos([e], "poyo_a1")
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["media_key"], PHOTO["id_str"])

    def test_parse_syndication_next_data(self):
        entries = [tweet("1234567890123456789", [PHOTO])]
        payload = {"props": {"pageProps": {"timeline": {"entries": entries}}}}
        html = '<html><script id="__NEXT_DATA__" type="application/json">' + json.dumps(payload) + '</script></html>'
        self.assertEqual(parse_timeline_html(html), entries)
        with self.assertRaises(ValueError):
            parse_timeline_html("<h1>not available</h1>")

    def test_fxtwitter_media_gallery(self):
        payload = {"code": 200, "results": [
            {"type": "status", "id": "1234567890123456789", "author": {"screen_name": "poyo_a1"},
             "text": "my artwork", "media": {"photos": [
                 {"id": "556677", "type": "photo", "url": "https://pbs.twimg.com/media/Art123?format=jpg&name=large", "altText": "Poyo"},
                 {"id": "556688", "type": "photo", "url": "https://pbs.twimg.com/media/Art456.jpg"}
             ]}},
            {"type": "status", "id": "1234567890123456790", "author": {"screen_name": "not_poyo_a1"},
             "media": {"photos": [{"type": "photo", "url": "https://pbs.twimg.com/media/False.jpg"}]}},
            {"type": "status", "id": "1234567890123456791", "author": {"screen_name": "poyo_a1"},
             "media": {"videos": [{"type": "video", "url": "https://pbs.twimg.com/media/Video.jpg"}]}},
            {"type": "status", "id": "1234567890123456792", "author": {"screen_name": "poyo_a1"},
             "text": "RT @other: art", "media": {"photos": [{"type": "photo", "url": "https://pbs.twimg.com/media/RT.jpg"}]}}
        ]}
        result = extract_fx_photos(payload, "poyo_a1")
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["alt"], "Poyo")
        self.assertEqual(result[0]["post_url"], "https://x.com/poyo_a1/status/1234567890123456789")

    def test_invalid_fxtwitter_response(self):
        with self.assertRaises(ValueError):
            extract_fx_photos({"error": "limit reached"}, "poyo_a1")

    def test_link_file_validates_ownership(self):
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "tweet-links.txt"
            path.write_text("# comment\nhttps://x.com/poyo_a1/status/1234567890123456789\nhttps://x.com/poyo_a1/status/1234567890123456789/photo/1\n")
            self.assertEqual(read_links_file(path, "poyo_a1"), ["1234567890123456789"])
            path.write_text("https://x.com/someone_else/status/1234567890123456789")
            with self.assertRaises(ValueError):
                read_links_file(path, "poyo_a1")

    def test_direct_image_fallback_if_cdn_unavailable(self):
        with tempfile.TemporaryDirectory() as td:
            folder = Path(td)
            output = folder / "data" / "twitter-art.json"
            def fail_cache(url, directory):
                raise OSError("cdn unavailable")
            self.assertTrue(sync([tweet("1234567890123456789", [PHOTO])], "poyo_a1", output, folder / "images", cache_fn=fail_cache))
            posts = read_previous(output)
            self.assertEqual(posts[0]["image_url"], PHOTO["media_url_https"])

    def test_preserves_old_when_empty_or_error(self):
        with tempfile.TemporaryDirectory() as temp:
            folder = Path(temp)
            output = folder / "data" / "twitter-art.json"
            output.parent.mkdir()
            output.write_text('{"username":"poyo_a1","posts":[{"tweet_id":"1234567890123456789","image_url":"images/twitter/123.webp","post_url":"https://x.com/poyo_a1/status/1234567890123456789"}]}')
            before = output.read_bytes()
            with self.assertRaises(RuntimeError):
                sync([], "poyo_a1", output, folder / "images")
            self.assertEqual(before, output.read_bytes())

    def test_sync_and_merge_keep_older(self):
        with tempfile.TemporaryDirectory() as temp:
            folder = Path(temp)
            output = folder / "data" / "twitter-art.json"
            path = folder / "images" / "twitter" / ("a" * 24 + ".webp")
            def fake_cache(url, directory):
                directory.mkdir(parents=True, exist_ok=True)
                path.write_bytes(b"RIFFfakeWEBP")
                return path
            fresh = [tweet("1234567890123456789", [PHOTO])]
            self.assertTrue(sync(fresh, "poyo_a1", output, path.parent, cache_fn=fake_cache))
            posts = read_previous(output)
            self.assertEqual(len(posts), 1)
            self.assertEqual(posts[0]["image_url"], "images/twitter/" + path.name)
            self.assertFalse(sync(fresh, "poyo_a1", output, path.parent, cache_fn=fake_cache))
            fresh2 = [tweet("1234567890123456791", [PHOTO])]
            self.assertTrue(sync(fresh2, "poyo_a1", output, path.parent, cache_fn=fake_cache))
            self.assertEqual(len(read_previous(output)), 2)


if __name__ == "__main__":
    unittest.main()
