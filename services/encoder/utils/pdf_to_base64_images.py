import asyncio
import base64
import io

from pdf2image import convert_from_bytes


async def image_to_base64(image) -> str:
    # Save the image to memory
    image_bytes = io.BytesIO()
    image.save(image_bytes, format="JPEG")

    # Encode the image as base64
    base64_image = base64.b64encode(image_bytes.getvalue()).decode("utf-8")

    return base64_image


async def pdf_to_base64_images(file_bytes: bytes) -> list[str]:
    try:
        # Convert PDF to images
        images = convert_from_bytes(file_bytes)

        # Convert images to base64, concurrently
        image_to_base64_tasks = [image_to_base64(image) for image in images]

        # Wait for all tasks to complete
        base64_images = await asyncio.gather(*image_to_base64_tasks)

        return base64_images
    except Exception as e:
        print(f"Error converting PDF to base64 images: {str(e)}")
        return []
