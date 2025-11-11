/*
  # Add New Product Categories and Sample Data

  1. New Products
    - TV & Audio products (Smart TVs, Sound systems)
    - Headphones & Audio (Wireless headphones, Speakers)
    - Cameras & Photography (DSLR, Mirrorless cameras)
    - Gaming & Accessories (Consoles, Gaming gear)
    - Automotive & Parts (Tires, Car accessories)
    - Fashion & Clothing (Jeans, Apparel)
    - Baby & Kids (Baby gear, Toys)
    - Sports & Fitness (Exercise equipment)
    - Books & Education (Online courses, Educational materials)
    - Art & Crafts (Digital art tools, Creative supplies)

  2. Enhanced Data
    - Updated existing products with better specifications
    - Added subcategories for better organization
    - Enhanced features and descriptions
    - Improved product metadata
*/

-- Insert sample products for new categories
INSERT INTO products (
  name, description, price, original_price, category, subcategory, image_url, 
  colors, sizes, specifications, features, brand, stock_quantity, is_new, is_featured
) VALUES 

-- TV & Audio
(
  'Samsung 55" QLED 4K Smart TV',
  'Premium QLED display with Quantum HDR and smart features',
  125000,
  145000,
  'tv-audio',
  'smart-tv',
  'https://images.pexels.com/photos/1444416/pexels-photo-1444416.jpeg',
  ARRAY['Black', 'Silver'],
  ARRAY['55 inch', '65 inch', '75 inch'],
  '{"display": "55-inch QLED 4K", "resolution": "3840x2160", "smart_os": "Tizen", "hdr": "Quantum HDR", "refresh_rate": "120Hz"}',
  ARRAY['Quantum HDR Technology', 'Smart TV Platform', 'Voice Control', 'Multiple HDMI Ports', 'WiFi Connectivity'],
  'Samsung',
  20,
  true,
  true
),

-- Headphones & Audio
(
  'Sony WH-1000XM5 Headphones',
  'Industry-leading noise canceling wireless headphones',
  35000,
  42000,
  'headphones-audio',
  'wireless-headphones',
  'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
  ARRAY['Black', 'Silver'],
  ARRAY['Standard'],
  '{"driver": "30mm", "battery": "30 hours", "connectivity": "Bluetooth 5.2", "weight": "250g", "anc": "Advanced ANC"}',
  ARRAY['Active Noise Cancellation', '30-hour Battery Life', 'Quick Charge', 'Touch Controls', 'Multipoint Connection'],
  'Sony',
  35,
  true,
  false
),

-- Cameras & Photography
(
  'Canon EOS R6 Mark II',
  'Professional mirrorless camera with advanced autofocus',
  285000,
  320000,
  'cameras-photography',
  'mirrorless-camera',
  'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg',
  ARRAY['Black'],
  ARRAY['Body Only', 'With 24-105mm Lens'],
  '{"sensor": "24.2MP Full Frame", "video": "4K 60fps", "iso": "100-102400", "stabilization": "8-stop IBIS", "af_points": "1053"}',
  ARRAY['Dual Pixel CMOS AF II', 'In-body Image Stabilization', '4K Video Recording', 'Weather Sealing', 'High-speed Continuous Shooting'],
  'Canon',
  12,
  true,
  true
),

-- Gaming & Accessories
(
  'PlayStation 5 Console',
  'Next-generation gaming console with ultra-fast SSD',
  65000,
  75000,
  'gaming-accessories',
  'gaming-console',
  'https://images.pexels.com/photos/7915437/pexels-photo-7915437.jpeg',
  ARRAY['White'],
  ARRAY['Standard Edition', 'Digital Edition'],
  '{"cpu": "AMD Zen 2", "gpu": "AMD RDNA 2", "memory": "16GB GDDR6", "storage": "825GB SSD", "resolution": "4K 120fps"}',
  ARRAY['Ultra-fast SSD Loading', '4K Gaming Support', 'Ray Tracing', 'DualSense Controller', 'Backward Compatibility'],
  'Sony',
  8,
  true,
  true
),

