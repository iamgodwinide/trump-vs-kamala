import connectDB from "@/db/connectdb";
import Vote from "@/models/Vote";

export const dynamic = 'force-dynamic'; // Required for revalidation to work properly

const TRUMP = "TRUMP";
const KAMALA = "KAMALA";

export const GET = async () => {
    await connectDB();

    const totalVotes = await Vote.countDocuments();
    const trumpVotes = await Vote.find({ choice: TRUMP }).countDocuments();
    const kamalaVotes = await Vote.find({ choice: KAMALA }).countDocuments();
    const recentVotes = await Vote.find().sort({ _timestamps: -1 });

    return new Response(JSON.stringify({
        totalVotes,
        trumpVotes,
        kamalaVotes,
        recentVotes: recentVotes.slice(0, 100)
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',  // Disable caching
        },
    });
};


export const POST = async (req) => {
    await connectDB();


    const { address, choice } = await req.json();

    console.log(address, choice)


    if (!address || !choice) {
        return new Response(JSON.stringify({
            message: "Invalid request"
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store',  // Disable caching
            },
        });
    }

    if (![TRUMP, KAMALA].includes(choice.toUpperCase())) {
        return new Response(JSON.stringify({
            message: "Invalid request"
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store',  // Disable caching
            },
        });
    }

    const exists = await Vote.findOne({ address });

    if (exists) {
        return new Response(JSON.stringify({
            message: "Already voted!"
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store',  // Disable caching
            },
        });
    }


    const newVote = new Vote({
        address,
        choice: choice.toUpperCase()
    });

    await newVote.save();

    return new Response(JSON.stringify({
        message: "voted successfully",
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',  // Disable caching
        },
    });
};