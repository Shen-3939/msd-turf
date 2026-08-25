MSD TURF - PREMIUM SINGLE-PAGE WEBSITE
=======================================

Project structure
-----------------
index.html
css/style.css
js/script.js
images/msd-turf-logo.jpeg

Run locally
-----------
Open index.html directly, or serve the folder with a simple static/PHP server.
Example:
  php -S localhost:8000
Then visit:
  http://localhost:8000

Central configuration
---------------------
Edit js/script.js and update SITE_CONFIG:
- BUSINESS_NAME
- ADDRESS
- WHATSAPP_NUMBER
- GOOGLE_MAPS_URL
- OPERATING_HOURS.START
- OPERATING_HOURS.END
- SLOT_INTERVAL_MINUTES

Booking behaviour
-----------------
- Date cannot be earlier than today.
- Start/end time selectors use 30-minute intervals.
- End time options update dynamically and must be later than the start.
- Valid form data is encoded into a WhatsApp enquiry message.
- The website does not claim automatic slot confirmation or process payments.

Important assets
----------------
The supplied MSD Turf logo is kept as-is in images/msd-turf-logo.jpeg.
Gallery and section photos are placeholder remote Unsplash images and should be replaced with official MSD Turf photos before production if desired.
