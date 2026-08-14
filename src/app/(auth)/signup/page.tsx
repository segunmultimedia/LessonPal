import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border/50 shadow-xl shadow-black/5 p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">Start managing your teaching progress</p>
      </div>

      <form className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1.5">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            placeholder="Kwame Asante"
            className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-shadow"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-shadow"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="At least 8 characters"
            className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-shadow"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity shadow-sm"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
