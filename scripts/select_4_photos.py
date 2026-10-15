"""Віконний помічник для додавання чотирьох зображень у статичний сайт."""
from pathlib import Path
import sys
import tkinter as tk
from tkinter import filedialog, messagebox

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "images" / "posts"


def main():
    try:
        from PIL import Image, ImageOps
    except ImportError:
        print("Pillow not installed. Run: py -m pip install Pillow")
        input("Press Enter to exit...")
        return 1
    app = tk.Tk()
    app.withdraw()
    app.attributes("-topmost", True)
    messagebox.showinfo("POYO — 4 фото", "Вибери фото з чотирьох постів X за порядком (1, 2, 3, 4).\nПідтримуються JPG, PNG, WEBP і GIF.", parent=app)
    DEST.mkdir(parents=True, exist_ok=True)
    count = 0
    for n in range(1, 5):
        filepath = filedialog.askopenfilename(
            title=f"Пост {n}/4 — вибери зображення",
            filetypes=[("Картинки", "*.jpg *.jpeg *.png *.webp *.bmp *.gif"), ("Всі файли", "*.*")],
            parent=app
        )
        if not filepath:
            messagebox.showinfo("Зупинено", f"Збережено {count} фото. Можеш продовжити пізніше.", parent=app)
            break
        try:
            with Image.open(filepath) as source:
                image = ImageOps.exif_transpose(source)
                if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
                    rgba = image.convert("RGBA")
                    background = Image.new("RGB", rgba.size, (255, 253, 242))
                    background.paste(rgba, mask=rgba.getchannel("A"))
                    image = background
                else:
                    image = image.convert("RGB")
                output = DEST / f"post{n}.jpg"
                image.save(output, "JPEG", quality=92, optimize=True)
                count += 1
                print(f"Saved {output} ({image.width}x{image.height})")
        except Exception as exc:
            messagebox.showerror("Помилка", f"Не вдалося обробити {filepath}:\n{exc}", parent=app)
            print(f"FAILED: {filepath}: {exc}")
    if count == 4:
        messagebox.showinfo("Готово!", "Усі 4 фотографії додано! Онови сайт клавішами Ctrl+F5.\nДля GitHub Pages завантаж також папку images/posts/.", parent=app)
    app.destroy()
    return 0


if __name__ == "__main__":
    sys.exit(main())
