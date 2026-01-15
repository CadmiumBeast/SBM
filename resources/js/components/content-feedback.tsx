import React from 'react';
import { useForm } from '@inertiajs/react';

interface FeedbackFormProps {
    calendarId: string | number;
}

const FeedbackForm = ({ calendarId }: FeedbackFormProps) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        feedback: '',
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Manual URL construction since Ziggy is not used
        post(`/content-feedback/${calendarId}`, {
            onSuccess: () => reset('feedback'),
            preserveScroll: true, // Optional: keeps the user at the same scroll position
        });
    };

    return (
        <div className="max-w-md p-6 rounded-xl shadow-sm border transition-colors duration-200
            bg-white border-gray-200 
            dark:bg-gray-900 dark:border-gray-800">
            
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label 
                        htmlFor="feedback" 
                        className="block text-sm font-semibold mb-2 transition-colors
                            text-gray-900 dark:text-gray-100"
                    >
                        Content Feedback
                    </label>
                    
                    <textarea
                        id="feedback"
                        value={data.feedback}
                        onChange={(e) => setData('feedback', e.target.value)}
                        rows={4}
                        placeholder="Provide feedback on this content..."
                        className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm transition-all
                            bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500
                            dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500
                            dark:focus:ring-blue-400 dark:focus:border-blue-400
                            ${errors.feedback ? 'border-red-500 dark:border-red-400' : ''}`}
                    />

                    {errors.feedback && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                            {errors.feedback}
                        </p>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center px-5 py-2.5 rounded-lg font-medium text-sm transition-all
                            bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200
                            dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-900
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? 'Sending...' : 'Submit Feedback'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FeedbackForm;