from PIL import Image
import numpy as np

def process_logo():
    # Load the new high-res screenshot
    img_path = "/home/ubuntu/upload/Screenshot2026-01-22at3.25.54PM.png"
    img = Image.open(img_path).convert("RGBA")
    
    # Convert to numpy array
    arr = np.array(img)
    
    # The image is a black bag on white background.
    # We want to remove the white background (make it transparent).
    # But we want to KEEP the white circle inside the bag.
    
    # Strategy:
    # 1. Find the bounding box of the bag (black pixels).
    # 2. Crop to that bounding box.
    # 3. Make the OUTER white pixels transparent.
    # 4. Keep the INNER white pixels (circle/airplane) opaque.
    
    # Step 1: Find bounding box
    # Threshold for black pixels (R,G,B < 200) - allow some anti-aliasing
    is_black = (arr[:,:,0] < 200) & (arr[:,:,1] < 200) & (arr[:,:,2] < 200)
    
    rows = np.any(is_black, axis=1)
    cols = np.any(is_black, axis=0)
    
    if not np.any(rows) or not np.any(cols):
        print("No black pixels found")
        return
        
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    
    # Add a small padding
    padding = 2
    rmin = max(0, rmin - padding)
    rmax = min(arr.shape[0], rmax + padding)
    cmin = max(0, cmin - padding)
    cmax = min(arr.shape[1], cmax + padding)
    
    # Crop
    cropped = img.crop((cmin, rmin, cmax, rmax))
    cropped_arr = np.array(cropped)
    
    # Step 3: Make OUTER white pixels transparent
    # We can use a flood fill algorithm from the corners to find the background.
    # Since we cropped to the bounding box, the corners might be part of the object or background.
    # But usually for a bag shape, the top corners are background.
    
    # Let's use a mask.
    # Create a mask of "white-ish" pixels
    # R,G,B > 200
    is_white = (cropped_arr[:,:,0] > 200) & (cropped_arr[:,:,1] > 200) & (cropped_arr[:,:,2] > 200)
    
    # Use flood fill (BFS) to identify the outer background
    # Start from borders
    h, w = is_white.shape
    mask = np.zeros((h, w), dtype=bool)
    
    queue = []
    # Add all border pixels that are white to the queue
    for r in range(h):
        if is_white[r, 0]: queue.append((r, 0))
        if is_white[r, w-1]: queue.append((r, w-1))
    for c in range(w):
        if is_white[0, c]: queue.append((0, c))
        if is_white[h-1, c]: queue.append((h-1, c))
        
    # BFS
    visited = set(queue)
    idx = 0
    while idx < len(queue):
        r, c = queue[idx]
        idx += 1
        mask[r, c] = True
        
        # Neighbors
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < h and 0 <= nc < w:
                if (nr, nc) not in visited and is_white[nr, nc]:
                    visited.add((nr, nc))
                    queue.append((nr, nc))
    
    # Now 'mask' contains True for background pixels.
    # We want to set Alpha to 0 for these pixels.
    
    # Create Black Version (for Header)
    # This is essentially the cropped image, but with background transparent.
    # The inner white circle remains white (opaque).
    
    black_ver = cropped_arr.copy()
    black_ver[mask, 3] = 0 # Set alpha to 0 for background
    
    final_black = Image.fromarray(black_ver)
    final_black.save("/home/ubuntu/packgo-travel/client/public/images/logo-bag-black-v3.png")
    
    # Create White Version (for Footer)
    # We want the BAG (black parts) to become WHITE.
    # We want the CIRCLE (white parts) to become TRANSPARENT (so it shows footer bg).
    # OR, we want the CIRCLE to be BLACK (if footer is white? No footer is black).
    # If footer is black, and we want "White Bag + Dark Circle + White Plane":
    # Bag (Black) -> White
    # Circle (White) -> Transparent (shows black footer)
    # Plane (Black) -> White
    
    # Wait, let's look at the source image again.
    # Source: Black Bag, White Circle, Black Plane inside.
    # Actually, looking at the user's image:
    # It's Black Bag, White Circle, BLACK Plane.
    
    # If we want it on a Black Footer:
    # Bag -> White
    # Circle -> Transparent (shows black footer) -> effectively Black
    # Plane -> White
    
    # So:
    # Source Black -> Target White
    # Source White -> Target Transparent
    
    white_ver = np.zeros_like(cropped_arr)
    
    # Identify source black pixels (Bag & Plane)
    # These are pixels that are NOT white-ish
    is_source_black = ~is_white
    
    # Set them to White
    white_ver[..., 0:3] = 255
    white_ver[is_source_black, 3] = 255
    
    # Identify source white pixels (Circle & Background)
    # These are 'is_white'
    # We want them Transparent
    white_ver[is_white, 3] = 0
    
    # But wait, the 'mask' we calculated earlier is only the OUTER background.
    # The INNER white circle is also in 'is_white' but NOT in 'mask'.
    # For the footer version, we want the INNER circle to be transparent too?
    # If the footer is black, making the circle transparent means it will look black.
    # That seems correct for a "negative" version.
    
    final_white = Image.fromarray(white_ver)
    final_white.save("/home/ubuntu/packgo-travel/client/public/images/logo-bag-white-v3.png")
    
    print("Successfully extracted high-res bag icon v3")

if __name__ == "__main__":
    process_logo()
