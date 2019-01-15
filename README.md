# paparazzi
A web service for converting HTML to images

## Running
    git clone https://github.com/fernap3/paparazzi.git
    cd paparazzi
    tsc -p tsconfig.json
    echo -e "PORT=5000\nPOOL_SIZE=2" > .env
    npm start
	
	
## Endpoints
/html
POST: Initializes all Puppeteer instances with the given page content

/image
POST: Updates the page content and generates an image
