"use client"
import React, { useState } from 'react';
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

const CourseReviewForm = () => {
  const [formData, setFormData] = useState({
    professor: '',
    semester: '',
    courseRating: [3],
    difficulty: [3],
    hoursPerWeek: [6],
    grade: '',
    format: '',
    attendance: '',
    recommend: '',
    textbook: '',
    review: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (

    <>
      <div className="bg-md-purple w-full border-t-2 border-purple-600/20 py-8 rounded-b-2xl shadow-md">

        <div className="px-4 flex justify-between items-start">
          {/* Left side - University Info */}
          <div className="flex-1">
            <h1 className="text-5xl font-extrabold text-rbc-purple">CSE 380</h1>
            <p className="text-lg text-white font-semibold py-2">Write a Review</p>
          </div>
          </div>

        </div>
        <Card className="w-full mt-4 max-w-2xl mx-auto p-6 bg-white/50 backdrop-blur">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Professor Selection */}
              <div className="space-y-2">
                <Label>Select your professor</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, professor: value })}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select your Professor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prof1">Professor Smith</SelectItem>
                    <SelectItem value="prof2">Professor Johnson</SelectItem>
                    <SelectItem value="prof3">Professor Williams</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Semester Selection */}
              <div className="space-y-2">
                <Label>Select your semester</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, semester: value })}>
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

              {/* Course Rating */}
              <div className="space-y-2">
                <Label>Rate the course</Label>
                <Slider
                  defaultValue={[3]}
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

              {/* Difficulty */}
              <div className="space-y-2">
                <Label>How difficult was the course?</Label>
                <Slider
                  defaultValue={[3]}
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

              {/* Hours per Week */}
              <div className="space-y-2">
                <Label>How many hours do you spend on work outside of class?</Label>
                <Slider
                  defaultValue={[6]}
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

              {/* Grade Selection */}
              <div className="space-y-2">
                <Label>Select the grade you received in the class</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Class Format */}
              <div className="space-y-2">
                <Label>What format did your class have?</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, format: value })}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select class format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inPerson">In-person</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Attendance */}
              <div className="space-y-2">
                <Label>Was attendance mandatory?</Label>
                <RadioGroup
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

              {/* Recommend */}
              <div className="space-y-2">
                <Label>Would you recommend this class?</Label>
                <RadioGroup
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

              {/* Textbook Requirement */}
              <div className="space-y-2">
                <Label>Was there a textbook requirement?</Label>
                <RadioGroup
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

              {/* Review Text */}
              <div className="space-y-2">
                <Label>Write a review</Label>
                <Textarea
                  placeholder="Share your thoughts about the course"
                  className="min-h-32 bg-white"
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Submit Review
              </Button>
            </form>
          </CardContent>
        </Card>
      </>
      );
};

      export default CourseReviewForm;
