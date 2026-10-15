#!/usr/bin/env python3
"""Cache @poyo_a1 photos using public FxTwitter media endpoint, with X syndication fallback.

No personal X API key, login or cookies. Both providers are third-party/unofficial
relative to X and may be limited. Downloaded images + JSON can go on GitHub Pages.
On failures the previous gallery cache is preserved.
"""

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from io import BytesIO
from pathlib import Path
from urllib.parse import quote, urlparse, urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

NAME_RE = re.compile(r"^[A-Za-z0-9_]{1,15}$")
ID_RE = re.compile(r"^\d{10,22}$")
MAX_HTML = 12 * 1024 * 1024
MAX_IMAGE = 14 * 1024 * 1024
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PoyoGallery/3.0; GitHubActions)",
    "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.5",
    "Accept-Language": "en-US,en;q=0.9",
}


class NextDataParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.is_next_data = False
        self.fragments = []
        self.result = None

    def handle_starttag(self, tag, attrs):
        if tag == "script" and dict(attrs).get("id") == "__NEXT_DATA__":
            self.is_next_data = True
            self.fragments = []

    def handle_data(self, data):
        if self.is_next_data:
            self.fragments.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self.is_next_data:
            self.result = "".join(self.fragments)
            self.is_next_data = False


def parse_timeline_html(html):
    parser = NextDataParser()
    parser.feed(html)
    if not parser.result:
        raise ValueError("X syndication: embedded timeline JSON not found (endpoint may have changed)")
    data = json.loads(parser.result)
    entries = (((data.get("props") or {}).get("pageProps") or {})
               .get("timeline") or {}).get("entries")
    if not isinstance(entries, list):
        raise ValueError("X syndication: unexpected timeline format")
    return entries


def is_twitter_media(url):
    if not isinstance(url, str):
        return False
    try:
        value = urlparse(url)
    except ValueError:
        return False
    return value.scheme == "https" and value.hostname == "pbs.twimg.com" and value.path.startswith("/media/")


def extract_photos(entries, username):
    """Only own authored post attachments, not retweets, quoted media, avatars or videos."""
    results, seen = [], set()
    for entry in entries:
        if not isinstance(entry, dict) or entry.get("type") not in ("tweet", None):
            continue
        content = entry.get("content") or {}
        tweet = content.get("tweet") or {}
        if not isinstance(tweet, dict):
            continue
        user = tweet.get("user") or {}
        if not isinstance(user, dict) or str(user.get("screen_name", "")).lower() != username.lower():
            continue
        post_id = str(tweet.get("id_str") or tweet.get("id") or "")
        if not ID_RE.fullmatch(post_id):
            continue
        if tweet.get("retweeted_status") or str(tweet.get("full_text", tweet.get("text", ""))).startswith("RT @"):
            continue
        extended = tweet.get("extended_entities") or {}
        media_list = extended.get("media") or (tweet.get("entities") or {}).get("media") or []
        if not isinstance(media_list, list):
            continue
        for media in media_list:
            if not isinstance(media, dict) or media.get("type") != "photo":
                continue
            src = media.get("media_url_https") or media.get("media_url")
            if not is_twitter_media(src):
                continue
            media_id = str(media.get("id_str") or media.get("id") or "")
            key = (post_id, media_id or src)
            if key in seen:
                continue
            seen.add(key)
            results.append({
                "tweet_id": post_id,
                "media_key": media_id or hashlib.sha256(src.encode()).hexdigest()[:16],
                "post_url": f"https://x.com/{username}/status/{post_id}",
                "source_image_url": src,
                "alt": (media.get("ext_alt_text") or "")[:300],
                "text": str(tweet.get("full_text") or tweet.get("text") or "")[:500],
                "created_at": str(tweet.get("created_at") or ""),
            })
    return results


def extract_fx_photos(payload, username):
    """FxTwitter /2/profile/{handle}/media results; accept only authored photo media."""
    if not isinstance(payload, dict) or not isinstance(payload.get("results"), list):
        raise ValueError("FxTwitter: API response is not a media timeline")
    result, seen = [], set()
    for post in payload["results"]:
        if not isinstance(post, dict) or post.get("type") not in ("status", None):
            continue
        author = post.get("author") or {}
        if not isinstance(author, dict) or str(author.get("screen_name", "")).lower() != username.lower():
            continue
        post_id = str(post.get("id", ""))
        if not ID_RE.fullmatch(post_id):
            continue
        text = str(post.get("text") or "")
        if post.get("is_retweet") or post.get("retweeted_status") or text.startswith("RT @"):
            continue
        media = post.get("media") or {}
        photos = media.get("photos") if isinstance(media, dict) else []
        if not isinstance(photos, list):
            continue
        for pic in photos:
            if not isinstance(pic, dict) or pic.get("type", "photo") != "photo":
                continue
            url = pic.get("url")
            if not is_twitter_media(url):
                continue
            media_id = str(pic.get("id") or hashlib.sha256(url.encode()).hexdigest()[:16])
            key = (post_id, media_id)
            if key in seen:
                continue
            seen.add(key)
            result.append({
                "tweet_id": post_id,
                "media_key": media_id,
                "post_url": f"https://x.com/{username}/status/{post_id}",
                "source_image_url": url,
                "alt": str(pic.get("altText") or "")[:300],
                "text": text[:500],
                "created_at": str(post.get("created_at") or ""),
            })
    return result


