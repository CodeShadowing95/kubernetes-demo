import express from 'express'
import authRouter from './src/controllers/authController.js'
import postRouter from './src/controllers/postController.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        message: "Hello from a container !",
        service: "hello-node",
        pod: process.env.POD_NAME || 'unknown',
        time: new Date().toISOString(),
    })
})

app.get('/readyz', (req, res) => res.status(200).send('<span style="color:green">👍 Ready</span>'))
app.get('/healthz', (req, res) => res.status(200).send('<span style="color:green">✅ OK</span>'))

app.use('/auth', authRouter)
app.use('/posts', postRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})