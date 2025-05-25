import express from 'express';
import compression from 'compression';
import { handler } from './build/handler.js'; // The handler for SvelteKit

const app = express();

app.use(compression());

app.use(handler);

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`Running express server on http://localhost:${port}`);
});
