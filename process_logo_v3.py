from PIL import Image
import numpy as np

def process_logo():
    # Load the screenshot
    img_path = "/home/ubuntu/upload/Screenshot2026-01-22at3.22.21PM.png"
    img = Image.open(img_path).convert("RGBA")
    
    # Convert to numpy array
    arr = np.array(img)
    
    # Threshold for white pixels (since the screenshot shows black logo on white bg, or vice versa)
    # Let's check the screenshot content.
    # The screenshot shows a black bag on white background on the left, and text on the right.
    # We want to extract the black bag.
    
    # Check if it's black on white or white on black
    # The screenshot provided in the prompt shows black bag on white background.
    # So we look for black pixels.
    
    # Threshold for black pixels (R,G,B < 50)
    mask = (arr[:,:,0] < 50) & (arr[:,:,1] < 50) & (arr[:,:,2] < 50)
    
    # Project to X axis (columns)
    cols = np.any(mask, axis=0)
    
    if not np.any(cols):
        print("No black pixels found")
        return

    # Find start of the first object (the bag)
    start_col = np.argmax(cols)
    
    # Find the end of the first object
    # We look for the first empty column after the start
    end_col = start_col
    found_gap = False
    
    # Heuristic: The bag is roughly square. If width > height * 1.5, it's probably including text.
    # But let's rely on the gap first.
    
    for c in range(start_col, len(cols)):
        if not cols[c]:
            # Found a gap (white space)
            # Check if the gap is wide enough to be a separator, not just a hole in the icon
            # The bag icon is solid, so any gap in column projection means end of icon
            end_col = c
            found_gap = True
            break
    
    if not found_gap:
        # If no gap found, maybe the text is too close?
        # Let's limit width to be roughly equal to height
        # First find height
        rows = np.any(mask, axis=1)
        rmin, rmax = np.where(rows)[0][[0, -1]]
        height = rmax - rmin
        end_col = start_col + int(height * 1.2) # Allow slightly wider than tall
        print(f"No gap found, limiting width based on height: {height}")
        
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
    
    # Process Black Version (for Header)
    # The source is already black on white.
    # We want black icon on transparent background.
    black_data = np.array(bag_icon)
    r, g, b, a = black_data.T
    
    # Identify black pixels (the icon)
    # Note: black_areas shape is (width, height) because of transpose
    black_areas = (r < 100) & (g < 100) & (b < 100)
    
    # Create new RGBA image
    new_black_data = np.zeros_like(black_data)
    # Set RGB to 0 (Black)
    new_black_data[..., 0:3] = 0
    # Set Alpha to 255 where it was black in source
    new_black_data[..., 3] = 0 # Default transparent
    
    # Fix: Use the mask directly on the alpha channel
    # We need to transpose back to match image coordinates if we were using PIL, 
    # but here we are operating on numpy arrays.
    # black_data shape is (height, width, 4)
    # r, g, b, a shape is (width, height) because of .T
    # So black_areas is (width, height)
    
    # Let's redo without transpose to avoid confusion
    black_data = np.array(bag_icon)
    r = black_data[:,:,0]
    g = black_data[:,:,1]
    b = black_data[:,:,2]
    
    black_areas = (r < 150) & (g < 150) & (b < 150)
    
    new_black_data = np.zeros_like(black_data)
    new_black_data[..., 0:3] = 0
    new_black_data[black_areas, 3] = 255
    
    # Wait, the airplane inside is white (in the black circle).
    # In the source image (black bag on white bg), the airplane is white (or transparent/background color).
    # If we just take black pixels, we lose the airplane shape (it becomes a solid black circle).
    # We need to preserve the "hole" inside the black circle.
    
    # Let's look at the source again.
    # It's a black bag outline, black circle, white airplane inside.
    # So we want:
    # Black pixels -> Black Opaque
    # White pixels inside the bag -> Transparent (or White)
    
    # Actually, for a logo, usually:
    # Bag outline: Black
    # Circle: Black
    # Airplane: Transparent (so it shows background color) OR White.
    
    # Let's make a simple mask:
    # If pixel is dark -> Black Opaque
    # If pixel is light -> Transparent
    
    # But the airplane is light, surrounded by dark. So it will be transparent.
    # This works for white background header.
    
    final_black = Image.fromarray(new_black_data)
    final_black.save("/home/ubuntu/packgo-travel/client/public/images/logo-bag-black-v2.png")
    
    # Process White Version (for Footer)
    new_white_data = np.zeros_like(black_data)
    new_white_data[..., 0:3] = 255
    new_white_data[black_areas, 3] = 255
    
    final_white = Image.fromarray(new_white_data)
    final_white.save("/home/ubuntu/packgo-travel/client/public/images/logo-bag-white-v2.png")
    
    print("Successfully extracted bag icon v2")

if __name__ == "__main__":
    process_logo()