-- Automotive & Parts
(
  'Michelin Pilot Sport 4 Tires',
  'High-performance tires for sports cars and sedans',
  18000,
  22000,
  'automotive-parts',
  'tires',
  'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg',
  ARRAY['Black'],
  ARRAY['205/55R16', '225/45R17', '245/40R18'],
  '{"type": "Summer Performance", "tread_life": "40000 miles", "speed_rating": "Y", "load_index": "94"}',
  ARRAY['Superior Wet Grip', 'Enhanced Cornering', 'Reduced Road Noise', 'Long Lasting Tread', 'Fuel Efficient'],
  'Michelin',
  50,
  false,
  false
),

-- Fashion & Clothing
(
  'Levis 501 Original Jeans',
  'Classic straight-leg jeans with authentic vintage styling',
  8500,
  12000,
  'fashion-clothing',
  'jeans',
  'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg',
  ARRAY['Blue', 'Black', 'Light Blue', 'Dark Blue'],
  ARRAY['28', '30', '32', '34', '36', '38', '40'],
  '{"material": "100% Cotton Denim", "fit": "Straight Leg", "rise": "Mid Rise", "closure": "Button Fly"}',
  ARRAY['Classic 501 Fit', '100% Cotton Denim', 'Button Fly', 'Authentic Styling', 'Durable Construction'],
  'Levis',
  75,
  false,
  false
),

-- Baby & Kids
(
  'Fisher-Price Baby Swing',
  'Soothing baby swing with music and nature sounds',
  15000,
  18000,
  'baby-kids',
  'baby-gear',
  'https://images.pexels.com/photos/1648377/pexels-photo-1648377.jpeg',
  ARRAY['Pink', 'Blue', 'Neutral'],
  ARRAY['0-6 months', '6-12 months'],
  '{"weight_limit": "11kg", "swing_speeds": "6", "music": "10 songs", "timer": "3 settings", "power": "Battery/AC"}',
  ARRAY['6 Swing Speeds', '10 Songs & Sounds', 'Removable Toy Bar', 'Machine Washable Seat', 'Compact Fold'],
  'Fisher-Price',
  25,
  false,
  false
),

-- Sports & Fitness
(
  'Bowflex SelectTech Dumbbells',
  'Adjustable dumbbells replacing 15 sets of weights',
  45000,
  55000,
  'sports-fitness',
  'home-gym',
  'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
  ARRAY['Black'],
  ARRAY['5-52.5 lbs', '10-90 lbs'],
  '{"weight_range": "5-52.5 lbs each", "adjustments": "15 weights", "increment": "2.5 lbs", "dimensions": "16.9 x 8.3 x 9 inches"}',
  ARRAY['Space-Saving Design', 'Quick Weight Changes', 'Durable Construction', 'Comfortable Grip', 'Workout App Included'],
  'Bowflex',
  15,
  true,
  false
),

-- Books & Education
(
  'Complete Programming Course Bundle',
  'Comprehensive coding bootcamp with certificates',
  12000,
  18000,
  'books-education',
  'online-courses',
  'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
  ARRAY['Digital'],
  ARRAY['Beginner', 'Intermediate', 'Advanced'],
  '{"languages": "Python, JavaScript, Java", "duration": "40 hours", "projects": "15", "certificate": "Yes", "support": "1 year"}',
  ARRAY['40+ Hours Content', 'Real-world Projects', 'Certificate of Completion', '1 Year Support', 'Lifetime Access'],
  'TechEd',
  100,
  true,
  false
),

