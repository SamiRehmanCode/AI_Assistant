import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import ChatSession from "@/lib/models/ChatSession";
import Message from "@/lib/models/Message";
import Feedback from "@/lib/models/Feedback";
import { getUserByEmail } from "@/lib/user-service";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDb();

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [
    totalSessions,
    totalMessages,
    avgResponseAgg,
    avgRatingAgg,
    accuracyAgg,
    topicPerformance,
    positionPerformance,
    responseTimeTrend,
    recentFeedback,
  ] = await Promise.all([
    ChatSession.countDocuments({ userId: user._id }),
    Message.countDocuments({ userId: user._id }),
    Message.aggregate([
      {
        $match: {
          userId: user._id,
          role: "assistant",
          latencyMs: { $ne: null },
        },
      },
      { $group: { _id: null, avgMs: { $avg: "$latencyMs" } } },
    ]),
    Feedback.aggregate([
      { $match: { userId: user._id, rating: { $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]),
    Feedback.aggregate([
      { $match: { userId: user._id, correctness: { $ne: null } } },
      {
        $group: {
          _id: null,
          accuracyRate: {
            $avg: {
              $cond: [{ $eq: ["$correctness", true] }, 1, 0],
            },
          },
        },
      },
    ]),
    Message.aggregate([
      {
        $match: {
          userId: user._id,
          role: "assistant",
          topicTags: { $exists: true, $ne: [] },
        },
      },
      { $unwind: "$topicTags" },
      {
        $lookup: {
          from: "feedbacks",
          localField: "_id",
          foreignField: "messageId",
          as: "feedback",
        },
      },
      { $addFields: { feedback: { $arrayElemAt: ["$feedback", 0] } } },
      {
        $group: {
          _id: "$topicTags",
          messages: { $sum: 1 },
          ratingSum: { $sum: { $ifNull: ["$feedback.rating", 0] } },
          ratingCount: {
            $sum: {
              $cond: [{ $gt: ["$feedback.rating", 0] }, 1, 0],
            },
          },
          correctCount: {
            $sum: {
              $cond: [{ $eq: ["$feedback.correctness", true] }, 1, 0],
            },
          },
          feedbackCount: {
            $sum: { $cond: [{ $ne: ["$feedback", null] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          topic: "$_id",
          messages: 1,
          avgRating: {
            $cond: [
              { $gt: ["$ratingCount", 0] },
              { $divide: ["$ratingSum", "$ratingCount"] },
              0,
            ],
          },
          accuracyRate: {
            $cond: [
              { $gt: ["$feedbackCount", 0] },
              { $divide: ["$correctCount", "$feedbackCount"] },
              0,
            ],
          },
        },
      },
      { $sort: { messages: -1 } },
      { $limit: 10 },
    ]),
    Message.aggregate([
      { $match: { userId: user._id, role: "assistant" } },
      { $sort: { sessionId: 1, sequence: 1 } },
      {
        $group: {
          _id: "$sessionId",
          messages: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          messages: {
            $map: {
              input: { $range: [0, "$count"] },
              as: "idx",
              in: {
                $let: {
                  vars: {
                    msgId: { $arrayElemAt: ["$messages", "$$idx"] },
                    startCutoff: {
                      $max: [1, { $ceil: { $multiply: ["$count", 0.2] } }],
                    },
                    endCutoff: { $floor: { $multiply: ["$count", 0.8] } },
                  },
                  in: {
                    messageId: "$$msgId",
                    position: {
                      $cond: [
                        { $lt: ["$$idx", "$$startCutoff"] },
                        "start",
                        {
                          $cond: [
                            { $gte: ["$$idx", "$$endCutoff"] },
                            "end",
                            "middle",
                          ],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      { $unwind: "$messages" },
      { $replaceRoot: { newRoot: "$messages" } },
      {
        $lookup: {
          from: "feedbacks",
          localField: "messageId",
          foreignField: "messageId",
          as: "feedback",
        },
      },
      { $addFields: { feedback: { $arrayElemAt: ["$feedback", 0] } } },
      {
        $group: {
          _id: "$position",
          messages: { $sum: 1 },
          ratingSum: { $sum: { $ifNull: ["$feedback.rating", 0] } },
          ratingCount: {
            $sum: {
              $cond: [{ $gt: ["$feedback.rating", 0] }, 1, 0],
            },
          },
          correctCount: {
            $sum: {
              $cond: [{ $eq: ["$feedback.correctness", true] }, 1, 0],
            },
          },
          feedbackCount: {
            $sum: { $cond: [{ $ne: ["$feedback", null] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          position: "$_id",
          messages: 1,
          avgRating: {
            $cond: [
              { $gt: ["$ratingCount", 0] },
              { $divide: ["$ratingSum", "$ratingCount"] },
              0,
            ],
          },
          accuracyRate: {
            $cond: [
              { $gt: ["$feedbackCount", 0] },
              { $divide: ["$correctCount", "$feedbackCount"] },
              0,
            ],
          },
        },
      },
      { $sort: { position: 1 } },
    ]),
    Message.aggregate([
      {
        $match: {
          userId: user._id,
          role: "assistant",
          latencyMs: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          avgMs: { $avg: "$latencyMs" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Feedback.aggregate([
      { $match: { userId: user._id } },
      { $sort: { createdAt: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: "messages",
          localField: "messageId",
          foreignField: "_id",
          as: "message",
        },
      },
      { $addFields: { message: { $arrayElemAt: ["$message", 0] } } },
      {
        $project: {
          _id: 0,
          messageId: 1,
          rating: 1,
          correctness: 1,
          length: 1,
          createdAt: 1,
          topicTags: "$message.topicTags",
          latencyMs: "$message.latencyMs",
          snippet: { $substrBytes: ["$message.content", 0, 120] },
        },
      },
    ]),
  ]);

  const positionOrder: Record<string, number> = {
    start: 0,
    middle: 1,
    end: 2,
  };

  const orderedPositions = [...positionPerformance].sort(
    (a, b) =>
      (positionOrder[a.position] ?? 0) - (positionOrder[b.position] ?? 0),
  );

  return NextResponse.json({
    totals: {
      sessions: totalSessions,
      messages: totalMessages,
      avgResponseMs: avgResponseAgg[0]?.avgMs ?? 0,
      avgRating: avgRatingAgg[0]?.avgRating ?? 0,
      accuracyRate: accuracyAgg[0]?.accuracyRate ?? 0,
    },
    topicPerformance,
    positionPerformance: orderedPositions,
    responseTimeTrend: responseTimeTrend.map((entry) => ({
      day: entry._id,
      avgMs: entry.avgMs,
      count: entry.count,
    })),
    recentFeedback,
  });
}
