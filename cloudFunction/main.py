from PIL import Image
from io import BytesIO
from google.cloud import storage
import os
import sys
import base64

PROJECT = os.environ.get("USER_PROJECT") or 'appointments-images'
IMG_SIZE = int(os.environ.get("USER_IMGSIZE") or 400)

def upload_blob(bucket, file_name, blob_text, u_format):
    #https://stackoverflow.com/questions/52249978/write-to-google-cloud-storage-from-cloud-function-python#
    """Uploads a file to the bucket."""
    blob = bucket.blob(file_name)
    print('Uploading {} as {}'.format("image/" + u_format, blob.name))
    blob.upload_from_string(blob_text, content_type="image/" + u_format)
    print('File reuploaded as {}'.format(blob.name))
    return 0


def compute_and_load_image(bucket, image_file_name):
    print("Processing:", image_file_name)
    # Change = Resize Image and push to the same url
    blob = bucket.get_blob(image_file_name)
    if not blob.exists():
        print("The image file does not exist in the bucket.", file=sys.stderr)
        return 0
    img = Image.open(BytesIO(blob.download_as_bytes()))
    # Only resize if original image is too large in either of its dimensions
    current_size = max(img.size)
    if current_size > IMG_SIZE:
        downscale_ratio = IMG_SIZE / current_size
        new_size = (int(downscale_ratio * img.size[0]),
                    int(downscale_ratio * img.size[1]))
        img_format = str(img.format).lower()
        img = img.resize(new_size, Image.ANTIALIAS)
        img_byte_arr = BytesIO()
        img.save(img_byte_arr, format=img_format)
        print('Image resized to {}x{}'.format(img.size[0], img.size[1]))
        upload_blob(bucket, image_file_name, img_byte_arr.getvalue(), img_format)
    else:
        return 0

        
def resize_image(event, context):
    # Upload event triggers image resizer
    if 'data' in event:
        file_name = base64.b64decode(event['data']).decode('utf-8')
        storage_client = storage.Client()
        bucket = storage_client.bucket(PROJECT)
        if not bucket.exists():
            print("The configured image storage bucket does not exist.", file=sys.stderr)
            return 0
        compute_and_load_image(bucket, file_name)
    else:
        print("Image upload event carried no data.", file=sys.stderr)
        return 0
