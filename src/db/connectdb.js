import { connect } from 'mongoose';

export default async function connectDB() {
    try {
        await connect(process.env.NEXT_MONGO_URI);
    } catch (err) {
        console.log("MONGO ERROR:", err);
    }
}