def _get_json(url):
    # Strictly a configured public API, never accept a user-supplied URL.
    with urlopen(Request(url, headers={"User-Agent": HEADERS["User-Agent"], "Accept": "application/json"}), timeout=30) as response:
        if urlparse(response.geturl()).hostname != "api.fxtwitter.com":
            raise RuntimeError("FxTwitter: unexpected redirect")
        body = response.read(MAX_HTML + 1)
    if len(body) > MAX_HTML:
        raise RuntimeError("FxTwitter: response exceeded size limit")
    return json.loads(body.decode("utf-8"))


def fetch_fx_media(username, count=50):
    params = urlencode({"count": count})
    return _get_json(f"https://api.fxtwitter.com/2/profile/{quote(username)}/media?{params}")


def read_links_file(path, username):
    if not path.exists():
        return []
    links = []
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parsed = urlparse(line)
        if parsed.hostname not in ("x.com", "twitter.com") or parsed.scheme != "https":
            raise ValueError(f"Only https://x.com/{username}/status/... URLs are accepted")
        match = re.fullmatch(r"/([a-zA-Z0-9_]+)/status/(\d{10,22})(?:/photo/\d+)?/?", parsed.path)
        if not match or match.group(1).lower() != username.lower():
            raise ValueError(f"Wrong post URL or X account: {line}")
        links.append(match.group(2))
    return list(dict.fromkeys(links))


def fetch_posts_from_links(ids, username):
    results = []
    for post_id in ids:
        try:
            response = _get_json(f"https://api.fxtwitter.com/2/status/{post_id}")
            post = response.get("tweet") or response.get("status")
            if isinstance(post, dict):
                results.append(post)
            else:
                print(f"No public post data for {post_id}", file=sys.stderr)
        except (RuntimeError, OSError, ValueError) as e:
            print(f"Couldn't fetch post {post_id}: {e}", file=sys.stderr)
    return extract_fx_photos({"results": results}, username)


def fetch_timeline(username):
    url = f"https://syndication.twitter.com/srv/timeline-profile/screen-name/{quote(username)}"
    with urlopen(Request(url, headers=HEADERS), timeout=30) as response:
        if response.geturl().split("/")[2] != "syndication.twitter.com":
            raise RuntimeError("Unexpected redirect from X syndication")
        data = response.read(MAX_HTML + 1)
    if len(data) > MAX_HTML:
        raise RuntimeError("X syndication returned an unexpectedly large page")
    return data.decode("utf-8", errors="replace")


def cache_image(image_url, directory):
    """Save a small local WebP. This avoids X embeds/CDN blocks on visitor browsers."""
    if not is_twitter_media(image_url):
        raise ValueError("Not a Twitter media image")
    from PIL import Image, ImageOps, UnidentifiedImageError
    stem = hashlib.sha256(image_url.encode("utf-8")).hexdigest()[:24]
    dest = directory / (stem + ".webp")
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    with urlopen(Request(image_url, headers={"User-Agent": HEADERS["User-Agent"]}), timeout=25) as r:
        if urlparse(r.geturl()).hostname != "pbs.twimg.com":
            raise RuntimeError("Unexpected image redirect")
        content = r.read(MAX_IMAGE + 1)
    if len(content) > MAX_IMAGE:
        raise RuntimeError("Image too large to cache")
    try:
        with Image.open(BytesIO(content)) as original:
            if original.width * original.height > 75_000_000:
                raise RuntimeError("Image has too many pixels")
            converted = ImageOps.exif_transpose(original).convert("RGB")
            converted.thumbnail((960, 960), Image.Resampling.LANCZOS)
            directory.mkdir(parents=True, exist_ok=True)
            tmp = dest.with_suffix(".tmp")
            converted.save(tmp, format="WEBP", quality=83, method=5)
            tmp.replace(dest)
    except (UnidentifiedImageError, OSError) as exc:
        raise RuntimeError("Image file invalid") from exc
    return dest


