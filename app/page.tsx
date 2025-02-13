import LoginForm from "@/components/LoginForm"

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 via-sky-50 to-indigo-100">
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      <LoginForm />
    </main>
  )
}

