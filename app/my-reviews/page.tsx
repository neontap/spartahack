"use client";
import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown } from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Review {
  id: number;
  course_id: number;
  course: {
    title: string;
  }[];
  professor: {
    full_name: string;
  }[];
  rating: number;
  study_material_usefulness: number;
  exam_difficulty: number;
  assignment_difficulty: number;
  hours_per_week: number;
  grading_fairness: string;
  grade: number;
  mandatory_attendance: boolean;
  recommend_class: boolean;
  textbook_required: boolean;
  comment: string;
  advice: string;
  semester: string;
  created_at: string;
  helpful_count: number;
  unhelpful_count: number;
}

const getRatingColor = (rating: number) => {
  if (rating >= 4) return "bg-rating-green text-white";
  if (rating >= 3) return "bg-rating-yellow text-white";
  return "bg-rating-red text-white";
};

const getDifficultyColor = (difficulty: number) => {
  if (difficulty >= 4) return "bg-rating-red text-white";
  if (difficulty >= 3) return "bg-rating-yellow text-white";
  return "bg-rating-green text-white";
};

const getWorkloadColor = (workload: number) => {
  if (workload >= 16) return "bg-rating-red text-white";
  if (workload >= 12) return "bg-rating-yellow text-white";
  if (workload >= 8) return "bg-rating-yellow text-white";
  return "bg-rating-green text-white";
};

const MyReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<number, number>>({});
  const router = useRouter();

  const handleVote = async (reviewId: number, vote: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/sign-in");
        return;
      }

      //Allows user to update existing vote count for review      
      const { data: existingVote } = await supabase
        .from("review_votes")
        .select("vote")
        .eq("review_id", reviewId)
        .eq("user_id", session.user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote === vote) {
          await supabase
            .from("review_votes")
            .delete()
            .eq("review_id", reviewId)
            .eq("user_id", session.user.id);
          setUserVotes(prev => {
            const newVotes = { ...prev };
            delete newVotes[reviewId];
            return newVotes;
          });
        } else {
          await supabase
            .from("review_votes")
            .update({ vote })
            .eq("review_id", reviewId)
            .eq("user_id", session.user.id);
          setUserVotes(prev => ({
            ...prev,
            [reviewId]: vote
          }));
        }
      } else {
        await supabase
          .from("review_votes")
          .insert({ review_id: reviewId, user_id: session.user.id, vote });
        setUserVotes(prev => ({
          ...prev,
          [reviewId]: vote
        }));
      }

      const { data: votes } = await supabase
        .from("review_votes")
        .select("vote")
        .eq("review_id", reviewId);

      if (votes) {
        const helpfulCount = votes.filter((v) => v.vote === 1).length;
        const unhelpfulCount = votes.filter((v) => v.vote === -1).length;

        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  helpful_count: helpfulCount,
                  unhelpful_count: unhelpfulCount,
                }
              : review
          )
        );
      }
    } catch (error) {
      console.error("Error handling vote:", error);
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/sign-in");
          return;
        }

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("course_reviews")
          .select(`
            *,
            course: courses(title),
            professor: professors(full_name)
          `)
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (reviewsError) throw reviewsError;

        // Fetch user's votes
        const { data: votesData, error: votesError } = await supabase
          .from("review_votes")
          .select("review_id, vote")
          .eq("user_id", session.user.id);

        if (votesError) throw votesError;

        // Create a map of review_id to vote
        const votesMap = votesData.reduce((acc, vote) => {
          acc[vote.review_id] = vote.vote;
          return acc;
        }, {} as Record<number, number>);

        // Fetch vote counts for all reviews
        const { data: allVotes, error: allVotesError } = await supabase
          .from("review_votes")
          .select("review_id, vote");

        if (allVotesError) throw allVotesError;

        // Calculate vote counts for each review
        const reviewsWithVotes = reviewsData.map(review => {
          const reviewVotes = allVotes.filter(v => v.review_id === review.id);
          return {
            ...review,
            helpful_count: reviewVotes.filter(v => v.vote === 1).length,
            unhelpful_count: reviewVotes.filter(v => v.vote === -1).length
          };
        });

        setUserVotes(votesMap);
        setReviews(reviewsWithVotes);
      } catch (err) {
        setError("Failed to fetch reviews. Please try again later.");
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  //Checks if user has no reviews
  if (reviews.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-rbc-purple mb-4">My Reviews</h1>
        <div className="text-center text-gray-600">
          <p className="text-lg">You haven't submitted any reviews yet.</p>
        </div>
      </div>
    );
  }
  //Displays all reviews
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-rbc-purple mb-8">My Reviews</h1>
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-lg py-0.5 px-3 ${getRatingColor(review.rating)}`}>
                      {review.rating.toFixed(1)}
                    </Badge>
                    <span className="text-gray-500 text-xs">Overall Rating</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleVote(review.id, 1)}
                      className={`flex items-center gap-1 transition-colors ${
                        userVotes[review.id] === 1 ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{review.helpful_count || 0}</span>
                    </button>
                    <button 
                      onClick={() => handleVote(review.id, -1)}
                      className={`flex items-center gap-1 transition-colors ${
                        userVotes[review.id] === -1 ? "text-red-600" : "text-gray-500 hover:text-red-600"
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="text-sm">{review.unhelpful_count || 0}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <span className="text-gray-500 text-xs">Taught by: </span>
                    <span className="font-semibold text-sm">{review.professor[0]?.full_name}</span>
                  </div>
                  <div className="hidden md:block h-4 w-px bg-border"></div>

                  {review.semester && (
                    <Badge variant="outline" className="text-sm">{review.semester}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="pt-1">
                <p className="text-lg font-semibold text-gray-700 mt-0.5">{review.comment}</p>
              </div>

              {review.advice && (
                <div className="pt-1">
                  <span className="text-gray-500 text-sm">Advice:</span>
                  <p className="text-lg font-semibold text-gray-700 mt-0.5">{review.advice}</p>
                </div>
              )}

              <div className="w-full bg-border h-px"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className={`text-sm ${getDifficultyColor(review.assignment_difficulty)}`}>
                    {review.assignment_difficulty.toFixed(1)}
                  </Badge>
                  <span className="text-gray-500 text-sm">Difficulty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-sm ${getRatingColor(review.study_material_usefulness)}`}>
                    {review.study_material_usefulness.toFixed(1)}
                  </Badge>
                  <span className="text-gray-500 text-sm">Material Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-sm ${getWorkloadColor(review.hours_per_week)}`}>
                    {review.hours_per_week} h/w
                  </Badge>
                  <span className="text-gray-500 text-sm">Workload</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Grading Fairness:</span>
                  <span className="text-sm">{review.grading_fairness || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline text-gray-500 text-sm">Required Attendance:</span>
                  <span className="text-gray-500 inline md:hidden text-sm">Req. Attendance:</span>
                  <span className="text-sm">{review.mandatory_attendance ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Required Textbook:</span>
                  <span className="text-sm">{review.textbook_required ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyReviewsPage; 