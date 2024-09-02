import express from 'express';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const path = './data/videos.json';


function readData() {
    try {
        const data = fs.readFileSync(path, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return { videos: [] };
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing data:', error);
    }
}

// GET /videos
router.get('/', (req, res) => {
    const data = readData();
    const simplifiedVideos = data.videos.map((video, index) => ({
        id: video.id,
        title: video.title,
        channel: video.channel,
        image: video.image
    }));
    res.json(simplifiedVideos);
});


// GET /videos/id
router.get('/:id', (req, res) => {
    const data = readData();
    const video = data.videos.find(v => v.id === req.params.id);

    if (video) {
        res.json(video);
    } else {
        res.status(404).json({ error: 'Video not found' });
    }
});


// POST /videos
router.post('/', (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    const data = readData();
    const newVideoIndex = data.videos.length;

    const newVideo = {
        id: uuidv4(),
        title,
        channel: "Anonymous User",
        image: `image${newVideoIndex}.jpg`,
        description,
        views: "0",
        likes: "0",
        duration: "0:00",
        video: "https://unit-3-project-api-0a5620414506.herokuapp.com/stream",
        timestamp: Date.now(),
        comments: []
    };

    data.videos.push(newVideo);
    writeData(data);

    res.status(201).json(newVideo);
});


// POST /videos/:id/comments
router.post('/:id/comments', async (req, res) => {
    const data = readData();
    const { id } = req.params;
    const { comment } = req.body;
    const name = 'Anonymous';

    const video = data.videos.find(v => v.id === id);
    if (!video) {
        return res.status(404).json({ error: 'Video not found' });
    }

    const newComment = {
        id: uuidv4(),
        name,
        comment,
        likes: 0,
        timestamp: Date.now()
    };

    video.comments.push(newComment);
    writeData(data);

    res.status(201).json(newComment);
});


// DELETE /videos/:videoId/comments/:commentId
router.delete('/videos/:videoId/comments/:commentId', async (req, res) => {
    try {
        const { videoId, commentId } = req.params;

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.video.toString() !== videoId) {
            return res.status(403).json({ error: 'Comment does not belong to this video' });
        }

        video.comments = video.comments.filter(id => id.toString() !== commentId);
        await video.save();

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;