-- Art & Crafts
(
  'Wacom Intuos Graphics Tablet',
  'Professional drawing tablet for digital artists',
  22000,
  28000,
  'art-crafts',
  'digital-art',
  'https://images.pexels.com/photos/1053687/pexels-photo-1053687.jpeg',
  ARRAY['Black', 'White'],
  ARRAY['Small', 'Medium'],
  '{"active_area": "6 x 3.7 inches", "pressure_levels": "4096", "connectivity": "USB", "compatibility": "Windows/Mac", "pen": "Battery-free"}',
  ARRAY['4096 Pressure Levels', 'Battery-free Pen', 'Multi-touch Gestures', 'Wireless Kit Ready', 'Creative Software Included'],
  'Wacom',
  30,
  false,
  false
);

-- Update existing products with better data
UPDATE products SET 
  subcategory = 'smartphone',
  specifications = '{"display": "6.7-inch Super Retina XDR", "chip": "A17 Pro", "camera": "48MP Main + 12MP Ultra Wide + 12MP Telephoto", "battery": "Up to 29 hours video", "storage": "128GB to 1TB", "connectivity": "5G, WiFi 6E, Bluetooth 5.3"}',
  features = ARRAY['Titanium Design', 'A17 Pro Chip', 'Pro Camera System', '5G Connectivity', 'Face ID', 'MagSafe Compatible', 'Water Resistant IP68'],
  is_featured = true
WHERE name = 'iPhone 15 Pro Max';

UPDATE products SET 
  subcategory = 'ultrabook',
  specifications = '{"processor": "Apple M3 chip 8-core CPU", "memory": "8GB unified memory", "storage": "256GB SSD", "display": "13.6-inch Liquid Retina", "battery": "Up to 18 hours", "weight": "1.24 kg"}',
  features = ARRAY['M3 Chip Performance', 'All-Day Battery Life', 'Liquid Retina Display', 'Silent Operation', 'MagSafe Charging', 'Touch ID'],
  is_featured = true
WHERE name = 'MacBook Air M3';

UPDATE products SET 
  subcategory = 'french-door',
  specifications = '{"capacity": "500L total", "energy_rating": "A++", "type": "French Door", "features": "Smart Connect, Digital Display", "dimensions": "70 x 175 x 65 cm", "warranty": "10 years compressor"}',
  features = ARRAY['Energy Efficient A++', 'Smart Connectivity', 'Large Capacity', 'Digital Temperature Display', 'Multi-Air Flow', 'LED Lighting']
WHERE name LIKE '%Refrigerator%';

UPDATE products SET 
  subcategory = 'lifestyle-sneakers',
  specifications = '{"material": "Mesh and synthetic leather", "sole": "Rubber with Max Air", "cushioning": "Max Air 270 unit", "weight": "380g", "origin": "Vietnam"}',
  features = ARRAY['Max Air 270 Cushioning', 'Breathable Mesh Upper', 'Durable Rubber Outsole', 'Comfortable Fit', 'Iconic Design']
WHERE name = 'Nike Air Max 270';

UPDATE products SET 
  subcategory = 'smartwatch',
  specifications = '{"chip": "S9 SiP with 64-bit dual-core processor", "display": "Always-On Retina LTPO OLED", "battery": "Up to 18 hours", "water_resistance": "50 meters", "connectivity": "WiFi, Bluetooth 5.3, GPS"}',
  features = ARRAY['Health Monitoring', 'Fitness Tracking', 'Always-On Display', 'Water Resistant 50m', 'ECG App', 'Blood Oxygen App'],
  is_featured = true
WHERE name = 'Apple Watch Series 9';

UPDATE products SET 
  subcategory = 'gas-range',
  specifications = '{"burners": "4 Gas Burners with different sizes", "oven": "Gas Oven 60L with Grill", "ignition": "Auto Ignition System", "safety": "Flame Failure Device", "dimensions": "60 x 60 x 85 cm"}',
  features = ARRAY['Auto Ignition System', 'Flame Failure Safety Device', 'Spacious 60L Oven', 'Easy Clean Enamel', 'Adjustable Legs', 'Grill Function']
WHERE name LIKE '%Gas Cooker%';