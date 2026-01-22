from PIL import Image
import numpy as np

def process_logo():
    # Load the screenshot
    img_path = "/home/ubuntu/upload/Screenshot2026-01-22at3.15.06PM.png"
    img = Image.open(img_path).convert("RGBA")
    
    # Convert to numpy array
    arr = np.array(img)
    
    # Threshold for white pixels
    mask = (arr[:,:,0] > 200) & (arr[:,:,1] > 200) & (arr[:,:,2] > 200)
    
    # Project to X axis (columns)
    cols = np.any(mask, axis=0)
    
    if not np.any(cols):
        print("No white pixels found")
        return

    # Find start of the first object (the bag)
    start_col = np.argmax(cols)
    
    # Find the end of the first object
    # We look for the first empty column after the start
    # If no gap found, it takes the whole width (fallback)
    end_col = start_col
    found_gap = False
    for c in range(start_col, len(cols)):
        if not cols[c]:
            end_col = c
            found_gap = True
            break
    
    if not found_gap:
        end_col = len(cols)
        
    print(f"Cropping width from {start_col} to {end_col}")
    
    # Now find the height bounds within this width
    sub_mask = mask[:, start_col:end_col]
    rows = np.any(sub_mask, axis=1)
    
    if not np.any(rows):
        print("Error finding height")
        return
        
    rmin, rmax = np.where(rows)[0][[0, -1]]
    
    # Crop the bag
    padding = 2
    bag_icon = img.crop((
        max(0, start_col - padding),
        max(0, rmin - padding),
        min(img.width, end_col + padding),
        min(img.height, rmax + padding)
    ))
    
    # Process White Version (for Footer)
    # Keep white as white, make black transparent
    white_data = np.array(bag_icon)
    r, g, b, a = white_data.T
    white_areas = (r > 100) & (g > 100) & (b > 100)
    new_a = np.zeros_like(r)
    new_a[white_areas] = 255
    white_data[..., 3] = new_a.T
    final_white = Image.fromarray(white_data)
    final_white.save("/home/ubuntu/packgo-travel/client/public/images/logo-bag-white.png")
    
    # Process Black Version (for Header)
    # Turn white pixels to black, keep transparency
    black_data = white_data.copy()
    # Set RGB to 0 where alpha is 255
    # Actually we just set all RGB to 0, and keep the alpha channel we just made
    black_data[..., 0] = 0
    black_data[..., 1] = 0
    black_data[..., 2] = 0
    
    final_black = Image.fromarray(black_data)
    final_black.save("/home/ubuntu/packgo-travel/client/public/images/logo-bag-black.png")
    
    print("Successfully extracted bag icon and saved black/white versions")

if __name__ == "__main__":
    process_logo()
