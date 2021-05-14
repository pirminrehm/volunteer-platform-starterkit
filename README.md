# Volunteer Platform Starterkit

## Setup

- you have node.js 12 or later installed
- clone the project and go into project folder `cd volunteer-platform-starterkit`
- by default, sendgrid and recaptcha integration are commented out
- `npm install`
- `npm install -g @nrwl/cli`
- add `.env` file with local variables in root directory:

  - `MONGO_CONNECTION=<MONGO_CONNECTION_URL>`
  - `SENDGRID_API_KEY=<SENDGRID_API_KEY>` (if you enable sendgrind)
  - `HOST_URL=localhost:4200` (if you enable sendgrind, used for the link in the mail)
  - `RECAPTCHA_KEY=<RECAPTCHA_KEY>` (if you enable recaptcha)

- add your reCaptcha sitekey in the angular `environment.ts` file

- open two consoles
  1. `nx serve volunteer-app` (frontend)
  2. `nx serve api` (backend)
- go to http://localhost:4200/

## Deployment

In addition to the envrionment variables defined for local development, specify:

- `PORT` (default 3333)

# Licence:

This Project is liceced under [MIT licence](https://github.com/pirminrehm/volunteer-platform-starterkit/blob/master/LICENSE),
except the file `zipcodes-germany.ts`, which is bascially provide by OpenStreetMap under
[Open Data Commons Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/1.0/) and adapted for the software.

© OpenStreetMap-Mitwirkende