def read_previous(path):
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        posts = data.get("posts", []) if isinstance(data, dict) else []
        return posts if isinstance(posts, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def sync(entries, username, output, images_dir, limit=40, cache_fn=cache_image, photos=None, source="Public X media", allow_direct=True):
    photos = extract_photos(entries, username) if photos is None else photos
    if not photos:
        raise RuntimeError("No own photo posts found in recent X embed timeline; existing gallery preserved")
    previous = read_previous(output)
    normalized = []
    for item in photos:
        try:
            path = cache_fn(item["source_image_url"], images_dir)
        except Exception as exc:
            # Preserve a working gallery even if image CDN rejects server-to-server downloads.
            # Browsers can sometimes still display pbs.twimg.com hotlinked images.
            print(f"Could not cache post {item['tweet_id']} image: {type(exc).__name__}; trying direct image URL", file=sys.stderr)
            if not allow_direct or not is_twitter_media(item["source_image_url"]):
                continue
            item["image_url"] = item["source_image_url"]
        else:
            item["image_url"] = "images/twitter/" + path.name
        normalized.append(item)
    if not normalized:
        raise RuntimeError("X returned photos but images couldn't be saved; existing gallery preserved")
    # Old posts remain when no longer among the latest posts (so random picks
    # rotate through more than the limited embed timeline).
    merged = []
    seen = set()
    for post in normalized + previous:
        if not isinstance(post, dict):
            continue
        tid = str(post.get("tweet_id", ""))
        media_key = str(post.get("media_key", ""))
        url = post.get("image_url", "")
        key = (tid, media_key) if tid and media_key else (post.get("post_url"), url)
        if key in seen:
            continue
        if not (url and post.get("post_url")):
            continue
        seen.add(key)
        merged.append(post)
        if len(merged) >= limit:
            break
    if previous == merged:
        print(f"Gallery unchanged; {len(merged)} photos cached")
        return False
    output.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "username": username,
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": source + " (unofficial, best effort)",
        "posts": merged,
    }
    tmp = output.with_suffix(".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(output)
    print(f"Gallery updated: {len(normalized)} recent, {len(merged)} total photos")
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--username", default="poyo_a1")
    parser.add_argument("--output", default="data/twitter-art.json")
    parser.add_argument("--images-dir", default="images/twitter")
    parser.add_argument("--limit", type=int, default=40)
    parser.add_argument("--provider", choices=("auto", "fx", "syndication"), default="auto")
    parser.add_argument("--input-html", help="Offline syndication HTML fixture")
    parser.add_argument("--input-json", help="Offline FxTwitter media JSON fixture")
    parser.add_argument("--links-file", default="tweet-links.txt", help="Optional text file with links to your own X posts")
    args = parser.parse_args()
    if not NAME_RE.fullmatch(args.username):
        parser.error("Invalid X handle")
    if not 4 <= args.limit <= 100:
        parser.error("limit must be 4..100")
    errors = []
    photos = []
    source = ""
    if args.input_json:
        photos = extract_fx_photos(json.loads(Path(args.input_json).read_text(encoding="utf-8")), args.username)
        source = "FxTwitter JSON fixture"
    elif args.input_html:
        photos = extract_photos(parse_timeline_html(Path(args.input_html).read_text(encoding="utf-8")), args.username)
        source = "X syndication HTML fixture"
    else:
        if args.provider in ("auto", "fx"):
            try:
                photos = extract_fx_photos(fetch_fx_media(args.username, min(100, max(args.limit, 30))), args.username)
                if photos:
                    source = "FxTwitter public media timeline"
                    print(f"FxTwitter found {len(photos)} photos")
                else:
                    errors.append("FxTwitter media endpoint returned no usable photos")
            except (OSError, ValueError, RuntimeError) as exc:
                errors.append(f"FxTwitter: {exc}")
        if not photos and args.provider in ("auto", "syndication"):
            try:
                photos = extract_photos(parse_timeline_html(fetch_timeline(args.username)), args.username)
                if photos:
                    source = "X embed syndication"
                    print(f"X syndication found {len(photos)} photos")
                else:
                    errors.append("X syndication returned no usable photos")
            except (OSError, ValueError, RuntimeError) as exc:
                errors.append(f"X syndication: {exc}")
        # Explicitly given post links provide a fallback without manually uploading images.
        links = read_links_file(Path(args.links_file), args.username)
        if links:
            link_photos = fetch_posts_from_links(links, args.username)
            if link_photos:
                known = {(x["tweet_id"], x["media_key"]) for x in photos}
                photos += [x for x in link_photos if (x["tweet_id"], x["media_key"]) not in known]
                source = (source + " + " if source else "") + "FxTwitter individual posts"
                print(f"Post links supplied {len(link_photos)} photos")
    if not photos:
        raise RuntimeError("No images fetched. " + "; ".join(errors) + ". Existing gallery untouched.")
    sync([], args.username, Path(args.output), Path(args.images_dir), limit=args.limit, photos=photos, source=source)


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, ValueError, OSError) as error:
        print(f"Gallery update was NOT applied: {error}", file=sys.stderr)
        sys.exit(1)
