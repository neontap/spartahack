import React, { useState } from 'react';
import { MessagesSquare, X, Send, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

const CourseAssistant = ({ courseId }: { courseId: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/advice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    question: userMessage
                })
            });

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.advice }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-rbc-purple hover:bg-purple-700 shadow-lg flex items-center justify-center"
            >
                <MessagesSquare className="h-6 w-6" />
            </Button>

            {/* Chat Popup */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-[600px]">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b bg-md-purple rounded-t-lg">
                        <h3 className="font-semibold text-white">Course Assistant</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="h-8 w-8 text-white hover:text-gray-200"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <MessagesSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Ask me anything about this course!</p>
                                <p className="text-sm mt-2">
                                    Examples:
                                    <br />
                                    "What are the prerequisites?"
                                    <br />
                                    "How difficult is this course?"
                                    <br />
                                    "Tips for success?"
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-lg ${
                                            msg.role === 'user'
                                                ? 'bg-rbc-purple text-white'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about this course..."
                                className="text-white p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rbc-purple"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="bg-rbc-purple hover:bg-purple-700"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CourseAssistant;