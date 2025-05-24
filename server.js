import express from 'express';
import { handler } from './build/handler.js'; // The handler for SvelteKit

const app = express();
const port = process.env.PORT || 3000;

app.use(handler);
app.listen(port, () => {
	console.log(`Running express server on http://localhost:${port}`);
});
