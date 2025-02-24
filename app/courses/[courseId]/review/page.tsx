"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link"
import { useParams, useRouter } from "next/navigation";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { createBrowserClient } from "@supabase/ssr";
import { Slider } from "@mui/material";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CourseReviewForm = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    professor: "",
    semester: "",
    courseRating: 3, // How useful/relevant did you find this course?
    studyMaterialUsefulness: 3, // How useful was the course material?
    examDifficulty: 3, // How difficult are the exams?
    assignmentDifficulty: 3, // How difficult are the assignments?
    hoursPerWeek: 12,
    gradingFairness: "", // Enum: Very Unfair, Unfair, Neutral, Fair, Very Fair
    grade: null,
    attendance: "",
    recommend: "",
    textbook: "",
    review: "",
    advice: ""
  });
  const [user, setUser] = useState<any>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [course, setCourse] = useState<any>(null);
  const [professorId, setProfessorId] = useState<any>(null);

  const params = useParams();
  const courseId =
    typeof params.courseId === "string" ? parseInt(params.courseId) : null;

  // Fetch course details
  useEffect(() => {
    if (!courseId) return;
    const fetchCourseDetails = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(
          `
          id,
          title,
          course_professors (
            professors (
              id,
              full_name
            )
          )
        `
        )
        .eq("id", courseId)
        .single();
      if (error) {
        console.error("Error fetching course details:", error);
      } else {
        setCourse(data);
      }
    };
    fetchCourseDetails();
    // setProfessorId(data.)
  }, [courseId]);



  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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
      professor_id: parseInt(formData.professor),
      course_id: courseId,
      user_id: user.id,
      rating: formData.courseRating,
      study_material_usefulness: formData.studyMaterialUsefulness,
      exam_difficulty: formData.examDifficulty,
      assignment_difficulty: formData.assignmentDifficulty,
      hours_per_week: formData.hoursPerWeek,
      grading_fairness: formData.gradingFairness,
      grade: formData.grade,
      mandatory_attendance: formData.attendance === "yes",
      recommend_class: formData.recommend === "yes",
      textbook_required: formData.textbook === "yes",
      comment: formData.review,
      advice: formData.advice,
      semester: formData.semester
    });

    if (error) {
      console.error("Error submitting review:", error);
      setSubmissionError("Failed to submit review. Please try again.");
    } else {
      setSubmissionSuccess("Review submitted successfully!");
      router.push(`/courses/${courseId}`);
    }
  };

  const renderCourseTitle = () => {
    if (!course) {
      return (
        <div className="animate-pulse">
          <div className="h-12 w-64 bg-gray-200 rounded"></div>
        </div>
      );
    }
    return (
      <Link
        href={`/courses/${course.id}`}
        className="hover:opacity-80 transition-opacity"
      >
        <h1 className="text-5xl font-extrabold text-rbc-purple">
          {course.title}
        </h1>
      </Link>

    );
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.professor && formData.semester;
      case 2:
        return (
          formData.courseRating !== null &&
          formData.studyMaterialUsefulness !== null &&
          formData.examDifficulty !== null &&
          formData.assignmentDifficulty !== null &&
          formData.hoursPerWeek !== null
        );
      case 3:
        return formData.grade !== null && formData.attendance && formData.gradingFairness;
      case 4:
        return formData.recommend && formData.textbook;
      case 5:
        return formData.review.length >= 10 && formData.advice.length >= 10;
      default:
        return false;
    }
  };
  const sliderSx = {
    '& .MuiSlider-track': {
      backgroundColor: '#4F3078',
      color: '#4F3078',
    },
    '& .MuiSlider-rail': {
      backgroundColor: '#e2e8f0',
    },
    '& .MuiSlider-thumb': {
      backgroundColor: '#fff',
      border: '2px solid #4F3078',
      '&:hover': {
        boxShadow: 'none',
      },
      '&:focus, &.Mui-focusVisible': {
        boxShadow: '0 0 0 8px rgba(79, 48, 120, 0.16)',
        outline: 'none',
      },
      '&.Mui-active': {
        boxShadow: '0 0 0 14px rgba(79, 48, 120, 0.16)',
      },
    },
    '& .MuiSlider-mark': {
      backgroundColor: '#4F3078',
      height: '8px',
      width: '2px',
      '&.MuiSlider-markActive': {
        backgroundColor: '#4F3078',
      },
    },
    '& .MuiSlider-markLabel': {
      color: '#666',
      fontSize: '0.875rem',
    },
    '& .MuiSlider-valueLabel': {
      backgroundColor: '#4F3078',
    },
    // Override focus states
    '&.Mui-focused .MuiSlider-thumb': {
      boxShadow: '0 0 0 8px rgba(79, 48, 120, 0.16)',
    },
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
              </div>
              <Select
                value={formData.professor}
                onValueChange={(value) =>
                  setFormData({ ...formData, professor: value })
                }
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select your professor">
                    {formData.professor
                      ? course.course_professors.find(
                        (cp) => cp.professors.id.toString() === formData.professor
                      )?.professors.full_name
                      : "Select your Professor"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {course?.course_professors?.map((cp, index) => (
                    <SelectItem
                      key={cp.professors.id || index}
                      value={cp.professors.id.toString()} // Ensure value is a string
                    >
                      {cp.professors.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Label>Select your semester</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) =>
                    setFormData({ ...formData, semester: value })
                  }
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select your semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fall2023">Fall 2023</SelectItem>
                    <SelectItem value="spring2024">Spring 2024</SelectItem>
                    <SelectItem value="summer2024">Summer 2024</SelectItem>
                    <SelectItem value="fall2024">Fall 2024</SelectItem>
                    <SelectItem value="spring2025">Spring 2025</SelectItem>
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
            <div className="space-y-4">
              <div className="space-y-2 py-2">
                <Label>How useful/relevant did you find this course?</Label>
                <Slider
                  value={formData.courseRating}
                  onChange={(_, value) =>
                    setFormData({ ...formData, courseRating: value as number })
                  }
                  min={1}
                  max={5}
                  step={1}
                  marks={[
                    { value: 1, label: "1" },
                    { value: 2, label: "2" },
                    { value: 3, label: "3" },
                    { value: 4, label: "4" },
                    { value: 5, label: "5" }
                  ]}
                  sx={sliderSx}
                />
              </div>


              <div className="space-y-2 py-4">
                <Label>How difficult are the assessments?</Label>
                <Slider
                  value={formData.assignmentDifficulty}
                  onChange={(_, value) =>
                    setFormData({ ...formData, assignmentDifficulty: value as number })
                  }
                  min={1}
                  max={5}
                  step={1}
                  marks={[
                    { value: 1, label: "1" },
                    { value: 2, label: "2" },
                    { value: 3, label: "3" },
                    { value: 4, label: "4" },
                    { value: 5, label: "5" }
                  ]}
                  sx={sliderSx}
                />
              </div>

              <div className="space-y-2">
                <Label>Hours spent on work outside of class</Label>
                <Slider
                  value={formData.hoursPerWeek}
                  onChange={(_, value) =>
                    setFormData({ ...formData, hoursPerWeek: value as number })
                  }
                  min={4}
                  max={20}
                  step={4}
                  marks={[
                    { value: 4, label: "0-4" },
                    { value: 8, label: "4-8" },
                    { value: 12, label: "8-12" },
                    { value: 16, label: "12-16" },
                    { value: 20, label: "16-20" }
                  ]}
                  sx={sliderSx}
                />
              </div>

              <div className="space-y-2 py-4">
                <Label>How useful was the study material?</Label>
                <Slider
                  value={formData.studyMaterialUsefulness}
                  onChange={(_, value) =>
                    setFormData({ ...formData, studyMaterialUsefulness: value as number })
                  }
                  min={1}
                  max={5}
                  step={1}
                  marks={[
                    { value: 1, label: "1" },
                    { value: 2, label: "2" },
                    { value: 3, label: "3" },
                    { value: 4, label: "4" },
                    { value: 5, label: "5" }
                  ]}
                  sx={sliderSx}
                />
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, grade: parseFloat(value) })
                  }
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
                <Label>Was attendance mandatory?</Label>
                <RadioGroup
                  value={formData.attendance}
                  className="flex gap-4"
                  onValueChange={(value) =>
                    setFormData({ ...formData, attendance: value })
                  }
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

              <div className="space-y-2">
                <Label>How fair is the grading system?</Label>
                <RadioGroup
                  value={formData.gradingFairness}
                  className="flex gap-4"
                  onValueChange={(value) =>
                    setFormData({ ...formData, gradingFairness: value })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Very Unfair" id="very-unfair" />
                    <Label htmlFor="very-unfair">Very Unfair</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Unfair" id="unfair" />
                    <Label htmlFor="unfair">Unfair</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Neutral" id="neutral" />
                    <Label htmlFor="neutral">Neutral</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Fair" id="fair" />
                    <Label htmlFor="fair">Fair</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Very Fair" id="very-fair" />
                    <Label htmlFor="very-fair">Very Fair</Label>
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, recommend: value })
                  }
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
                <Label>Was there a paid homework/textbook access requirement?</Label>
                <RadioGroup
                  value={formData.textbook}
                  className="flex gap-4"
                  onValueChange={(value) =>
                    setFormData({ ...formData, textbook: value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, review: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Share some advice</Label>
                <Textarea
                  placeholder="What advice can you give to future students? (minimum 10 characters)"
                  className="min-h-24 bg-white"
                  value={formData.advice}
                  onChange={(e) =>
                    setFormData({ ...formData, advice: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Only render the form if not loading and the user is logged in
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>You must be logged in to submit a review. Please <Link className="font-bold underline" href="/sign-in"> sign in</Link>.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-md-purple w-full border-t-2 border-purple-600/20 py-8 rounded-b-2xl shadow-md">
        <div className="px-4 flex justify-between items-start">
          <div className="flex-1">
            {renderCourseTitle()}
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto p-4 py-16">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-1/5 h-2 rounded-full mx-1 ${step <= currentStep ? "bg-purple-600" : "bg-gray-200"
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
