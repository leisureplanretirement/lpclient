# GreenAcres.UX

GreenAcres.UX is the front-end for <span style="color: blue;">LeisurePlan.app</span>.
The back end is the [GreenAcres](https://github.com/rwoodley/GreenAcres/blob/main/README.md) project.


## Setup

1. Install dependencies:
	```bash
	cd ux
	npm install
	```
2. Start the development server:
	```bash
	npm run dev
	```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment
We use [Github Pages](https://docs.github.com/en/pages) to host this web site in production.
Since we are using vite to build our web site, pushing changes to github is not enough to put those changes live. We need to also build a deployment package, as follows: 

```bash
# run this on the main branch.
npm run deploy
```

### Running System Locally

Note: GreenAcres.ux is currently configured to point to the production back-end, namely: https://bmhtdwxiwr.us-east-1.awsapprunner.com/
If you want to point to the local back-end, either the container (port 8080) or running in VSCode (port 7299), then in your local instance of the React front end you need to change references to `bmhtdwxiwr.us-east-1.awsapprunner.com` to `localhost:port`.  


## Notes
- All frontend code is in the `ux` directory.
- Backend REST API endpoints should be configured in `src/api.js` and in `.env`.

#### Project Structure
- `src/components/` - UI components (Banner, Menu, Chat, Results, etc.)
- `src/pages/` - Route views (Plans, Settings)
- `src/App.jsx` - Main app layout and routing
- `src/theme.js` - Material UI theme customization
- `src/tests/` - Unit tests

