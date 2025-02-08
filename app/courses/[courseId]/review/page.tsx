"use client"
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CourseReviewForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    professor: "",
    semester: "",
    courseRating: [3],
    difficulty: [3],
    hoursPerWeek: [6],
    grade: null,
    format: "",
    attendance: "",
    recommend: "",
    textbook: "",
    review: "",
    advice: ""
  });
  const [user, setUser] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [course, setCourse] = useState(null);

  const params = useParams();
  const courseId = typeof params.courseId === "string" ? parseInt(params.courseId) : null;

  useEffect(() => {
    if (!courseId) return;
    const fetchCourseDetails = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          course_professors (
            professors (
              id,
              full_name
            )
          )
        `)
        .eq("id", courseId)
        .single();
      if (error) {
        console.error("Error fetching course details:", error);
      } else {
        setCourse(data);
      }
    };
    fetchCourseDetails();
  }, [courseId]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseId) {
      console.error("Missing courseId");
      return;
    }

    if (!user) {
      console.error("User not signed in");
      setSubmissionError("Please sign in to submit a review.");
      return;
    }

    const { error } = await supabase.from("course_reviews").insert({
      course_id: courseId,
      user_id: user.id,
      rating: formData.courseRating[0],
      difficulty_rating: formData.difficulty[0],
      comment: formData.review,
      advice: formData.advice,
      mandatory_attendance: formData.attendance === "yes",
      recommend_class: formData.recommend === "yes",
      textbook_required: formData.textbook === "yes",
      class_format: formData.format,
      grade: formData.grade
    });

    if (error) {
      console.error("Error submitting review:", error);
      setSubmissionError("Failed to submit review. Please try again.");
    } else {
      setSubmissionSuccess("Review submitted successfully!");
      setCurrentStep(1);
      setFormData({
        professor: "",
        semester: "",
        courseRating: [3],
        difficulty: [3],
        hoursPerWeek: [6],
        grade: null,
        format: "",
        attendance: "",
        recommend: "",
        textbook: "",
        review: "",
        advice: ""
      });
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.professor && formData.semester;
      case 2:
        return formData.courseRating && formData.difficulty && formData.hoursPerWeek;
      case 3:
        return formData.grade !== null && formData.format && formData.attendance;
      case 4:
        return formData.recommend && formData.textbook;
      case 5:
        return formData.review.length >= 10 && formData.advice.length >= 10;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-purple-800">Basic Information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select your professor</Label>
                <Select
                  value={formData.professor}
                  onValueChange={(value) => setFormData({ ...formData, professor: value })}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select your Professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {course?.course_professors?.map((cp, index) => (
                      <SelectItem key={cp.professors.id || index} value={cp.professors.full_name}>
                        {cp.professors.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select your semester</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select your semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fall2023">Fall 2023</SelectItem>
                    <SelectItem value="spring2024">Spring 2024</SelectItem>
                    <SelectItem value="summer2024">Summer 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-purple-800">Course Experience</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Rate the course</Label>
                <Slider
                  value={formData.courseRating}
                  max={5}
                  step={0.5}
                  className="w-full"
                  onValueChange={(value) => setFormData({ ...formData, courseRating: value })}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>How difficult was the course?</Label>
                <Slider
                  value={formData.difficulty}
                  max={5}
                  step={0.5}
                  className="w-full"
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hours spent on work outside of class</Label>
                <Slider
                  value={formData.hoursPerWeek}
                  max={15}
                  step={1}
                  className="w-full"
                  onValueChange={(value) => setFormData({ ...formData, hoursPerWeek: value })}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0-4</span>
                  <span>4-8</span>
                  <span>8-12</span>
                  <span>12-16</span>
                  <span>16-20</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-purple-800">Course Details</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select the grade you received</Label>
                <Select
                  value={formData.grade?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, grade: parseInt(value) })}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {[4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5, 0].map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        {grade.toFixed(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>What format did your class have?</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) => setFormData({ ...formData, format: value })}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select class format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In-person">In-person</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Was attendance mandatory?</Label>
                <RadioGroup
                  value={formData.attendance}
                  className="flex gap-4"
                  onValueChange={(value) => setFormData({ ...formData, attendance: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes-attendance" />
                    <Label htmlFor="yes-attendance">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no-attendance" />
                    <Label htmlFor="no-attendance">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-purple-800">Quick Recommendations</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Would you recommend this class?</Label>
                <RadioGroup
                  value={formData.recommend}
                  className="flex gap-4"
                  onValueChange={(value) => setFormData({ ...formData, recommend: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes-recommend" />
                    <Label htmlFor="yes-recommend">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no-recommend" />
                    <Label htmlFor="no-recommend">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Was there a textbook requirement?</Label>
                <RadioGroup
                  value={formData.textbook}
                  className="flex gap-4"
                  onValueChange={(value) => setFormData({ ...formData, textbook: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes-textbook" />
                    <Label htmlFor="yes-textbook">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no-textbook" />
                    <Label htmlFor="no-textbook">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-purple-800">Detailed Feedback</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Write a review</Label>
                <Textarea
                  placeholder="Share your thoughts about the course (minimum 10 characters)"
                  className="min-h-32 bg-white"
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Share some advice</Label>
                <Textarea
                  placeholder="What advice can you give to future students? (minimum 10 characters)"
                  className="min-h-24 bg-white"
                  value={formData.advice}
                  onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-md-purple w-full border-t-2 border-purple-600/20 py-8 rounded-b-2xl shadow-md">
        <div className="px-4 flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-5xl font-extrabold text-rbc-purple">
              {course ? course.title : "Loading Course..."}
            </h1>
            <p className="text-lg text-white font-semibold py-2">Write a Review</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto p-4">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-1/5 h-2 rounded-full mx-1 ${
                  step <= currentStep ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {currentStep} of 5
          </div>
        </div>

        <Card className="bg-white/50 backdrop-blur">
          <CardContent className="p-6">
            {submissionError && (
              <p className="text-red-600 mb-4">{submissionError}</p>
            )}
            {submissionSuccess && (
              <p className="text-green-600 mb-4">{submissionSuccess}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStepContent()}

              <div className="flex justify-between pt-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="bg-white hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                )}
                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceedToNextStep()}
                    className="bg-purple-600 hover:bg-purple-700 text-white ml-auto"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!canProceedToNextStep()}
                    className="bg-purple-600 hover:bg-purple-700 text-white ml-auto"
                  >
                    Submit Review
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CourseReviewForm;
