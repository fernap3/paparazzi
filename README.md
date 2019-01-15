# paparazzi
A web service for converting HTML to images

## Running
    git clone https://github.com/fernap3/paparazzi.git
    cd paparazzi
    npm install
    tsc -p tsconfig.json
    echo -e "PORT=5000\nPOOL_SIZE=2" > .env
    npm start
	
	
## Endpoints
To initialize all Puppeteer instances with the given page content

    POST /html
    { html: string }

To generate an image

    POST /image
    { updateFunction: string, updateData: any, height: number, width: number }
    Updates the page content and generates an image
