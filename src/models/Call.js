import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    participants: [{ socketId: String, username: String }],
    type: { type: String, enum: ['audio', 'video'], required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    recordingFile: { type: String } // path to saved recording
}, { timestamps: true });

export default mongoose.model('Call', callSchema);
