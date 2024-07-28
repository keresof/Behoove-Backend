require('dotenv').config();
import express from 'express';

const PORT = process.env.PORT || 3030;


export const configureApp = (middleware?: any[]) => {
    const app = express();
    app.use(express.json());
    if(middleware && middleware.length > 0) {
        middleware.forEach(m => app.use(m));
    }
    return app;
}

const app = configureApp();

app.get('/', (req, res) => {
    res.send('Hello World!');
});     

if (!process.env.NODE_ENV || (process.env.NODE_ENV && process.env.NODE_ENV !== 'test')) {
    app.listen(PORT, () => {
        console.log(`Express app running on port ${PORT}`);
    });
}


export default app;




