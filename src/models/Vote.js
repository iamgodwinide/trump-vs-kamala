import { model, models, Schema } from 'mongoose';


const VoteSchema = new Schema({
    address: String,
    choice: String
},
    {
        timestamps: true
    }
);

const Vote = models.Vote || model("Vote", VoteSchema);

export default Vote;