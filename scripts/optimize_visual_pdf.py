import os
import sys
import time
from PIL import Image
import pypdf

def optimize_pdf(input_path, output_path, quality=82):
    print(f"Optimizing: {input_path}")
    start_time = time.time()
    reader = pypdf.PdfReader(input_path)
    writer = pypdf.PdfWriter()
    
    total_pages = len(reader.pages)
    print(f"Total pages: {total_pages}")
    
    for idx, page in enumerate(reader.pages):
        writer_page = writer.add_page(page)
        try:
            for img in writer_page.images:
                if len(img.data) > 15000:
                    pil_img = img.image
                    if pil_img.mode in ('RGBA', 'LA'):
                        bg = Image.new('RGB', pil_img.size, (255, 255, 255))
                        bg.paste(pil_img, mask=pil_img.split()[-1])
                        pil_img = bg
                    elif pil_img.mode != 'RGB':
                        pil_img = pil_img.convert('RGB')
                    
                    img.replace(pil_img, quality=quality)
        except Exception as e:
            print(f"Warning on page {idx}: {e}")
        
        if (idx + 1) % 25 == 0 or idx + 1 == total_pages:
            print(f"Processed {idx + 1}/{total_pages} pages...")

    print("Deduplicating identical objects...")
    writer.compress_identical_objects()
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as f:
        writer.write(f)
        
    orig_sz = os.path.getsize(input_path)
    new_sz = os.path.getsize(output_path)
    elapsed = time.time() - start_time
    print(f"Done in {elapsed:.1f}s!")
    print(f"Original size: {orig_sz / (1024*1024):.2f} MB")
    print(f"Optimized size: {new_sz / (1024*1024):.2f} MB ({new_sz / orig_sz * 100:.1f}%)")

if __name__ == "__main__":
    src = sys.argv[1]
    dst = sys.argv[2]
    q = int(sys.argv[3]) if len(sys.argv) > 3 else 82
    optimize_pdf(src, dst, q)
