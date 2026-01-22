from PIL import Image
import numpy as np

def process_logo():
    # Load the screenshot
    img_path = "/home/ubuntu/upload/Screenshot2026-01-22at3.15.06PM.png"
    img = Image.open(img_path).convert("RGBA")
    
    # Crop the bag icon (approximate coordinates based on visual inspection)
    # The image is likely the logo on black background
    # We need to find the white bag icon
    
    # Convert to numpy array for analysis
    arr = np.array(img)
    
    # Find white pixels (the bag)
    # Threshold for white
    mask = (arr[:,:,0] > 200) & (arr[:,:,1] > 200) & (arr[:,:,2] > 200)
    
    # Find bounding box of the white pixels
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    
    if not np.any(rows) or not np.any(cols):
        print("Could not find white logo pixels")
        return

    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    
    # Crop with some padding
    padding = 2
    logo = img.crop((max(0, cmin-padding), max(0, rmin-padding), min(img.width, cmax+padding), min(img.height, rmax+padding)))
    
    # Save the white version (for dark footer)
    # Make background transparent
    white_logo = logo.copy()
    white_data = np.array(white_logo)
    
    # Create alpha channel based on brightness (white is opaque, black is transparent)
    # Since the source is white on black, we can use the brightness as alpha
    # But we want to keep the inner black parts (airplane circle background) transparent?
    # Actually, the bag is white outline, inner circle is black, airplane is white.
    # Let's look at the reference image again.
    # It's a white bag outline, black circle inside, white airplane inside black circle.
    # So we want to keep white pixels as white opaque, and black pixels as transparent.
    
    r, g, b, a = white_data.T
    # Define white areas
    white_areas = (r > 100) & (g > 100) & (b > 100)
    
    # Set alpha: 255 for white areas, 0 for black areas
    new_a = np.zeros_like(r)
    new_a[white_areas] = 255
    
    white_data[..., 3] = new_a.T
    
    final_white = Image.fromarray(white_data)
    final_white.save("/home/ubuntu/packgo-travel/client/public/images/logo-bag-white.png")
    print("Saved white logo")
    
    # Create black version (for white header)
    # Invert colors: White becomes Black
    black_data = white_data.copy()
    # Set RGB to 0 (Black) where alpha is 255
    black_data[..., 0:3] = 0
    
    final_black = Image.fromarray(black_data)
    final_black.save("/home/ubuntu/packgo-travel/client/public/images/logo-bag-black.png")
    print("Saved black logo")

if __name__ == "__main__":
    process_logo()
