import { useState } from 'react';

export default function WaitlistForm() {
  // --- Lesson 3.12: STATE (React's Memory) ---
  // We are creating a variable called 'email' and setting it to empty ''.
  // 'setEmail' is the only tool allowed to change what is inside 'email'.
  const [email, setEmail] = useState('');

  // --- Lesson 4.6: EVENT HANDLING ---
  // This function runs when the user clicks the "Join" button.
  const handleSubmit = (e) => {
    e.preventDefault(); // This stops the website from doing a hard refresh.
    
    console.log("We will send this to the database later:", email);
    alert(`Success! ${email} is on the list.`);
    
    setEmail(''); // This clears the input box after they hit join.
  };

  // --- Lesson 3.3: JSX (The UI) ---
  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
      <input
        type="email"
        required
        placeholder="Enter your student email"
        value={email}
        // Every time they press a key, we tell React to update its memory
        onChange={(e) => setEmail(e.target.value)} 
        className="flex-1 px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
      >
        Join Waitlist
      </button>
    </form>
  );
}