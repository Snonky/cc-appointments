from PIL import Image
import requests
from io import BytesIO
import json
from google.cloud import storage
import os

PROJECT = os.environ.get("USER_PROJECT") or 'cc-appointments-images'
IMG_SIZE = int(os.environ.get("USER_IMGSIZE") or 400)
BASE_URL = os.environ.get("USER_URL") or 'https://static.appointments.gq/'

def upload_blob(bucket_name, blob_text, destination_blob_name, u_format):
    #https://stackoverflow.com/questions/52249978/write-to-google-cloud-storage-from-cloud-function-python#
    """Uploads a file to the bucket."""
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    print('Uploading {} as {}'.format("image/" + u_format, destination_blob_name))
    blob.upload_from_string(blob_text, content_type="image/" + u_format)
    print('File reuploaded as {}x{} to {}'.format(str(IMG_SIZE), str(IMG_SIZE), destination_blob_name))


def checkChange(event, keys=["avatarUrl", "pictureUrls"]):
    try:
        paths = event.get("updateMask").get("fieldPaths")
        result = []
        for key in keys:
            if key in paths:
                result.append(key)
        if len(result):
            return result
    except:
        return 0


def compute_and_load_image(image_url):
    print("Processing:", image_url)
    outfile = image_url.split("/")[-1]
    image_url = BASE_URL + outfile
    # Change = Resize Image and push to the same url
    response = requests.get(image_url, stream=True)
    img = Image.open(BytesIO(response.content))
    img_format = str(img.format).lower()
    #img.thumbnail((IMG_SIZE, IMG_SIZE), Image.ANTIALIAS)
    img = img.resize((IMG_SIZE, IMG_SIZE), Image.ANTIALIAS)
    img_byte_arr = BytesIO()
    img.save(img_byte_arr, format=img_format)
    upload_blob(PROJECT, img_byte_arr.getvalue(), outfile, img_format)

        
def resize_image(event, context):
    # Check event for changes in images
    # No Change = return = Done
    res = checkChange(event)
    if (res):
        if "avatarUrl" in res:
            avatar_url = event.get("value").get("fields").get("avatarUrl").get("stringValue")
            compute_and_load_image(avatar_url)
        if "pictureUrls" in res:
            picture_urls = event.get("value").get("fields").get("pictureUrls").get("arrayValue").get("values")
            for pic_url in picture_urls:
                try:
                    pic_url = pic_url.get("stringValue")
                except:
                    continue
                try:
                    compute_and_load_image(pic_url)
                except:
                    print("Error while Computing", pic_url)
    else:
        return 0