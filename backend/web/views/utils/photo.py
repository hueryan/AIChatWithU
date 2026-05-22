import os


def remove_old_photo(photo):
    if photo and photo.name != 'user/photos/default.jpg':
        # old_path = settings.MEDIA_ROOT / photo.name
        old_path = photo.path
        if os.path.exists(old_path):
            os.remove(old_path)