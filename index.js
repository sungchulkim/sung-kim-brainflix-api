import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import videosRoutes from './routes/videos.js'

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())
app.use('/images', express.static('public/images'))
app.use('/upload', express.static('public/videos'))
app.use('/videos', videosRoutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});